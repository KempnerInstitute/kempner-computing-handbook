# Evaluating and Monitoring Agents

An agent's output looks confident whether or not it is correct, and a long run can quietly burn through budget. Three questions keep an agentic workflow honest: is it right (evaluation), what did it actually do (observability), and what did it cost.

## Evaluate against a baseline

Before you trust an agent on real work, and before you reach for a more complex setup, measure it on a small set of tasks whose answers you can check. A handful of representative tasks with known-good outputs is enough to see whether a change helps or hurts.

Use that set to resist unnecessary complexity. A multi-agent pipeline adds coordination overhead and can propagate errors, so compare it against a simpler single-agent or single-pass approach on your own tasks, and keep whichever is more accurate and cheaper. The method here is the practical side of the guidance in {doc}`Agentic AI in Research <agentic_ai_in_research>`.

## Watch what it did

A single agent run expands into a tree of steps: the main agent calls tools, delegates to subagents, and makes model calls, each of which you can record as a span. Reading that trace is how you see where an agent went wrong, not just that it did.

```{mermaid}
flowchart TD
    A(["Agent run"]) --> T1["Tool call"]
    A --> L1["Model call"]
    A --> S1["Subagent"]
    S1 --> T2["Tool call"]
    S1 --> L2["Model call"]
    classDef root fill:#A51C30,color:#ffffff,stroke:#A51C30;
    classDef span fill:#14154C,color:#ffffff,stroke:#3D3E82;
    class A root;
    class T1,L1,S1,T2,L2 span;
```

The [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai) define a vendor-neutral way to record these traces and metrics, so you can use an agent-native tool while you develop and still feed a standard observability stack in production. Purpose-built platforms such as LangSmith, Langfuse, and Arize Phoenix render the same traces; treat them as interchangeable examples, since this layer changes quickly.

## Watch cost and context

Agent runs spend money and context, both of which reward a little discipline:

- **Track spend.** API and subscription usage bills to your account through the provider's console; cluster jobs draw on your fairshare allocation. See {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Cache repeated context.** Prompt caching reuses a stable prefix across calls, which cuts cost and latency when the same project context is sent each turn.
- **Keep the working context small.** Give the agent what the task needs, not the whole repository; a smaller context is cheaper and often more accurate.
- **Bound long runs.** Set token budgets and stopping criteria so an unattended run cannot spend without limit.

```{seealso}
For the research method behind evaluation, see {doc}`Agentic AI in Research <agentic_ai_in_research>`. For staying within your allocation on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. Subagents, which show up as separate spans in a trace, are covered in {doc}`Configuring Agents for Your Project <configuring_agents>`.
```
