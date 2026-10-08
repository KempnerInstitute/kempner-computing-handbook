# Multi-Agent Orchestration

Several agents can split a large task, check each other's work, or run side by side on independent problems. They also multiply cost, and a mistake early in a chain can be carried forward by every step after it. This page covers when several agents are worth it, and how to build multi-step agent workflows and keep them under control on the cluster, using Claude Code and SLURM.

## Start with one agent

Try the task with a single agent first, and move to several only when a measured gain justifies the extra cost; see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`. The cost is real. Anthropic found that its multi-agent research system used about 15 times as many tokens as a chat ([How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)), and Claude Code's documentation notes that agent teams use significantly more tokens than a single session, since each agent keeps its own context.

Several agents tend to help when the work splits into independent pieces (separate modules, datasets, or hypotheses), when an independent reviewer should check work it did not produce, or when the task is too large for one context. They tend to hurt on sequential work with many dependencies, on changes to the same files, and on small tasks, where coordinating costs more than it saves.

| Pattern | How it works | Good for |
|---|---|---|
| Chain | Each step is a fresh agent run that reads the previous step's output, with your review between steps | Plan, implement, test, and review |
| Writer and reviewer | One agent produces; a second, with read-only tools and a fresh context, checks the result | Code review, citation checks |
| Parallel workers | Agents work on independent pieces, each in its own copy of the repository | Separate modules or analyses |
| Lead and helpers | A lead agent splits the task, delegates to helpers, and combines their results | Broad research and exploration |

## Chain steps with print mode

Running each step as its own `claude -p` call gives every step its own permissions, budget, and log, and puts a file you can read between the steps:

```{mermaid}
flowchart LR
    P["Plan<br/>read-only"] --> A{"You review<br/>the plan"}
    A --> I["Implement<br/>edits and tests"]
    I --> R["Review<br/>fresh context, read-only"]
    R --> M{"You review<br/>and commit"}
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class P,I,R agent;
    class A,M you;
```

Keep the files the chain produces in a directory that git ignores, so they never end up in your commits. The plan step can only read and search: `--tools` gives it no other tools, and `dontAsk` refuses anything else without waiting for an answer:

```bash
mkdir -p agent-run
echo "agent-run/" >> "$(git rev-parse --git-path info/exclude)"    # ignore it in this clone only
claude -p "Plan how to add a --seed option to train.py that seeds every random number generator. List the files to change and the tests to add, and give the whole plan in your final answer." \
  --permission-mode dontAsk --tools "Read,Grep,Glob" \
  --max-turns 15 --max-budget-usd 1.00 --output-format json > agent-run/plan.json
jq -er '.result' agent-run/plan.json > agent-run/plan.md
```

Read `agent-run/plan.md` and edit it until it is right. That is the checkpoint that keeps a bad plan from becoming bad code. The implementation step then works on its own branch, and it may create and edit files in the project and run the tests; any other command that would need approval is refused:

```bash
git switch -c add-seed
claude -p "Implement the plan in agent-run/plan.md. Run the tests with uv run pytest and fix any failures. Do not change anything the plan does not mention." \
  --permission-mode dontAsk --allowedTools "Edit(./**),Bash(uv run pytest *)" \
  --max-turns 40 --max-budget-usd 5.00 --output-format json > agent-run/implement.json
```

The review step starts a new session, so it judges the change without the implementer's reasoning, and it can only read. First check what the implementation step changed, since `git add -A` stages every new file and the diff goes to the model:

```bash
git status --short
```

Then stage the changes and run the review:

```bash
git add -A && git diff --cached > agent-run/change.diff    # every change, including new files
claude -p "Review the diff on standard input against agent-run/plan.md. List any bug, any change the plan did not ask for, and any test that was removed or loosened." \
  --permission-mode dontAsk --tools "Read,Grep,Glob" \
  --max-turns 15 --max-budget-usd 1.00 --output-format json < agent-run/change.diff > agent-run/review.json
jq -er '.result' agent-run/review.json > agent-run/review.md
```

- **Each step has its own limits.** The permission mode, `--tools`, and `--allowedTools` set what the step may do, and `--max-turns` and `--max-budget-usd` cap it; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- **Each step leaves a record.** The JSON result holds the step's output, its session ID, and its estimated cost (`total_cost_usd`). Keep these files with the run, and reopen any step with `claude --resume <session_id>` to see what it did.
- **A failed step stops the chain.** `claude -p` exits with a nonzero code when a run fails, and `jq -e` fails when a run left no result, so a script that runs the steps under `set -euo pipefail` stops instead of passing a bad result on.
- **The output can have a fixed shape.** For a step whose result a script checks, such as a review verdict, add `--json-schema` with a JSON Schema; the result then appears in the `structured_output` field.

In a test on the cluster with a toy repository, the chain produced a plan, an implementation whose six tests passed, and a review that found no problems. The implementer's attempt to rewrite files through a shell script was refused, so it used the file-edit tools instead.

Committing and merging stay with you. Read the review, then the diff itself, before you commit.

## Run independent agents in parallel

Two agents editing the same checkout overwrite each other's work, so give each its own git worktree: a separate checkout on its own branch that shares the repository's history.

```bash
claude --worktree fix-loader      # in one terminal
claude --worktree add-metrics     # in another
```

Each command creates a worktree under `.claude/worktrees/<name>/` on a new branch named `worktree-<name>`, starting from the repository's default branch, and starts a session in it. A worktree is a fresh checkout, so set up its environment there (for example with `uv sync`), and add `.claude/worktrees/` to your `.gitignore`. When you exit an interactive session, Claude Code removes a worktree with no changes and asks before removing one with work in it; print-mode runs leave theirs in place, so remove those with `git worktree remove <path>` once their branches are merged, after `git worktree unlock <path>` if git reports that the worktree is locked. You can also create worktrees yourself with `git worktree add`; see the Claude Code [worktrees documentation](https://code.claude.com/docs/en/worktrees).

On the cluster, run the parallel sessions in separate tmux windows that share one interactive job: start the job with `salloc` in the first window, and in each other window open a shell in the same job with `srun --jobid=<job_id> --overlap --pty bash`. Review and merge each branch on its own.

## Delegate within a session

### Subagents

A subagent is a helper the main agent delegates to inside one session. It works in its own context and returns a summary, so exploration does not crowd the main conversation; see {doc}`Configuring Agents for Your Project <configuring_agents>`. Define a role once in `.claude/agents/` to reuse it. This reviewer, saved as `.claude/agents/reviewer.md`, can read but not edit or run anything, so it works from the diff the main agent passes it:

```markdown
---
name: reviewer
description: Reviews code changes for bugs, unrequested changes, and weakened tests. Use after any code change, and pass it the output of git diff.
tools: Read, Grep, Glob
---

