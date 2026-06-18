# KempnerForge

[KempnerForge](https://github.com/KempnerInstitute/KempnerForge) is a PyTorch-native framework for fault-tolerant distributed training of foundation models on AI clusters. It is designed for config-driven experiments that need to scale from small debug runs to multi-node training jobs.

**Best for**

- Scaling decoder-only Transformer training across single-node and multi-node clusters.
- Comparing dense and Mixture-of-Experts model variants.
- Running long-lived jobs that need checkpointing, auto-resume, and cluster health monitoring.
- Extracting activations and attention patterns for interpretability and NeuroAI workflows.

**Core capabilities**

- Model architecture: RoPE, GQA, SwiGLU, RMSNorm, `torch.compile`, dense Transformers, and MoE variants.
- Parallelism: FSDP2, tensor, expert, and pipeline parallelism.
- Precision: FP8 mixed precision with E4M3 and E5M2 support through `torchao`.
- Training: AdamW, Muon, Lion, Schedule-Free AdamW, multiple learning-rate schedulers, DCP async checkpointing, data mixing, data annealing, and Hugging Face dataset integration.
- Resilience: SLURM preemption handling, auto-resume, NaN detection, GPU and NCCL health checks, MFU tracking, and WandB or TensorBoard logging.
- Interpretability: activation hooks with CPU offload, attention-weight capture, and batch extraction over datasets.
- Vision-language training: joint-decoder, cross-attention, Mixture-of-Transformers, and modality-aware expert paths.
