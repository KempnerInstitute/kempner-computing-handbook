# Job Submission Basics

You can either run your jobs interactively (with allocating compute resources) or submit them as batch jobs. Interactive jobs are useful for testing and debugging, while batch jobs are useful for running large-scale simulations and analyses. In this section, we will cover the basics of job submission on the Kempner Institute HPC cluster. In both cases, you will need to specify the Kempner Institute partitions and the fairshare account to which the resources will be charged.


## Interactive Jobs

Below are the steps to allocate 1 TB of RAM, 64 CPU cores, and 4 A100 40GB GPUs for an interactive job on the `kempner` partition, with the resources charged to the `kempner_grads` fairshare account for one hour.

- step 1: Connect to the cluster using SSH (`ssh <username>@login.rc.fas.harvard.edu`)
- step 2: Allocate resources using the `salloc` command:

```bash
salloc --partition=kempner --account=kempner_grads --time=0-01:00 --mem=1000G --gres=gpu:4 --cpus-per-task=64
```

```{seealso}
For details on how to connect this interactive session to VSCode, plese see the section {ref}`development_and_runtime_envs:using_vscode_for_remote_development:compute_node`.
```

(resource_management:job_submission_basics:batch_jobs)=
## Batch Jobs

Submitting a batch job in SLURM involves creating a job script that specifies the resources required for the job and the commands to be executed. The job script is essentially a shell script that includes 3 sections:

- Resource and job specifications, 
- Loading modules, setting environment variables, other pre-job tasks, and
- Running the job.

The following is an example of a very simple job script.

```bash
#!/bin/bash
#SBATCH --job-name=my_job
#SBATCH --account=kempner_grads
#SBATCH --partition=kempner
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --cpus-per-task=16
#SBATCH --gpus-per-node=1
#SBATCH --time=0-01:00
#SBATCH --mem=256G
#SBATCH --output=my_job_output.out
#SBATCH --error=my_job_error.err
#SBATCH --mail-type=END
#SBATCH --mail-user=<username>@harvard.edu

# Load modules
module load python/3.10.9-fasrc01 

# Activate conda environment (optional)

# Run the job
python my_script.py
```
In the following table we provide a brief description of the SLURM directives used in the job script.

| Directive | Description |
|-----------|-------------|
| `--job-name` | The name of the job. |
| `--account` | The account to which the resources will be charged. |
| `--partition` | The partition to which the job will be submitted. |
| `--nodes` | The number of nodes required for the job. |
| `--ntasks-per-node` | The number of tasks to be launched on each node. |
| `--cpus-per-task` | The number of CPUs per task. |
| `--gpus-per-node` | The number of GPUs per node. |
| `--time` | The time limit for the job. |
| `--mem` | The memory required for the job. |
| `--output` | The file to which the standard output will be written. |
| `--error` | The file to which the standard error will be written. |
| `--mail-type` | The type of email notification to be sent. |
| `--mail-user` | The email address to which the notifications will be sent. |


You can submit the job script using the `sbatch` command:

```bash
sbatch my_job_script.sh
```

```{seealso}
For more details on the SLURM directives run `sbatch  --help` and the [SLURM documentation](https://slurm.schedmd.com/sbatch.html).
```

## Example Batch Job Specifications 

The following list details several batch jobs, each with a different SLURM configuration and their respective use cases.

```{warning}
Please note that some of the following combinations may not work on Kempner partitions, as they require the `--gres=gpu:` option; otherwise, they will fail. The Kempner cluster is available only for GPU jobs, and the shared public partitions on the FASRC cluster should be used for CPU workflows.
```

| Combination | Description |
|-------------|-------------|
| `--ntasks=8 --mem=32G` | Allocates 8 tasks with a total of 32GB memory for the job. Useful for jobs that require multiple tasks without specific node distribution or GPU requirements. |
| `--ntasks-per-node=4 --nodes=2 --mem-per-node=64G` | Allocates 2 nodes with 4 tasks per node and 64GB memory per node. Ideal for parallel tasks that can efficiently utilize a fixed amount of memory on each node. |
| `--cpus-per-task=2 --ntasks=4 --gres=gpu:1` | Allocates 4 tasks, each with 2 CPU cores and 1 shared GPU among all tasks. Suitable for multi-threaded GPU-accelerated applications. |
| `--nodes=3 --ntasks=12 --ntasks-per-node=4 --mem=128G` | Distributes 12 tasks across 3 nodes, with 4 tasks per node, using a total of 128GB memory. Good for balanced load distribution across nodes. |
| `--ntasks=6 --cpus-per-task=4 --mem-per-cpu=8G` | Allocates 6 tasks, each with 4 CPU cores and 8GB of memory per CPU. This setup is beneficial for CPU-intensive applications requiring significant memory per core. |
| `--nodes=2 --gpus-per-node=2 --mem-per-node=48G` | Allocates 2 nodes, each with 2 GPUs and 48GB of memory. Targets GPU-based computations needing substantial memory but with a clear node division. |
| `--ntasks=10 --cpus-per-task=1 --gres=gpu:2 --mem=128G` | Allocates 10 tasks with 1 CPU each, 2 GPUs shared among tasks, and 128GB of memory. This combination is tailored for lightweight tasks in a GPU-enhanced environment. |
| `--ntasks-per-node=2 --nodes=4 --mem-per-cpu=4G --gres=gpu:1` | Uses 4 nodes with 2 tasks each, 4GB memory per CPU, and 1 GPU per node. Designed for tasks that are GPU intensive, spread evenly across multiple nodes. |
| `--nodes=1 --cpus-per-task=8 --mem=64G --gres=gpu:2` | Single-node job with tasks that require 8 CPUs each, a total of 64GB memory, and 2 GPUs. Fits high-performance computing tasks on a single node with substantial GPU requirements. |
| `--ntasks=5 --cpus-per-task=2 --mem-per-cpu=16G --gpus-per-node=1` | Allocates 5 tasks, each with 2 CPU cores and 16GB memory per CPU, with at least 1 GPU per node. This setup is optimal for moderately demanding tasks, ensuring enough memory and GPU access. |












