# Distributed GPU Computing
One can decide to use multiple GPUs on their AI/ML applications for different reasons including but not limited to:
* Handling large-scale datasets
* Hyperparameter tuning
* Train/inferece large-scale Model that does not fit into the memory of a single GPU. 

## Inter GPU Communication
In majority of use-cases of multi-GPU computation there is the need for different GPU to communicate and send their partail computation to one another to sync. NCCL libarary from NVIDIA is widely in use for NIVIDA based GPU communication.
(sec-nccl)=
### NVIDIA Collective Communication Library (NCCL)
For multi-GPU and multi-node communication, NVIDIA Collective Communication Library (NCCL, pronounced “Nickel”) is being used as backend in distributed strategies for Nvidia GPUs such as Distributed Data Parallel (DDP) and Fully Sharded Data Parallel (FSDP). Following are some of the most related NCCL collective communication primitives :
* Scatter: From one rank, data will be distributed across all rank, with each rank receiving a subpart of the data.
* Gather: One rank will receive the aggregation of data from all ranks.
* AllGather: Each rank receives the aggregation of data from all ranks in the order of the ranks.
* Reduce: One rank receives the reduction of input values across ranks.
* AllReduce: Each rank receives the reduction of input values across ranks.
* ReduceScatter: Input values are reduced across ranks, with each rank receiving a subpart of the result.
```{seealso}
For more information about the different NCCL collective operations refer to:
https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/collectives.html
``` 
```{note}
Each process in the multi-process applications is called a rank. Usually each process has its own exclusive device. Therefore you can think of each rank as one GPU in the following diagrams.
```

````{list-table} Inter-GPU Collective Communication Primitives.
:header-rows: 0

* - ![](figures/png/nccl_scatter.png)
   - ![](figures/png/nccl_gather.png)
* - ![](figures/png/nccl_reduce.png)
   - ![](figures/png/nccl_all_gather.png)
* - ![](figures/png/nccl_all_reduce.png)
   - ![](figures/png/nccl_reduce_scatter.png)
````
## Distributed Training Strategies
### Simple MLP Network
To go over the different distributed computing strategies that have been used widely in AI/ML community, let's consider the following simple example.
```{figure} figures/png/mlp_network.png
---
width: 50%
name: mlp_network
---
A 2-Layer MLP Network.
```
{numref}`mlp_matrices` shows the input, output of the above network as well as the weight and bias tensors of each layer in {numref}`mlp_network`
```{figure} figures/png/mlp_matrices.png
---
width: 80%
name: mlp_matrices
---
Input, output, weight and bias matrices of the mlp model in {numref}`mlp_network`.
```
* Forward Pass Computations
```{math}
:name: forward_computation
h = xW_1 + b_1

y' = hW_2 + b_2
```
* Loss Calculation
```{math}
:name: loss_computation
L = \frac{1}{2} (y' - y)^2
```
* Backward Pass Computations
```{math}
:name: backward_computation_dy
\frac{dL}{dy'} = y' - y
```
```{math}
:name: backward_computation_layer2
&W_2.grad = \frac{dL}{dW_2} = \frac{dL}{dy'} . \frac{dy'}{dW_2} = (y' - y) . h^T \\
&b_2.grad = \frac{dL}{db_2} = \frac{dL}{dy'} . \frac{dy'}{db_2} = (y' - y)
```
```{math}
:name: backward_computation_dh
\frac{dL}{dh} = \frac{dL}{dy'} . \frac{dy'}{dh} = (y' - y) . W_2
```
```{math}
:name: backward_computation_layer1
&W_1.grad = \frac{dL}{dW_1} = \frac{dL}{dh} . \frac{dh}{dW_1} = [(y' - y) . W_2] . x^T \\
&b_1.grad = \frac{dL}{db_1} = \frac{dL}{dh} . \frac{dh}{db_1} = [(y' - y) . W_2] 
```
* Updating the Model
```{math}
:name: update_computation
&W_i = W_i - \alpha . W_i.grad \\
&b_i = b_i - \alpha . b_i.grad 
```
Corresponding single-GPU pytorch code for the above example would be the following code:
```{code-block}
:name: mlp_single_gpu
:caption: mlp_single_gpu.py - Simple MLP example training loop. Note that it uses a random dataset with size of 1024 and batch size of 32.
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from random_dataset import RandomTensorDataset

class MLP(nn.Module):
  def __init__(self, in_feature, hidden_units, out_feature):
    super().__init__()

    self.hidden_layer = nn.Linear(in_feature, hidden_units)
    self.output_layer = nn.Linear(hidden_units, out_feature)
  
  def forward(self, x):
    x = self.hidden_layer(x)
    x = self.output_layer(x)
    return x

device = 0 # Using single GPU (GPU 0)

# model construction
layer_1_units = 6
layer_2_units = 4
layer_3_units = 2
model = MLP(
  in_feature=layer_1_units,
  hidden_units=layer_2_units,
  out_feature=layer_3_units
  ).to(device)

loss_fn = nn.MSELoss()
optimizer = optim.SGD(model.parameters(),lr=0.01)

# dataset construction
num_samples = 1024
batch_size  = 32
dataset = RandomTensorDataset(
  num_samples=num_samples,
  in_shape=layer_1_units,
  out_shape=layer_3_units
  )

dataloader = DataLoader(
  dataset,
  batch_size=batch_size,
  pin_memory=True,
  shuffle=True
  )

max_epochs = 1
for i in range(max_epochs):
  print(f"[GPU{device}] Epoch {i} | Batchsize: {len(next(iter(dataloader))[0])} | Steps: {len(dataloader)}")
  for x, y in dataloader:
    x = x.to(device)
    y = y.to(device)
    
    # Forward Pass 
    out = model(x)

    # Calculate loss
    loss = loss_fn(out, y)

    # Zero grad
    optimizer.zero_grad(set_to_none=True)

    # Backward Pass
    loss.backward()

    # Update Model
    optimizer.step()
```
The `RandomTensorDataset` will generate random tensors for the input as well as output label.
```{code-block}
:name: random_dataset
:caption: random_dataset.py - Simple Random Dataset
import torch
from torch.utils.data import Dataset

class RandomTensorDataset(Dataset):
  def __init__(self, num_samples, in_shape, out_shape):
    self.num_samples = num_samples
    torch.manual_seed(12345)
    self.data = [(torch.randn(in_shape), torch.randn(out_shape)) for _ in range(num_samples)]
  
  def __len__(self):
    return self.num_samples

  def __getitem__(self, idx):
    return self.data[idx]
```
````{dropdown} Run the above code on the HPC cluster
If you don't have a conda environment already in which PyTorch is installed, you need to create one.

