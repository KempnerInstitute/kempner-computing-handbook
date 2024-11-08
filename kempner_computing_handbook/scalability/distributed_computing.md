# Distributed Computing

## When One Computer is Not Enough

Often times the computational resources of a single node are not enough to solve a problem in a reasonable amount of time. This can be due to data size or limitations of compute, where more CPUs or GPUs are required than are available on a single node. In these cases, it is necessary to distribute the computation across multiple nodes on a shared network. In HPC and ML contexts, there is also typically shared storage and a scheduler that manages the allocation of resources to ease the work of coordinating distributed jobs. Distributed computing provides a means to massively scale up computation but also introduces a number of complexities and challenges. Distributed computing is a broad topic and an entire field of research in its own right. This chapter will provide an overview of the basic concepts and tools for distributed computing in the context of HPC and ML, with a particular focus on working on a SLURM managed cluster.

## How Slurm Handles Multinode Jobs

To request a multinode job, there a number of `sbatch`/`salloc` flags available to the user. Read more about [`sbatch`](https://slurm.schedmd.com/sbatch.html) and [`salloc`](https://slurm.schedmd.com/salloc.html) on SLURM official documentation. When requesting resources it is also important to consider whether the resources
being requested are allocated on a per node or per task basis. The key flags for multinode jobs are:

- `-N` or `--nodes`: The number of nodes to request for the job. This cannot be greater than the number of tasks requested.
- `-n` or `--ntasks`: The number of tasks to request for the job. This can be greater than the number of nodes requested, in which case multiple tasks will be run on each node. This can also be made to vary with the number of nodes using the `--ntasks-per-node` flag.
- `-c`: This is the number of CPUs per task. This is a per task resource, and the total number of CPUs requested for the job is `--ntasks` $\times$ `-c`. If the task per node description is uneven then the total number of CPUs will be different on each node. Note that all allocated CPUs on the job headnode will be available to the batch script and that task resource limitation will only be enforced on tasks initialized with `srun`.
- `--mem`: The amount of memory to request per node. Note that this is per node and not per task. Therefore the memory  allocated on each node will be shared by all tasks
- `--gres`: This flag can be used to request GPUs or other specialized resources. The resources requested with this flag are per node, and the number of resources requested will be shared by all tasks on the node. When there are multiple tasks on a node trying to divide GPUs, GPU selection will typically be done based on the local rank of the task. Frameworks like Pytorch handle this automatically.

When a multinode job is submitted, slurm will allocate the requested resources and then run the job script on the head node. The other nodes will be allocated
but will be unused unless a task is started on them by using `srun`. In theory tasks can also be started on other nodes through directly sshing into the node and running the task, but this is not recommended as it bypasses the slurm scheduler and can lead to resource contention and other issues. The head node is the node with a rank of 0, and the other nodes are numbered sequentially. The tasks are also numbered sequentially within each node. The environment variables `SLURM_NODEID` and `SLURM_PROCID` can be used to determine the node and task rank of a given task. 

### What is a "Task"?

A task is a single unit of work that can be executed on a single node wihtin a slurm job. Tasks are initialized by calling `srun` within a slurm allocation. Each task has its resources restricted using Cgroups (in a similar manner  to how slurm controls the resources visible to an entire allocation), and the resource for each task can be specified using many of the same flags available to the user when requesting resources for an entire allocation. Slurm automatically handles the placement of tasks on nodes within the allocation, and the user can specify the number of tasks to be run on each node using the `--ntasks-per-node` flag at job submission time. Slurm also sets environment variables within each task process indicating the Node rank and Task rank wihin the allocation. These can be used to coordinate work between tasks within a single allocation. Most distributed computing frameworks use these environment variables to coordinate work between tasks within a single allocation automatically.

## Typical Multinode Job Patterns

### Head and Worker Nodes

The typical pattern for multinode worker jobs is having a process running on one node that coordinates the work of other processes running on other nodes. This is often referred to as a head and worker pattern. The head node is responsible for coordinating the work of the worker nodes, and the worker nodes are responsible for doing the actual computation. The head node is typically responsible for distributing work to the worker nodes, collecting results from the worker nodes, and aggregating the results into a final result. The worker nodes are typically responsible for doing the actual computation, and they may also be responsible for collecting and sending results back to the head node. The head and worker nodes may communicate with each other using a variety of different communication patterns, typically over the network, but where shared file systems exist we also observe a pattern of writing intermediate results to shared storage.

This pattern can be used both for distributed training jobs or embarassingly parallel tasks that don't require the level of communication of distributed training. By handling the scheduling of tasks within a single job rather than outsource the scheduling and distribution of small pieces of work to slurm, we can avoid the overhead of scheduling and launching many small jobs and instead use a single job to manage the distribution of work across many nodes and improve the performance of both our job and of the  cluster as a whole. The frameworks described below all support this pattern, and it is the most common pattern for distributed computing on HPC clusters.


## Common Frameworks for Multinode Jobs

### Pytorch

Pytorch is typically thought of as a library for writing ML training pipelines, but its ecosystem also includes a number of utilities and libraries that
support multinode training. 
- The `torch.distributed` package provides a number of tools for coordinating distributed training, including a `DistributedDataParallel` module that wraps a model and handles the distribution of data and gradients across multiple nodes. 
- Pytorch also includes a `torch.multiprocessing` package that can be used to spawn multiple processes on a single node, which can be used to create a worker pool for distributed training. 
- Pytorch also includes a `torch.distributed.rpc` package that can be used to create distributed RPC services, which can be used to coordinate distributed training or to create distributed parameter servers.

```{note}
Please see the [pytorch documentation](https://pytorch.org/docs/stable/index.html) for more information on how to use these packages. 
```

#### Pytoch Lighting
[Pytorch Lighting](https://lightning.ai/docs/pytorch/stable/) is a highly recommended library, although it is not officially part of the pytorch distribution is. It includes a number of utilities and has built in easy integration with slurm to support multi GPU training. In experiments on the kempner cluster, we have seen pytorch lightning provide near linear scaling as the number of nodes is increased. 

Pytorch and Pytorch lightning support multiple communicatoin backends including both MPI and NCCL. This enables users to make backend changes and optimizations while keeping their model definition and training pipeline the same.


### Ray

[Ray](https://ray.io) is a distributed computation library for python that supports both single and multi-node execution. Ray is designed to be easy to use and provides a number of high-level abstractions for distributed computing, including a task-based API, a distributed actor API, and a distributed data API. Ray also includes a number of utilities for distributed machine learning, including a distributed data loader and a distributed hyperparameter search library.

It serves as the backend for a number of tools in the modern AI/ML ecosystem, including [vLLM](https://github.com/vllm-project/vllm), [DCLM](https://github.com/mlfoundations/dclm) and others. 

Ray clusters can be run on your laptop as well as on SLURM. The methods of starting the cluster are different, but once the cluster is started the python API is the same, enabling easy development of Ray applications for the cluster on your laptop.

#### Installing Ray

Ray can be installed using pip. The following command will install Ray and all of its dependencies.

```
pip install ray[default]
```

While Ray is available on `conda-forge`, the version available there is maintained by the community and may not be the most up to date. It is recommended to install Ray using pip. See the [Ray documentation](https://docs.ray.io/en/latest/ray-overview/installation.html#installing-from-conda-forge) for more information on how to install Ray.

#### Using Ray on SLURM

In order to use Ray on SLURM, you will need to start a Ray cluster and ensure that it is using the proper number of resources. The following script can be used to start a Ray cluster on SLURM. This script will start a Ray head node on the first node in the allocation and then start Ray workers on the rest of the nodes. The script will then start a python script that uses Ray to do distributed computation. Note the use of the SLURM environment variables. By default, Ray will attempt to use all CPUs on a node regardless of the number of tasks requested. This can be controlled by setting the `--num-cpus` flag when starting the Ray cluster. We do this in the following script by setting the number of CPUs to the number of CPUs per task requested by the user. We also set the number of GPUs to the number of GPUs per node requested by the user.

Some specific things to note about the script:
- The script will start a Ray head node on the first node in the allocation and then start Ray workers on the rest of the nodes.
- The script defines a custom temporary directory for ray to use, based on the user and job id. This is important as Ray will store logs and other temporary files in this directory. If we don't specify a custom directory, Ray will use the default `/tmp/ray` directory, which can lead to conflicts if multiple users are running Ray jobs on the same node. However this makes it so that `ray.init()` can't automatically connect to the ray cluster without specifying the address. We use the `RAY_ADDRESS` environment variable to specify the address of the head node without having to modify the script.

```
#! /bin/bash
#SBATCH --job-name=ray_cluster
#SBATCH -N 2 # number of nodes, this script is adaptable for any number of nodes
#SBATCH --tasks-per-node=1
#SBATCH --cpus-per-task=40 # number of cpus per task, this script can work with any number of cpus
#SBATCH --gres=gpu:4 # number of gpus per node, note that GPUs are not required for Ray
#SBATCH --mem=0 # memory per node, note that this is per node and not per task
#SBATCH --time=0:30:00 # time limit for the job
#SBATCH -p kempner_requeue
#SBATCH --account=<your account>




# Load environment with Ray installed, as well as other dependencies
# Can also run Ray inside singularitiy containers, assuming that all needed dependencies are installed in the container

## PLACEHOLDER LOAD ENV COMMAND ##

# Get number of GPUs on each node
if [[ -z "$SLURM_GPUS_ON_NODE" ]]; then
    export RAY_GPUS=0
else
    export RAY_GPUS=$SLURM_GPUS_ON_NODE
fi

# choose available port on the head node
head_port=`comm -23 <(seq 15000 20000 | sort) <(ss -Htan | awk '{print $4}' | cut -d':' -f2 | sort -u) | shuf | head -n 1`
nodes=`scontrol show hostnames $SLURM_JOB_NODELIST`
nodes_array=( $nodes )
head_node=${nodes_array[0]}
head_node_ip=$(srun --nodes=1 --ntasks=1 -w "$head_node" hostname --ip-address)
echo "Head node: $head_node"
echo "Head node ip: $head_node_ip"
echo "Head port: $head_port"
export head_addr="$head_node_ip:$head_port"
echo "Head address: $head_addr"

echo "Starting Ray head on $head_node"
srun -N 1 -n 1 -w "$head_node" ray start --head --node-ip-address="$head_node_ip" --temp-dir /tmp/$USER/$SLURM_JOB_ID/ray \
    --port=$head_port --num-cpus $SLURM_CPUS_PER_TASK --num-gpus $RAY_GPUS --min-worker-port 20001 --max-worker-port 30000 --block &

# wait for head node to start
sleep 5

# start ray on the rest of the nodes
worker_num=$((SLURM_NNODES - 1))
for (( i = 1; i <= worker_num; i++ )); do
    node=${nodes_array[$i]}
    echo "Starting Ray worker on $node"
    srun -N 1 -n 1 -w "$node"  ray start --address="$head_addr" \
        --num-cpus $SLURM_CPUS_PER_TASK --num-gpus $RAY_GPUS --min-worker-port 20001 --max-worker-port 30000 --block &
    sleep 5
done

# wait for all nodes to start
sleep 5

# export RAY_ADDRESS for your script to connect with custom tempdir
export RAY_ADDRESS="$head_addr"

# Start your script here
python my_ray_script.py
```

Your python script will then be able to call `ray.init()` to connect to the Ray cluster and use the Ray API to do distributed computation. Tasks and actors created 
during your script will run across the Ray cluster, with Ray handling scheduling, communication, and placement. Upon completion of the script, the Ray cluster will be shut down and the resources will be released as SLURM terminates the job.

### Dask
[TODO]

### MPI
[TODO]
