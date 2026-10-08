# Experiment Management with Agents

Experiments are where an agent can save you the most time and waste the most compute. It can add logging to a training script, launch a sweep, read the results, and propose the next round, but every one of those runs spends GPU time from your allocation. This page puts an agent in the experiment loop with you approving what runs. It builds on the {doc}`Experiment Management <../s5_ai_scaling_and_engineering/experiment_management/README>` chapter, which covers Weights & Biases (W&B) in depth, and the examples were run on the Kempner AI cluster.

```{mermaid}
flowchart LR
    P["Agent proposes<br/>the next runs"] --> A{"You approve<br/>the sweep"}
    A --> S["Sweep runs as<br/>an array job"]
    S --> R["Agent reads<br/>the results"]
    R --> P
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class P,S,R agent;
    class A you;
```

## Set the limits first

Decide the size of each round before the agent proposes one: how many runs, how many at once, and how long each may take. Keep job submission behind your approval with the permission rules in {ref}`Guardrails <agentic_ai:guardrails>`, so the agent proposes a sweep and you launch it. Never paste an API key into a prompt. Log in to W&B yourself with `wandb login`, which stores your key in your home directory, or keep the runs offline as shown below.

## Add experiment tracking

> Add W&B logging to `train.py`: log the configuration, the training loss, and the validation loss every 1,000 steps, and write each run's final metrics to `runs/results/<run name>.json`. Respect `WANDB_MODE` so the runs can stay offline.

Ask for a small JSON summary per run alongside the dashboard. It is the easiest thing for an agent, or a script, to read reliably, and it does not depend on any service being reachable.