```{code-block} bash
:name: conda_setup
:caption: Conda Environment Setup
# Creating the conda envireonment named `dist_computing` (one can use their own customized name).
conda create dist_computing python=3.10

# Activating the conda environment and install PyTorch:
conda activate dist_computing
pip3 install torch
```
The conda environment activation needs also be added to the slurm scripts.

Now create `mlp_single_gpu.py` and `random_dataset.py` from {numref}`mlp_single_gpu` and {numref}`random_dataset` respectively and use the following slurm script to run it on the HPC cluster.
```{code-block} bash
:name: single_gpu_slurm
:caption: Slurm script skeleton to run the single-GPU mlp example.
#! /bin/bash
#SBATCH --job-name=mlp-single-gpu
#SBATCH --output=mlp.out
#SBATCH --error=mlp.err
#SBATCH --time=00:10:00
#SBATCH --partition=kempner
#SBATCH --nodes=1
#SBATCH --ntasks-per-node=1
#SBATCH --cpus-per-task=4
#SBATCH --mem=64G
#SBATCH --account=kempner_dev # Add your own account here
#SBATCH --gres=gpu:1

module load python
conda activate dist_computing

python mlp_single_gpu.py
```
````
### Distributed Data Parallel (DDP)
Distributed Data Parallelism facilitates training a model on high-volume datasets by distributing the computation across multiple devices. Particularly, Each GPU trains a copy of the model and the dataset is splitted into smaller batches evenly distributed between GPUs. In each training step, GPUs perform forward and backward passes locally and compute the parameter gradients corresponding to their current data batch. Then before updating the model weights, GPUs communicate to sum the parameter gradients across GPUs. This guarantees the model replicas being kept consistent across GPUs before starting the next training step. This inter-GPU communication are optimized by All-Reduce collective communication primitive from NCCL library for Nvidia GPUs, see {numref}`sec-nccl`.

{numref}`ddp` shows a high-level overview of how DDP works. 
```{figure} figures/png/DDP.png
---
height: 500px
name: ddp
---
Schematic Diagram of DDP Computation, Communication and Their Potential Overlapp.
```
```{note}
The limitation is that DDP requires all model parameters, gradients, and optimizer states to fit into the memory of a single GPU device.
```

