# Experiment Management with Agents

An agent can add logging to a training script, launch a sweep, read the results, and propose the next round. Each of those runs spends GPU time from your allocation, so this page keeps you in the loop to approve what runs. It builds on the {doc}`Experiment Management <../s5_ai_scaling_and_engineering/experiment_management/README>` chapter, and the examples were run on the Kempner AI cluster.

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

Decide the size of each round before the agent proposes one: how many runs, how many at once, and how long each may take. Keep job submission behind your approval with the permission rules in {ref}`Guardrails <agentic_ai:guardrails>`, so the agent proposes a sweep and you launch it. Never paste an API key into a prompt; log in to Weights & Biases (W&B) yourself with `wandb login`, or keep the runs offline.

## Add experiment tracking

> Add W&B logging to `train.py`: log the configuration, the training loss, and the validation loss every 1,000 steps, and write each run's final metrics to `runs/results/<run_name>.json`. Respect `WANDB_MODE` so the runs can stay offline.

Ask for a small JSON summary per run as well. It is the easiest output for an agent or a script to read, and it does not depend on any service.

::::{tab-set}
:::{tab-item} W&B offline mode
With `WANDB_MODE=offline`, W&B writes each run to a local directory, and `wandb sync <run_dir>` uploads it later. Compute nodes have outbound access, so online mode works too; offline mode keeps jobs independent of the network. See W&B's [offline documentation](https://docs.wandb.ai/support/models/articles/can-i-run-wandb-offline).
:::
:::{tab-item} MLflow
Since MLflow 3.7, a local tracking store is a SQLite file by default (`sqlite:///mlflow.db`), viewed with `mlflow server`. It works for a single run, but in a test on netscratch, setting up the database alone took about 90 seconds, and many array tasks writing to one SQLite file over a network filesystem invite locking problems. For parallel jobs, log to an MLflow tracking server instead; the Kempner [mlflow-on-databricks](https://github.com/KempnerInstitute/mlflow-on-databricks) repository sets up tracking on Databricks from the cluster.
:::
::::

## Run the sweep as an array job

A SLURM array runs one task per configuration, and `%2` caps how many run at once. Each task picks its settings from its index:

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

Create `logs/` before you submit, with `mkdir -p logs`. SLURM writes each task's log there, and a missing folder can make the tasks fail without a log. See {doc}`Array Jobs <../s1_high_performance_computing/general_hpc_concepts/array_jobs>`. To use W&B's sweep controller instead, create the sweep with `wandb sweep` and run `wandb agent --count 1 <sweep_id>` in each array task; this needs online mode. See {doc}`Weights & Biases - Sweeps <../s5_ai_scaling_and_engineering/experiment_management/wandb_sweeps>`.

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

A good proposal reads the table as you would. A learning rate of 3e-4 is best at both widths, 1e-3 and above hurt, and the two widths nearly tie at 3e-4, so the smaller model may be enough. It also notes what the table cannot show: with one run per configuration, the 0.0004 gap at the top may be noise. A sensible next round narrows the learning rate around 3e-4 and repeats the top configurations with a few seeds. Approve or edit the proposal before anything runs, and check each number the agent quotes against the files.

## Checkpoint and resume

Long runs hit time limits, and jobs on a partition like `kempner_requeue` can be preempted. A run that saves checkpoints loses only the work since its last save. Ask the agent to:

- Save the model, the optimizer state, and the step number every N steps.
- Write each checkpoint to a temporary file and rename it into place (`os.replace` in Python), so a job killed mid-save cannot leave a corrupt checkpoint.
- On startup, load the latest checkpoint if one exists and continue from its step.

In a test on the cluster, a run with a one-minute limit stopped at about step 237,000. Resubmitted with a longer `--time`, it logged `resumed from step 236000`, its latest checkpoint, and repeated only the steps after it.

SLURM can also warn a job before its time limit, so the run saves on its way out. `#SBATCH --signal=B:SIGTERM@120` sends SIGTERM about two minutes early, and SLURM may send it up to a minute earlier than requested. With `B:`, only the batch script's shell receives the signal, so the script must pass it on. In a test on the cluster with a one-minute warning, a job that ran training in the foreground with no handler was ended by the warning without saving. With these lines at the end of the batch script, training received the signal, saved, and the job completed cleanly:

```bash
python train.py &      # run training in the background
pid=$!
trap 'kill -TERM $pid; wait $pid; exit $?' TERM   # pass the warning on, wait for the save
wait $pid              # returns when training ends
```

The training code must also save a checkpoint and exit when it receives SIGTERM. Ask the agent to add both pieces, and test them with a short `--time`. If training finishes before the warning, the script ends with training's own exit status, as it would without the trap. After a warning, if the training code exits with status 0, SLURM records the job as completed although training stopped early, so do not chain a job that needs the finished model to it with `afterok`. The Kempner Institute's [KempnerForge](https://github.com/KempnerInstitute/KempnerForge) framework has checkpointing and automatic resume built in; see {doc}`KempnerForge <../s3_ai_workflows/kempnerforge>`.

## Before you trust the results

- The runs differ only in the swept parameters, with the same data, steps, and evaluation.
- The differences you act on are larger than the variation between repeated runs.
- Every number in the agent's summary matches the logged value.
- You can rerun the winning configuration from its logged settings; see {doc}`Reproducing W&B Runs <../s5_ai_scaling_and_engineering/experiment_management/reproducing_runs>`.

```{seealso}
For W&B setup, see {doc}`Weights & Biases - Intro <../s5_ai_scaling_and_engineering/experiment_management/logging_and_monitoring>`. For chaining a sweep with follow-up jobs, see {doc}`Job Dependencies <../s1_high_performance_computing/general_hpc_concepts/job_dependencies>` and {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
```
