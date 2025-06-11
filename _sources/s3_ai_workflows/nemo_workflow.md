# NVIDIA NeMo Workflow

This section documents NVIDIA NeMo Workflows, designed for training and finetuning large language models (LLMs) on the Kempner AI Cluster using NVIDIA data center GPUs (e.g., A100, H100, and H200).

## Overview

This section provides a modular, cluster-ready workflow built on top of the [NVIDIA NeMo](https://github.com/NVIDIA/NeMo) framework. It supports:

- Pretraining and finetuning of LLMs such as GPT2 and Llama 3
- Scalable distributed training utilizing SLURM
- Containerized execution with reproducible environments

The goal is to replicate NeMo’s capabilities in a way that is optimized for the AI cluster infrastructure, while maintaining flexibility to adapt to new models and datasets.

GitHub Repository: [KempnerInstitute/nvidia-nemo-workflows](https://github.com/KempnerInstitute/nvidia-nemo-workflows)

## About NeMo

[NVIDIA NeMo](https://docs.nvidia.com/nemo-framework/user-guide/latest/overview.html) is a scalable, research-oriented AI framework for:

- Large Language Models (LLMs)
- Multimodal Models (MM)
- Automatic Speech Recognition (ASR)
- Text-to-Speech (TTS)
- Computer Vision (CV)

It is designed to streamline experimentation and deployment with modular components and out-of-the-box support for distributed training and mixed precision.

## Prerequisites

To use these workflows, ensure the following:

- Access to a SLURM partition with data center GPUs (e.g., A100, H100, or H200).
- Container with NeMo installed
- Access to pretrained models (e.g., [Llama 3](https://huggingface.co/meta-llama), [Megatron GPT2](https://huggingface.co/nvidia/megatron-gpt2-345m))
- Approved access to any [Gated Repositories](https://huggingface.co/settings/gated-repos) on Hugging Face

> [!NOTE]  
> Some models require token-based authentication and acceptance of usage terms on Hugging Face before use.

## Available NeMo Workflows

### Pretraining Workflows

| Workflow Name                   | Model                                                              | Dataset     |
|--------------------------------|---------------------------------------------------------------------|-------------|
| [gpt2_pretraining_codeparrot](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/pretraining/gpt2_pretraining_codeparrot) | [Megatron GPT2](https://huggingface.co/nvidia/megatron-gpt2-345m) | [CodeParrot](https://huggingface.co/codeparrot) |

### Finetuning Workflows

| Type     | Workflow Name  | Model       | Dataset   |
|----------|----------------|-------------|-----------|
| Full     | [sft_full_llama3-70b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/full/sft_full_llama3-70b_dolly15k)   | [Meta-Llama-3-70B](https://huggingface.co/meta-llama/Meta-Llama-3-70B)  | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |
| Full     | [sft_full_llama3-70b_pubmedqa](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/full/sft_full_llama3-70b_pubmedqa)   | [Meta-Llama-3-70B](https://huggingface.co/meta-llama/Meta-Llama-3-70B)  | [PubMedQA](https://pubmedqa.github.io)  |
| Full     | [sft_full_llama3-8b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/full/sft_full_llama3-8b_dolly15k)     | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)   | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |
| Full     | [sft_full_llama3-8b_pubmedqa](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/full/sft_full_llama3-8b_pubmedqa)     | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)  | [PubMedQA](https://pubmedqa.github.io)  |
| [LoRA](https://arxiv.org/abs/2106.09685)     | [sft_lora_llama3-70b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/lora/sft_lora_llama3-70b_dolly15k)   | [Meta-Llama-3-70B](https://huggingface.co/meta-llama/Meta-Llama-3-70B)  | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |
| LoRA     | [sft_lora_llama3-70b_pubmedqa](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/lora/sft_lora_llama3-70b_pubmedqa)   | [Meta-Llama-3-70B](https://huggingface.co/meta-llama/Meta-Llama-3-70B)  | [PubMedQA](https://pubmedqa.github.io)  |
| LoRA     | [sft_lora_llama3-8b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/lora/sft_lora_llama3-8b_dolly15k)     | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)   | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |
| LoRA     | [sft_lora_llama3-8b_pubmedqa](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/lora/sft_lora_llama3-8b_pubmedqa)     | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)   | [PubMedQA](https://pubmedqa.github.io)  |
| [P-Tuning](https://arxiv.org/abs/2103.10385) | [ptuning_llama3-70b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/p-tuning/ptuning_llama3-70b_dolly15k) | [Meta-Llama-3-70B](https://huggingface.co/meta-llama/Meta-Llama-3-70B)  | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |
| P-Tuning | [ptuning_llama3-8b_dolly15k](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/finetuning/p-tuning/ptuning_llama3-8b_dolly15k)   | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct)   | [databricks-dolly-15k](https://huggingface.co/datasets/databricks/databricks-dolly-15k)  |

### Reinforcement Learning (RL) Workflows

| Type | Workflow Name | Model      | Dataset        |
|------|---------------|------------|----------------|
| DPO  | [dpo_llama3-8b](https://github.com/KempnerInstitute/nvidia-nemo-workflows/tree/main/RL/DPO/llama3-8b) | [Meta-Llama-3-8B-Instruct](https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct) | email response |

> [!NOTE]
> Follow this repository for regular updates on workflow instructions for the latest training, fine-tuning, and RL workflows on AI clusters.
