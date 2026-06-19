# KempnerForge

[KempnerForge](https://github.com/KempnerInstitute/KempnerForge) is a PyTorch-native framework for fault-tolerant distributed training of foundation models on AI clusters, developed at the Kempner Institute. It is designed for config-driven experiments that need to scale from small debug runs to multi-node training jobs by swapping a single TOML config, with FSDP, tensor, expert, and pipeline parallelism applied automatically.

**Best for**

- Scaling‑law experiments — train one architecture across model sizes by changing config alone.
Multimodal / vision‑language research — train VLMs across multiple fusion architectures (joint‑decoder, cross‑attention, mixture‑of‑transformers, modality‑aware experts).
- Sparse‑architecture (MoE) research — toggle dense ↔ Mixture‑of‑Experts and vary routing, shared/fine‑grained experts, and MoE frequency.
- Mechanistic interpretability & NeuroAI — layer‑wise activation extraction and raw QK^T attention capture for probing, CKA/SVCCA, and comparison against neural recordings.
- Optimizer / scheduler studies — mix and match optimizers, LR schedules, and curriculum (data‑annealing) phases via config.
- Long‑running jobs on shared clusters — SLURM preemption handling, async checkpointing with auto‑resume, and live health monitoring for multi‑day runs.

**Core capabilities**

- Architecture — decoder‑only Transformer (RoPE, GQA, SwiGLU, RMSNorm, optional QK‑Norm, torch.compile); Mixture‑of‑Experts with softmax top‑k and DeepSeek‑V3‑style sigmoid routing.
- Multimodal / Vision‑Language Models — registry‑driven VLM stack with four fusion architectures, SigLIP2/CLIP vision encoders, and staged freeze/unfreeze training.
- Parallelism — FSDP2, tensor, expert, and pipeline parallelism, plus FP8 mixed precision (via torchao).
- Training — multiple optimizers and LR schedulers; distributed (DCP) checkpointing with async save and auto‑resume; stateful data pipeline with multi‑dataset mixing, annealing, and HuggingFace (eager + streaming) integration.
- Resilience — SLURM preemption recovery, NaN detection, and GPU/NCCL health monitoring.
- Observability — MFU tracking, peak‑memory monitoring, and WandB/TensorBoard logging.
- Configuration — typed dataclass configs layered as defaults → TOML → CLI, with fail‑fast validation and a registry for swappable components.
