# Evaluating and Monitoring Agents

An agent's output looks confident whether or not it is correct, and a long run can quietly use up a budget. Ask three questions of any agentic workflow: is it right, what did it do, and what did it cost. The last section asks a fourth: whether the task suits an agent at all.

(agentic_ai:evaluate_against_baseline)=
## Evaluate against a baseline

Before you trust an agent with real work, measure it on tasks whose answers you know. Pick five to ten tasks you have already solved, give each to the agent with the same prompt, and score its output against your answer. Rerun the set whenever you change the model, the prompt, or the setup, so you can see whether a change helps or hurts.

Use the same set to resist needless complexity. A multi-agent pipeline adds coordination overhead and can pass errors along, so compare it with a single agent on your own tasks, and keep whichever is more accurate and cheaper; see {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.

## Check the output

A baseline shows how an agent does on average; each result still needs its own check:

- **Run the tests yourself.** Keep or write tests before the agent changes code, and read the test output, not the agent's summary of it.
- **Check that the tests were not weakened.** Agents under pressure to finish sometimes skip a failing test, loosen a tolerance, edit a reference file, or hard-code an expected value. Read the diff of your test files as carefully as the code.
- **Compare against known-good outputs.** Compare new output with a reference result, within a tolerance you chose on purpose; see {doc}`Refactoring Research Code into Packages <refactoring_into_packages>`.
- **Reproduce the key numbers.** Recompute a headline number another way, rerun with a different seed, or plot the data and look. Two independent paths agreeing is far stronger evidence than one confident run.
- **Read the full diff.** An agent's summary of its changes can leave things out; the diff cannot.
- **Check every source.** Open each citation, link, and quoted figure the agent relies on; see {doc}`Literature Review and Data Exploration <literature_review_and_data_exploration>`.

## Watch what it did

To see where an agent went wrong, not just that it did, keep a record of each run. Three records cover most needs:

- **The session transcript.** `claude --resume` reopens any conversation, with every tool call and result.
- **The print-mode result.** `--output-format json` records the final answer, session ID, and estimated cost of a batch run; `--output-format stream-json --verbose` records every step.
- **A command log.** A hook can append every shell command the agent tries to a file; see {ref}`Hooks <agentic_ai:hooks>`.

For tracing many runs in a standard format, see the [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai).

(agentic_ai:watch_cost)=
## Watch cost and context

- **Track spend.** API usage is billed per token in the provider's console; a subscription has usage limits, which Claude Code shows with `/usage`. Cluster jobs draw on your fairshare allocation; see {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Let caching work.** Claude Code caches the unchanging start of each request, such as its system prompt, tools, and project instructions, automatically. Run `/clear` between unrelated tasks, so the old conversation is not sent again with every request.
- **Keep the context small.** Give the agent what the task needs, not the whole repository; a smaller context is cheaper and often more accurate.
- **Bound long runs.** Set `--max-turns`, `--max-budget-usd`, and a SLURM `--time` before an unattended run, and for an API key, a spend limit in the provider console; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.

## When not to use an agent

Some tasks are better done yourself, or with the agent preparing a command that you review and run:

- **You cannot check the result.** With no tests, no reference, and no expertise to review it, a confident answer is a liability.
- **The data is above what the tool is approved for.** On the cluster, a cloud agent may work only with public data (Level 1) unless your school has an agreement with the provider; see {ref}`Before you start <agentic_ai:before_you_start>`. For a model served on the cluster, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`, including the data rules that apply to it.
- **The action is hard to undo.** Deleting or moving shared data, overwriting results, submitting or canceling many jobs, changing permissions, and publishing are yours to run.
- **The judgment is the science.** Choosing a hypothesis, deciding what a result means, and standing behind a claim stay with you; see {doc}`Agentic AI in Research <agentic_ai_in_research>`.
- **The task is small or one-off.** If reviewing the agent's work takes longer than doing it, do it yourself.
- **It would cost more than it saves.** Open-ended runs over a large context can spend more than the task is worth.

```{seealso}
For the research method behind evaluation, see {doc}`Agentic AI in Research <agentic_ai_in_research>`. For the guardrails that bound a run, see {doc}`Configuring Agents for Your Project <configuring_agents>`.
```
