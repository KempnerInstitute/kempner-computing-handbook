# Collaborative Code Development

(wandb_section)=
## Wandb
Weights & Biases (W&B) is a platform designed to streamline experiment tracking and visualization, enabling effective collaboration on large teams. Weights and Biases gives researchers great flexibility in deciding what metrics to log.

### Logging In
To get started, first sign up for an account at https://wandb.ai/site/. Next, generate an API key at https://wandb.ai/authorize . Finally, install the wandb package and log in:

```bash
pip install wandb
wandb login
```

### Simple Tracking
In your python script, import wandb and start a W&B run object. Set the project name and decide which hyperparameters and metrics to track:

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

Access your project and view your runs at https://wandb.ai/home. Additionally, invite any collaborators you have to your project at this page. Refer to the [quickstart guide](https://docs.wandb.ai/quickstart/) for more details