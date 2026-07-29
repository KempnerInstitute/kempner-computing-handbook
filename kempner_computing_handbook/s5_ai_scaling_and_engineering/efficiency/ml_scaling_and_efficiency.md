(ml_efficiency)=
# ML Efficiency

On a shared GPU cluster, compute is the scarce resource. Efficiency is about training bigger models, running more experiments, and finishing faster within the GPUs you are allocated. This page collects training-side efficiency techniques: how to use less memory, do more compute per second, and spend your compute budget wisely. It focuses on a single training run; for spreading a run across many GPUs, see {doc}`Distributed GPU Computing <../scalability/distributed_gpu_computing>`.

```{tip}
Measure before you optimize. Confirm a run is GPU-bound (not stalled on data loading or communication) before tuning it, and track the effect of each change. See {doc}`GPU Profiling <../scalability/gpu_profiling>` for profiling tools, and {doc}`Experiment Management <../experiment_management/README>` for tracking runs.
```

Efficiency techniques act on three levers:

- **Memory**: fit a larger model or batch on each GPU.
- **Compute**: do more useful math per second.
- **Budget**: choose the model size, data size, and hardware that give the most result per GPU-hour.

## Mixed-precision training

Mixed precision runs most operations in 16-bit while keeping a 32-bit master copy of the weights, and it uses full precision for the operations that need it. This cuts memory use, and because the cluster's A100, H100, and H200 GPUs have tensor cores built for 16-bit and lower, the speedup is larger than the memory saving alone would suggest.

Prefer **bf16** on these GPUs: it has the same exponent range as fp32, so it trains stably without the loss-scaling that fp16 needs. Some models and sensitive operations still benefit from full 32-bit precision, which mixed precision keeps where it matters.

```python
import torch

# bf16 needs no gradient scaler
for x, y in dataloader:
    with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
        loss = loss_fn(model(x), y)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
```

```{note}
If you use **fp16** instead (for example on older GPUs), wrap the step with a [`torch.amp.GradScaler`](https://docs.pytorch.org/docs/stable/amp.html) to avoid underflow. bf16 does not need it. For how the precisions compare in raw throughput on each GPU, see the {doc}`GPU partition benchmarks <../../technical_blog/choosing_gpu_partition>`.
```

## Fit more in memory

When a model or batch does not fit, these techniques trade a little compute or throughput for a large memory saving.

**Activation checkpointing** recomputes intermediate activations during the backward pass instead of storing them, often cutting activation memory several-fold at the cost of one extra forward pass.

```python
from torch.utils.checkpoint import checkpoint

# Recompute this block's activations in the backward pass
out = checkpoint(block, x, use_reentrant=False)
```

**Gradient accumulation** sums gradients over several small batches before stepping, giving the effect of a large batch without its memory cost.

```python
accum_steps = 4
optimizer.zero_grad(set_to_none=True)
for i, (x, y) in enumerate(dataloader):
    with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
        loss = loss_fn(model(x), y) / accum_steps
    loss.backward()
    if (i + 1) % accum_steps == 0:
        optimizer.step()
        optimizer.zero_grad(set_to_none=True)
```

Other memory levers:

- **Memory-efficient optimizers**: 8-bit or fused optimizers reduce optimizer-state memory.
- **Shard across GPUs**: when one GPU is not enough even after the above, shard the model, gradients, and optimizer state with FSDP. See {doc}`Distributed GPU Computing <../scalability/distributed_gpu_computing>`.

```{warning}
Activation checkpointing adds a recomputation pass, so it trades roughly 30% extra compute for the memory saving. Use it to unlock a larger batch or model, not on runs that already fit comfortably.
```

## Faster compute

Once a run fits, these techniques increase throughput on the same hardware.

**`torch.compile`** fuses operations into optimized kernels, often for a double-digit percentage speedup, with a one-line change:

```python
model = torch.compile(model)
```

```{note}
`torch.compile` specializes on input shapes and recompiles when they change, so variable sequence lengths (common in transformer text training) trigger repeated recompilation. Pad inputs to a fixed maximum length, or bucket them, to keep shapes stable.
```

**CUDA Graphs** capture a sequence of GPU kernels once and replay it as a single unit, removing the per-kernel CPU launch overhead that bottlenecks workloads with many small kernels (small models or small batches). The simplest way to use them is `torch.compile`'s reduce-overhead mode, which applies CUDA Graphs automatically where it is safe:

```python
model = torch.compile(model, mode="reduce-overhead")
```

