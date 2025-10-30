# Job Dependencies

When running machine learning (ML) computational workflows on the Kempner AI cluster using SLURM, managing job dependencies is useful for efficient workflow management. Job dependency in SLURM allows you to schedule jobs to run in a specific sequence, ensuring that a job runs only after its dependent job(s) have been successfully completed.

```{note}
The job dependency feature is particularly useful in ML research for **managing data preprocessing**, **model training**, and **evaluation steps** across multiple jobs.
```

## Introduction

In SLURM, job dependency is managed using the `--dependency` option with `sbatch`, the command used to submit batch jobs to the cluster. The basic syntax is,

```bash
sbatch --dependency=<type:job_id> <job_script>
```

The parameters in placeholders are, 

| Placeholder | Description                               |
|-------------|-------------------------------------------|
| `<type>`    | Specifies the kind of dependency.        |
| `<job_id>`  | The ID of the job that the current job is dependent on. |

The following table lists the common dependency types (`<type>`) for batch jobs,

| Dependency Type | Description                                                                       |
|-----------------|-----------------------------------------------------------------------------------|
| `after`     | Job begins after the specified job(s) has started.             |
| `afterok`   | Job begins only after the specified job has completed successfully (exit code=0).        |
| `afternotok`| Job begins only if the specified job has failed.                              |
| `afterany`  | Job starts after the specified job has finished, regardless of its exit status. |
| `singleton`  | Job starts after all previously launched jobs with the same name and user have ended. |


## Examples
Let's review a few examples showcasing how SLURM job dependencies can be used in ML research scenarios:

### Example 1: Data Preprocessing Before Model Training
First, submit the data preprocessing job. The SLURM submission script for data preprocessing in this example is `preprocess.sh`,

```bash
sbatch preprocess.sh
```

Assume this job gets the ID `12345`. Now you can submit the model training job (`train_model.sh`) to start after the data preprocessing job completes successfully,


```bash
sbatch --dependency=afterok:12345 train_model.sh
```

### Example 2: Model Training Followed by Evaluation

Following up the previous example, you first submit the model training job:


```bash
sbatch train_model.sh
```

Assume this job gets the ID `67890`. Now you can submit the evaluation job (`evaluate_model.sh`) to start after the training job completes successfully,

```bash
sbatch --dependency=afterok:67890 evaluate_model.sh
```

### Example 3: Sequential Training of Multiple Models

If you have a sequence of ML models to train, where each model's training depends on the completion of the previous model's training, you can chain them using the `afterok` dependency type. You can submit the first model's training job (`train_model1.sh`), 

```bash
sbatch train_model1.sh
```

Assume this job gets the ID `11111`. Submit the second model's training job (`train_model2.sh`) to start after the first one completes:

```bash
sbatch --dependency=afterok:11111 train_model2.sh
```

You can continue chaining models as required. As you can see through these examples, using job dependencies in SLURM is a powerful way to automate and streamline the workflow of ML research projects on the Kempner AI Cluster. 


```{note}
By leveraging the SLURM job dependency feature, you can learn to efficiently manage your ML workflows, ensuring that resources are used **optimally** and projects progress **smoothly**.
```