# Evaluating and Monitoring Agents

An agent's output looks confident whether or not it is correct, and a long run can quietly burn through budget. Three questions keep an agentic workflow honest: is it right (evaluation), what did it actually do (observability), and what did it cost. A fourth, covered at the end of this page, is whether the task suits an agent at all.

(agentic_ai:evaluate_against_baseline)=
## Evaluate against a baseline

Before you trust an agent on real work, and before you reach for a more complex setup, measure it on a small set of tasks whose answers you can check. A handful of representative tasks with known-good outputs is enough to see whether a change helps or hurts.

Use that set to resist unnecessary complexity. A multi-agent pipeline adds coordination overhead and can propagate errors, so compare it against a simpler single-agent or single-pass approach on your own tasks, and keep whichever is more accurate and cheaper. This is the hands-on side of the research method covered next in {doc}`Agentic AI in Research <agentic_ai_in_research>`.

## Check the output

A baseline tells you how an agent does on average; each result still needs its own check. Before you build on an agent's work:

- **Run the tests yourself.** Keep or write tests before the agent changes code, then read the test output rather than the agent's summary of it. A claim that "all tests pass" is not the same as seeing them pass.
- **Check that the tests were not weakened.** Agents under pressure to finish sometimes skip a failing test, loosen a tolerance, edit a reference file, or hard-code an expected value. Look at the diff of your test files as carefully as the diff of your code.
- **Compare against known-good outputs.** Where you have a reference result, compare the new output with it, within a tolerance you chose on purpose. {doc}`Refactoring Research Code into Packages <refactoring_into_packages>` shows this pattern.
- **Reproduce the key numbers.** Recompute a headline number by a separate route, rerun the analysis with a different seed, or plot the data and look. Agreement from two independent paths is much stronger evidence than one confident run.
- **Read the full diff.** An agent's summary of what it changed can leave things out. The diff cannot.
- **Check every source.** Open each citation, link, and quoted figure the agent relies on; see {doc}`Literature Review and Data Exploration <literature_review_and_data_exploration>`.

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

The [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai) define a vendor-neutral way to record these traces and metrics, so you can use an agent-native tool while you develop and still feed a standard observability stack in production. Purpose-built platforms render the same traces; treat them as interchangeable, since this layer changes quickly.

## Watch cost and context

Agent runs spend money and context, both of which reward a little discipline:

- **Track spend.** API usage is billed per token and shown in the provider's console, and a subscription has usage limits, which Claude Code shows with `/usage`; cluster jobs draw on your fairshare allocation. See {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Cache repeated context.** Prompt caching reuses a stable prompt prefix to cut cost and latency, and Claude Code applies it automatically to its system prompt, tools, and project instructions. Benefit from it by keeping durable context in `CLAUDE.md` or `AGENTS.md`, leaving that prefix unchanged within a session, and running `/clear` to start fresh between unrelated tasks rather than carrying a stale prefix.
- **Keep the working context small.** Give the agent what the task needs, not the whole repository; a smaller context is cheaper and often more accurate.
- **Bound long runs.** Cap an unattended run before you start it with `--max-turns`, `--max-budget-usd`, and a SLURM `--time` limit, and for an API key, set a spend limit in the provider console; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.

## When not to use an agent

Some tasks are better done yourself, or with the agent preparing a command that you review and run:

- **You cannot check the result.** With no tests, no reference, and no expertise to review the output, an agent's confident answer is a liability rather than a shortcut.
- **The data is above what the tool is approved for.** On the cluster, a cloud agent may work only with public data (Level 1) unless your school has an agreement with the provider; see {ref}`Before you start <agentic_ai:before_you_start>`. Keep other data out of it. A model you serve on the cluster, as in {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`, keeps data from leaving it; which data you may use with it is set by the rules under {ref}`Data classification and what the cluster can host <security_and_compliance:data_classification>` and {ref}`Responsible use of AI tools <security_and_compliance:responsible_use_of_ai_tools>` in Security and Compliance.
- **The action is hard to undo.** Deleting or moving shared data, overwriting results, canceling or submitting large batches of jobs, changing permissions, and pushing or publishing are yours to run.
- **The judgment is the science.** Choosing a hypothesis, deciding what a result means, and standing behind a claim stay with you; see {doc}`Agentic AI in Research <agentic_ai_in_research>`.
- **The task is small or one-off.** If reviewing the agent's work would take longer than doing it, do it.
- **It would cost more than it saves.** Open-ended runs over a large context can spend more budget or GPU time than the task is worth. Bound them as described in {ref}`Caps on unattended runs <agentic_ai:run_caps>`.

```{seealso}
For the research method behind evaluation, see {doc}`Agentic AI in Research <agentic_ai_in_research>`. For staying within your allocation on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. Subagents, which show up as separate spans in a trace, and the guardrails that bound a run are covered in {doc}`Configuring Agents for Your Project <configuring_agents>`.
```
