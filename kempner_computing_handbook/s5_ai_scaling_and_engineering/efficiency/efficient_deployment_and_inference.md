(deployment_and_inference)=
# Deployment and Inference

Inference is running a trained model to get predictions. For a model that is used repeatedly, inference, not training, is often the largest ongoing compute cost, so serving it efficiently matters. This page covers the main techniques for fast, memory-efficient inference. It focuses on large language models (LLMs), where these techniques are most developed, but the principles apply to other models too. For tested multi-node serving of very large models on the cluster, see {doc}`Distributed Inference <../../s3_ai_workflows/distributed_inference>`.

## How inference differs from training

Inference has a different cost profile from training, so it is tuned differently.

- **Two goals, in tension.** *Latency* is how fast a single request completes; *throughput* is how many requests or tokens per second you serve in total. Batching more requests raises throughput but can raise per-request latency. Decide which one your use case needs.
- **Memory is weights plus KV cache.** Beyond the model weights, autoregressive generation stores a key-value (KV) cache of past tokens that grows with batch size and sequence length, and often dominates memory during serving.
- **Offline versus online.** *Offline* (batch) inference runs many prompts at once and cares only about throughput. *Online* serving answers requests as they arrive and cares about latency too.

## Use a serving engine

Do not write your own generation loop with `model.generate` for anything beyond a quick test. Purpose-built serving engines implement the optimizations below and are far faster. [vLLM](https://docs.vllm.ai/en/stable/) is the most widely used; [SGLang](https://github.com/sgl-project/sglang) and TensorRT-LLM are other strong options.

vLLM runs offline batches:

```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-3.1-8B-Instruct")
params = SamplingParams(temperature=0.7, max_tokens=256)
outputs = llm.generate(["Explain mixed precision in one sentence."], params)
```

or serves an OpenAI-compatible endpoint:

```bash
vllm serve meta-llama/Llama-3.1-8B-Instruct
```

The OpenAI-compatible endpoint lets existing client tools connect to your model without code changes.

```{warning}
A served endpoint is reachable over the network, so secure it. Gate requests with an API key by passing `--api-key` (or setting `VLLM_API_KEY`); vLLM then rejects requests without it. Per vLLM's [security guidance](https://docs.vllm.ai/en/stable/usage/security/), do not expose an inference server on an untrusted network, and treat the key as a shared secret. See {doc}`Cluster Usage Policies <../../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>` for network conduct.
```

```{seealso}
The Kempner Institute maintains [distributed-inference-vllm](https://github.com/KempnerInstitute/distributed-inference-vllm), with tested multi-node vLLM deployment recipes for large models such as Llama 3.1 405B and DeepSeek-R1 671B on the cluster. See {doc}`Distributed Inference <../../s3_ai_workflows/distributed_inference>` and the {doc}`LLM Distributed Inference workshop <../../s9_workshops_and_trainings/llm_distributed_inference/llm_distributed_inference>`.
```

## Throughput: batching and the KV cache

Two engine features give most of the throughput gain:

- **Continuous batching.** Instead of waiting for a whole batch to finish, the engine adds new requests as running ones complete, keeping the GPU busy. This alone can multiply throughput several-fold over static batching.
- **PagedAttention.** vLLM stores the KV cache in small, non-contiguous blocks, like virtual memory pages, which nearly eliminates the memory fragmentation that otherwise wastes most of the KV cache. This lets you hold more concurrent requests in the same memory.

Reusing a shared prompt prefix across requests (prefix caching) avoids recomputing it and helps throughput further.

## Latency: speculative decoding and chunked prefill

When per-request speed matters:

- **Speculative decoding** runs a small draft model to propose several tokens that the main model verifies in one step, cutting latency without changing the output distribution.
- **Chunked prefill** splits the initial prompt processing into chunks so it can overlap with ongoing generation, reducing time to first token under load.

## Quantization for inference

Serving in lower precision shrinks the model and speeds up memory-bound decoding, usually with little quality loss.

- **FP8** is the sweet spot on the cluster's H100 and H200 GPUs, which have native FP8 tensor cores. It roughly halves memory versus 16-bit with minimal quality impact.
- **FP4** is supported natively by the RTX6000 (Blackwell) GPUs in the `kempner_rtx` partition, whose tensor cores run 4-bit floating point for the lowest-precision, highest-throughput inference.
- **Weight-only INT8 or INT4** (for example AWQ or GPTQ) shrinks the weights further, useful when memory is the limit.
- **KV-cache quantization** (FP8) reduces the cache footprint so you can serve longer contexts or larger batches.

```{seealso}
For how the precisions map to each GPU, see the {doc}`GPU partition benchmarks <../../technical_blog/choosing_gpu_partition>`, and for precision in training, see {doc}`ML Efficiency <ml_scaling_and_efficiency>`.
```

## Fit the model in memory

Serving memory is the weights plus the KV cache, and the KV cache grows with context length and batch size. Two vLLM knobs control the trade-off:

- `gpu_memory_utilization` sets the fraction of GPU memory the engine may use for weights and cache.
- `max_model_len` caps the context length, which bounds the KV cache size.

```{warning}
Long context is expensive at inference time because the KV cache grows with sequence length. If you hit out-of-memory errors, lower `max_model_len`, reduce the batch size, or enable KV-cache quantization before reaching for more GPUs.
```

## Scale across GPUs and nodes

When a model does not fit on one GPU, shard it with tensor parallelism (splitting each layer) or pipeline parallelism (splitting layers across devices). In vLLM this is the `tensor_parallel_size` and `pipeline_parallel_size` engine arguments.

```{tip}
When a job needs several GPUs, pack them onto as few nodes as possible, ideally one. For example, request 4 GPUs on a single node rather than spreading them across nodes, because the intra-node GPU interconnect (NVLink or PCIe) is much faster than the network between nodes, so fewer nodes means less communication overhead.
```

```{seealso}
For tested multi-GPU and multi-node serving recipes on the cluster, including the parallelism settings for very large models, use {doc}`Distributed Inference <../../s3_ai_workflows/distributed_inference>` and the [distributed-inference-vllm](https://github.com/KempnerInstitute/distributed-inference-vllm) repository rather than configuring it from scratch.
```

## Right-size and monitor

- **Pick the right GPU.** Serving is often memory-bound, so match the model and context to a GPU with enough memory and the right precision support. The Hoppers (H100, H200) are strong for FP8 serving, the RTX6000 (Blackwell) adds native FP4 for low-precision inference, and a single RTX6000 suits smaller single-GPU serving. See {doc}`GPU Types and Use Cases <../../s1_high_performance_computing/kempner_cluster/gpu_types_and_use_cases>`.
- **Measure the right numbers.** Track tokens per second, requests per second, and latency (including time to first token), not just GPU utilization. See {doc}`Performance Monitoring <performance_monitoring_and_optimization>`.
