# Local Agentic Models

A local agentic model is an open-weight model, such as GLM-5.2 or Kimi-K2.7-Code, that you serve on the cluster's own GPUs and drive with Claude Code or any OpenAI-compatible client. Because the model runs on the cluster, your prompts and code never leave it for an external provider. This is the on-cluster answer to the cloud-or-local choice in {doc}`Agentic AI Tools <agentic_ai_tools>`, and it sidesteps the external-service data limits described in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. The tradeoff is that you spend time on your GPU allocation instead of a subscription or API bill. For what data may be processed where, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

## Where the recipes live

The Kempner [local-agentic-coding](https://github.com/KempnerInstitute/local-agentic-coding) repository is the maintained source for serving these models on the cluster. Each recipe is self-contained: one directory holds the environment build, the launch scripts, the measured performance, and the known failure modes for one model on one hardware shape. This page orients you; follow the repository for the runnable steps.

```{note}
This is a fast-moving area. Treat the model shortlist and figures below as a snapshot, and check the repository's model table and [choosing a model](https://github.com/KempnerInstitute/local-agentic-coding/blob/main/docs/choosing-a-model.md) guide for the current list and benchmarks.
```

## Two ways to connect

**Use an endpoint someone is already serving.** This is the fastest path, with no environment build. Get the node name, port, and API key from whoever is serving the model, then point Claude Code at it:

```bash
export ANTHROPIC_BASE_URL=http://<node>:8000
export ANTHROPIC_AUTH_TOKEN=<the api key>
export ANTHROPIC_MODEL=<served model name>
export ANTHROPIC_SMALL_FAST_MODEL=<the same name>
claude
```

See the repository's [quickstart](https://github.com/KempnerInstitute/local-agentic-coding/blob/main/docs/quickstart.md) for the full walkthrough.

**Serve your own.** Start from a single-GPU recipe: it queues fastest and needs one GPU rather than a whole node. Each recipe follows the same shape: configure once, build the environment, launch, verify, then connect. Larger models need a full RTX or H200 node, or several nodes.

## Models to consider

A curated starting point, drawn from the repository's validated recipes:

- **Gemma-4-26B-A4B** is a strong default for interactive coding on a single GPU: a mixture-of-experts model with 4B active parameters, so it is fast and queues quickly.
- **GLM-5.2** offers strong reasoning and is the fastest large model measured in the repository when it fits a single RTX node.
- **Kimi-K2.7-Code** is the strongest coder available, a 1T-parameter mixture of experts quantized to INT4; use it when quality matters more than latency and you can hold a full RTX node, or two H200 nodes for its validated recipe.
- **Qwen3-Coder-480B** is the largest coding model that fits a single RTX node.

## Engines

The recipes cover two serving engines. vLLM is the default because it exposes an Anthropic-compatible `/v1/messages` endpoint that Claude Code uses directly with no proxy. SGLang serves only an OpenAI-compatible `/v1` API, so drive it with an OpenAI-compatible client instead.

## Using the GPUs well

Serving a model reserves its GPUs for the whole allocation, and they draw power whether or not requests are arriving. A loaded model sitting idle wastes that reservation, so release the allocation when you are not actively using it, and connect to an existing endpoint rather than launching a second copy of a model a colleague already serves. This is the same idle-GPU discipline described in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

Because one served model handles many requests at once, a single endpoint shared across a lab uses the GPUs far better than each person serving their own. vLLM and SGLang batch concurrent requests, so throughput in tokens per second climbs with concurrency until the GPUs saturate. One person in one Claude Code session rarely gets there; several users, or a multi-agent workflow that issues requests in parallel, keep the GPUs busy and raise the tokens you get per GPU-hour.

Measure to see where you stand. The repository's [benchmarking](https://github.com/KempnerInstitute/local-agentic-coding/blob/main/docs/benchmarking.md) tool reports a recipe's sustained decode rate on an otherwise idle endpoint, which gives each model's baseline single-stream speed; the model table records these numbers. To judge whether a shared endpoint still has headroom under real use, watch GPU utilization while it serves; see {doc}`Performance Monitoring and Optimization <../s5_ai_scaling_and_engineering/efficiency/performance_monitoring_and_optimization>`.

```{tip}
If your lab uses local models regularly, stand up one shared endpoint per model rather than one per person. It cuts queue waits, keeps utilization high, and means most people only need the four environment variables above, with no build.
```

## Things that will bite you

A few issues account for most first-attempt failures; the repository's [troubleshooting](https://github.com/KempnerInstitute/local-agentic-coding/blob/main/docs/troubleshooting.md) guide covers the rest:

- Use `ANTHROPIC_AUTH_TOKEN`, not `ANTHROPIC_API_KEY`. The latter makes the client send an `x-api-key` header, which vLLM ignores, so every request returns 401.
- Set `ANTHROPIC_SMALL_FAST_MODEL`. Without it, Claude Code reaches for a hosted model that your local endpoint does not serve.
- Claude Code's built-in web search fails against vLLM with an HTTP 400, because the tool definition it sends has no input schema. Client-side tools such as file editing and shell commands work normally; the repository documents a keyless replacement for search.

## Hardware

The cluster's serving partitions are `kempner_rtx` (RTX PRO 6000 Blackwell), `kempner_h200`, and `kempner_h100`. Which model fits which shape, and at what parallelism, is set by GPU memory and the interconnect. See {doc}`GPU Types and Use Cases <../s1_high_performance_computing/kempner_cluster/gpu_types_and_use_cases>` and the repository's hardware notes.

```{seealso}
For the wider tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`, and for running cloud agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For serving models more generally, see {doc}`Efficient Deployment and Inference <../s5_ai_scaling_and_engineering/efficiency/efficient_deployment_and_inference>`.
```
