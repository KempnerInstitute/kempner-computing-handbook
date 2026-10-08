# Multi-Agent Orchestration

Several agents can split a large task, check each other's work, or run side by side on independent problems. They also multiply cost, and an early mistake can carry through every later step. This page covers when several agents are worth it, and how to build and control multi-step workflows on the cluster with Claude Code and SLURM.

## Start with one agent

Try a single agent first, and add more only when a measured gain justifies the cost; see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`. The cost is real. Anthropic found that its multi-agent research system used about 15 times as many tokens as a chat ([How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)). Claude Code's documentation also notes that agent teams use significantly more tokens than one session.

Several agents help when the work splits into independent pieces, when a reviewer should check work it did not produce, or when the task is too large for one context. They hurt on sequential work with many dependencies, on edits to the same files, and on small tasks.

| Pattern | How it works | Good for |
|---|---|---|
| Chain | Each step is a new agent run that reads the previous step's output, with your review between steps | Plan, implement, test, and review |
| Writer and reviewer | One agent produces; a second, read-only and with a fresh context, checks the result | Code review, citation checks |
| Parallel workers | Agents work on independent pieces, each in its own copy of the repository | Separate modules or analyses |
| Lead and helpers | A lead agent splits the task, hands parts to helpers, and combines the results | Broad research and exploration |

## Chain steps with print mode

Run each step as its own `claude -p` call. Each step then has its own permissions, budget, and log, and leaves a file you can read before the next step.

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

Keep the chain's files in a directory that git ignores, so they never reach your commits.

::::{tab-set}
:::{tab-item} 1. Plan
The plan step can only read and search: `--tools` gives it no other tools, and `dontAsk` refuses everything else.

```bash
mkdir -p agent-run
echo "agent-run/" >> "$(git rev-parse --git-path info/exclude)"    # ignore it in this clone only
claude -p "Plan how to add a --seed option to train.py that seeds every random number generator. List the files to change and the tests to add, and give the whole plan in your final answer." \
  --permission-mode dontAsk --tools "Read,Grep,Glob" \
  --max-turns 15 --max-budget-usd 1.00 --output-format json > agent-run/plan.json
jq -er '.result' agent-run/plan.json > agent-run/plan.md
```

Read `agent-run/plan.md` and edit it until it is right. This checkpoint keeps a bad plan from becoming bad code.
:::
:::{tab-item} 2. Implement
The implementation step works on its own branch. It may create and edit files in the project and run the tests; anything else that needs approval is refused.

```bash
git switch -c add-seed
claude -p "Implement the plan in agent-run/plan.md. Run the tests with uv run pytest and fix any failures. Do not change anything the plan does not mention." \
  --permission-mode dontAsk --allowedTools "Edit(./**),Bash(uv run pytest *)" \
  --max-turns 40 --max-budget-usd 5.00 --output-format json > agent-run/implement.json
