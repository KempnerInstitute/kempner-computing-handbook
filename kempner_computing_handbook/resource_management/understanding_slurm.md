# Understanding SLURM

SLURM (Simple Linux Utility for Resource Management) is a job scheduler and resource manager that is widely used in High-Performance Computing (HPC) environments. It is open-source and is designed to be scalable and fault-tolerant. SLURM is used to allocate resources to users and to schedule and manage jobs on a cluster. This document provides an overview of SLURM and its key concepts.

```{note}
Visit [https://www.schedmd.com/](https://www.schedmd.com/) for official SLURM documentation.
```

SLURM commands can be divided into 4 categories:

1. **System Admin Commands**: These commands are used by system administrators to manage the SLURM daemons and the cluster. We will not cover these commands in this handbook.
2. **Cluster Commands**: These commands are used to manage and view the cluster and its resources. Some flags are available only to users with administrative privileges. The following table lists some of the commonly used cluster commands:

    | Command | Description |
    |---------|-------------|
    | `sinfo` | View information about the cluster and its resources. |
    | `scontrol` | Control the SLURM daemons and the cluster. |
    | `sview` | View the cluster in a graphical interface. |
    | `spart` | View the partitions and their status. |

3. **Account/Group/User Commands**: These commands are used to manage and view accounts, groups, and users. The following table lists some of the commonly used account/group/user commands:

    | Command | Description |
    |---------|-------------|
    | `sacct` | Displays accounting data for jobs, job steps, and resource utilization. |
    | `sacctmgr` | Utility for managing Slurm's accounting database. |
    | `sreport` | Generate reports from the accounting data. |
    | `sshare` | Shows the fairshare information for users. |
    | `squota` | Displays storage quotas. |

4. **Job Commands**: These commands are used to submit, manage, and view jobs. The following table lists some of the commonly used job commands:

    | Command | Description |
    |---------|-------------|
    | `sbatch` | Submit a batch script for execution. |
    | `salloc` | Allocate resources for a job step. |
    | `srun` | Run a parallel job. |
    | `squeue` | Display status of jobs. |
    | `scancel` | Cancel a pending or running job. |
    | `sjobexitmod` | View the exit status of a job. |

Going through each of these commands in detail is beyond the scope of this handbook. Please see [SLURM](https://www.schedmd.com/) official documentation for indepth details. However, we will cover the basic usage of some of these commands in the following sections.


## SLURM Partitions

The following partitions are available for Kempner affliates on the FASRC cluster:

| Partition | Description |
|-----------|-------------|
| `kempner` | This GPU block includes 2304 Intel Ice Lake cores and 144 Nvidia A100 40GB GPUs, with each water-cooled node featuring 64 cores, 1TB RAM, and 4 A100 GPUs, linked via HDR Infiniband, with a 7-day limit.|
| `kempner_h100` | This GPU block includes 2304 AMD Genoa cores, 96 Nvidia H100 80GB GPUs, water-cooled nodes with 96 cores, 1.5TB RAM, and 4 H100 GPUs, interconnected via NDR Infiniband, with a 3-day limit. |
| `kempner_requeue` | This partition utilizes `kempner` and `kempner_h100` partitions, designed for tasks that can be interrupted and restarted. This partition has a 7 day time limit.|
| `kempner_dev` | This partition is dedicated to the engineering team and is not available to all users. |

````{tip}
Run the following command to see the list of Kempner partitions,

```bash
spart | awk 'NR==1 || /kempner/'
```
````

(resource_management:understanding_slurm:slurm_accounts)=
## SLURM Accounts

The accounts are used to track the usage of resources on the cluster. You need to specify the account to which the resources will be charged when submitting a job. You can run the following command to see which accounts you have access to and the fairshare information for each account. If you cannot see the account you need, and you think should be a part of that account, please add a grant on [FASRC portal](https://portal.rc.fas.harvard.edu/request/grants/add) or feel free to contact [Max Shad](mailto:max_shad@harvard.edu) if you need additional help.

```bash
sshare -U -u <username>
```

## SLURM Variables

When SLURM allocates resources to a job, it sets several environment variables that can be used in the job script. The following table lists some of the commonly used SLURM environment variables:

| Variable | Description |
|----------|-------------|
| `SLURM_JOB_ID` | The job ID. |
| `SLURM_JOB_NAME` | The job name. |
| `SLURM_NPROCS` | The total number of processes in the current job. |
| `SLURM_JOB_NODELIST` | The list of nodes allocated to the job. |
| `SLURM_JOB_NUM_NODES` | The number of nodes allocated to the job. |
| `SLURM_JOB_CPUS_PER_NODE` | The number of CPUs per node allocated to the job. |
| `SLURM_MEM_PER_NODE` | The memory per node allocated to the job. |
| `SLURM_JOB_PARTITION` | The partition to which the job was submitted. |
| `SLURM_JOB_ACCOUNT` | The account to which the resources will be charged. |

One can use the following code to print all the SLURM environment variables:

````{tab-set-code}

```{code-block} shell
for var in $(env | grep '^SLURM_'); do
  echo "${var}"
done
```

```{code-block} python
import os

for key, value in os.environ.items():
    if key.startswith("SLURM_"):
        print(f"{key}: {value}")
```

````












