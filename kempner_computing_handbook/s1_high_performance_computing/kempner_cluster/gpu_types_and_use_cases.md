# GPU Types and Use Cases

The Kempner AI cluster provides several NVIDIA GPU types, each with different memory capacity, memory bandwidth, compute throughput, and numerical-precision support. This page compares the GPUs available on the cluster and gives guidance on choosing the right one for common AI and NeuroAI workloads. The four types are the [A100 40GB](https://www.nvidia.com/en-us/data-center/a100/), [H100 80GB](https://www.nvidia.com/en-us/data-center/h100/), [H200 141GB](https://www.nvidia.com/en-us/data-center/h200/), and [RTX PRO 6000 Blackwell Server Edition](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) (RTX6000).

## GPUs Available on the Kempner Cluster

Each GPU type is served by its own SLURM partition, and the RTX6000 nodes hold twice as many GPUs per node as the others.

| GPU | Architecture | SLURM partition | GPUs per node |
|-----|--------------|-----------------|---------------|
| A100 40GB | Ampere | `kempner` | 4 |
| H100 80GB | Hopper | `kempner_h100` | 4 |
| H200 141GB | Hopper | `kempner_h200` | 4 |
| RTX6000 96GB | Blackwell | `kempner_rtx` | 8 |

```{seealso}
For node counts and the physical hardware layout, see [Overview of the Kempner Cluster](overview_of_kempner_cluster.md). For partition time limits and job submission syntax, see [Understanding SLURM](../general_hpc_concepts/understanding_slurm.md) and [Job Submission Basics](../general_hpc_concepts/job_submission_basics.md).
```

## Specifications at a Glance

Each column header links to the official NVIDIA datasheet the values are drawn from.

| Specification | [A100 40GB](https://www.nvidia.com/en-us/data-center/a100/) | [H100 80GB](https://www.nvidia.com/en-us/data-center/h100/) | [H200 141GB](https://www.nvidia.com/en-us/data-center/h200/) | [RTX6000 96GB](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) |
|---|---|---|---|---|
| Architecture | Ampere | Hopper | Hopper | Blackwell |
| Tensor Core generation | 3rd | 4th | 4th | 5th |
| Memory | 40 GB HBM2 | 80 GB HBM3 | 141 GB HBM3e | 96 GB GDDR7 |
| Memory bandwidth | 1,555 GB/s | 3,350 GB/s | 4,800 GB/s | 1,597 GB/s |
| FP8 support | No | Yes | Yes | Yes |
| FP4 support | No | No | No | Yes |
| RT Cores | No | No | No | Yes (4th gen) |
| Transformer Engine | No | Yes | Yes | Yes (2nd gen) |
| GPU-to-GPU link | NVLink | NVLink | NVLink | PCIe Gen5 |
| Partition | `kempner` | `kempner_h100` | `kempner_h200` | `kempner_rtx` |

## Understanding the Key Differences

Four properties drive most GPU choices:

- Memory capacity sets the largest model and batch size that fit on one GPU. The A100 (40 GB) holds the least and the H200 (141 GB) the most, which matters for large models and long context windows.
- Memory bandwidth sets the speed of memory-bound work such as large-batch training and inference. The H200 (4,800 GB/s) leads, followed by the H100; the A100 and RTX6000 are lower.
- Numerical precision sets which low-precision math the Tensor Cores accelerate. Lower precision gives faster compute and a smaller memory footprint.
- Interconnect sets how fast GPUs exchange data. NVLink on the A100, H100, and H200 is much faster than the PCIe link on the RTX6000, which matters when one model is sharded across many GPUs.

```{note}
FP8 speeds up training and inference of large models at reduced precision. It is available on the H100, H200, and RTX6000, but not on the A100.
```

```{important}
FP4 is available only on the RTX6000, whose [Blackwell architecture](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) adds it. It is the format to reach for in low-precision and quantization research, an area where software support is still maturing. The H100 and H200 do not support it.
```

```{note}
The RTX6000 is the only GPU here with [RT Cores](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/), which accelerate ray tracing. This helps robotics and reinforcement learning that depend on simulation and rendering, and any visual-rendering workload.
```

```{warning}
The RTX6000 connects to other GPUs over PCIe Gen5 rather than NVLink. For jobs that shard one model across many GPUs, the NVLink-equipped A100, H100, and H200 scale more efficiently.
```

## GPU Profiles

### A100 40GB (Ampere)

The [A100](https://www.nvidia.com/en-us/data-center/a100/) is a proven training and inference GPU with third-generation Tensor Cores. Its 40 GB of memory and lack of FP8 make it best for small to mid-size models, prototyping, and established workflows.

### H100 80GB (Hopper)

The [H100](https://www.nvidia.com/en-us/data-center/h100/) adds fourth-generation Tensor Cores, a Transformer Engine, and FP8, a large step up in throughput for transformer models. Its 80 GB and NVLink suit large-model training.

### H200 141GB (Hopper)

The [H200](https://www.nvidia.com/en-us/data-center/h200/) shares the H100 compute architecture but pairs it with 141 GB of HBM3e and 4,800 GB/s of bandwidth, the most memory and bandwidth of the four. It is the best fit for the largest models, long context windows, and memory-bound inference.

### RTX6000 96GB (Blackwell)

The [RTX6000](https://www.nvidia.com/en-us/data-center/rtx-pro-6000-blackwell-server-edition/) uses the newest Blackwell architecture, with fifth-generation Tensor Cores, both FP8 and FP4, and fourth-generation RT Cores. With 96 GB of GDDR7 and 8 GPUs per node, it suits low-precision and quantization research, rendering, and simulation-heavy robotics and reinforcement learning. It connects to other GPUs over PCIe rather than NVLink.

## Choosing a GPU by Use Case

```{figure} figures/png/gpu_selection_map.png
---
width: 95%
name: gpu-selection-map
---
A guide to choosing a GPU on the Kempner cluster. For standard training and inference over NVLink, pick by memory footprint from the A100 to the H200. The RTX6000 is the choice for FP4 low-precision work and for RT-core rendering, robotics, and reinforcement learning.
```

### AI and Machine Learning

- Large-model pretraining and fine-tuning: H100 or H200, using FP8 and NVLink for throughput and multi-GPU scaling.
- Largest models, long context, and memory-bound inference: H200, for its 141 GB and highest bandwidth.
- Low-precision and quantization research: RTX6000, the only option with FP4.
- Small to mid-size training and prototyping: A100, which is widely available and well understood.

### NeuroAI

- Training and evaluating brain-inspired or vision models: H100 or H200 for throughput, A100 for smaller models.
- Robotics, embodied AI, and reinforcement learning with simulation or rendering: RTX6000, for its RT Cores.
- Analysis of large neural datasets and other memory-bound pipelines: H200, for its memory capacity and bandwidth.

## Requesting a Specific GPU on the Cluster

To use a specific GPU type, submit your job to the matching partition from the table above (for example `kempner_h200` for the H200). The Kempner SLURM pages already cover the submission commands, constraints, and time limits.

```{seealso}
See [Understanding SLURM](../general_hpc_concepts/understanding_slurm.md) for partitions and time limits, and [Job Submission Basics](../general_hpc_concepts/job_submission_basics.md) for `salloc` and `sbatch` examples.
```

## Summary: Quick Decision Guide

| If you need | Use |
|-------------|-----|
| The most GPU memory and bandwidth (large models, long context) | H200 |
| High-throughput large-model training with FP8 | H100 or H200 |
| FP4 for low-precision or quantization research | RTX6000 |
| RT Cores for robotics, reinforcement learning, or rendering | RTX6000 |
| Small to mid-size training, prototyping, or established workflows | A100 |