- **W&B offline mode.** With `WANDB_MODE=offline`, W&B writes each run to a local directory instead of sending it to the server, and `wandb sync <run directory>` uploads it later. Compute nodes have outbound access, so online mode works too; offline mode is useful when you do not want jobs to depend on the network or have not set up an account. See W&B's [offline documentation](https://docs.wandb.ai/support/models/articles/can-i-run-wandb-offline).
- **MLflow.** Since MLflow 3.7, a local tracking store is a SQLite file by default (`sqlite:///mlflow.db`), viewed with `mlflow server`. That works for a single run, but in a test on netscratch, setting up the database alone took about 90 seconds, and many array tasks writing to one SQLite file over a network filesystem invite locking problems. For parallel jobs, log to an MLflow tracking server or a hosted MLflow instead; the Kempner [mlflow-on-databricks](https://github.com/KempnerInstitute/mlflow-on-databricks) repository sets up tracking on Databricks from the cluster.

## Run the sweep as an array job

A SLURM array runs one task per configuration, and `%2` caps how many run at once. Each task picks its hyperparameters from its index:

```bash
#!/bin/bash
#SBATCH --job-name=sweep
#SBATCH --partition=kempner
#SBATCH --account=<your_account>
#SBATCH --array=0-7%2
#SBATCH --nodes=1
#SBATCH --ntasks=1
#SBATCH --gres=gpu:1
#SBATCH --cpus-per-task=8
#SBATCH --mem=32G
#SBATCH --time=00:20:00
#SBATCH --output=logs/%x_%A_%a.out

# Eight runs: 4 learning rates x 2 widths, at most 2 at a time.
set -euo pipefail
cd "$SLURM_SUBMIT_DIR"
LRS=(1e-4 3e-4 1e-3 3e-3)
HIDDENS=(256 1024)
i=$SLURM_ARRAY_TASK_ID
LR=${LRS[$((i % 4))]}
HIDDEN=${HIDDENS[$((i / 4))]}
export WANDB_MODE=offline
.venv/bin/python train_sweep.py --run-name "lr${LR}_h${HIDDEN}" --lr "$LR" --hidden "$HIDDEN"
```

See {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>` for the array syntax. To use W&B's own sweep controller instead, create the sweep with `wandb sweep`, then run `wandb agent --count 1 <sweep_id>` in each array task, so each task takes one configuration from the controller; this needs online mode. See {doc}`Weights & Biases - Sweeps <../s5_ai_scaling_and_engineering/experiment_management/wandb_sweeps>`.

## Let the agent read the results and propose the next round

> Read the summaries in `runs/results/`, rank the runs by final validation loss, and propose the next sweep of at most 8 runs, with your reasoning. Do not submit anything.

The eight runs above, each about a minute or less on one GPU, produced:

| Run | Learning rate | Hidden size | Final validation loss |
|---|---|---|---|
| lr3e-4_h1024 | 3e-4 | 1024 | 0.0507 |
| lr3e-4_h256 | 3e-4 | 256 | 0.0511 |
| lr1e-4_h1024 | 1e-4 | 1024 | 0.0535 |
| lr1e-3_h256 | 1e-3 | 256 | 0.0610 |
| lr1e-4_h256 | 1e-4 | 256 | 0.0706 |
| lr1e-3_h1024 | 1e-3 | 1024 | 0.0724 |
| lr3e-3_h256 | 3e-3 | 256 | 0.0865 |
| lr3e-3_h1024 | 3e-3 | 1024 | 0.0981 |

A good proposal reads this table the way you would: a learning rate of 3e-4 is best at both widths, rates of 1e-3 and above hurt, and the two widths are nearly tied at 3e-4, so the smaller model may be good enough. It should also notice what the table cannot show: with one run per configuration, a gap of 0.0004 between the top two may be noise. A sensible next round narrows the learning rate around 3e-4 and repeats the top configurations with a few different seeds before declaring a winner. Approve or edit the proposal before anything runs, and check each number the agent quotes against the files; see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.

## Checkpoint and resume

Long runs hit time limits, and jobs on a partition like `kempner_requeue` can be preempted. A run that saves checkpoints and resumes from the latest one loses only the work since its last save. Ask the agent to add three things:

- Save the model, the optimizer state, and the step number every N steps.
- Write each checkpoint to a temporary file and rename it into place (`os.replace` in Python), so a job killed mid-save cannot leave a corrupt checkpoint.
- On startup, load the latest checkpoint if one exists and continue from its step.

In a test on the cluster, a run with a one-minute time limit was stopped at about step 237,000. Resubmitted with a longer `--time`, it logged `resumed from step 236000`, its most recent checkpoint, and carried on; only the steps since that checkpoint had to be repeated. Choose the checkpoint interval by how much repeated work you can tolerate against how long a save takes.

You can also ask SLURM for a warning before the limit, so the run saves on its way out: `#SBATCH --signal=B:SIGTERM@120` sends SIGTERM about two minutes early (SLURM may send it up to a minute earlier than requested). The `B:` means only the batch script's shell receives it, so the script has to pass it on. In a test on the cluster with a one-minute warning, a job that ran its training process in the foreground, with no handler, was ended by the warning without saving. With these lines in the batch script, the training process received the signal, saved, and the job completed cleanly:

```bash
python train.py &      # run training in the background
pid=$!
trap 'kill -TERM $pid; wait $pid; exit $?' TERM   # pass the warning on, wait for the save
wait $pid              # returns when training ends
```

The training code must also handle SIGTERM by saving a checkpoint and exiting. Ask the agent to add both pieces, and test them with a short `--time` before you rely on them. With these lines at the end of the batch script, a run that finishes before the warning ends with training's own exit status, as it would without the trap. After a warning, if the training code exits with status 0 once it has saved, SLURM records the job as completed even though training stopped early, so do not chain a job that needs the finished model to it with `afterok`. For a framework with checkpointing and automatic resume built in, see {doc}`KempnerForge <../s3_ai_workflows/kempnerforge>`.

## Before you trust the results

- The comparison is fair: the runs differ only in the parameters being swept, with the same data, number of steps, and evaluation.
- The differences you act on are larger than the variation between repeated runs.
- Every number in the agent's summary matches the logged value.
- You can rerun the winning configuration from its logged settings; see {doc}`Reproducing W&B Runs <../s5_ai_scaling_and_engineering/experiment_management/reproducing_runs>`.

```{seealso}
For W&B setup and logging, see {doc}`Weights & Biases - Intro <../s5_ai_scaling_and_engineering/experiment_management/logging_and_monitoring>`. For chaining a sweep with follow-up jobs, see {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>` and {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
