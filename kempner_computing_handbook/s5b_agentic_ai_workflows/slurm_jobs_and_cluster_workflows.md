# SLURM Jobs and Cluster Workflows

An agent can take much of the routine cluster work off your hands: writing batch scripts, checking on jobs, explaining why one failed, and adapting code to more GPUs. This page walks through those tasks with examples run on the Kempner AI cluster, and starts with the guardrails that keep an agent from spending your allocation or touching jobs it should not. The examples use Claude Code and ClusterTool, the Kempner command-line tool that wraps SLURM and FASRC's site tools behind one command. Install ClusterTool once with `uv tool install 'clustertool[tui]'`; see the [ClusterTool repository](https://github.com/KempnerInstitute/clustertool) and the {doc}`Open Source Hub <../s7_open_source_hub/README>`. For SLURM itself, see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>` and {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`.

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

Let the agent look freely, and make it ask before it acts. Read-only queries run without prompts; anything that submits, cancels, or changes a job waits for your approval. Set this up with permission rules, and back it with a hook that blocks job cancellation; both are described, with ready-to-use examples, in {ref}`Guardrails <agentic_ai:guardrails>`. If you also use the agent sandbox, exclude SLURM commands from it, since they cannot reach the scheduler from inside, and have the agent run them as simple calls, without pipes or redirects; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

ClusterTool commands sort into three groups. To place a command that is not listed here, check what it does in the ClusterTool documentation before you allow it:

| Group | ClusterTool commands |
|---|---|
| Safe to allow (read-only) | `jobs list`, `jobs show`, `jobs why`, `jobs log` (without `-f`), `jobs history`, `jobs debug`, `jobs stats`, `jobs scope`, `jobs failures`, `jobs best-partition`, `gpu util`, `gpu avail`, `gpu status`, `nodes partitions`, `nodes frag`, `nodes load`, `account fairshare`, `account limits`, `storage quota`, `storage scratch`, `me --plain` |
| Ask first (change state or start work) | `jobs submit`, `jobs new`, `jobs cancel`, `jobs hold`, `jobs release`, `jobs requeue`, `gpu session`, `diag nccl`, `diag nvlink`, `diag io-probe` |
| Never (administrator commands) | `account add-user`, `account remove-user`, `account set-fairshare`, `jobs set-priority`, `nodes resume`, the `qos` commands other than `qos holders`, `diag ib`, `gpu monitor-partition` |

A few read-only commands are live, interactive displays that an agent cannot use well: the `me` dashboard, `gpu monitor-job`, `gpu nvtop`, `gpu pulse`, and `jobs top`. ClusterTool and the tools it wraps all work on compute nodes, so an agent running in an interactive job can use them.

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

Check what the agent wrote before it runs: the partition and account, a GPU request (the Kempner partitions are GPU-only), CPUs and memory within the per-GPU limits in {doc}`Cluster Usage Policies <../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>`, a time limit you are willing to pay for, and the right environment. Two read-only commands help the agent pick where a job will start soonest. `clustertool jobs best-partition job.sbatch` asks SLURM where the script would start without submitting it, and `clustertool nodes frag` shows how many jobs of a given shape fit right now:

```text
$ clustertool nodes frag -p kempner_rtx --cpus-per-gpu 8 --mem-per-gpu 32768
Free GPU shards and N-GPU-job fit  (job shape: 8 CPU + 32768 MiB per GPU)

  Partition                 Nodes  FreeGPUs(0/1/2/3/4+)    Fit1  Fit2  Fit4
  kempner_rtx                  23  14/2/4/1/2                21     9     2

  1 GPU node(s) not accepting new work, excluded
    holygpu7c1928 (DOWN+DRAIN+NOT_RESPONDING)
```

Here, a 4-GPU job on a single node would fit on 2 nodes right away, and the tool also flags a node that is down.

## Submit and monitor

Approve the `sbatch` when the agent asks. To follow the job, the agent can use `squeue --me`, `clustertool jobs list`, and `clustertool jobs log <job_id>` for the output so far. Ask it to check at intervals of a minute or more rather than polling every few seconds, which spends tokens and adds load on the scheduler that everyone shares. For a short job, the agent can run `sbatch --wait`, which returns only when the job ends, as a background command, so it waits without polling.

## Diagnose a failure

When a job fails, `clustertool jobs debug <job_id>` reads the job's accounting record and names the likely cause. These two jobs failed on purpose. The first asked for 4 GB of memory and then used 8:

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

The second had a two-minute limit for a longer run:

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

The diagnosis is right in both cases, but notice the "peak 2 MiB used" for a job that was killed for using too much memory. SLURM samples memory periodically, and the spike that killed the job happened between samples, so the recorded peak is misleading. The job's own log is definitive:

```text
slurm_script: line 16: 1394572 Killed   ../.venv/bin/python train.py --host-mem-gb 8 --steps 1000
error: Detected 1 oom_kill event in StepId=51161725.batch. Some of the step tasks have been OOM Killed.
```

Have the agent read the state, the log, and the request together before it proposes a fix: raising `--mem` to fit the real need, reducing memory use, or, for a timeout, raising `--time` or adding checkpoints so the run can resume. {doc}`Experiment Management with Agents <experiment_management_with_agents>` shows a checkpointed run picking up after a timeout.

## Scale to more GPUs, and measure

> Convert `train.py` to DistributedDataParallel and write a 4-GPU batch script that launches it with `torchrun`. Keep the global batch size the same, then compare the time for 40,000 steps with the single-GPU run.

