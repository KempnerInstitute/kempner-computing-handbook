(wandb_section)=
# Weights & Biases - Intro

Weights & Biases (W&B) is an online platform designed to streamline experiment tracking and visualization, enabling effective collaboration on large teams. W&B gives researchers great flexibility in deciding what metrics to log.

## Getting Started
To get started, first sign up for an account at [wandb.ai](https://wandb.ai/site/) website. Next, generate an API key [here](https://wandb.ai/authorize). Finally, install the `wandb` package and log in:

```bash
pip install wandb
wandb login
```

## Authentication
Logging in using the `wandb` Command Line Interface (CLI) adds your API key to your `.netrc` file at `~/.netrc` (Mac and Linux). Alternatively, you can also manually add your API key to this file following this format:

```bash
machine api.wandb.ai
  login user
  password YOUR_API_KEY
```

## Simple Tracking
In your Python script, import `wandb` module and start a W&B run object. Set the project name and decide which hyperparameters and metrics to track:

```python
import wandb

run = wandb.init(
    project = "project_name"
    config = {
        "metric_1": metric_1,
        "metric_2": metric_2,
    }
)


for epoch in range(epochs):
    ...
    wandb.log({"accuracy": acc, "loss": loss})
```

Access your project and view your runs on [wandb.ai](https://wandb.ai/home) website. Additionally, invite any collaborators you have to your project at this page. Refer to the [W&B Quickstart](https://docs.wandb.ai/quickstart/) for more details.