```
:::
:::{tab-item} 3. Review
The review step starts a new session, so it judges the change without the implementer's reasoning, and it can only read. First check what changed, because `git add -A` stages every new file and the diff goes to the model:

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
:::
::::

- **Each step has its own limits.** The permission mode, `--tools`, and `--allowedTools` set what it may do; `--max-turns` and `--max-budget-usd` cap it. See {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- **Each step leaves a record.** The JSON result holds the output, the session ID, and the estimated cost (`total_cost_usd`). Reopen any step with `claude --resume <session_id>`.
- **A failed step stops the chain.** `claude -p` exits nonzero when a run fails, and `jq -e` fails when there is no result, so a script run under `set -euo pipefail` stops instead of passing a bad result on.
- **A step can return a fixed shape.** For a result a script checks, such as a review verdict, add `--json-schema`; the result then appears in the `structured_output` field.

In a test on the cluster with a toy repository, the chain produced a plan, an implementation whose six tests passed, and a review that found no problems. The implementer's attempt to rewrite files through a shell script was refused, so it used the file-edit tools instead. Committing and merging stay with you: read the review, then the diff itself, before you commit.

## Run independent agents in parallel

Two agents editing the same checkout overwrite each other's work, so give each one its own git worktree, a separate checkout on its own branch:

```bash
claude --worktree fix-loader      # in one terminal
claude --worktree add-metrics     # in another
```

- **Where it goes.** Each command creates `.claude/worktrees/<name>/` on a new branch `worktree-<name>`, from the default branch, and starts a session there. Add `.claude/worktrees/` to your `.gitignore`.
- **Its own environment.** A worktree is a fresh checkout, so set up its environment there, for example with `uv sync`.
- **Cleanup.** When an interactive session exits, Claude Code removes a worktree with no changes and asks about one with work in it. Print-mode runs leave theirs; remove them with `git worktree remove <path>` after their branches are merged, and run `git worktree unlock <path>` first if git reports a lock.

On the cluster, run the sessions in separate tmux windows that share one job. Start the job with `salloc` in the first window, and in each other window run `srun --jobid=<job_id> --overlap --pty bash`. Review and merge each branch on its own. See the Claude Code [worktrees documentation](https://code.claude.com/docs/en/worktrees).

## Delegate within a session

### Subagents

A subagent is a helper that works in its own context inside one session and returns a summary; see {doc}`Configuring Agents for Your Project <configuring_agents>`. Define a role once in `.claude/agents/` to reuse it. This reviewer, saved as `.claude/agents/reviewer.md`, can only read, so it works from the diff the main agent passes it:

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

For helpers that edit files in parallel, add `isolation: worktree` to the frontmatter so each works in its own temporary worktree. These start from the default branch, not your current branch, unless you set `worktree.baseRef` to `"head"` in your settings.

### Agent teams

Agent teams, an experimental Claude Code feature, go further: a lead session starts several teammates, each a separate session, which share a task list and message each other. They suit work where independent views help, such as reviewing a change from several angles or testing competing explanations for a failed run.

- They are off by default; set `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` to enable them.
- They run only in interactive sessions, not in print mode or batch jobs.
- While enabled, a subagent that Claude names starts as a teammate in the main working directory, even if its definition sets `isolation: worktree`.
- Teammates start with the lead's permission mode (except `dontAsk`), and their permission requests come to the lead's session.
- Keep teams small (the documentation suggests three to five) and give each teammate its own files.

See the [agent teams documentation](https://code.claude.com/docs/en/agent-teams) for current limitations.

## Chain agent runs with SLURM

SLURM can run an agent after other work finishes, for example a report after a sweep. Submit the sweep, then the report job with a dependency on it:

```bash
sweep_job=$(sbatch --parsable sweep.sbatch)
sbatch --dependency=afterany:$sweep_job --export=ALL,SWEEP_JOB_ID=$sweep_job report.sbatch
```

The report job waits for every task in the array to finish, then runs the agent:

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

`Edit(./reports/**)` limits the agent's writes to `reports/`, and `dontAsk` refuses anything else that needs approval. Use `afterany` for a step that should run however the sweep ends; with `afterok`, it runs only if every task succeeds. In a test on the cluster with a three-task array where one task failed on purpose:

- The `afterany` job ran as soon as the array finished.
- The `afterok` job was canceled automatically, because the scheduler removes jobs whose dependencies can no longer be met.
- With the agent step in place, the report ranked the two finished runs and listed the failed task with the cause from its log, and the agent wrote nothing outside `reports/`.

See {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>`. To run the same agent task over many inputs, use an array job with one agent run per task, each with its own budget and log. Cap how many run at once with `%`, for example `--array=0-49%4`, which also slows how fast the runs use up your plan or API limits; see {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>`.

## Before you trust the result

- A single agent was tried on the same task, and the multi-agent version did measurably better.
- Each agent had only the tools and budget its step needed: reviewers read, only the implementer edited, and no agent submitted, canceled, or merged anything.
- You read each step's output, not only the last; an error one step takes as given is hard to see at the end.
- The reviewer worked from the diff in a fresh context, not from the implementer's summary.
- The plan, the review, and each step's JSON result are kept with the outputs, and the total cost, the sum of the `total_cost_usd` values, is recorded.

```{seealso}
For the guardrails these workflows rely on, see {ref}`Guardrails <agentic_ai:guardrails>`. For building custom pipelines in code, see the frameworks in {doc}`Agentic AI Tools <agentic_ai_tools>`.
```