The conversion follows a standard pattern, which you can check line by line: initialize the process group, pick the GPU from `LOCAL_RANK`, wrap the model in `DistributedDataParallel`, give each rank its share of each batch, log from rank 0 only, and launch with `torchrun --standalone --nproc_per_node=4`. See {doc}`Distributed GPU Computing <../s5_ai_scaling_and_engineering/scalability/distributed_gpu_computing>` for the details. On the cluster, the converted code ran correctly, but the measurement told a different story. The last column comes from JobScope (`clustertool jobs scope <job_id> --diagnose`), ClusterTool's report on how busy a job's GPUs were:

| Run | GPUs | Time for 40,000 steps | JobScope diagnosis |
|---|---|---|---|
| Original script | 1 | 36.9 s | (too short to sample; see below) |
| DistributedDataParallel, same global batch | 4 | 82.9 s | underfed, 13.9% SM activity |

The 4-GPU version was more than twice as slow. The model is small, so each GPU finishes its share of a step quickly and then waits on the gradient exchange; JobScope flags the GPUs as underfed, with their compute units (streaming multiprocessors, or SMs) active only about 14% of the time. More GPUs help only when each one has enough work to outweigh the communication. Ask the agent to measure before and after any scaling change, and keep the version that is actually faster; see {doc}`ML Efficiency <../s5_ai_scaling_and_engineering/efficiency/ml_scaling_and_efficiency>` and {doc}`Performance Monitoring <../s5_ai_scaling_and_engineering/efficiency/performance_monitoring_and_optimization>`.

```{note}
JobScope's GPU metrics are averages of periodic samples, so they are unreliable for jobs that run only a minute or two. In this test the single-GPU job trained for 37 seconds while drawing about 400 W, yet JobScope reported its compute activity as zero and labeled it idle, because no utilization sample landed on the busy period. For short jobs, judge by the logs and timings. {doc}`KempnerInsight Cluster Monitoring App <../s1_high_performance_computing/kempner_cluster/kempnerinsight>` gives the same data as charts in the browser.
```

## Run an agent unattended in a batch job

For work that needs no conversation, such as triaging a night's worth of failed jobs, run the agent itself in print mode inside a batch job. The agent only talks to its model and reads files, so a small CPU allocation is enough:

```bash
#!/bin/bash
#SBATCH --job-name=agent-triage
#SBATCH --partition=test
#SBATCH --time=00:30:00
#SBATCH --mem=8G
#SBATCH --cpus-per-task=2
#SBATCH --output=logs/%x_%j.out

cd /path/to/your/project
mkdir -p reports
claude -p "Read the job logs in logs/ from the last day. For each failed job, explain the likely cause and propose a fix to its batch script. Write your findings to reports/triage.md. Do not submit, cancel, or edit any job or script." \
  --permission-mode dontAsk \
  --allowedTools "Read,Grep,Glob,Edit(./reports/**),Bash(sacct *),Bash(clustertool jobs debug *)" \
  --max-turns 30 --max-budget-usd 3.00 \
  --output-format json > logs/triage_result.json
```

- `--permission-mode dontAsk` refuses anything that is not pre-approved, and `--allowedTools` pre-approves only reading, creating and editing files under `reports/`, and two read-only commands, so the agent cannot submit or cancel jobs or change your scripts. If you use the agent sandbox, this holds only with `autoAllowBashIfSandboxed` set to `false`; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`. The space before `*` matters: `Bash(sacct *)` matches `sacct` with arguments, while `Bash(sacct*)` would also match other commands that start with those letters.
- `--max-turns` and `--max-budget-usd` bound the run, and the job's `--time` is the final stop: at the limit, SLURM signals the job, and Claude Code exits and stops any command it started. See {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- The JSON result includes the session ID, so you can continue the conversation interactively with `claude --resume`, and an estimated cost for the run.
- The job uses the same login as your interactive sessions, which is stored in your home directory. To use an API key instead, read it from a file only you can read rather than writing it into the script, for example `export ANTHROPIC_API_KEY=$(cat ~/.anthropic_key)` after `chmod 600 ~/.anthropic_key`, and add a deny rule, `Read(~/.anthropic_key)`, to your user settings so the agent cannot read the file, although the key itself stays in the environment of the commands the agent runs. If `ANTHROPIC_API_KEY` is set in your environment, for example from `~/.bashrc`, print mode always uses it instead of your subscription, and batch jobs inherit it; see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

Read the report before acting on it; the agent's proposals are leads, not fixes.

```{warning}
In print mode, Claude Code runs the hooks in a project's `.claude/settings.json` and starts the MCP servers in its `.mcp.json` without asking, even in a folder you have never opened before. Before you run an agent this way in a repository you did not write, read those two files and any skills under `.claude/skills/`, or add `--setting-sources user`, which makes Claude Code skip the project's settings files and its `.mcp.json`. See {doc}`Working with Unfamiliar Research Codebases <unfamiliar_codebases>`.
```

## Before you trust the result

- The batch script asks for what the job needs, within the per-GPU limits, and you saw it before it was submitted.
- Each diagnosis matches the job's own log, not only its accounting record.
- Any scaling change was measured before and after, and you kept the faster version.
- Unattended runs had caps, and you read their reports before acting on them.

```{seealso}
For the guardrails used on this page, see {doc}`Configuring Agents for Your Project <configuring_agents>`. For running many related jobs, see {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>` and {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>`, and for chaining agent runs together, {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
