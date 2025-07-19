# Advanced SLURM Features 

This section covers advanced topics in utilizing SLURM better for your computational workflows. This document will be updated over time by the engineers and our cluster community to cover a comprehensive list of SLURM advanced features. 

## Exclusive Node Access

For jobs that require the exclusive use of a compute node to avoid sharing resources with other jobs, you can specify the `--exclusive` flag with your batch job submission command (`sbatch`) when requesting an interactive session in SLURM,

```bash
salloc -p sapphire --exclusive -t 00-07:00:00
salloc -p kempner --exclusive --account=kempner_grads --gres=gpu:4 -t 00-07:00:00
```

You can check the SLURM environmental variables to ensure complete node reservation, or you can see if anyone else is on that node by using the `who` command. Additionally, you can check system resources by using the `htop` command. 

```{warning}
To use Kempner partitions in SLURM, you need to specify the SLURM account associated with your lab/group membership for fairshare accounting.
```

## Dependency Chains with Job Arrays

You can combine job dependencies with job arrays for complex workflows, where subsequent tasks depend on the completion of previous ones. As an example, you first submit a job for data preprocessing (`preprocess.sh`) using SLURM batch job command, 

```bash
sbatch --array=1-12 --job-name=preprocess preprocess.sh
```

Then you can submit a dependent job array for analysis (`analysis.sh`), contingent on the successful completion of all data preprocessing jobs:

```bash
sbatch --dependency=afterok:$(sbatch --parsable --array=1-12 --job-name=analysis --dependency=afterok:<preprocess_job_id> analysis.sh)
```

You need to replace `<preprocess_job_id>` with the actual job ID of the preprocessing job array.

## Constraining Resources

Constraining resources in SLURM involves using the `--constraint` option with sbatch to specify the requirements that nodes must meet for the job to be scheduled on them. This can include specifying types of processors, GPUs, or any custom properties defined by the Kempner AI cluster administrator.

In the following interactive job, a graduate student can request one node with one CPU core and one A100 GPU for 7 hours. 

```bash
salloc -p kempner_requeue --account=kempner_grads -N 1 -n  1 --gres=gpu:1 --constraint=a100 -t 00-07:00:00
```

You can find a list of features in Kempner AI cluster by,

```bash
echo "PARTITION FEATURES" && sinfo -p kempner,kempner_requeue,kempner_h100 --noheader --format="%P %f" | sort | uniq
```

and the result will be, 

```bash
PARTITION FEATURES
kempner intel,holyhdr,icelake,avx,avx2,avx512,gpu,a100,cc8.0
kempner_requeue amd,holyndr,genoa,avx,avx2,avx512,gpu,h100,cc9.0
kempner_requeue intel,holyhdr,icelake,avx,avx2,avx512,gpu,a100,cc8.0
kempner_h100 amd,holyndr,genoa,avx,avx2,avx512,gpu,h100,cc9.0
```

The following table describes each of the features in the Kempner AI cluster:

| Feature  | Description                                                                                       |
|----------|---------------------------------------------------------------------------------------------------|
| `amd`      | Refers to processors manufactured by AMD.                                                         |
| `intel`    | Refers to processors manufactured by Intel.                                                       |
| `holyndr`  | Indicates support for NDR (Next Data Rate, 400 Gb/s) networking, enhancing data transfer and communication efficiency between nodes. |
| `genoa`    | Represents AMD's Genoa processor line, known for high performance in computing tasks.             |
| `holyhdr`  | Indicates support for HDR (High Data Rate, 200 Gb/s) networking, enhancing data transfer and communication efficiency between nodes. |
| `icelake`  | Denotes Intel's Ice Lake processor line, which includes features like deep learning boost for AI and machine learning enhancements. |
| `avx`, `avx2`, `avx512` | Advanced Vector Extensions (AVX) are Intel's and AMD's SIMD (single instruction, multiple data) extensions for parallelism in computing. `avx512` offers more features and wider vector registers than `avx` and `avx2`. |
| `gpu`      | Indicates the presence of GPU resources in the partition.                                         |
| `h100`     | NVIDIA H100 GPU, part of NVIDIA's Hopper architecture, designed for deep learning and high-performance computing tasks. |
| `a100`     | NVIDIA A100 GPU, part of NVIDIA's Ampere architecture, also aimed at deep learning and high-performance computing. |
| `cc9.0`, `cc8.0` | CUDA compute capability, indicating the version of the CUDA API and features the GPU supports. `cc9.0` and `cc8.0` refer to specific versions with different levels of support for CUDA features. |


## Receiving Emails about Job Status

SLURM offers the capability to send email notifications regarding the status of jobs, allowing users to be informed about job start, end, and failure events. This feature is particularly useful for monitoring long-running or critical jobs without the need to manually check their status. This feature can be configured using the following options:

| Parameter     | Description                                                |
|--------------|------------------------------------------------------------|
|`--mail-type` | specifies the type of events you want to be notified about.|
|`--mail-user` | specifies the email address to receive the notifications.  |

Example of an SLURM batch job with email notification,

```bash
sbatch --mail-type=BEGIN,END,FAIL --mail-user=your_email@harvard.edu job_script.sh
```

In this example, SLURM is configured to send email notifications to `your_email@harvard.edu` when the job begins (`BEGIN`), ends successfully (`END`), or fails (`FAIL`).

The available email types:

| Email Type     | Description                                                |
|----------------|------------------------------------------------------------|
| `BEGIN`        | Notifies when the job has started.                         |
| `END`          | Notifies when the job has finished, regardless of status.  |
| `FAIL`         | Notifies if the job fails at any point.                    |
| `REQUEUE`      | Notifies if the job is requeued.                           |
| `ALL`          | Sends notifications for all the above events.              |


## Optimizing Request for Compute Resources 

Since SLURM performs backfilling to allow smaller jobs to run, it may lead to fragmentation of GPU resources on Kempner AI cluster. If your job requires multiple GPUs, you can optimize your SLURM submission script or `salloc` based on the available resources. The following command can help you determine the optimal resource configuration for your job.

The initial version of this command only prints the total utilization of nodes and does not account for preemptible resources.

**Command for the `kempner_h100` partition:**
```bash
sh /n/holylfs06/LABS/kempner_shared/Everyone/cluster_scripts/free_resources kempner_h100
```

**Command for the `kempner` partition:**
```bash
sh /n/holylfs06/LABS/kempner_shared/Everyone/cluster_scripts/free_resources kempner
```

Each command prints the available GPUs, CPU cores, and memory for each node in the partition. Here is a sample output:

```bash
Node_Name       Available_GPU  Available_Core  Free_Memory_GB
holygpu8a17303  4              96              1511
holygpu8a11301  3              32              1480
holygpu8a13303  3              32              1480
holygpu8a13404  3              80              16
holygpu8a13602  3              80              16
holygpu8a13603  3              32              1480
holygpu8a15602  3              32              1480
holygpu8a17104  3              32              1480
holygpu8a17202  3              32              1480
holygpu8a17403  3              32              1480
holygpu8a17504  3              32              1480
holygpu8a11102  2              16              1430
```

Using the information in the output table, you can adjust your job’s resource request (number of nodes, number of cores per node, and memory) to secure an allocation more quickly.