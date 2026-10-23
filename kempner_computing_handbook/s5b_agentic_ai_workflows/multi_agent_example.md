# Multi-Agent Workflow Example

This chapter runs the task of {doc}`End-to-End Agentic Workflow Example <end_to_end_example>` with four agents: a planner, a critic, a writer, and an auditor. The loop script still submits the jobs and writes the records. The code is in the [agentic-workflow-example](https://github.com/KempnerInstitute/agentic-workflow-example) repository.

```{mermaid}
flowchart TB
    subgraph SUP [" "]
        direction LR
        S(["Chapter 28:<br/>setup and round 1"]) --> P["Plan-only job:<br/>plan wave 1"] --> R(["You read<br/>the plan"])
    end
    subgraph LOOP ["Loop job"]
        direction LR
        W["Planner and<br/>critic"] --> J["Up to 3<br/>round jobs"]
        J -->|next wave| W
        J --> F["Writer and<br/>auditor"]
    end
    SUP -->|you start the loop job| LOOP
    LOOP --> V(["You check<br/>the result"])
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class P,W,J,F agent;
    class S,R,V you;
    style SUP fill:none,stroke:#c8c8d0
    style LOOP fill:none,stroke:#c8c8d0
```

| Part | Chapter 28 | This chapter |
|---|---|---|
| Agents | One agent step for each round | Planner, critic, writer, and auditor |
| Rounds | One round job at a time | Waves of up to 3 round jobs |
| Check before a round | The schema | The schema, a repeat check, and the critic |
| GPUs | Full GPUs | A100 MIG slices |
| Confirmation | One seed | Two seeds |
| Check of the report | You | The auditor and a code check, then you |

Several agents cost more tokens. Use them only when a test shows a gain; see {ref}`Start with one agent <agentic_ai:start_with_one_agent>`. This example makes that test; see {ref}`Our runs <agentic_ai:multi_agent_our_runs>`.

## Before you start

- **Chapter 28.** Do its setup, baseline, and round 1. This loop copies round 1 to its own state directory, `state_multi/`.
- **GPUs.** The round jobs run on `kempner_requeue`, on A100 MIG slices (3g.20gb). One round takes 1 to 3 minutes.
- **Cost.** The limits are 1,250,000 tokens and 150 GPU minutes for the rounds. The confirmation rounds add a few GPU minutes.

## Step 1: Check the settings

Read `experiment_multi.yaml`. It sets the roles and the limits.

| Role | Model | Effort | Task |
|---|---|---|---|
| Planner | `claude-opus-5-5` | `xhigh` | Plans 3 configurations for each wave, each with a hypothesis and a predicted accuracy |
| Critic | `claude-sonnet-5-5` | `high` | Accepts or rejects each configuration before any GPU job runs |
| Writer | `claude-sonnet-5-5` | `medium` | Writes the draft report |
| Auditor | `claude-opus-5-5` | `max` | Checks each claim of the report against the records |

- **Change a role.** Edit its `model` and `effort` in `roles`. Use full model names, because an alias such as `opus` moves to newer models. Keep a different model for a checker and the role that it checks.
- **One agent.** Set `roles.critic.enabled: false`. The loop is then one agent that plans waves of 3.
- **Model check.** The loop script stops with `model_check` if a step used another model.

| Limit | Value |
|---|---|
| Threshold | Validation accuracy of at least 0.905 |
| Plateau | Stop after 6 rounds in a row without a smaller passing model |
| Tokens | 1,250,000: 800,000 for the search, 450,000 for the writer and the auditor |
| GPU | 150 GPU minutes. Each round reserves its 10-minute time limit. |
| Rounds | 45 round attempts, round 1 included |
| Round jobs at the same time | At most 3, as one array job; see {ref}`Array Jobs <resource_management:array_jobs>` |
| Queue | 45 minutes for one array job |
| Loop job | `shared`, 2 CPUs, 8 GB, 6 hours |

The agents have the guardrails of chapter 28: no shell, no write tools, no MCP tools, and no reads outside the project directory or of the README; see {ref}`Guardrails <agentic_ai:guardrails>` and {ref}`Prohibited activities <security_and_compliance:prohibited_activities>`. Only the scale changes: up to 3 GPU jobs at a time.

:::{dropdown} A role step, as the loop script runs it
```bash
claude -p "$PROMPT" \
  --permission-mode dontAsk --tools "Read,Grep,Glob" --disallowedTools "mcp__*" \
  --max-turns 10 --max-budget-usd 3.00 --output-format json \
  --settings '{"permissions": {"deny": ["Read(./README.md)"]}}' \
  --model claude-opus-5-5 --effort xhigh \
  --append-system-prompt-file prompts/multi/roles/planner.md \
  --json-schema "$WAVE_SCHEMA"
```

- **Role prompt.** `--append-system-prompt-file` adds the prompt of the role to the default system prompt.
- **README.** The deny rule keeps the agents out of the README, which holds the results of our runs.
- **Effort.** The loop script removes `CLAUDE_CODE_EFFORT_LEVEL`, which overrides `--effort`.
- **Caps.** Each role has its own caps; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`. In a test, one wave plan used about 51,000 tokens, and the auditor about 300,000.
:::

:::{dropdown} Before an unattended run, answered for this example
| Question | Answer |
|---|---|
| Task boundary | Plan or check configurations, or write or check the report. Return JSON. |
| Read scope | Only the project directory, without the README |
| Write scope | None. The loop script writes all files. |
| Credentials | None. The agents have no shell. |
| Network | Only the model provider |
| Data policy | CIFAR-10 is public data (Level 1). |
| Untrusted input | Project files, and the outputs of earlier agent steps in `state_multi/` |
| Resource scope | 3 GPU jobs at a time, 10 minutes each; 150 GPU minutes; 45 round attempts; 1,250,000 tokens; 6 hours |
| Evidence | `history.tsv`, `ledger.tsv`, `waves/`, `hypotheses.tsv`, the JSON result of each agent step, and the loop log |
| Stop condition | The limits above. SIGTERM stops the loop cleanly. |

See {ref}`Before an unattended run <agentic_ai:before_an_unattended_run>`.
:::

## Step 2: Plan wave 1

Check the first plan before any GPU job runs.

1. On a login node, in the project directory, submit the plan-only job:

   ```bash
   source cluster.env
   sbatch --time=01:30:00 slurm/multi_loop.sbatch --plan-only
   ```

2. When the job ends, read `state_multi/waves/wave_01/plan.md`. It shows each configuration and the verdict of the critic.
3. To accept the plan, go to step 3.
4. To plan again, remove `state_multi/waves/wave_01/`, and submit the job again. Do not edit the plan by hand.

:::{dropdown} Example: the plan of wave 1 in a test
| Item | Sparsity | Steps | Epochs | Learning rate | Excluded | Predicted validation accuracy | Status |
|---|---|---|---|---|---|---|---|
| 1 | 0.92 | 2 | 10 | 0.02 | none | 0.928 | accepted |
| 2 | 0.96 | 4 | 16 | 0.03 | none | 0.917 | accepted |
| 3 | 0.985 | 5 | 20 | 0.05 | `conv1`, `fc` | 0.906 | accepted |

The critic on item 3: "It is bold, but nothing in the history says it will fail."
:::

(agentic_ai:multi_agent_start_the_loop)=
## Step 3: Start the loop

On a login node, in the project directory, submit the loop job:

```bash
source cluster.env
sbatch slurm/multi_loop.sbatch
```

For each wave, the planner plans, the code and the critic check the plan, and the loop script submits one array job. This is the pattern of {ref}`Run an agent unattended in a batch job <agentic_ai:unattended_batch_job>`.

- **Watch.** Run `tail -f logs/prune-multi-loop_<job_id>.out`.
- **Stop.** Run `scancel <loop_job_id>`. The loop script cancels its array job. The next loop job counts the GPU minutes of the canceled tasks.
- **Finish later.** Run `sbatch slurm/multi_loop.sbatch --finish`. It runs only the final steps, and it keeps the selected round.
- **Timeouts.** If round jobs end at the time limit with no epoch line in their logs, check the storage of `DATA_DIR`.
- **Problems.** Follow {ref}`Reporting a concern <security_and_compliance:reporting_a_concern>`.

:::{dropdown} Example: the loop log in a test with 4 round attempts
```text
2026-10-21 22:07:43 wave 1: submitted array job 54502617, rounds 2 to 4
2026-10-22 00:40:00 wave 1: round 2: val_accuracy=0.9302 weights_left=0.100000; round 3: val_accuracy=0.9292 weights_left=0.050147; round 4: val_accuracy=0.9182 weights_left=0.020601; tokens planner 23354, critic 22051 (totals: 45405 tokens, 8.7 GPU minutes)
2026-10-22 00:40:00 stop: round_limit
2026-10-22 00:40:02 confirmation rounds: submitted array job 54550705 for seeds 1, 2
2026-10-22 00:41:45 SIGTERM: asked SLURM to cancel array job 54550705.
```

The test canceled the loop job on purpose. Then `--finish` ran the confirmation rounds again:

```text
2026-10-22 00:43:18 confirmation rounds: submitted array job 54551527 for seeds 1, 2
test evaluation, round 4: test_accuracy=0.9215
test evaluation, confirm 4: test_accuracy=0.9219
test evaluation, confirm 4: test_accuracy=0.9179
2026-10-22 00:52:21 final steps done: see m7_finish_state/summary.json, final_report.md, and audit.json
```
:::

## Step 4: Check the result

After the last wave, the loop script selects the passing round with the fewest weights left. It confirms it with seeds 1 and 2, evaluates the three models on the test set, and runs the writer and the auditor. Then check these files in `state_multi/`; see {ref}`Check the output <agentic_ai:check_the_output>`:

| File | Check |
|---|---|
| `summary.json` | `means.holds` is `true`: the 3-seed means keep 0.905 for validation and 0.900 for test. |
| `audit.json` | Each claim of the report is `supported`. Check each claim that is `unsupported` or `wrong`. |
| `audit.json` | Check each number in `unmatched_numbers`. The code did not find it in the records. A derived number, such as a margin, is often correct. |
| `audit.json` | `check_round.ok` is `true`. |
| `final_report.md` | You read it after the checks above. |
| `ledger.tsv` | The tokens of each role, and the GPU minutes of each job |

The auditor and the code checks do not replace your check; see {ref}`Best practices for trustworthy agentic research <agentic_ai:trustworthy_practices>`. To check the report of chapter 28 the same way, run `STATE_DIR=state sbatch slurm/multi_loop.sbatch --audit-only`.

(agentic_ai:multi_agent_our_runs)=
## Our runs

:::{note}
Draft. The comparison runs have not run yet. Their design is fixed before the runs.
:::

| Arm | Design |
|---|---|
| 1 | One agent, one round at a time: the loop of chapter 28 |
| 2 | One agent, waves of 3: this loop with the critic off |
| 3 | Planner and critic, waves of 3: this loop |

- **Same conditions.** Same baseline and round 1, same agent that decides (`claude-opus-5-5` at `xhigh`), 800,000 tokens for the search, 45 round attempts, and 150 GPU minutes on MIG slices.
- **Result.** An arm's result holds if its 3-seed means keep 0.905 for validation and 0.900 for test. The main number is its weights left.
- **Difference.** An arm is better only if its weights left are lower by at least 0.15 point. This is about 1.5 standard errors.
- **Limit.** One run of each arm is a worked example, not a proof.

## Was it worth it?

:::{note}
Draft. After the runs, this section answers each check with the results.
:::

| Check of {ref}`Before you trust the result <agentic_ai:before_you_trust_the_result>` | Evidence |
|---|---|
| A single agent was tried, and the multi-agent version did better. | Arms 1 and 2 against arm 3 |
| Each agent had only the tools and budget its step needed. | Read-only tools, role caps, and the model check |
| You read each step's output. | `plan.md`, `hypotheses.tsv`, and `audit.json` |
| The reviewer worked in a fresh context. | The critic and the auditor are separate `claude -p` calls. |
| The outputs and the total cost are kept. | `state_multi/` and `summary.json` |

## Adapt the example

- **Roles.** Change the models, the effort levels, and the caps in `experiment_multi.yaml`.
- **Waves.** Change `wave.size` and `wave.max_parallel`.
- **GPUs.** Set `round.constraint`, for example `a100|h100|h200|rtx6000pro`. A full GPU is faster, so lower `gpu_minutes` too.
- **Subagents.** To use a role in your own interactive sessions, make its prompt a subagent; see {ref}`Subagents <agentic_ai:configuring_subagents>` in Configuring Agents for Your Project. Do this in your own project. In the clone of this example, a subagent would change round 1.

:::{dropdown} Example: the critic as a subagent
Save this file as `.claude/agents/critic.md` in your own project. Paste the text of `prompts/multi/roles/critic.md` below the frontmatter.

```markdown
---
name: critic
description: Checks a plan of experiment configurations against the rules and the records before any job runs.
tools: Read, Grep, Glob
model: sonnet
---

<the text of prompts/multi/roles/critic.md>
```

The `tools` field gives the subagent read-only tools; see {ref}`Subagents <agentic_ai:orchestration_subagents>` in Multi-Agent Orchestration.
:::

```{seealso}
For the single-agent version, see {doc}`End-to-End Agentic Workflow Example <end_to_end_example>`. For the patterns and costs of several agents, see {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