Now let's see how DDP applies on the above simple MLP example in {numref}`mlp_single_gpu`.
```{figure} figures/png/mlp_ddp.png
---
width: 100%
name: mlp_ddp_figure
---
DDP for the simple MLP example. For simplicity it does not show communication overlap.
```
Now we can take the single-GPU code of our simple mlp example from {numref}`mlp_single_gpu` and modify to use two GPUs using DDP.
````{dropdown} Using DDP To Run The Simple MLP example On Two GPUs
```{code-block}
:name: mlp_ddp_code
:caption: mlp_ddp.py - Modifying the simple mlp example, {numref}`mlp_single_gpu`, to run on multiple GPUs using DDP
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from torch.utils.data.distributed import DistributedSampler
from torch.nn.parallel import DistributedDataParallel as DDP
from torch.distributed import init_process_group, destroy_process_group, is_initialized
import os
from socket import gethostname

from random_dataset import RandomTensorDataset

class MLP(nn.Module):
  def __init__(self, in_feature, hidden_units, out_feature):
    super().__init__()

    self.hidden_layer = nn.Linear(in_feature, hidden_units)
    self.output_layer = nn.Linear(hidden_units, out_feature)
  
  def forward(self, x):
    x = self.hidden_layer(x)
    x = self.output_layer(x)
    return x

rank          = int(os.environ["SLURM_PROCID"])
world_size    = int(os.environ["WORLD_SIZE"])
gpus_per_node = int(os.environ["SLURM_GPUS_ON_NODE"])

assert (
  gpus_per_node == torch.cuda.device_count()
), f'SLURM_GPUS_ON_NODE={gpus_per_node} vs torch.cuda.device_count={torch.cuda.device_count()}'

print(
  f"Hello from rank {rank} of {world_size} on {gethostname()} where there are" \
  f" {gpus_per_node} allocated GPUs per node." \
  f" | (CUDA_VISIBLE_DEVICES={os.environ["CUDA_VISIBLE_DEVICES"]})", flush=True
)

# Using NCCl for inter-GPU communication
init_process_group(backend="nccl", rank=rank, world_size=world_size)
if rank == 0: print(f"Group initialized? {is_initialized()}", flush=True)

device = rank - gpus_per_node * (rank // gpus_per_node)
torch.cuda.set_device(device)

print(f'Using GPU{device} on Machine {os.uname().nodename.split('.')[0]} (Rank {rank})')

# model construction
layer_1_units = 6
layer_2_units = 4
layer_3_units = 2
model = MLP(
  in_feature=layer_1_units,
  hidden_units=layer_2_units,
  out_feature=layer_3_units
  ).to(device)

model = DDP(model, device_ids=[device])

loss_fn = nn.MSELoss()
optimizer = optim.SGD(model.parameters(),lr=0.01)

# dataset construction
num_samples = 1024
batch_size  = 32
dataset = RandomTensorDataset(
  num_samples=num_samples,
  in_shape=layer_1_units,
  out_shape=layer_3_units
  )

dataloader = DataLoader(
  dataset,
  batch_size=batch_size, # Global batch size is equal to batch_size multiply by the number of GPUs (world_size). batch_size=(batch_size//worldsize) to maintain the global batch size as batch_size
  pin_memory=True,
  shuffle=False,
  num_workers=int(os.environ["SLURM_CPUS_PER_TASK"]),
  sampler=DistributedSampler(dataset, num_replicas=world_size, rank=rank)
  )

max_epochs = 1
for i in range(max_epochs):
  print(f"[GPU{rank}] Epoch {i} | Batchsize: {len(next(iter(dataloader))[0])} | Steps: {len(dataloader)}")
  dataloader.sampler.set_epoch(i)
  for x, y in dataloader:
    x = x.to(device)
    y = y.to(device)
    
    # Forward Pass 
    out = model(x)

    # Calculate loss
    loss = loss_fn(out, y)

    # Zero grad
    optimizer.zero_grad(set_to_none=True)

    # Backward Pass
    loss.backward()

    # Update Model
    optimizer.step()

destroy_process_group()
```
To run this code we need the `random_sataset.py` from {numref}`random_dataset` and a conda environment in which PyTorch is installed, refer to {numref}`conda_setup` to create one if you don't have one already.

Now use the following slurm script skeleton to run the `mlp_ddp.py` from {numref}`mlp_ddp_code`. Note that we need to add environment variables to specify the Master node info, rannk, local rank, etc.
```{code-block} bash
:name: multi_gpu_slurm
:caption: Slurm script skeleton to run {numref}`mlp_ddp_code` on multiple GPUs. Here, it requests for two nodes, one GPU on each node, a total of two GPUs.
#! /bin/bash
#SBATCH --job-name=mlp_tp
#SBATCH --output=tp.out
#SBATCH --error=tp.err

#SBATCH --nodes=2
#SBATCH --ntasks-per-node=1
#SBATCH --cpus-per-task=4
#SBATCH --gpus-per-node=1

#SBATCH --time=00:10:00
#SBATCH --mem=64G
#SBATCH --partition=kempner
#SBATCH --account=kempner_dev

module load python cuda cudnn
conda activate dist_computing

export MASTER_ADDR=$(scontrol show hostnames | head -n 1)
export MASTER_PORT=39591
export RANK=$SLURM_PROCID
export LOCAL_RANK=$SLURM_LOCALID
export WORLD_SIZE=$(($SLURM_NNODES * $SLURM_NTASKS_PER_NODE))

srun --ntasks-per-node=$SLURM_NTASKS_PER_NODE \
     python -u mlp_ddp.py
```
````