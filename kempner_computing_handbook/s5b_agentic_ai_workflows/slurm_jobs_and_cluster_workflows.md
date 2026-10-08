# SLURM Jobs and Cluster Workflows

An agent can take on routine cluster work: writing batch scripts, checking on jobs, explaining failures, and adapting code to more GPUs. This page shows each task with examples run on the Kempner AI cluster, starting with the guardrails. The examples use Claude Code and [ClusterTool](https://github.com/KempnerInstitute/clustertool), the Kempner command-line tool that wraps SLURM and FASRC's site tools; install it once with `uv tool install 'clustertool[tui]'` (see {doc}`uv Environment <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`). For SLURM itself, see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>`.

```{mermaid}
flowchart LR
    W["Write or fix<br/>the batch script"] --> A{"You approve<br/>sbatch"}
    A --> M["Monitor<br/>the job"]
    M --> D["Diagnose<br/>the result"]
    D -->|propose a fix| W
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class W,M,D agent;
    class A you;
```

## Set the guardrails first

Let the agent look freely, and make it ask before it acts. Use permission rules so that read-only queries run without prompts and anything that submits, changes, or cancels a job waits for you, and add a hook that blocks job cancellation; see {ref}`Guardrails <agentic_ai:guardrails>`. If you use the agent sandbox, exclude SLURM commands from it and have the agent run them as simple calls; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

ClusterTool commands fall into three groups. Before you allow a command not listed here, check what it does in the [ClusterTool documentation](https://github.com/KempnerInstitute/clustertool).

| Group | ClusterTool commands |
|---|---|
| Safe to allow (read-only) | `jobs list`, `jobs show`, `jobs why`, `jobs log` (without `-f`), `jobs history`, `jobs debug`, `jobs stats`, `jobs scope`, `jobs failures`, `jobs best-partition`, `gpu util`, `gpu avail`, `gpu status`, `nodes partitions`, `nodes frag`, `nodes load`, `account fairshare`, `account limits`, `storage quota`, `storage scratch`, `me --plain` |
| Ask first (change state or start work) | `jobs submit`, `jobs new`, `jobs cancel`, `jobs hold`, `jobs release`, `jobs requeue`, `gpu session`, `diag nccl`, `diag nvlink`, `diag io-probe` |
| Never (administrator commands) | `account add-user`, `account remove-user`, `account set-fairshare`, `jobs set-priority`, `nodes resume`, the `qos` commands other than `qos holders`, `diag ib`, `gpu monitor-partition` |

Administrator commands fail without administrator rights. Live displays such as the `me` dashboard, `gpu monitor-job`, `gpu nvtop`, `gpu pulse`, and `jobs top` are read-only but not useful to an agent. ClusterTool works on compute nodes, so an agent in an interactive job can use it.

## Write a batch script

> Write a batch script that runs `train.py` on one GPU on the `kempner` partition with my account `<your_account>`: 8 CPUs, 32 GB of memory, 15 minutes, and output in `logs/`. Show me the script before saving it.

```bash
#!/bin/bash
#SBATCH --job-name=train-1gpu
#SBATCH --partition=kempner
#SBATCH --account=<your_account>
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=00:15:00
#SBATCH --output=logs/%x_%j.out

set -euo pipefail
cd "$SLURM_SUBMIT_DIR"
.venv/bin/python train.py
```

Before it runs, check the partition and account, the GPU request (the Kempner partitions are GPU-only), CPUs and memory within the per-GPU limits in {doc}`Cluster Usage Policies <../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>`, the time limit, and the environment. To find where a job starts soonest, the agent can run `clustertool jobs best-partition job.sbatch`, which asks SLURM without submitting, or `clustertool nodes frag`, which shows how many jobs of a given shape fit now.

:::{dropdown} Example: clustertool nodes frag
```text
$ clustertool nodes frag -p kempner_rtx --cpus-per-gpu 8 --mem-per-gpu 32768
Free GPU shards and N-GPU-job fit  (job shape: 8 CPU + 32768 MiB per GPU)

  Partition                 Nodes  FreeGPUs(0/1/2/3/4+)    Fit1  Fit2  Fit4
  kempner_rtx                  23  14/2/4/1/2                21     9     2

  1 GPU node(s) not accepting new work, excluded
    holygpu7c1928 (DOWN+DRAIN+NOT_RESPONDING)
```

A 4-GPU job on one node would fit on 2 nodes right away, and the tool flags a node that is down.
:::

## Submit and monitor

Approve the `sbatch` when the agent asks. To follow the job, the agent can use `squeue --me`, `clustertool jobs list`, and `clustertool jobs log <job_id>`. Ask it to check once a minute or less often, because frequent polling spends tokens and loads the shared scheduler. For a short job, it can run `sbatch --wait` as a background command, which returns when the job ends.

## Diagnose a failure

`clustertool jobs debug <job_id>` reads a job's accounting record and names the likely cause. These two jobs failed on purpose:

::::{tab-set}
:::{tab-item} Out of memory
The job asked for 4 GB and used 8:

```text
$ clustertool jobs debug 51161725
Job 51161725 diagnosis

State:    OUT_OF_MEMORY (exit 0:125)
Elapsed:  00:00:26 / 00:10:00
Memory:   peak 2 MiB used, 4G requested
Nodes:    holygpu7c1934

Diagnosis:
  - Ran out of memory
      Request more memory (--mem) or reduce memory usage.
```
:::
:::{tab-item} Time limit
The job had two minutes for a longer run:

```text
$ clustertool jobs debug 51161726
Job 51161726 diagnosis

State:    TIMEOUT (exit 0:0)
Elapsed:  00:02:29 / 00:02:00
Memory:   peak 803 MiB used, 16G requested
Nodes:    holygpu7c1934

Diagnosis:
  - Hit the time limit
      Increase --time, or checkpoint and resume.
```
:::
::::

Both diagnoses are right, but note "peak 2 MiB used" for a job killed for using too much memory. SLURM samples memory, and the spike happened between samples, so the recorded peak is misleading. The job's own log is definitive:

```text
slurm_script: line 16: 1394572 Killed   ../.venv/bin/python train.py --host-mem-gb 8 --steps 1000
error: Detected 1 oom_kill event in StepId=51161725.batch. Some of the step tasks have been OOM Killed.
```

Have the agent read the state, the log, and the request together before it proposes a fix: more `--mem`, less memory use, or, for a timeout, more `--time` or checkpoints; see {doc}`Experiment Management with Agents <experiment_management_with_agents>`.

## Scale to more GPUs, and measure

> Convert `train.py` to DistributedDataParallel and write a 4-GPU batch script that launches it with `torchrun`. Keep the global batch size the same, then compare the time for 40,000 steps with the single-GPU run.

Check the conversion against the standard pattern: initialize the process group, pick the GPU from `LOCAL_RANK`, wrap the model in `DistributedDataParallel`, split each batch across ranks, log from rank 0, and launch with `torchrun --standalone --nproc_per_node=4`; see {doc}`Distributed GPU Computing <../s5_ai_scaling_and_engineering/scalability/distributed_gpu_computing>`. On the cluster, the converted code ran correctly but was slower. The last column comes from JobScope (`clustertool jobs scope <job_id> --diagnose`), which reports how busy a job's GPUs were:

| Run | GPUs | Time for 40,000 steps | JobScope diagnosis |
|---|---|---|---|
| Original script | 1 | 36.9 s | (too short to sample; see below) |
| DistributedDataParallel, same global batch | 4 | 82.9 s | underfed, 13.9% SM activity |

The 4-GPU version took more than twice as long. The model is small, so each GPU finishes its share quickly and then waits for the gradient exchange. JobScope reports the GPUs' compute units (streaming multiprocessors, or SMs) active only about 14% of the time. For a run this short, treat that figure as indicative and rely on the timings. More GPUs help only when each has enough work to outweigh communication. Ask the agent to measure before and after any scaling change, and keep the faster version; see {doc}`ML Efficiency <../s5_ai_scaling_and_engineering/efficiency/ml_scaling_and_efficiency>`.

```{note}
JobScope averages periodic samples, so it is unreliable for jobs of a minute or two. Here the single-GPU job trained for 37 seconds while drawing about 400 W, yet JobScope reported zero compute activity, because no sample landed on the busy period. For short jobs, judge by logs and timings. {doc}`KempnerInsight Cluster Monitoring App <../s1_high_performance_computing/kempner_cluster/kempnerinsight>` shows the same data as charts.
```

## Run an agent unattended in a batch job

For work that needs no conversation, such as triaging the night's failed jobs, run the agent in print mode in a batch job. It only talks to its model and reads files, so a small allocation on a CPU partition such as `shared` is enough (`test` is meant for interactive work). Before you submit:

- Work through {ref}`Before an unattended run <agentic_ai:before_an_unattended_run>`.
- Set `blockReadsOutsideWorkingDirectories` to `true` under `permissions` in `~/.claude/settings.json`, so `dontAsk` refuses reads outside the project. Otherwise read-only commands such as `cat` run on any file your account can read.
- In a repository you did not write, read its hooks and MCP servers first, because print mode runs them without asking; see {ref}`Untrusted repositories <agentic_ai:untrusted_repositories>`.

```bash
#!/bin/bash
#SBATCH --job-name=agent-triage
#SBATCH --partition=shared
#SBATCH --time=00:30:00
#SBATCH --mem=8G
#SBATCH --cpus-per-task=2
#SBATCH --output=reports/%x_%j.out   # SLURM creates reports/ if it is missing

cd "$SLURM_SUBMIT_DIR"
claude -p "Read the job logs in logs/ from the last day. For each failed job, explain the likely cause and propose a fix to its batch script. Write your findings to reports/triage.md. Do not submit, cancel, or edit any job or script." \
  --permission-mode dontAsk \
  --allowedTools "Read,Grep,Glob,Edit(./reports/**),Bash(sacct *),Bash(clustertool jobs debug *)" \
  --max-turns 30 --max-budget-usd 3.00 \
  --output-format json > reports/triage_result.json
```

- **What it may do.** `dontAsk` refuses anything not pre-approved, and `--allowedTools` allows only reading, writing under `reports/`, and two read-only commands. The agent cannot submit or cancel jobs or change your scripts. If you use the agent sandbox, this holds only with `autoAllowBashIfSandboxed` set to `false`; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.
- **Rule syntax.** The space before `*` matters: `Bash(sacct *)` matches `sacct` with arguments, but `Bash(sacct*)` also matches other commands that start with those letters.
- **Limits.** `--max-turns` and `--max-budget-usd` bound the run, and the job's `--time` is the final stop; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- **Record.** The JSON result has the session ID, for `claude --resume`, and an estimated cost.
- **Sign-in.** The job uses your saved login, unless `ANTHROPIC_API_KEY` is set, for example in `~/.bashrc`; then print mode uses and bills the key. See {ref}`Running a terminal agent <agentic_ai:running_a_terminal_agent>`.

In a test on the cluster with three job logs, the agent wrote its findings to `reports/triage.md` and changed nothing else. Asked in a second run to create a file elsewhere, edit a batch script, and run `touch`, it was refused all three times. Read the report before you act on it; its proposals are leads, not fixes.

## Before you trust the result

- The batch script asks for what the job needs, within the per-GPU limits, and you saw it before it was submitted.
- Each diagnosis matches the job's own log, not only its accounting record.
- Any scaling change was measured before and after, and you kept the faster version.
- Unattended runs had caps, and you read their reports before acting on them.

```{seealso}
For the guardrails used here, see {doc}`Configuring Agents for Your Project <configuring_agents>`. For many related jobs, see {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>` and {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>`; for chaining agent runs, see {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
