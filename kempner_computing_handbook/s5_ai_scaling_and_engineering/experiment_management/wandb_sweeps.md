(wandb_sweep_section)=
# Weights & Biases - Sweeps

## Introduction
Hyperparameter sweeps systematically explore combinations of training parameters, such as learning rate, batch size, and optimizer, to identify configurations that improve model performance.

Why Sweep Hyperparameters?

- Small changes can have big impacts: Minor tweaks to hyperparameters can significantly affect training outcomes.
- Gain insights: Sweeps help understand how different hyperparameters influence training dynamics.
- Experiment at scale: Run one model on many datasets or many models on one dataset.
- Automate and save time: Automating the exploration process is more efficient than manual tuning.

```{tip}
[Weights & Biases (W&B)](https://wandb.ai) offers robust tools for managing and automating hyperparameter sweeps.
```

## ResNet-50 Classification Example
In order to cover the W&B sweep feature, we will go over an example from this [GitHub repository](https://github.com/KempnerInstitute/optimizing-ml-workflow/tree/main/workshop_exercises/wandb_sweep), which was presented during *"Optimizing ML Workflows on an AI Cluster"* workshop. This example demonstrates a simple classification task on the [CIFAR-10](https://www.cs.toronto.edu/~kriz/cifar.html) dataset using the [ResNet-50](https://arxiv.org/abs/1512.03385) model. 

Below is a directory-style tree view of the files used in this example, along with brief explanations for each file:

```bash
wandb_sweep/
├── config.yaml             # Base training configuration (default hyperparameters)
├── sweep_config.yaml       # Sweep definition: parameters to search and optimization method
├── sweep_submission.slrm   # SLURM batch script to submit sweep agents to the cluster
└── wandb_sweep.py          # Training script that reads config and logs results to W&B
```

The description of each file is listed in the following.

- `config.yaml`

  Contains the default hyperparameters and general configuration used during training.  
  Values here are overridden by `sweep_config.yaml` during sweeps.

- `sweep_config.yaml`

  Defines the sweep strategy:
  - The script (`program`) to execute
  - The search method (`grid`, `random`, or `bayes`)
  - The metric to optimize (e.g., validation accuracy)
  - The hyperparameters and value ranges to explore

- `sweep_submission.slrm`

  A SLURM batch submission script used to launch sweep agents on an AI cluster.  
  This typically includes calls to `wandb agent` and resource requests (CPU/GPU, memory, etc.).

- `wandb_sweep.py`

  The training script executed by each sweep run. It:
  - Reads hyperparameters from W&B config
  - Trains the model using those parameters
  - Logs metrics and artifacts to W&B for tracking and comparison

In the following sections, we cover each step in detail.

## Step 1: Define the Sweep

The first step in setting up a W&B sweep is to define the sweep configuration.

This is typically done using a `sweep_config.yaml` file. The key elements of `sweep_config.yaml` are:

- Program to run: The training script to execute (e.g., `wandb_sweep.py`)
- Search method: Choose from:
  - `grid`: tests all combinations
  - `random`: samples combinations at random
  - `bayes`: uses Bayesian optimization for smarter search
- Metric to optimize: Define the goal and metric name (e.g., maximize validation accuracy)
- Parameters to sweep over: List the hyperparameters and their values to explore

```yaml
# sweep_config.yaml
program: wandb_sweep.py
method: grid  # other options: bayes, random

metric:
  goal: maximize
  name: Validation Accuracy

parameters:
  learning_rate:
    values: [0.1, 0.01]
```

```{note}
Use `config.yaml` for fixed parameters not being searched. Values in `sweep_config.yaml` will override those in `config.yaml` during the sweep.
```

## Step 2: Initialize the Sweep

Once the sweep configuration is defined, the next step is to initialize the sweep. W&B uses [Sweep Controllers](https://docs.wandb.ai/ref/python/controller/) to manage and orchestrate sweeps.

From within your (e.g., `mamba`) environment, run the following command:

```bash
wandb sweep --project project_name sweep_config.yaml
```

Replace `project_name` with the name of your W&B project. After running this command, W&B will:

- Register the sweep with your account
- Return a sweep ID, which uniquely identifies the sweep
- Allow you to launch one or more sweep agents using this ID in the next step

```bash
# Sample output
wandb sweep --project test_project sweep_config.yaml

wandb: Creating sweep from: sweep_config.yaml
wandb: Creating sweep with ID: 3r3sv8tg
wandb: View sweep at: https://wandb.ai/mxshad/test_project/sweeps/3r3sv8tg
wandb: Run sweep agent with: wandb agent mxshad/test_project/3r3sv8tg
```

## Step 3: Run Sweep Agents

Once the sweep is initialized and you have a sweep ID, the next step is to run sweep agents.

Sweep agents are processes that:

- Connect to the W&B sweep controller
- Fetch a set of hyperparameter values from the sweep
- Run the training script with those values
- Report results back to W&B

Each agent runs one experiment from the sweep. To parallelize experiments on an AI cluster, you can launch sweep agents using a SLURM array job. For example:

```bash
#SBATCH --array=1-12%2
```

This directive launches up to 12 jobs, with a maximum of 2 running concurrently.

Inside the SLURM batch script, run the agent command:

```bash
wandb agent --count 1 your_entity/your_project/your_sweep_id
```

Replace `your_entity`, `your_project`, and `your_sweep_id` with your actual W&B account name, project name, and the sweep ID you received in Step 2.

```{note}
Set one sweep run per array job ID by using the `--count 1` flag.
```

## Step 4: Sweep Visualization 

You can explore and compare your sweep runs using the [W&B App UI](https://wandb.ai/home). Just open your project, click the Sweeps (broom) icon in the sidebar, and select your sweep from the list.

### Key Sweep Visualizations

- **Parallel Coordinates Plot**: This chart provides a quick overview of how different hyperparameter values relate to model performance. Each line represents a sweep run, showing how its specific parameter values align across multiple axes and relate to the final metric. It helps spot patterns and trade-offs between parameters.

```{figure} figures/png/parallel_coordinates_plot.png
---
width: 600 px
name: Parallel Coordinates Plot
```

- **Parameter Importance Plot**: This plot ranks hyperparameters based on how strongly they influence your target metric. It helps identify which parameters had the greatest impact on performance, guiding future tuning efforts.

```{figure} figures/png/parameter_importance_plot.png
---
width: 600 px
name: Parameter Importance Plot
```

```{note}
`Correlation` measures the linear relationship between a single hyperparameter and a performance metric, while `Importance` tells you how much a hyperparameter influenced the model's performance, regardless of whether the effect was linear or nonlinear.
```

```{note}
You can learn more about these visualizations in the [W&B documentation](https://docs.wandb.ai/guides/sweeps/visualize-sweep-results/).
```

## Mapping Sweep Runs to SLURM Array Jobs

The way you configure your SLURM jobs determines how sweep runs are distributed. The diagram below illustrates two different execution patterns when running `wandb agent`.

```{figure} figures/png/sweep_runs.png
---
width: 600 px
name: W&B Sweep Mapping
```

The top execution pattern shows multiple runs per task in an SLURM array job (no `--count 1` flag). In this setup, each task within the SLURM array job (or individual submission) runs multiple sweep runs. This happens when you omit the `--count 1` flag in your `wandb agent` command. Each job will continue pulling new runs from the sweep controller until the sweep is complete or the job is stopped.

- Good for maximizing GPU/CPU utilization
- Harder to map specific sweep runs to array job IDs

The bottom execution pattern shows one run per task in an SLURM array job (`--count 1`). When using `wandb agent --count 1`, each task within the SLURM array job executes exactly one sweep run. This creates a 1:1 mapping in SLURM array job IDs and W&B sweep runs.

- Easier to track and debug individual runs
- Enables fine-grained resource control (e.g., job timeouts, logs)
- Requires more job submissions for large sweeps

```{note}
Use `--count 1` if you want each array job to handle a single, isolated hyperparameter configuration from the sweep.
```
