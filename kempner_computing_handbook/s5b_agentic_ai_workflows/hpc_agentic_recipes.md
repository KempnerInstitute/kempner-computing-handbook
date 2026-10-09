# HPC Agentic Recipes

A local agentic model is an open-weight model that you serve on the cluster's own GPUs and drive with Claude Code or any OpenAI-compatible client. Your prompts and code then stay on the cluster, and no provider stores them. The data rule in {ref}`Before you start <agentic_ai:before_you_start>` still applies: [FASRC's guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/) covers "other GenAI models" on the cluster, not only cloud tools. Check with your school before you use Level 2 data; see {ref}`Data classification and what the cluster can host <security_and_compliance:data_classification>` and {ref}`Responsible use of AI tools <security_and_compliance:responsible_use_of_ai_tools>`. The tradeoff is GPU time from your allocation instead of usage on a cloud account.

```{warning}
DeepSeek models are not offered here. Under Harvard's [NDAA 2026 Guidance and Prohibition on use of certain Artificial Intelligence](https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/f/106/files/2026/01/NDAA-2026-Guidance-and-Prohibition-on-use-of-certain-Artificial-Intelligence.pdf), anyone performing work under a U.S. Department of Defense (DoD) contract may not use AI developed by DeepSeek, its parent company High Flyer, or affiliated entities, in any activity related to that contract. The rule also covers serving the open-weight models yourself. See {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```

## Where the recipes live

The Kempner [hpc-agentic-recipes](https://github.com/KempnerInstitute/hpc-agentic-recipes) repository is the maintained source. Each recipe is one directory with the environment build, launch scripts, measured performance, and known limits for one model on one hardware shape. This page orients you; follow the repository for the steps. The model list and figures below are a snapshot, so check the repository's model table and [choosing a model](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/choosing-a-model.md) guide for the current set.

## Two ways to connect

::::{tab-set}
:::{tab-item} Use a shared endpoint
This is the fastest path, with nothing to build. Ask whoever serves the model for its node, port, and API key (for example in the `#cluster-users` Slack channel, with the key sent by direct message). Save the key in a file only you can read, as in {ref}`Running a terminal agent <agentic_ai:running_a_terminal_agent>`, then point Claude Code at the endpoint:

```bash
unset ANTHROPIC_API_KEY
chmod 600 ~/.endpoint_key                           # the file that holds the key
export ANTHROPIC_BASE_URL=http://<node>:<port>
export ANTHROPIC_AUTH_TOKEN=$(cat ~/.endpoint_key)
export ANTHROPIC_MODEL=<model_name>
export ANTHROPIC_DEFAULT_HAIKU_MODEL=<model_name>
export CLAUDE_CODE_ATTRIBUTION_HEADER=0
claude
```

`CLAUDE_CODE_ATTRIBUTION_HEADER=0` removes a client attribution line from the start of each prompt, so a shared endpoint can reuse the work it cached for the common start of every prompt. See the repository's [quickstart](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/quickstart.md). Open-source agents such as opencode, Goose, and Qwen Code can use the same endpoint through its OpenAI-compatible `/v1` interface; see {doc}`Agentic AI Tools <agentic_ai_tools>`.
:::
:::{tab-item} Serve your own
Start with a single-GPU recipe: it queues fastest. Each recipe follows the same steps: configure once, build the environment, launch, verify, and connect. Larger models need a full RTX6000 node (8 GPUs), an H200 node (4 GPUs), or several nodes.
:::
::::

## Models to consider

NVFP4, FP8, INT4, and MXFP4 below are low-precision number formats that fit a large model on fewer GPUs.

- **Gemma-4-26B-A4B** is a strong default for interactive coding on one GPU: a mixture-of-experts model with 4B active parameters, so it is fast and queues quickly.
- **GLM-5.2** reasons well. Its NVFP4 build is the fastest large model that fits one RTX6000 node, and its FP8 build serves the longest context here, 626K tokens across two H200 nodes.
- **Qwen3-Coder-480B** gives strong quality for its speed on one RTX6000 node.
- **Kimi-K2.7-Code** is the largest coding model that fits one RTX6000 node, a 1T-parameter mixture of experts in INT4. Use it when quality matters more than latency.
- **Kimi-K3** has the highest published coding scores here, a 2.8T-parameter model in MXFP4. It needs four H200 nodes (16 GPUs, a user's full limit; see {doc}`Cluster Usage Policies <../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>`) and the SGLang engine.

The recipes run on the `kempner_rtx` (RTX6000), `kempner_h200`, and `kempner_h100` partitions; see {doc}`GPU Types and Use Cases <../s1_high_performance_computing/kempner_cluster/gpu_types_and_use_cases>`. Each recipe sets its serving engine: vLLM for most, and SGLang where vLLM cannot load the model, as for Kimi-K3. Both expose an Anthropic-compatible `/v1/messages` endpoint that Claude Code uses directly, alongside an OpenAI-compatible `/v1`.

## Using the GPUs well

A served model holds its GPUs for the whole allocation, and they draw power whether or not requests arrive. Release the allocation when you are not using it, and connect to a model a colleague already serves rather than launch a second copy.

One endpoint shared across a lab uses the GPUs far better than one per person. Both engines batch concurrent requests, so total throughput across many requests can be more than ten times the rate one session sees. The repository's [benchmarking](https://github.com/KempnerInstitute/hpc-agentic-recipes/blob/main/docs/benchmarking.md) tool measures both rates and finds where throughput peaks. If your lab uses local models often, run one shared endpoint per model; most people then need only the environment variables above.

## Common pitfalls

- **Use `ANTHROPIC_AUTH_TOKEN`, not `ANTHROPIC_API_KEY`.** The latter sends an `x-api-key` header, which both engines ignore, so every request returns 401.
- **Set `ANTHROPIC_DEFAULT_HAIKU_MODEL`.** Without it, Claude Code reaches for a hosted model your endpoint does not serve. The recipes' quickstart uses the older, deprecated name, `ANTHROPIC_SMALL_FAST_MODEL`.
- **Cap output on a small-context endpoint.** Claude Code requests 32,000 output tokens by default, which can exceed a 32K or 40K context and fail every request. Set `CLAUDE_CODE_MAX_OUTPUT_TOKENS` lower; recipes with a small context do this for you.
- **Web search does not work.** vLLM rejects Claude Code's built-in web search with HTTP 400, and SGLang silently drops it. File editing and shell commands work normally; the repository documents a replacement for search.

```{seealso}
For cloud agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For serving models more generally, see {doc}`Deployment and Inference <../s5_ai_scaling_and_engineering/efficiency/efficient_deployment_and_inference>`.
```
