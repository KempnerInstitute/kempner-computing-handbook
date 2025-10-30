# Access by FASRC Users 

Priority access to the Kempner AI cluster is granted based on an ongoing, direct relationship with the Kempner Institute and is intended exclusively to support mission-aligned research.

However, the Kempner Institute and FAS Research Computing (FASRC) want to ensure that GPU resources are fully utilized.  Thus, if any resources on the Kempner AI cluster (`kempner`, `kempner_h100`, or `kempner_requeue` partitions) are not being used by a Kempner user, it is accessible to all users in the FASRC Cannon cluster environment through the `gpu_requeue` partition. The `gpu_requeue` partition has a preemption policy, meaning that jobs are preempted by SLURM when a high-priority job is submitted.

Conversely, some Kempner users also have access to other FASRC GPUs via the `gpu_requeue` partition. You can see the full list of [available GPUs on the FASRC website](https://docs.rc.fas.harvard.edu/kb/running-jobs/#Using_GPUs).

## Interactive Jobs

Use the following command to request an interactive session with H100 GPUs in the FASRC Cannon cluster environment,

```bash
salloc -p gpu_requeue -C h100  -N 1 -n 24 -t 0-01:00 --mem=375G --gres=gpu:1
```

Use the following command to request an interactive session with A100 GPUs in the FASRC Cannon cluster environment,

```bash
salloc -p gpu_requeue -C a100  -N 1 -n 16 -t 0-01:00 --mem=250G --gres=gpu:1
```


## Batch Jobs

Use the following SLURM submission script to submit a batch job using H100 GPUs on the `gpu_requeue` partition.

```bash
#!/bin/bash

#SBATCH -J job_name                # job name
#SBATCH -p gpu_requeue             # partition (queue)
#SBATCH -N 1                       # number of nodes
#SBATCH -n 24                      # number of cores , A100: 64 cores, H100: 96 cores
#SBATCH --gres=gpu:1               # Number of GPUs per node
#SBATCH --mem 375G                 # Memory per node, H100: 1.5 TB, A100: 1 TB RAM
#SBATCH -t 00-07:00                # time (D-HH:MM)
#SBATCH --constraint=h100          # Choose H100 GPU or a100 for A100 GPU
#SBATCH -o job.%N.%j.out           # STDOUT
#SBATCH -e job.%N.%j.err           # STDERR

# Code commands to run your program
date
# python my_code.py
```

Use the following submission script For A100 GPUs,

```bash
#!/bin/bash

#SBATCH -J job_name                # job name
#SBATCH -p gpu_requeue             # partition (queue)
#SBATCH -N 1                       # number of nodes
#SBATCH -n 16                      # number of cores , A100: 64 cores, H100: 96 cores
#SBATCH --gres=gpu:1               # Number of GPUs per node
#SBATCH --mem 250G                 # Memory per node, H100: 1.5 TB, A100: 1 TB RAM
#SBATCH -t 00-07:00                # time (D-HH:MM)
#SBATCH --constraint=a100          # Choose H100 GPU or a100 for A100 GPU
#SBATCH -o job.%N.%j.out           # STDOUT
#SBATCH -e job.%N.%j.err           # STDERR

# Code commands to run your program
date
# python my_code.py
```