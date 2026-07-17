(experiment_management:reproducing_runs)=
# Reproducing W&B Runs

Reproducing a run means starting from a recorded experiment and obtaining the same result, or a comparable one, later. This requires capturing everything that determines the outcome: the configuration, the code version, the software environment, the random seeds, and the data. Weights & Biases (W&B) records much of this automatically and gives you tools to version the rest. This page collects the practices that make a W&B run reproducible.

For the basics of tracking with W&B, see the {doc}`W&B introduction <logging_and_monitoring>`. For reproducibility beyond W&B, see {doc}`Reproducible Research <../../s2_swe_for_research/reproducible_research>`.

## Log the full configuration

Put every value that changes a result into the run configuration, so the run records exactly how it was launched. Log the hyperparameters, the optimizer, the dataset version, and the random seed through the `config` argument of `wandb.init`:

```python
import wandb

run = wandb.init(
    project="my-project",
    config={
        "learning_rate": 3e-4,
        "batch_size": 64,
        "optimizer": "adamw",
        "epochs": 20,
        "seed": 42,
        "dataset_version": "v3",
    },
)
```

The W&B comparison and grouping features are only as useful as the values you log, so prefer logging a value over leaving it implicit in the code.

## Capture the code version

When a run starts inside a Git repository, W&B automatically records the current commit and links back to that version of the code. Commit your changes before launching a run so the recorded commit points to a clean state.

To also save a snapshot of the code with the run, enable code saving:

```python
run = wandb.init(
    project="my-project",
    settings=wandb.Settings(code_dir="."),
)
```

By default, W&B disables code saving, so an organization or team admin must enable it in the W&B settings for the snapshot to upload. Recording the commit lets you check out the exact code later. See {doc}`Reproducible Research <../../s2_swe_for_research/reproducible_research>` for version-control practices.

## Record the software environment

The commit captures your code but not the packages it runs against. Save the environment alongside the run so it can be recreated:

- Export the dependencies from your environment manager and keep the file with the run. With {doc}`uv <../../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>`, commit `pyproject.toml` and `uv.lock`; with {doc}`conda <../../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>`, export an `environment.yml`.
- Store that dependency file as part of the run, for example as a W&B Artifact (described below), so it travels with the experiment.

## Set and log random seeds

Seed every source of randomness and log the seed in the run configuration so it can be reused:

```python
import random
import numpy as np
import torch

def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
```

For stricter determinism, ask the frameworks to use deterministic algorithms:

```python
torch.use_deterministic_algorithms(True)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False
```

```{note}
Even with a fixed seed, some GPU operations remain nondeterministic, and results can differ across GPU models, library versions, and the number of processes. Treat a fixed seed as a way to reduce variation, not a guarantee of bit-for-bit identical results.
```

## Version data and checkpoints with Artifacts

Code and configuration do not capture the data a run consumed or the checkpoints it produced. W&B Artifacts version these, so a run is pinned to exact inputs and outputs. Log an artifact:

```python
artifact = wandb.Artifact("training-data", type="dataset")
artifact.add_dir("data/processed")
run.log_artifact(artifact)
```

Consume a specific version in a later run, which also records the dependency in the run's lineage:

```python
artifact = run.use_artifact("training-data:v3")
data_dir = artifact.download()
```

Referencing an explicit version (`:v3`) rather than the latest keeps a reproduced run pinned to the same data. See the [W&B Artifacts documentation](https://docs.wandb.ai/guides/artifacts/) for details.

## Resume, rewind, or fork a run

W&B can continue or branch from an existing run rather than starting fresh:

- **Resume** an interrupted run to keep logging to the same run. Pass the original run ID and a resume mode:

  ```python
  run = wandb.init(project="my-project", id="abc123", resume="must")
  ```

  Use `resume="must"` to require that the run already exists, or `resume="allow"` to resume if present and otherwise start a new run. Resuming pairs well with checkpointing for long or preemptible jobs.

- **Rewind** a run to correct or extend its history from a chosen step, using `resume_from` (W&B Python SDK 0.17.1 or newer):

  ```python
  run = wandb.init(project="my-project", resume_from="abc123?_step=200")
  ```

- **Fork** a run to branch off at a point and try a variation without altering the original:

  ```python
  run = wandb.init(project="my-project", fork_from="abc123?_step=200")
  ```

Because of known performance limitations with rewind, W&B typically recommends forking as an alternative. See the W&B documentation on [rewinding](https://docs.wandb.ai/guides/runs/rewind/) and [forking](https://docs.wandb.ai/guides/runs/forking/) runs.

## Reproduce a past run

To recreate a finished run:

1. Open the run in the W&B app and note its recorded commit and configuration.
2. Check out that commit so the code matches.
3. Recreate the software environment from the saved dependency file.
4. Download the exact data and checkpoint Artifact versions the run used.
5. Set the same random seed from the run configuration.
6. Launch the run with the same configuration.

A new run created this way should reproduce the recorded result within the limits noted above.

```{seealso}
The {doc}`W&B introduction <logging_and_monitoring>`, {doc}`W&B Sweeps <wandb_sweeps>`, and {doc}`Reproducible Research <../../s2_swe_for_research/reproducible_research>`.
```
