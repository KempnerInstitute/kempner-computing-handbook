(s9_workshops_and_trainings:spring2403_intro_to_hpc)=
# Kempner Institute - Compute Workshop

_Date: March 28, 2024_  
_Presenters: Ella Batty, Naeem Khoshnevis, Max Shad_   


> Welcome to the Kempner Institute Spring 2024 Compute Workshop! This workshop is designed to provide an introduction to High-Performance Computing (HPC) and the Kempner Institute AI cluster. The workshop will cover the basics of HPC, including an overview of the Kempner Institute AI cluster architecture and storage tiers. We will also discuss data transfer methods, code synchronization, and software modules. The workshop will include an introduction to job management and monitoring, advanced computing techniques, and support and troubleshooting. 


## Infrastructure Orientation

- Welcome and Introduction
- Cluster Access  (<a href="/s1_high_performance_computing/kempner_cluster/introduction_and_cluster_basics.html#getting-access-to-the-cluster" target="_blank">Click Here</a>)
- Overview of the Kempner Institute Cluster Architecture (<a href="/s1_high_performance_computing/kempner_cluster/overview_of_kempner_cluster.html#what-are-the-specifications-of-the-kempner-institute-hpc-cluster" target="_blank">Click Here</a>)
- Understanding Storage Tiers (<a href="/s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options.html" target="_blank">Click Here</a>)
- Shared Open-Source Data Repositories on Cluster (<a href="/s1_high_performance_computing/storage_and_data_transfer/shared_data_repository.html" target="_blank">Click Here</a>)
- Good Citizenship on the Cluster (<a href="/s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use.html" target="_blank">Click Here</a>)


## Development
````{dropdown} Cluster Access

1. SSH Access
    ```bash
    ssh <username>@login.rc.fas.harvard.edu
    ```

2. Open OnDemand (demo)

See {ref}`kempner_cluster:accessing_and_navigating_the_cluster` for full details. 

````

````{dropdown} Software Modules in AI cluster

1. **Software modules via module load**

    ```bash
    module avail
    module load python
    ```

    See {ref}`development_and_runtime_envs:software_module_and_environment_management` for full details. 

2. **Conda/mamba environments**

    *Why use conda environments?*


    ```{figure} figures/png/why_conda_env_1.png
    ---
    height: 300 px
    name: Why Conda Env 1
    ```

    ```{figure} figures/png/why_conda_env_2.png
    ---
    height: 300 px
    name: Why Conda Env 2
    ```

    *What is mamba?*

     FASRC uses `mamba`,  a drop-in replacement for `conda` that is generally much faster. 

    ```{admonition} Try it yourself
    Try creating a conda environment called `myenv` in your home directory by following [these steps](development_and_runtime_envs:using_conda_env:creation). Make it usable in jupyter notebooks with [one additional step](development_and_runtime_envs:using_conda_env:jupyter). 
    ```

3. **Spack**

See {ref}`development_and_runtime_envs:handling_dependencies_with_spack` for full details. 

````

````{dropdown} Code Synchronization

   **Using Git**:

   Step 1: Create a folder for the workshop excercise and navigate to it.

   Step 2: Clone the repository: Clone the repository.

   ```bash
   git clone https://github.com/KempnerInstitute/intro-compute-march-2024.git
   ```

   **VSCode**
   ```{admonition} Try it yourself
    Set up remote development using VSCode by following [these steps](development_and_runtime_envs:using_vscode_for_remote_development). 
   ```


````

`````{dropdown} Data Transfer

**Scp/rsync**: See {ref}`storage_and_data_trnasfer:data_transfer` for full details. 

````{admonition} Try it yourself

1. Navigate to the Data_transfer_example folder [here](https://github.com/KempnerInstitute/intro-compute-march-2024) and download `data.npy` to your computer.

2. Use scp or rsync to transfer this data to your home directory on the cluster. 


````

**Globus**: Follow the steps in {ref}`globus_section` to set up endpoints on the cluster and your laptop. 


`````

## Job Management and Monitoring

- Fairshare Policy and Job Priority Basics (<a href="/s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies.html" target="_blank">Click Here</a>)

````{dropdown} Example: Check your lab Fairshare score 
```bash
sshare --account=kempner_grads --all
```
````

````{dropdown} Example: Check your jobs fairshare in the queue
```bash
sprio -l | head -1 &&  sprio -l | grep $USER
```
````

````{dropdown} Example: Check all jobs running on kempner partitions
```bash
squeue -p kempner -o "%.18i %.9P %.20u %.50j %.8T %.10M %.5D %.20R" | sort -n -k 7
```
```bash
squeue -p kempner_requeue -o "%.18i %.9P %.20u %.50j %.8T %.10M %.5D %.20R" | sort -n -k 7
```
````