See the [PyTorch CUDA Graphs notes](https://docs.pytorch.org/docs/stable/notes/cuda.html#cuda-graphs) for the manual API and its constraints.

**Efficient attention.** Standard attention materializes a large attention matrix. [FlashAttention](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html) computes it in tiles, giving large speedups and memory savings. PyTorch selects a fused backend automatically through `scaled_dot_product_attention`:

```python
import torch.nn.functional as F

# Uses a fused FlashAttention kernel when the inputs qualify
out = F.scaled_dot_product_attention(q, k, v, is_causal=True)
```

For custom attention masks, such as packing several sequences into one batch or sliding-window masking, [FlexAttention](https://pytorch.org/blog/flexattention/) compiles a flexible mask or score modification into a fused kernel.

**TF32** lets fp32 matmuls use faster tensor-core math on A100 and newer, usually with no accuracy impact:

```python
torch.set_float32_matmul_precision("high")
```

A few more low-effort throughput wins, drawn from the official [PyTorch Performance Tuning Guide](https://docs.pytorch.org/tutorials/recipes/recipes/tuning_guide.html):

- Set `torch.backends.cudnn.benchmark = True` for convolutional models with fixed input sizes, so cuDNN autotunes the fastest kernels.
- Use the `channels_last` memory format for CNNs together with mixed precision to better use the tensor cores.
- Load with `pin_memory=True` and copy to the GPU with `non_blocking=True` so host-to-device transfers overlap compute.
- Avoid unnecessary CPU-GPU synchronizations (for example `.item()`, `.cpu()`, or printing tensor values) inside the training loop, so the CPU can run ahead of the GPU.

```{tip}
Keep the GPUs fed. A fast model still stalls if data loading cannot keep up. Tune the input pipeline as described in {doc}`Parallel I/O <../scalability/parallel_io>`, and see {doc}`GPU Computing <../scalability/gpu_computing>` for how GPUs execute work.
```

## Efficient fine-tuning (PEFT and LoRA)

Full fine-tuning updates every weight and stores optimizer state for all of them, which is expensive for large models. Parameter-efficient fine-tuning (PEFT) methods such as **LoRA** freeze the base model and train small adapter matrices instead, cutting trainable parameters and memory by orders of magnitude. **QLoRA** goes further by quantizing the frozen base model.

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(r=8, lora_alpha=16, lora_dropout=0.05, task_type="CAUSAL_LM")
model = get_peft_model(base_model, config)
model.print_trainable_parameters()  # often well under 1% of the total
```

```{seealso}
See the [Hugging Face PEFT documentation](https://huggingface.co/docs/peft/index) for supported methods, and the {doc}`NVIDIA NeMo Workflow <../../s3_ai_workflows/nemo_workflow>` for ready-to-run LoRA and full fine-tuning examples on the cluster.
```

## Reinforcement learning and RLHF

Reinforcement learning from human feedback (RLHF) and related post-training methods (PPO, GRPO, DPO) have a different efficiency profile from supervised training: most of the wall-clock time goes to **generating rollouts**, not to gradient steps. Efficiency here is mostly about making generation fast and keeping every model busy.

- **Generate rollouts with a fast inference engine.** Producing samples with a served engine such as vLLM (PagedAttention) rather than a plain generation loop usually dominates RLHF throughput.
- **Prefer a critic-free algorithm where it fits.** GRPO estimates advantages from a group of samples and drops the separate critic model that PPO needs, cutting memory and compute, at some cost in stability.
- **Keep every model busy.** PPO-style RLHF juggles policy, reference, reward, and critic models. Colocating them and overlapping generation with training (asynchronous RL) avoids leaving GPUs idle.

```{seealso}
Kempner Institute researchers maintain [AgentsOpenRLHF](https://github.com/KempnerInstitute/AgentsOpenRLHF), a Ray- and vLLM-based RLHF framework (PPO, GRPO, REINFORCE++, asynchronous agentic RL). It is a fork of [OpenRLHF](https://github.com/OpenRLHF/OpenRLHF) and may not be in sync with the upstream project. For DPO and other post-training recipes on the cluster, see the {doc}`NVIDIA NeMo Workflow <../../s3_ai_workflows/nemo_workflow>`.
```

## Spend your compute budget wisely

Efficiency is not only per-step speed; it is also choosing what to train.

- **Compute-optimal training.** Scaling-law studies ([Kaplan et al.](https://arxiv.org/abs/2001.08361) and [Chinchilla](https://arxiv.org/abs/2203.15556)) show that for a fixed compute budget there is a balanced choice of model size and training tokens. Training a model that is too large on too little data, or the reverse, wastes compute. Estimate your budget before committing GPU time.
- **Track utilization.** Model FLOPs Utilization (MFU) measures how much of the GPU's peak you actually use, and is the headline efficiency metric for large runs. The Kempner Institute's [KempnerInsight](https://kempnerinsight.eng.kempnerinstitute.harvard.edu/) web app surfaces job and cluster metrics in one dashboard. For detailed profiling, see {doc}`GPU Profiling <../scalability/gpu_profiling>`.

```{warning}
Do not read the `nvidia-smi` or `nvtop` "GPU utilization" percentage as a measure of efficiency. It only reports the fraction of time at least one kernel was running on the GPU, not how much of the GPU's compute you use, so it can show 100% even when a single small kernel is running and real throughput is a few percent. For a true picture, track MFU together with a counter-based tool such as the Kempner Institute's [KempnerPulse](https://github.com/KempnerInstitute/kempnerpulse) dashboard (see {doc}`KempnerPulse <../../s3_ai_workflows/kempnerpulse>`), which is built on NVIDIA DCGM and separates real tensor-core and memory activity from headline utilization.
```

## Right-size the job

Matching the job to the hardware is itself an efficiency gain, and it keeps shared GPUs from sitting idle.

- **Pick the right GPU and precision** for the workload. See {doc}`GPU Types and Use Cases <../../s1_high_performance_computing/kempner_cluster/gpu_types_and_use_cases>` and the {doc}`GPU partition benchmarks <../../technical_blog/choosing_gpu_partition>`.
- **Size the batch** to fill GPU memory without spilling, then hold the global batch steady with gradient accumulation if you change GPU count.
- **Do not over-request.** Idle GPUs in an allocation still count against fair-use. Review {doc}`Cluster Usage Policies <../../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>`.

```{seealso}
The Kempner Institute's [KempnerForge](https://github.com/KempnerInstitute/KempnerForge) foundation-model training framework applies many of these techniques together, including FSDP2, FP8 mixed precision, activation checkpointing, and `torch.compile`. See {doc}`KempnerForge <../../s3_ai_workflows/kempnerforge>`.
```

## Inference

The techniques above target training. Inference-time efficiency is a topic of its own: quantizing the model for serving, batching requests, reusing the KV cache, and using a serving engine such as vLLM. See {doc}`Deployment and Inference <efficient_deployment_and_inference>` and {doc}`Distributed Inference <../../s3_ai_workflows/distributed_inference>`.
