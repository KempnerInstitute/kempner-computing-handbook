# End-to-End Agentic Workflow Example

This chapter shows one complete agentic workflow on the Kempner AI cluster, from setup to a checked result. A Claude Code agent prunes a ResNet-18 model for CIFAR-10. The goal is the smallest model that keeps a test accuracy of at least 90%. The [agentic-workflow-example](https://github.com/KempnerInstitute/agentic-workflow-example) repository holds the code, the job scripts, and the agent settings.

- **Round.** One configuration in one GPU job. The job prunes the weights, fine-tunes the model, and measures it on 5,000 validation images.
- **Threshold.** A round passes when its validation accuracy is at least 0.905: 0.900 plus a margin for noise. Only the final steps use the test set.
- **Weights left.** The fraction of nonzero weights in the 20 convolution layers and the linear layer. Fewer is better.

```{mermaid}
flowchart TB
    subgraph SUP [" "]
        direction LR
        S["You set up and<br/>train the baseline"] --> R1(["Round 1:<br/>you approve"]) --> C(["You check<br/>the limits"])
    end
    subgraph LOOP ["Loop job"]
        direction LR
        A["Agent step"] --> J["Round job"]
        J -->|next round| A
        J --> F["Final steps"]
    end
    SUP -->|you start the loop job| LOOP
    LOOP --> V(["You check<br/>the result"])
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class A,J,F agent;
    class S,R1,C,V you;
    style SUP fill:none,stroke:#c8c8d0
    style LOOP fill:none,stroke:#c8c8d0
```

You supervise round 1. Then a loop job runs more rounds without a person, within limits that you check first. This is the bounded loop of {ref}`Workflow patterns <agentic_ai:workflow_patterns>`, with a stopping criterion and a budget.

## Before you start

- **Data.** CIFAR-10 and the code of the example are public (Level 1), so a cloud agent may read them; see {ref}`Before you start <agentic_ai:before_you_start>`.
- **Agent.** Install Claude Code with the native installer, because the loop job looks for `claude` in `~/.local/bin`. Sign in with the Claude access that HUIT provides through Harvard SSO, and leave `ANTHROPIC_API_KEY` unset; see {ref}`Running a terminal agent <agentic_ai:running_a_terminal_agent>`.
- **uv.** Install uv; see {doc}`uv Environment <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`.
- **Partitions.** You need a SLURM account that can use `kempner_requeue` for the GPU jobs and `shared` for the loop job; see {ref}`SLURM Accounts <resource_management:understanding_slurm:slurm_accounts>`. `kempner_requeue` can preempt a job with no warning. The GPU jobs save a checkpoint after each epoch, and they continue after a requeue; see {ref}`Checkpoint and resume <agentic_ai:checkpoint_and_resume>`.
- **Cost.** In a test run, the loop job used about 320,000 tokens and 17 GPU minutes in 66 minutes. The baseline and round 1 added about 2 GPU minutes and one interactive session.

## Set up the project

The project keeps its files in three places; see {doc}`Storage Options <../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>`.

| What | Where | Reason |
|---|---|---|
| Code, environment, and records | Lab storage | Lab storage is persistent. The home directory has a 100 GB limit. |
| uv cache and Python interpreter | Lab storage | The cache is large. The agent sandbox hides your home directory, so an interpreter there cannot run in sandboxed commands; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`. |
| Round checkpoints | Scratch (`RUN_ROOT`) | Scratch is fast. FASRC deletes scratch files after 90 days. |
| CIFAR-10 | The read-only shared copy | No download; see {doc}`Shared Data/Model Repository <../s1_high_performance_computing/storage_and_data_transfer/shared_data_repository>`. |

Clone the repository into lab storage, and copy the settings file:

```bash
mkdir -p /n/holylabs/LABS/<lab_name>/Users/<username>
cd /n/holylabs/LABS/<lab_name>/Users/<username>
git clone https://github.com/KempnerInstitute/agentic-workflow-example.git
cd agentic-workflow-example
cp cluster.env.example cluster.env
```

Edit `cluster.env`: set your SLURM account in `SBATCH_ACCOUNT`, and your lab name and user name in the three paths. `sbatch` reads the account from `SBATCH_ACCOUNT`, so the job scripts need no edit. Then load the file, and build the environment on a compute node:

```bash
source cluster.env && echo "$SBATCH_ACCOUNT $RUN_ROOT"   # check the values
mkdir -p logs && chmod 700 logs          # the hook writes logs/agent-commands.log here
salloc --partition=test --time=0-01:00 --mem=16G --cpus-per-task=4
uv sync --locked --extra gpu             # about 5 GB of packages
readlink -f .venv/bin/python             # must not be in your home directory
exit
```

Before you start Claude Code in the project directory, read its agent configuration, as for any repository that you did not write; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`.

:::{dropdown} What to read, and what to check
- **`AGENTS.md` and `CLAUDE.md`.** The instructions for the agent; see {ref}`Project instructions <agentic_ai:project_instructions>`. `CLAUDE.md` holds only the line `@AGENTS.md`.
- **`.claude/settings.json`.** The allow list holds only `squeue -j`, `sacct -j`, the tests, and the check command. The ask list holds `sbatch`, `srun`, `salloc`, `scancel`, `scontrol`, and `scrontab`. The deny list blocks edits of tracked files, `cluster.env`, and the output directories, and reads of `cluster.env`, the command log, and credential files. Also check that `blockReadsOutsideWorkingDirectories` is `true`, that the sandbox is on, that `disableRemoteControl` is `true`, and that the `env` block sets only `DISABLE_AUTOUPDATER`.
- **`.claude/hooks/guard.sh`.** The hook from {ref}`Hooks <agentic_ai:hooks>`. It blocks `scancel` and recursive deletes. A second hook writes each command to `logs/agent-commands.log`.
- **`.claude/skills/`.** Three skills: `check-round` for this project, and two skills from {doc}`Coding Agent Skills <../s2_swe_for_research/coding_agent_skills>`.
- **`slurm/`, `prompts/`, `src/pruning_example/loop.py`, and `finish.py`.** The job scripts, the prompts, and the code of the unattended phase.
- **No `.mcp.json`.** The project adds no MCP servers.
:::

## Train the baseline

```bash
source cluster.env
sbatch slurm/baseline.sbatch
```

The job trains the dense model for 40 epochs on one GPU, in about 2 minutes. SLURM writes the log to `logs/`, which you created in the setup; see {ref}`Write a batch script <agentic_ai:write_a_batch_script>`. The job is complete when `squeue -j <job_id>` shows nothing and the log ends with `val_accuracy=`. In a test run, `state/baseline/metrics.json` showed a validation accuracy of 0.937.

## Run round 1 with the agent

Round 1 tests the pipeline, not the method: the approvals, the job, and the records. Approve a mild configuration, for example a sparsity of 0.5 to 0.8 with a few epochs. Approve only the exact command `sbatch --wait slurm/round.sbatch agent/next_config.json`. Refuse added options such as `--partition`, `--gres`, or `--time`, because they change the fixed resources of the job.

1. On a login node, start tmux. In tmux, request a CPU job: `salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4`; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
2. In the project directory, run `source cluster.env`, then `claude --permission-mode default`. The trust prompt lists the allow rules of the project, and its default choice is "No, exit". Trust the directory only after you read the agent configuration.
3. Run `/status`, and check that the organization is Harvard's.
4. Give this prompt:

   > Read AGENTS.md and state/baseline/metrics.json. Propose a cautious first round that tests the pipeline, explain it, and write it to agent/next_config.json. Then run `sbatch --wait slurm/round.sbatch agent/next_config.json` as a background command.

5. Read the configuration, and approve the write. Read the `sbatch` command, and approve it; see {ref}`Submit and monitor <agentic_ai:submit_and_monitor>`.
6. When the job ends, type `/check-round 1`. Each line of the output must start with `OK`. If a line starts with `DIFF`, do not start the loop.
7. Type `/exit`. Then type `exit` two times: one time to end the job, and one time to close tmux.

This is the workflow of {doc}`Your First Agentic Workflow on the Cluster <first_agentic_workflow>`, with a SLURM job as the task. In a test run, round 1 removed half the weights with a 2-epoch fine-tune and reached a validation accuracy of 0.932.

## Check the limits, then start the loop

In the unattended phase, no one approves each round. You approve the whole budget one time, so read the limits first:

- **`experiment.yaml`.** The threshold, the plateau rule, the token budget, the GPU budget, the round limit, and the queue and time allowances.
- **`slurm/loop.sbatch`.** The 6-hour time limit of the loop job, which is the final stop.

The limits that matter are outside the model; see {ref}`Prefer enforceable boundaries over prompt instructions <agentic_ai:enforceable_boundaries>`. The agent has different powers in the two phases:

| Guardrail | Round 1 (supervised) | Unattended phase |
|---|---|---|
| Permission mode | `default` (manual); see {ref}`Permission modes <agentic_ai:permission_modes>` | `dontAsk`; see {ref}`Caps on unattended runs <agentic_ai:run_caps>` |
| Tools | All built-in tools | Read, Grep, and Glob only |
| Configuration | You read it, then approve the write | The loop script validates it |
| Writes | The agent asks first. Deny rules block edits of tracked files, `cluster.env`, and the output directories; see {ref}`Permission rules <agentic_ai:permission_rules>`. | None. The loop script writes all files. |
| Reads | File tools: only the project directory. Sandboxed commands: not the home directory. | Only the project directory |
| Shell | Sandbox on, SLURM commands outside it, and a hook that blocks `scancel` and `rm -r` | No shell |
| Jobs | `sbatch` asks | The loop script submits one job at a time, with fixed resources |
| Integrity | The round job stops if a tracked file changed | The same, and the loop script checks too |

{doc}`Agentic AI in Research <agentic_ai_in_research>` advises fuller autonomy only for well-scoped, low-stakes tasks. This task fits: public data, a fixed evaluator, one GPU job at a time, and fixed budgets. {ref}`Prohibited activities <security_and_compliance:prohibited_activities>` forbids "unsupervised or insufficiently controlled agentic workflows at scale" that could interact with cluster infrastructure, networks, user data, credentials, or external systems in ways that create security risk. Here, the unattended agent has no shell, no write tools, and no MCP tools, and it reads only the project directory.

:::{dropdown} Before an unattended run, answered for this example
| Question | Answer |
|---|---|
| Task boundary | Choose the next pruning configuration, and return it as JSON. |
| Read scope | Only the project directory. The prompt points to `state/history.tsv` and `state/notes.md`. |
| Write scope | None. The loop script writes all files. |
| Credentials | None, because the agent step has no shell. Keep secrets out of `cluster.env` and out of commands. |
| Network | Only the model provider. The agent step has no web tools. |
| Data policy | CIFAR-10 is public data (Level 1). |
| Untrusted input | Only project files, and the reasons that earlier agent steps wrote in `state/notes.md`. |
| Resource scope | One GPU job at a time, at most 10 minutes for each run of the job; 60 GPU minutes; 15 round attempts; 1,000,000 tokens; 6 hours. |
| Evidence | The `run_meta.json` file of each round, `state/history.tsv`, `state/ledger.tsv`, the JSON result of each agent step, and the loop log. |
| Stop condition | The stop rules below. SIGTERM stops the loop cleanly. |

See {ref}`Before an unattended run <agentic_ai:before_an_unattended_run>`.
:::

On a login node, in the project directory, start the loop job:

```bash
source cluster.env
sbatch slurm/loop.sbatch
```

For each round, the loop script runs an agent step, validates the configuration, submits one round job, and records the result. The agent step is the print-mode call below. It uses the limits of {ref}`Run an agent unattended in a batch job <agentic_ai:unattended_batch_job>` and the fixed JSON shape of {ref}`Chain steps with print mode <agentic_ai:chain_steps_print_mode>`. The loop script runs it for you, with `$PROMPT` from `prompts/agent_step.md`:

```bash
claude -p "$PROMPT" \
  --permission-mode dontAsk --tools "Read,Grep,Glob" --disallowedTools "mcp__*" \
  --json-schema "$(cat configs/round.schema.json)" \
  --max-turns 8 --max-budget-usd 1.00 --output-format json
```

:::{dropdown} Stop rules and budgets
Before each round, the loop script checks these rules, in this order:

1. 15 round attempts, round 1 included.
2. 3 complete rounds in a row without a smaller model that keeps the threshold.
3. The token budget. The loop script adds the largest earlier agent step to the total, and it stops if the sum passes 90% of the budget. The other 10% stays for the report step.
4. 60 GPU minutes.
5. 2 failed attempts in a row.
6. Too little job time for one more round and the final steps.

The loop script also stops when a job waits more than 45 minutes in the queue, or when a tracked file changes. It stops too when the JSON result of an agent step has no token counts.

- **Tokens.** Claude Code has no flag for a total token limit. The loop script adds the input, output, cache read, and cache creation tokens of each model in the `modelUsage` field of each result. The token rule is an estimate: one step can use more than the largest earlier step.
- **GPU minutes.** The loop script reads them from `sacct -D`, which counts each run of a requeued job. No round starts after 60 GPU minutes. With the last round and the confirmation round, the total can reach about 80, or more if SLURM preempts jobs.
- **One job, not a chain.** One loop job is easier to watch and to stop than the dependent jobs of {ref}`Chain agent runs with SLURM <agentic_ai:chain_runs_slurm>`. It holds only 2 CPUs and 8 GB.
:::

- **Watch.** Use `tail -f logs/prune-loop_<job_id>.out`, `state/history.tsv`, and `state/ledger.tsv`. Do not turn on remote control; see {ref}`Remote control <agentic_ai:remote_control>`.
- **Stop.** Run `scancel <loop_job_id>`. The loop script cancels its own round job and writes `state/summary.json`. Check with `squeue --me` that the round job is gone.
- **Finish later.** After an early stop, `sbatch slurm/loop.sbatch --finish` runs only the final steps.
- **Problems.** If the agent behaves unexpectedly, follow {ref}`Reporting a concern <security_and_compliance:reporting_a_concern>`.

:::{dropdown} Example: the end of the loop log in a test run
```text
2026-10-17 22:52:36 round 14: val_accuracy=0.9100 weights_left=0.007854 passes=yes tokens=22079 gpu_minutes=1.03 (totals: 277274 tokens, 15.1 GPU minutes)
2026-10-17 22:52:50 round 15: submitted job 53657818
2026-10-17 22:55:52 round 15: val_accuracy=0.9076 weights_left=0.007454 passes=yes tokens=22194 gpu_minutes=0.97 (totals: 299468 tokens, 16.1 GPU minutes)
2026-10-17 22:55:52 stop: round_limit
2026-10-17 22:55:53 confirmation round: submitted job 53658032
test evaluation, round 15: test_accuracy=0.9045
test evaluation, confirm 15: test_accuracy=0.9032
2026-10-17 23:00:12 final steps done: see state/summary.json and state/final_report.md
```
:::

:::{dropdown} Test the loop with small limits
Do not edit `experiment.yaml` for a test: the round job refuses to start while a tracked file has uncommitted changes. Put a test copy in `local/`, which Git ignores, and point the jobs to it:

```bash
mkdir -p local
cp experiment.yaml local/small.yaml       # then lower the limits in the copy
STATE_DIR=local/state_small EXPERIMENT_FILE=local/small.yaml sbatch slurm/loop.sbatch
```

The loop needs a round 1 in the state directory. The summary records the experiment file and its hash.
:::

## Check the result

After the last round, the loop script selects the passing round with the fewest weights left. If no round passes, it selects the round with the highest validation accuracy. Then it runs the final steps:

1. A confirmation round: the same configuration with a different seed for the order and augmentation of the fine-tuning data.
2. One test evaluation of each of the two models. `logs/final_eval.log` records each call, and `state/test_eval/` holds the two results.
3. A copy of the selected model in `results/state/round_NN_model.pt` on lab storage, because scratch files are temporary.
4. `state/summary.json`, with the stop reason, the totals, the agent model, and both seeds.
5. If the token budget allows, a draft report from a read-only agent step, in `state/final_report.md`.

Then check the result yourself; see {ref}`Check the output <agentic_ai:check_the_output>` and {ref}`Watch what it did <agentic_ai:watch_what_it_did>`:

- **Report.** Compare each number in the report with `state/summary.json`. The report gives the tokens and the cost before its own step, so these two numbers are lower than in the summary. In a test run, the report wrote one wrong interval, then corrected it in the next line.
- **Records.** In an interactive job, run `.venv/bin/python -m pruning_example.check_round N`, where N is `selected.round` in the summary. An exit status of 0 means that each check passed.
- **Seeds.** The confirmation round agrees when it also keeps the threshold, and its test accuracy is in the 95% interval of the selected round.
- **Stop reason.** `round_limit`, `plateau`, `token_budget`, `gpu_budget`, `failed_attempts`, `queue_limit`, and `time_left` are normal stops. `integrity` and `agent_format` mean a fault. `"terminated": true` means an early stop.
- **Code.** Check that the commit in each `run_meta.json` is the commit that you read.
- **Cost.** Read the tokens, the estimated cost, and the GPU minutes in the summary and in `state/ledger.tsv`; see {ref}`Watch cost and context <agentic_ai:watch_cost>`.
- **Test set.** Change nothing after the test evaluation.

A rerun can take a different path. Its numbers are close, not identical, because the jobs can run on different GPU types, and the code does not force deterministic algorithms. Keep the records with the model; see {ref}`Best practices for trustworthy agentic research <agentic_ai:trustworthy_practices>` and {doc}`Reproducible Research <../s2_swe_for_research/reproducible_research>`.

## Results of a test run

| Result | Value |
|---|---|
| Rounds | Round 1 supervised, rounds 2 to 15 in the loop job. The loop stopped at the round limit. 14 of 15 rounds kept the threshold. |
| Selected model | Round 15: sparsity 0.9927 with `conv1` kept dense, 83,215 nonzero weights (0.745%) |
| Size | 1.56 MB as a bitmask with FP16 values, against 44.7 MB for the dense model in FP32 |
| Accuracy | Validation 0.9076 and test 0.9045 (95% interval 0.899 to 0.910). Second seed: validation 0.9050 and test 0.9032. |
| Use of the loop job | 323,072 tokens (about $1.11), 17 GPU minutes, 66 minutes |

Until round 7, the agent raised the sparsity in each round. Round 8 changed three settings at once and fell below the threshold. From round 9, the agent went back to the recipe of round 7. It then raised the learning rate by 0.01 in each round, from 0.02 to 0.08. All later rounds kept the threshold.

:::{dropdown} All 15 rounds
| Round | Sparsity | Steps | Epochs in total | Learning rate | Validation accuracy | Weights left |
|---|---|---|---|---|---|---|
| 1 | 0.5 | 1 | 2 | 0.01 | 0.9320 | 50% |
| 2 | 0.85 | 2 | 4 | 0.01 | 0.9356 | 15% |
| 3 | 0.95 | 3 | 6 | 0.01 | 0.9180 | 5.01% |
| 4 | 0.97 | 4 | 8 | 0.01 | 0.9196 | 3.02% |
| 5 | 0.98 | 5 | 10 | 0.01 | 0.9074 | 2.02% |
| 6 | 0.985 | 6 | 18 | 0.01 | 0.9090 | 1.52% |
| 7 | 0.988 | 5 | 20 | 0.01 | 0.9052 | 1.22% |
| 8 | 0.989 | 4 | 20 | 0.01 | 0.8976 (below) | 1.12% |
| 9 | 0.9885 | 5 | 20 | 0.02 | 0.9126 | 1.17% |
| 10 | 0.9895 | 5 | 20 | 0.03 | 0.9154 | 1.07% |
| 11 | 0.991 | 5 | 20 | 0.04 | 0.9078 | 0.92% |
| 12 | 0.9915 | 5 | 20 | 0.05 | 0.9096 | 0.87% |
| 13 | 0.992 | 5 | 20 | 0.06 | 0.9074 | 0.82% |
| 14 | 0.9923 | 5 | 20 | 0.07 | 0.9100 | 0.79% |
| 15 | 0.9927 | 5 | 20 | 0.08 | 0.9076 | 0.75% |

From round 3, `conv1` stayed dense. Round 8 also used a weight decay of 0.0002 in place of 0.0005.
:::

The confirmation round passed exactly at the threshold, and both test values are below 0.905. The draft report flagged both points. Treat the result as a lead to check, not as a finding.

## Adapt the example

- **Change.** Replace the task: the data, the model, the metric, the configuration schema, the threshold, and the limits.
- **Keep.** Keep the parts that make the run safe: the fixed evaluator, the read-only agent step, the loop script, and the limits outside the model. Also keep the parts that make the result checkable: the run records, the confirmation round, and the one-time test evaluation.
- **Data.** Check that the data level of your data and your results allows the agent to read them. Most unpublished research data is Level 2; see {ref}`Before you start <agentic_ai:before_you_start>`.
- **Rounds.** Decide what the agent may change in each round, as in {doc}`Experiment Management with Agents <experiment_management_with_agents>`.

To extend the code with the agent, use the two skills from {doc}`Coding Agent Skills <../s2_swe_for_research/coding_agent_skills>` in an interactive session. The project settings deny edits of `src/` and `tests/`. So work on a development branch, and remove those two deny rules from `.claude/settings.json` on that branch. When the code is done, put the deny rules back, and commit everything. The round job refuses to start while a tracked file has uncommitted changes.

- **Tests.** For a new metric or model, ask: "Use the testing-and-continuous-integration skill: add tests for the new code and run them." The tests use generated images, so they need no GPU.
- **Run records.** For a new dataset or a new output, ask: "Use the reproducible-research skill: check that each run still records its seed, commit, and data version."
- **Checks.** The `check-round` skill is specific to this project. To write your own skill, see {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.

```{seealso}
For the setup of agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For the guardrails, see {doc}`Configuring Agents for Your Project <configuring_agents>` and {doc}`Agent Security and Scoping <agent_security_and_scoping>`. For SLURM tasks with an agent, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>` and {doc}`Which Kempner Partition Should Your Job Run On? <../technical_blog/choosing_gpu_partition>`. For checking agent results, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.
```
