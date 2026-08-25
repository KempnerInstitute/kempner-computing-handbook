# HPC Agentic Recipes

A local agentic model is an open-weight model, such as GLM-5.2, Kimi-K3, or Kimi-K2.7-Code, that you serve on the cluster's own GPUs and drive with Claude Code or any OpenAI-compatible client. Because the model runs on the cluster, your prompts and code never leave it for an external provider. This is the on-cluster answer to the cloud-or-local choice in {doc}`Agentic AI Tools <agentic_ai_tools>`, and it sidesteps the external-service data limits described in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`: because nothing leaves the cluster, a local model can work with data up to the cluster's own rating, not just the Level 1 that public AI services are limited to. The tradeoff is that you spend time on your GPU allocation instead of a subscription or API bill. For the data rules that apply, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

## Where the recipes live

The Kempner [hpc-agentic-recipes](https://github.com/KempnerInstitute/hpc-agentic-recipes) repository is the maintained source for serving these models on the cluster. Each recipe is self-contained: one directory holds the environment build, the launch scripts, the measured performance, and the known limits for one model on one hardware shape. This page orients you; follow the repository for the runnable steps.

```{note}
This is a fast-moving area. Treat the model shortlist and figures below as a snapshot, and check the repository's model table and [choosing a model](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/choosing-a-model.md) guide for the current list and benchmarks.
```

## Two ways to connect

**Use an endpoint someone is already serving.** This is the fastest path, with no environment build. Get the node name, port, and API key from whoever is serving the model, then point Claude Code at it:

```bash
export ANTHROPIC_BASE_URL=http://<node>:8000
export ANTHROPIC_AUTH_TOKEN=<the api key>
export ANTHROPIC_MODEL=<served model name>
export ANTHROPIC_SMALL_FAST_MODEL=<the same name>
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
claude
```

The last variable drops a client attribution line from the front of the prompt so that a shared endpoint's prefix cache is reused across callers. See the repository's [quickstart](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/quickstart.md) for the full walkthrough.

**Serve your own.** Start from a single-GPU recipe: it queues fastest and needs one GPU rather than a whole node. Each recipe follows the same shape: configure once, build the environment, launch, verify, then connect. Larger models need a full RTX or H200 node, or several nodes.

## Models to consider

A snapshot from the repository's recipes; see its model table and choosing-a-model guide for the current set and measured rates. Recall that one RTX node is 8 GPUs and one H200 node is 4 GPUs.

- **Gemma-4-26B-A4B** is a strong default for interactive coding on a single GPU: a mixture-of-experts model with 4B active parameters, so it is fast and queues quickly.
- **DeepSeek-V4-Flash** is the fastest large model measured, on a single RTX node, and serves a 1M-token context from that one node.
- **GLM-5.2** offers strong reasoning and runs fast in NVFP4 on a single RTX node.
- **Qwen3-Coder-480B** is a strong quality-per-second choice on a single RTX node, close to the much smaller Qwen3-235B on the same hardware.
- **Kimi-K2.7-Code** is the largest coding-specialized model that fits a single RTX node, a 1T-parameter mixture of experts in INT4; use it when quality matters more than latency.
- **Kimi-K3** posts the highest published coding scores here, a 2.8T-parameter model in MXFP4; it needs four H200 nodes and the SGLang engine.
- **DeepSeek-V4-Pro** serves the longest context, its full 1M-token window, across two RTX nodes.

## Engines

The recipes use two serving engines, and both expose an Anthropic-compatible `/v1/messages` endpoint that Claude Code uses directly with no proxy, alongside an OpenAI-compatible `/v1`. vLLM runs most recipes. SGLang is used when vLLM cannot load a model, which is the case for Kimi-K3, served from a container. Each recipe sets its own engine, so you do not choose.

## Using the GPUs well

Serving a model reserves its GPUs for the whole allocation, and they draw power whether or not requests are arriving. A loaded model sitting idle wastes that reservation, so release the allocation when you are not actively using it, and connect to an existing endpoint rather than launching a second copy of a model a colleague already serves. This is the same idle-GPU discipline described in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

Because one served model handles many requests at once, a single endpoint shared across a lab uses the GPUs far better than each person serving their own. Both engines batch concurrent requests, so aggregate throughput climbs with concurrency until compute, memory bandwidth, or KV cache runs out. The gap is large: a recipe's total throughput across many concurrent requests can be more than ten times its single-stream rate. One person in one Claude Code session sees only the single-stream figure; it takes several users, or a multi-agent workflow that issues requests in parallel, to turn that into real throughput.

The repository's [benchmarking](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/benchmarking.md) tool reports both the single-stream rate and the aggregate rate, and can sweep concurrency to find where aggregate throughput peaks, which tells you how much headroom an endpoint has. To watch utilization during real use, see {doc}`Performance Monitoring <../s5_ai_scaling_and_engineering/efficiency/performance_monitoring_and_optimization>`.

```{tip}
If your lab uses local models regularly, stand up one shared endpoint per model rather than one per person. It cuts queue waits, keeps utilization high, and means most people only need the environment variables above, with no build.
```

## Things that will bite you

A few issues account for most first-attempt failures; the repository's [quickstart](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/quickstart.md) covers these and more:

- Use `ANTHROPIC_AUTH_TOKEN`, not `ANTHROPIC_API_KEY`. The latter makes the client send an `x-api-key` header, which both engines ignore, so every request returns 401.
- Set `ANTHROPIC_SMALL_FAST_MODEL`. Without it, Claude Code reaches for a hosted model that your local endpoint does not serve.
- Against a small-context endpoint, cap the output with `CLAUDE_CODE_MAX_OUTPUT_TOKENS`. Claude Code requests 32000 output tokens by default, which can exceed a 32K or 40K context and fail every request; recipes that serve a small context set this for you.
- Claude Code's built-in web search does not work against a local endpoint: vLLM rejects it with an HTTP 400, and SGLang silently drops it so the model answers without searching. Client-side tools such as file editing and shell commands work normally; the repository documents a keyless replacement.

## Hardware

The cluster's serving partitions are `kempner_rtx` (RTX PRO 6000 Blackwell), `kempner_h200`, and `kempner_h100`. Which model fits which shape, and at what parallelism, is set by GPU memory and the interconnect. See {doc}`GPU Types and Use Cases <../s1_high_performance_computing/kempner_cluster/gpu_types_and_use_cases>` and the repository's hardware notes.

```{seealso}
For the wider tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`, and for running cloud agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For serving models more generally, see {doc}`Deployment and Inference <../s5_ai_scaling_and_engineering/efficiency/efficient_deployment_and_inference>`.
```