````{dropdown} Example: Fairshare score calculations 
```bash
scalc
```
````

````{dropdown} Example: Monitor Fairshare progress through Grafana 
<a href="https://dash.rc.fas.harvard.edu/d/qpgIs957z/lab-fairshare?orgId=1&refresh=5m" target="_blank">Check Grafana Dashboard</a>
````


- SLURM Partitions (<a href="/s1_high_performance_computing/general_hpc_concepts/understanding_slurm.html#slurm-partitions" target="_blank">Click Here</a>)
    - FASRC SLURM Partitions (<a href="https://docs.rc.fas.harvard.edu/kb/running-jobs/" target="_blank">Click Here</a>)
````{dropdown} Example: Check SLURM partition settings
```bash
scontrol show partition kempner
```
```bash
scontrol show partition kempner_requeue
```
````

````{dropdown} Example: Check status of all Kempner partitions 
```bash
spart | awk 'NR==1 || /kempner/'
```
````

````{dropdown} Example: Check status of nodes within a Kempner partition
```bash
lsload | head -n 1 & lsload | grep "8a19"
```
```bash
lsload | head -n 1 & lsload | grep "8a17"
```
````

````{dropdown} SLURM Interactive Jobs via Open OnDemand and VSCode

**Open OnDemand**: See {ref}`general_hpc_concepts:open_ondemand`.


**VSCode**: See {ref}`development_and_runtime_envs:using_vscode_for_remote_development:compute_node`.

````

`````{dropdown} SLURM Batch Job Submission Basics

See {ref}`resource_management:job_submission_basics:batch_jobs`.

````{admonition} Try it yourself

1. Navigate to the `SLURM_example_1` directory.

Here we have a python script that is simply occupying the CPU and Memory for a certain amount of time. Take a look at the job submission script `run.sh` and the python script `cpu_mem_occupy.py`.

2. **Test the job submission script**: 

You can test the job submission by adding the following command to the `run.sh` script:

```bash
#SBATCH --test-only
```

This will tell you what would happen if you submit the job without actually submitting it. (Try it!)

3. **Submit the job**: 

Drop the `--test-only` flag and set the duration to 300 seconds and submit the job using the following command:

```bash
sbatch run.sh
```

4. **Check the job status**:

You can check the status of the job using the following command:

```bash
squeue -u <username> 
```
or 

```bash
squeue -u $USER
```
or 

```bash
squeue --me
```

Note that the wrapper squeue command has some delay in updating the status of the job.

5. **Cancel the job**:

Resubmit the job and try to cancel the job using the following commands.

- Cancel the job using the job id:

    ```bash
    scancel <job_id>
    ```
- Cancel all jobs of the user:

    ```bash
    scancel -u <username>
    ```
- Cancel only pending jobs:

    ```bash
    scancel --state=pending -u <username>
    ```
````


`````

`````{dropdown} SLURM Batch Job Submission Advanced

**Array Jobs**

See {ref}`resource_management:array_jobs`.

````{admonition} Try it yourself

1. Navigate to the `SLURM_example_2` directory.


2. Take a look at the job submission script `run_array_job.sh`, the python script `hyperparameter_tuning.py`, and the csv file `hyperparemters.csv`. Can you figure out what would happen if you run this job?


3. Submit the array job

```bash
sbatch run_array_job.sh
```


4. Check the status of the job. Look at the output files created (once it runs). Do they match what you would expect?


````


`````
- Useful Slurm commands ([Click Here](https://github.com/KempnerInstitute/intro-compute-march-2024))
- Monitoring Job Status and Utilization


## Advanced Computing Techniques

- Best practices for HPC efficiency
- Introduction to parallel computing (<a href="/s5_ai_scaling_and_engineering/scalability/introduction_to_parallel_computing.html" target="_blank">Click Here</a>)
- Containerization with Singularity (<a href="/s1_high_performance_computing/development_and_runtime_envs/containerization.html#containerization" target="_blank">Click Here</a>)
- Distributed Computing (<a href="/s5_ai_scaling_and_engineering/scalability/distributed_computing.html" target="_blank">Click Here</a>)

## Support and Troubleshooting

- Troubleshooting Common Issues
- Support Framework: FASRC and Kempner Engineering Team (<a href="https://www.rc.fas.harvard.edu/training/office-hours/" target="_blank">Click Here</a>)
    - Send a ticket to FASRC (`rchelp [at] rc.fas.harvard.edu`)
- Closing Remarks and Q&A Session
