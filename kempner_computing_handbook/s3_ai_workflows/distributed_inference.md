# Distributed Inference

Distributed inference enables large language models (LLMs) to serve predictions efficiently across multiple GPUs or nodes. As models grow in size, ranging from tens to hundreds of billions of parameters, single-GPU deployment becomes impractical. This section introduces how distributed inference is achieved using the open-source library [vLLM](https://docs.vllm.ai/en/latest/index.html).

## Overview

vLLM is a high-performance inference engine designed to serve large transformer models efficiently. It supports:

- Pipeline Parallelism (PP): Splits the model layers across GPUs or nodes.
- Tensor Parallelism (TP): Splits individual computations within a layer.

These features allow for scalable, memory-efficient, and high-throughput inference, making it ideal for deploying very large models in production environments or on AI clusters.

## Supported Models

The following models have been tested and configured for distributed inference using vLLM on AI clusters:

| Model            | Model Size | Hugging Face                                                     | Deployment Guide                                                                                                                  |
|------------------|------------|------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Llama 3.1        | 70B        | [HF Link](https://huggingface.co/meta-llama/Llama-3.1-70B)       | [Llama 3.1 Deployment](https://github.com/KempnerInstitute/distributed-inference-vllm/blob/main/README_Llama3.1.md)               |
| Llama 3.1        | 405B       | [HF Link](https://huggingface.co/meta-llama/Llama-3.1-405B)      | [Llama 3.1 Deployment](https://github.com/KempnerInstitute/distributed-inference-vllm/blob/main/README_Llama3.1.md)               |
| DeepSeek-R1      | 671B       | [HF Link](https://huggingface.co/deepseek-ai/DeepSeek-R1)        | [DeepSeek-R1 Deployment](https://github.com/KempnerInstitute/distributed-inference-vllm/blob/main/README_DeepSeekR1.md)           |
| DeepSeek-R1-0528 | 671B       | [HF Link](https://huggingface.co/deepseek-ai/DeepSeek-R1-0528)   | [DeepSeek-R1-0528 Deployment](https://github.com/KempnerInstitute/distributed-inference-vllm/blob/main/README_DeepSeekR1-0528.md) |

Each model's deployment page includes:

- Instructions for launching vLLM with multi-GPU settings.
- Example configurations for PP and/or TP.
- Tips for optimizing throughput and latency.

## Best Practices

- Use a fast interconnect between GPUs or nodes (e.g., NVLink, InfiniBand).
- Fine-tune the balance between PP and TP for your hardware.
- Monitor memory usage and load balancing to avoid bottlenecks.

For full source code, documentation, and additional details, visit the GitHub repository.

GitHub Repository: [KempnerInstitute/distributed-inference-vllm](https://github.com/KempnerInstitute/distributed-inference-vllm)

```{note}
Stay up to date with the repository for new model support and configuration guides.
```