You review changes you did not write. Read the diff you are given, then each
changed file and the tests that cover it. Report bugs, changes the task did not
ask for, and tests that were removed or loosened, each with a file path and
line. Do not edit anything.
```

For helpers that edit files in parallel, add `isolation: worktree` to the frontmatter, and each one works in its own temporary worktree. These worktrees start from the repository's default branch, not your current branch, unless you set `worktree.baseRef` to `"head"` in your settings.

### Agent teams

Agent teams, an experimental Claude Code feature, go a step further: a lead session starts several teammates, each a separate Claude Code session, which share a task list and message each other directly. They suit work where independent views help, such as reviewing a change from several angles, or testing competing explanations for why a training run diverged.

- Teams are off by default; set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in your environment or settings to enable them.
- They run only in interactive sessions, not in print mode or batch jobs.
- Enabling them changes ordinary delegation: a subagent that Claude names starts as a teammate instead, in the main working directory, even if its definition sets `isolation: worktree`.
- Teammates start with the lead's permission mode (except `dontAsk`), and their permission requests come to you in the lead's session.
- Keep teams small (the documentation suggests three to five teammates), and give each one its own files, since teammates editing the same file overwrite each other.

See the [agent teams documentation](https://code.claude.com/docs/en/agent-teams), including its list of current limitations.

## Chain agent runs with SLURM

SLURM can sequence agent runs with the rest of your work. A common case is a sweep followed by an agent that reports on it. Submit the sweep, then the report job with a dependency on it:

```bash
sweep_job=$(sbatch --parsable sweep.sbatch)
sbatch --dependency=afterany:$sweep_job --export=ALL,SWEEP_JOB_ID=$sweep_job report.sbatch
```

The report job waits for every task in the array to finish, then runs the agent in print mode:

```bash
#!/bin/bash
#SBATCH --job-name=sweep-report
#SBATCH --partition=test
#SBATCH --time=00:30:00
#SBATCH --mem=8G
#SBATCH --cpus-per-task=2
#SBATCH --output=logs/%x_%j.out

cd "$SLURM_SUBMIT_DIR"
mkdir -p reports
claude -p "Array job $SWEEP_JOB_ID has finished. Use sacct to find which tasks failed, read the run summaries in runs/results/, and write reports/sweep_$SWEEP_JOB_ID.md ranking the runs and listing the failures. Do not submit or cancel anything." \
  --permission-mode dontAsk \
  --allowedTools "Read,Grep,Glob,Edit(./reports/**),Bash(sacct *)" \
  --max-turns 30 --max-budget-usd 3.00 \
  --output-format json > logs/report_$SLURM_JOB_ID.json
```

`Edit(./reports/**)` lets the agent create and change files only under `reports/`, and `dontAsk` refuses anything else that would need approval. Use `afterany` for a step like this, which should run however the sweep ends. With `afterok`, the step runs only if every task succeeds. In a test on the cluster, where one task of a three-task array failed on purpose, the `afterany` job ran as soon as the array finished, and the `afterok` job was canceled automatically, because the cluster's scheduler removes jobs whose dependencies can no longer be met. In a second test, with the agent step in place, the report ranked the two finished runs and listed the failed task with the cause from its log, and the agent wrote nothing outside `reports/`. See {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>`.

To run the same agent task over many inputs, such as summarizing one dataset per task, use an array job with one agent run per task, each with its own budget and log. Cap how many run at once with `%`, for example `--array=0-49%4`, which also limits how fast the runs use up your plan's usage or your API rate limits; see {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>`.

## Before you trust the result

- A single agent was tried on the same task, and the multi-agent version did measurably better.
- Each agent had only the tools and budget its step needed: reviewers read, only the implementer edited, and no agent submitted, canceled, or merged anything.
- You read each step's output, not only the last; an error that one step takes as given is hard to see in the final result.
- The reviewer worked from the diff in a fresh context, not from the implementer's summary.
- The plan, the review, and each step's JSON result are kept with the outputs, and the workflow's total cost, the sum of its `total_cost_usd` values, is recorded.

```{seealso}
For the guardrails these workflows rely on, see {ref}`Guardrails <agentic_ai:guardrails>`. For building custom multi-agent pipelines in code, see the frameworks in {doc}`Agentic AI Tools <agentic_ai_tools>`. For checking agent output, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.
```
