# Multi-Agent Workflow Example

This chapter runs the task of {doc}`End-to-End Agentic Workflow Example <end_to_end_example>` with four agent roles: a planner, a critic, a writer, and an auditor. The loop script still submits the jobs and writes the records. The code is in the [agentic-workflow-example](https://github.com/KempnerInstitute/agentic-workflow-example) repository.

```{mermaid}
flowchart TB
    subgraph SUP [" "]
        direction LR
        S(["Setup, baseline,<br/>and round 1"]) --> P["Plan-only job:<br/>plan wave 1"] --> R(["You read<br/>the plan"])
    end
    subgraph LOOP ["Loop job"]
        direction LR
        W["Planner and<br/>critic"] --> J["Up to 3<br/>round jobs"]
        J -->|next wave| W
        J --> F["Final<br/>steps"]
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

| Part | Single-agent example | This chapter |
|---|---|---|
| Agents | One agent step for each round, and a report step | Planner, critic, writer, and auditor |
| Rounds | One round job at a time | Waves of up to 3 round jobs |
| Check before a round | The schema | The schema, a repeat check, and the critic |
| GPUs | Full GPUs | A100 MIG slices |
| Confirmation | One confirmation round | Two confirmation rounds, and the means of 3 seeds |
| Check of the report | You | The auditor and two code checks, then you |

Several agents cost more tokens. Use them only when a test shows a gain; see {ref}`Start with one agent <agentic_ai:start_with_one_agent>`. This example runs that test. Our runs could not show a gain from the extra agents; see {ref}`Our runs <agentic_ai:multi_agent_our_runs>`.

## Before you start

- **Single-agent example.** Do the setup, the baseline, and round 1 of {doc}`End-to-End Agentic Workflow Example <end_to_end_example>`. This loop copies round 1 to its own state directory, `state_multi/`.
- **Code.** In your clone, run `git pull`. Then `git status` must show no changes.
- **Records.** If you ran the single-agent loop in this clone, the agents can read its records in `state/`. For a separate result, use a new clone.
- **GPUs.** The round jobs run on `kempner_requeue` with `--constraint=a100-mig`. This selects A100 MIG slices (3g.20gb): parts of an A100 GPU with 20 GB of memory each. One round takes 1 to 3 minutes.
- **Cost.** The budget is 1,250,000 tokens, the plan-only job included, and 150 GPU minutes for the rounds. Both are estimates: a step can use more than planned. In our run with the default settings, this loop used 1,348,571 tokens. The confirmation rounds can add up to 20 GPU minutes, and each requeue up to 10.
- **Your changes.** The jobs refuse to start while a tracked file has changes. So commit each change to `experiment_multi.yaml`. For a test, use a copy in `local/`, as the README shows.

## Step 1: Check the settings

Read `experiment_multi.yaml`, `slurm/multi_loop.sbatch`, `slurm/round_array.sbatch`, and the prompts in `prompts/multi/`. These files set what the agents and the jobs can do.

| Role | Model | Effort | Task |
|---|---|---|---|
| Planner | `claude-opus-5-5` | `xhigh` | Plans up to 3 configurations for each wave, each with a hypothesis, a predicted validation accuracy, and a pass probability. Revises rejected configurations one time. |
| Critic | `claude-sonnet-5-5` | `high` | Accepts or rejects each configuration before any GPU job runs |
| Writer | `claude-sonnet-5-5` | `medium` | Writes the draft report |
| Auditor | `claude-opus-5-5` | `max` | Checks each claim of the report against the records |

- **Change a role.** Edit its `model` and `effort` in `roles`. Use full model names, because an alias such as `opus` moves to newer models. Keep a different model for a checker and the role that it checks.
- **One agent.** Set `roles.critic.enabled: false`. Then one agent plans the waves.
- **Model check.** Claude Code can use another model with only a warning, for example when your organization does not allow a model. A planner or critic step with another model stops the loop with `model_check`. For the writer and the auditor, `audit.json` records it in `failures`.

| Limit | Value |
|---|---|
| Threshold | Validation accuracy of at least 0.905 |
| Plateau | Stop after 6 complete rounds in a row, in round order, without a smaller passing model |
| Tokens | 1,250,000: 800,000 for the search, 450,000 for the writer and the auditor. The search stops when the next wave could pass 800,000. |
| GPU | 150 GPU minutes. Each round of a wave reserves its 10-minute time limit. |
| Rounds | 45 round attempts, round 1 included |
| Failed waves | Stop after 2 waves in a row with no complete round |
| Round jobs at the same time | At most 3, as one array job; see {ref}`Array Jobs <resource_management:array_jobs>` |
| Queue | 45 minutes for one array job. Then the loop script cancels the waiting tasks and stops. |
| Loop job | `shared`, 2 CPUs, 8 GB, 6 hours. No new wave starts in the last 3 hours, which are for the role steps and the final steps. |

The agents have the guardrails of the single-agent example. They have no shell, no write tools, and no MCP tools. They cannot read outside the project directory, or read the README; see {ref}`Guardrails <agentic_ai:guardrails>` and {ref}`Prohibited activities <security_and_compliance:prohibited_activities>`. Only the scale changes: up to 3 GPU jobs at a time, within a fixed GPU budget.

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
- **Caps.** Each role has its own caps; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`. In our run with the default settings, the planner and the critic used 70,000 to 194,000 tokens for each wave, and the auditor 619,300.
:::

:::{dropdown} Before an unattended run, answered for this example
| Question | Answer |
|---|---|
| Task boundary | Plan or check configurations, or write or check the report |
| Read scope | Only the project directory, without the README |
| Write scope | None. The loop script writes all files. |
| Credentials | None. The agents have no shell. |
| Network | Only the model provider |
| Data policy | CIFAR-10 is public data (Level 1). |
| Untrusted input | Project files, and the outputs of earlier role steps in `state_multi/` |
| Resource scope | At most 3 GPU jobs at a time, at most 10 minutes for each run of a job; 150 GPU minutes; 45 round attempts; 1,250,000 tokens; 6 hours |
| Evidence | The `run_meta.json` file of each round, `history.tsv`, `ledger.tsv`, `waves/`, `hypotheses.tsv`, `summary.json`, `audit.json`, the JSON result of each role step, and the loop log |
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

2. When `squeue -j <job_id>` shows nothing, the log `logs/prune-multi-loop_<job_id>.out` must end with `wave 1 planned: N configuration(s) accepted`.
3. Read `state_multi/waves/wave_01/plan.md`. It shows each configuration and the verdict of the critic. A rejected configuration gets one revision. If the critic rejects the revision too, the configuration is dropped.
4. To accept the plan, start the loop; see {ref}`Step 3: Start the loop <agentic_ai:multi_agent_start_the_loop>`.
5. To plan again, remove `state_multi/waves/wave_01/`, and submit the job again. In our run with the default settings, the plan of wave 1 used about 86,000 tokens. Do not edit the files of the plan by hand.

:::{dropdown} Example: a plan of wave 1 with the default roles
| Item | Sparsity | Steps | Epochs | Learning rate | Excluded | Predicted validation accuracy | Pass probability | Status |
|---|---|---|---|---|---|---|---|---|
| 1 | 0.92 | 2 | 10 | 0.02 | none | 0.928 | 0.92 | accepted |
| 2 | 0.96 | 4 | 16 | 0.03 | none | 0.917 | 0.75 | accepted |
| 3 | 0.985 | 5 | 20 | 0.05 | `conv1`, `fc` | 0.906 | 0.45 | accepted |

The critic on item 3: "It is bold, but nothing in the history says it will fail, and the 0.45 pass probability is stated openly."
:::

(agentic_ai:multi_agent_start_the_loop)=
## Step 3: Start the loop

On a login node, in the project directory, submit the loop job:

```bash
source cluster.env
sbatch slurm/multi_loop.sbatch
```

Wave 1 runs the plan that you read. For each later wave, the planner plans, the code and the critic check the plan, and the loop script submits one array job. This is the pattern of {ref}`Run an agent unattended in a batch job <agentic_ai:unattended_batch_job>`.

- **Watch.** Run `tail -f logs/prune-multi-loop_<job_id>.out`. Do not turn on remote control; see {ref}`Remote control <agentic_ai:remote_control>`.
- **Stop.** Run `scancel <loop_job_id>`. The loop script cancels its array job. Check with `squeue --me` that no `prune-round` task is left.
- **Continue.** Submit the loop job again. It counts the GPU minutes of the canceled tasks, and it continues the search.
- **Finish later.** Run `sbatch slurm/multi_loop.sbatch --finish`. It runs only the final steps, and it keeps the selected round. After the final steps, the loop job refuses to start in the same state directory. To search again, use a new one.
- **Timeouts.** If `sacct -j <array_job_id>` shows `TIMEOUT`, and the logs `logs/prune-round_<job_id>.out` have no epoch line, reads from `DATA_DIR` hang. Each such round uses 10 GPU minutes. Stop the loop, and tell FASRC.
- **Problems.** If the agents behave unexpectedly, follow {ref}`Reporting a concern <security_and_compliance:reporting_a_concern>`.

:::{dropdown} Example: the loop log in a test with small limits
The test allowed 4 round attempts, and its roles used low effort levels. Its plan was not the plan above. Its state directory was `local/f1b_state/`. The test canceled the loop job on purpose during the confirmation rounds:

```text
2026-10-22 23:21:12 wave 1: submitted array job 54797113, rounds 2 to 4
2026-10-22 23:26:14 wave 1: round 2: val_accuracy=0.9330 weights_left=0.100000; round 3: val_accuracy=0.9286 weights_left=0.050583; round 4: val_accuracy=0.9236 weights_left=0.020601; tokens planner 23351, critic 22286 (totals: 45637 tokens, 6.3 GPU minutes)
2026-10-22 23:26:14 stop: round_limit
2026-10-22 23:26:14 confirmation rounds: submitted array job 54797493 for seeds 1, 2
2026-10-22 23:29:52 SIGTERM: asked SLURM to cancel array job 54797493.
```

Then `--finish` counted the canceled tasks and ran the confirmation rounds again. The two `confirm 4` lines are seeds 1 and 2:

```text
2026-10-22 23:30:21 counted the GPU minutes of 1 job(s) that an earlier loop job did not count
2026-10-22 23:30:24 confirmation rounds: submitted array job 54797902 for seeds 1, 2
test evaluation, round 4: test_accuracy=0.9204
test evaluation, confirm 4: test_accuracy=0.9250
test evaluation, confirm 4: test_accuracy=0.9211
2026-10-22 23:37:55 final steps done: see f1b_state/summary.json, final_report.md, and audit.json
```
:::

(agentic_ai:multi_agent_check_the_result)=
## Step 4: Check the result

After the last wave, the loop script selects the passing round with the fewest weights left. If no round passes, it selects the round with the highest validation accuracy. The search rounds use seed 0. The loop script runs two confirmation rounds of the selected round, with seeds 1 and 2. It evaluates the three models on the test set, copies the selected model to `results/state_multi/`, and runs the writer and the auditor. Then check these files in `state_multi/`; see {ref}`Check the output <agentic_ai:check_the_output>`:

| File | Check |
|---|---|
| `summary.json` | `stop_reason` is a normal stop. `integrity`, `agent_format`, and `model_check` mean a fault. |
| `summary.json` | `means.holds` is `true`: the 3-seed means are at least 0.905 for validation and 0.900 for test. If it is `false`, the result does not hold, so report the 3-seed means. If it is `null`, a confirmation round is missing. Run `--finish`. |
| `audit.json` | `auditor_step_failed` is `false`. Each claim is `supported`. Check each claim that is not. If the auditor step failed, read `failures`. |
| `audit.json` | Check each number in `unmatched_numbers`. The code check `check_report` did not find it in the records. A derived number, such as a margin, is often correct. |
| `audit.json` | `check_round.ok` is `true`. |
| `final_report.md` | Read it after the checks above. Its tokens and cost are from before the writer and auditor steps. |
| `ledger.tsv` | The tokens of each role, and the GPU minutes of each job |

The auditor and the code checks do not replace your check; see {ref}`Best practices for trustworthy agentic research <agentic_ai:trustworthy_practices>`.

To audit the report of the single-agent example, run `source cluster.env`, then `STATE_DIR=state sbatch --time=01:00:00 slurm/multi_loop.sbatch --audit-only`. It writes `state/audit.json`. In our runs and tests, the audit of a single-agent report used 133,000 to 359,000 tokens.

(agentic_ai:multi_agent_our_runs)=
## Our runs

We ran three designs, called arms, on October 23, 2026, one run of each. We fixed the comparison rule before the runs.

| Arm | Design |
|---|---|
| 1 | One agent, one round at a time: the loop of the single-agent example, with the limits below |
| 2 | One agent, waves of 3: this loop with the critic off |
| 3 | Planner and critic, waves of 3: this loop |

- **Same conditions.** All arms start from the same baseline and round 1, each in its own clone. In each arm, `claude-opus-5-5` at `xhigh` decides, `claude-sonnet-5-5` writes the report, and the auditor checks it. Each arm has 800,000 tokens for the search, 45 round attempts, a plateau of 6 rounds, two confirmation rounds, and 150 GPU minutes on MIG slices.
- **Result.** The result of an arm holds if its 3-seed means are at least 0.905 for validation and 0.900 for test. We compare only results that hold, by their weights left.
- **Difference.** An arm is better than another arm only if both results hold, and its weights left are at least 0.15 percentage point lower, for example 0.60% against 0.75%.

:::{dropdown} The settings of the arms
- **Arm 1.** A copy of `experiment.yaml` in `local/arm1.yaml`, with these changes:

  ```yaml
  target:
    plateau_rounds: 6
  round:
    constraint: a100-mig
  budget:
    tokens: 888889             # 800,000 for the search, with report_reserve_fraction 0.10
    gpu_minutes: 150
    gpu_reservation: true      # start a round only if its 10-minute limit fits in the budget
    max_round_attempts: 45
    final_reserve_minutes: 110
  agent_step:
    effort: xhigh
    max_turns: 10
    max_budget_usd: 3.00
    timeout_minutes: 20
  report_step:
    model: claude-sonnet-5-5
  confirmation_seeds: [1, 2]
  ```

  After round 1, run `source cluster.env`, then `EXPERIMENT_FILE=local/arm1.yaml sbatch slurm/loop.sbatch`. To audit its report, run `STATE_DIR=state sbatch --time=01:00:00 slurm/multi_loop.sbatch --audit-only`.
- **Arm 2.** A copy of `experiment_multi.yaml` in `local/arm2.yaml`, with `roles.critic.enabled: false`. Put `EXPERIMENT_FILE=local/arm2.yaml` before the `sbatch` commands of Steps 2 and 3.
- **Arm 3.** `experiment_multi.yaml`, with the commands of Steps 2 and 3.
:::

| Result | Arm 1 | Arm 2 | Arm 3 |
|---|---|---|---|
| Stop | Plateau | Plateau | Token budget |
| Rounds after round 1 | 14 | 21 | 21 |
| Selected round | Round 9 | Round 16 | Round 21 |
| Weights left | 0.700% | 0.485% | 0.661% |
| Validation accuracy of seeds 0, 1, and 2 | 0.9058, 0.9032, 0.9040 | 0.9052, 0.9046, 0.9016 | 0.9088, 0.9030, 0.9028 |
| Means of the 3 seeds: validation, test | 0.9043, 0.9001 | 0.9038, 0.8978 | 0.9049, 0.9017 |
| Result holds | No (validation) | No (both) | No (validation) |
| Tokens of the search | 626,272 | 616,201 | 692,090 |
| Tokens of the report and the audit | 157,494 | 262,900 | 656,481 |
| Estimated cost | $2.79 | $4.22 | $5.99 |
| GPU minutes, confirmation included | 41.8 | 59.9 | 61.8 |
| Time of the search, with the plan-only job of arms 2 and 3 | 62 minutes | 45 minutes | 52 minutes |

- **No result holds.** So the runs cannot show a difference between the arms. Arm 3 found its smallest passing model in its last wave, then the token budget stopped it.
- **Selection.** The loop selects the smallest model that passed with seed 0. Near the threshold, a lucky seed helps a model pass. In each arm, both confirmation rounds of the selected round were below 0.905.
- **Tokens.** Arm 3 used 1,348,571 tokens, 8% more than its budget. Its auditor used 619,300 tokens, more than the 450,000 kept for the writer and the auditor.
- **Cluster.** All rounds after round 1, and the confirmation rounds, ran on A100 MIG slices (3g.20gb), with no requeue. In the search, each arm waited 4 to 6 minutes in the queue in total. Your waits can be much longer.
- **Limit.** One run of each arm is a worked example, not a proof. The tokens of each role change from run to run.

Before the runs, we tested the critic and the auditor in a CPU job, with the records of the test run of the single-agent example; see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.

| Test | Result |
|---|---|
| Critic: 5 clear rule violations that we made, 3 runs each | Rejected in 15 of 15 runs, each for the right reason |
| Critic: the 14 configurations of the test run, 3 runs each | Accepted in 41 of 42 runs |
| Auditor: the report of the test run, with 3 known errors | Found the 3 errors, and 2 errors that we did not know. `check_report` found 1. |
| Auditor: the report with the 3 known errors fixed | Found the 2 other errors again, and gave 1 false alarm |
| Auditor: the fixed report with 5 errors that we added | Found the 5 errors, and 1 of the 2 other errors. `check_report` found 2. |

In the runs, the critic accepted all 21 configurations of arm 3. The auditor marked 3, 2, and 3 claims as wrong in the reports of arms 1, 2, and 3. In arm 1, two of them were the tokens and the cost from before the report step; see {ref}`Step 4: Check the result <agentic_ai:multi_agent_check_the_result>`. `check_report` found only these two wrong claims. The third named one agent model, but the run used two. The reports gave the selected round and the 3-seed means correctly.

## Was it worth it?

Not for the search: no result held, so the runs could not show a gain, and the critic rejected no configuration. The waves saved time, and the auditor found wrong claims that the code checks missed.

| Check of {ref}`Before you trust the result <agentic_ai:before_you_trust_the_result>` | Evidence |
|---|---|
| A single agent was tried on the same task, and the multi-agent version did measurably better. | No. No arm has a result that holds, so the runs could not show a gain. |
| Each agent had only the tools and budget its step needed. | Partly. Read-only tools, role caps, and the model check. The auditor of arm 3 used more tokens than its reserve. |
| You read each step's output, not only the last. | Yes. The plan of wave 1 before the loop. The later plans, `hypotheses.tsv`, and `audit.json` after it. |
| The reviewer worked from the diff in a fresh context, not from the implementer's summary. | Partly. The critic and the auditor are separate `claude -p` calls. The critic reads the reason of the planner for each configuration, as its rules need. |
| The plan, the review, and each step's JSON result are kept, and the total cost is recorded. | Yes. `state_multi/` and `summary.json` |

- **Waves.** Arm 2 ran 21 rounds in 45 minutes, and arm 1 ran 14 rounds in 62 minutes. Each round used about 2.6 GPU minutes in both arms. Arm 2 used fewer search tokens for each round. Use waves when time matters.
- **Critic.** It rejected no configuration, and it used 231,560 of the 692,090 search tokens of arm 3. It can help when a bad round uses many GPU hours. Test it on your task first.
- **Auditor.** It found wrong claims that `check_report` did not find: in the tests, and in the reports of arms 2 and 3. Use it for each report that you share.
- **Confirmation.** The confirmation rounds were the most useful check. With seed 0 alone, each selected round passed the validation threshold.

## Adapt the example

- **Roles.** Change the models, the effort levels, and the caps in `experiment_multi.yaml`. Commit the change.
- **Waves.** Change `wave.size` and `wave.max_parallel`. More GPU jobs at a time make the unattended run larger, so read {ref}`Prohibited activities <security_and_compliance:prohibited_activities>` first.
- **GPUs.** Set `round.constraint` in `experiment_multi.yaml`, for example `a100|h100|h200|rtx6000pro`. A full GPU is faster, so lower `gpu_minutes` too, but keep 10 minutes for each round of a wave.
- **Subagents.** To use a role in your own interactive sessions, make its prompt a subagent; see {ref}`Subagents <agentic_ai:configuring_subagents>` in Configuring Agents for Your Project. Do not add it to the clone of this example: a new file in `.claude/` stops the jobs with `integrity`.

:::{dropdown} Example: the critic as a subagent
Save this file as `.claude/agents/critic.md` in your own project. Paste the text of `prompts/multi/roles/critic.md` below the frontmatter, and change its file names and rules to those of your project.

```markdown
---
name: critic
description: Checks a plan of experiment configurations against the rules and the records before any job runs.
tools: Read, Grep, Glob
model: claude-sonnet-5-5
---

<the text of prompts/multi/roles/critic.md, changed for your project>
```

The `tools` field gives the subagent read-only tools; see {ref}`Subagents <agentic_ai:orchestration_subagents>` in Multi-Agent Orchestration.
:::

```{seealso}
For the single-agent example, see {doc}`End-to-End Agentic Workflow Example <end_to_end_example>`. For the patterns and costs of several agents, see {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
