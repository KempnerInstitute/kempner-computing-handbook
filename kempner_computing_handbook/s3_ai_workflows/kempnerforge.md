# KempnerForge

[KempnerForge](https://github.com/KempnerInstitute/KempnerForge) is a PyTorch-native framework for fault-tolerant distributed training of foundation models on AI clusters, developed at the Kempner Institute. It is designed for config-driven experiments that need to scale from small debug runs to multi-node training jobs by swapping a single TOML config, with FSDP, tensor, expert, and pipeline parallelism applied automatically.

**Best for**

- **Scaling-law experiments.** Train one architecture across model sizes by changing only the config.
- **Multimodal and vision-language research.** Train vision-language models (VLMs) with several fusion architectures: joint-decoder, cross-attention, mixture-of-transformers, and modality-aware experts.
- **Sparse-architecture (MoE) research.** Switch between dense and Mixture-of-Experts models, and vary the routing, shared and fine-grained experts, and how often layers use MoE.
- **Mechanistic interpretability and NeuroAI.** Extract activations at any layer and capture raw QK^T attention matrices for probing, CKA and SVCCA analyses, and comparison with neural recordings.
- **Optimizer and scheduler studies.** Mix and match optimizers, learning-rate schedules, and curriculum (data-annealing) phases through the config.
- **Long-running jobs on shared clusters.** Handle SLURM preemption, save checkpoints asynchronously and resume automatically, and monitor run health live during multi-day jobs.

**Core capabilities**

- **Architecture.** A decoder-only Transformer with RoPE, GQA, SwiGLU, RMSNorm, optional QK-Norm, and `torch.compile`, plus Mixture-of-Experts layers with softmax top-k or DeepSeek-V3-style sigmoid routing.
- **Multimodal and vision-language models.** A registry-driven VLM stack with four fusion architectures, SigLIP2 and CLIP vision encoders, and staged training that freezes and unfreezes parts of the model.
- **Parallelism.** FSDP2, tensor, expert, and pipeline parallelism, plus FP8 mixed precision through torchao.
- **Training.** Multiple optimizers and learning-rate schedulers, distributed checkpointing (DCP) with asynchronous saves and automatic resume, and a stateful data pipeline with multi-dataset mixing, annealing, and Hugging Face integration in eager and streaming modes.
- **Resilience.** SLURM preemption recovery, NaN detection, and GPU and NCCL health monitoring.
- **Observability.** MFU tracking, peak-memory monitoring, and logging to W&B or TensorBoard.
- **Configuration.** Typed dataclass configs layered as defaults, then TOML, then command-line overrides, with fail-fast validation and a registry for swappable components.
