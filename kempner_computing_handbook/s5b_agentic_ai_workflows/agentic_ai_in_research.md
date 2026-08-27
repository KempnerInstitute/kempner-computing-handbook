# Agentic AI in Research

Agentic AI can take on parts of the research process, not just answer questions about it: searching and synthesizing the literature, proposing hypotheses, designing and running experiments, analyzing results, and drafting write-ups. Used well, an agent is a collaborator that accelerates this work while you stay accountable for it. Used carelessly, it produces plausible but unverified claims that can undermine a result or your credibility. This page is about the method: how to fit agents into a research workflow and how to keep their output trustworthy. For the tools themselves, see {doc}`Agentic AI Tools <agentic_ai_tools>`; for running them on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

## Where agents fit in the research lifecycle

Most research agents structure their work as a pipeline of stages, with a natural point for you to review between each:

- **Literature review and synthesis:** finding, screening, and summarizing prior work.
- **Hypothesis generation:** proposing questions or explanations to test.
- **Experiment and method design:** turning a hypothesis into a concrete, runnable plan.
- **Coding and execution:** implementing the method and running it.
- **Analysis and evaluation:** measuring results and checking them against the hypothesis.
- **Drafting and reporting:** writing up methods, results, and figures.

```{mermaid}
flowchart LR
    L[Literature<br/>review] --> H[Hypothesis<br/>generation] --> D[Experiment and<br/>method design] --> C[Coding and<br/>execution] --> E[Analysis and<br/>evaluation] --> W[Drafting and<br/>reporting]
    E -. iterate .-> H
    You([You: review and steer<br/>between stages])
    You -. review .-> H
    You -. review .-> C
    You -. review .-> W
    classDef stage fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef human fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class L,H,D,C,E,W stage;
    class You human;
```

Work flows through the staged tasks, you review and steer between them, and results can loop back to refine an earlier stage. You do not have to hand the whole pipeline to an agent. The highest-value uses today are often a single stage with you steering, such as a literature agent that returns a cited brief, or a data-analysis agent working on one dataset. Reserve fuller autonomy for well-scoped, low-stakes tasks, and keep the human review points between stages.

## Workflow patterns

- **Single agent or multi-agent pipeline.** A single capable agent handles many tasks. Multi-agent pipelines split work across specialized roles (for example a solver and an independent evaluator), which helps on large or multi-step problems but adds coordination overhead and lets errors propagate across agent boundaries.
- **Complexity versus benefit.** More agents are not automatically better. Benchmark a multi-agent setup against a simpler single-agent or single-pass approach on your own task before adopting it, and keep whichever is more accurate and cheaper; see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`.
- **Iterative loops.** Many research agents work in a design-run-measure-revise loop, refining a solution across cycles. Bound the loop with a stopping criterion and a budget so it does not run indefinitely.
- **Human-in-the-loop checkpoints.** Treat the agent as a collaborative accelerator, not a black-box replacement. Insert explicit review points where you inspect intermediate outputs, inject domain knowledge, or correct course.

## Best practices for trustworthy agentic research

- **Build verification in, not after.** Design the workflow so that every claim carries its supporting evidence from the moment it is produced, rather than checking a finished draft afterward. Google Research's [Science-One](https://research.google/blog/science-one-framework-a-verifiable-autonomous-research-framework-via-chain-of-evidence/) calls this a chain of evidence: each reported number, method, or conclusion links back to the record that supports it, so a reviewer (or you) can trace and confirm it.
- **Ground citations in retrieval, not model memory.** Fabricated references that look real are a well-documented failure mode. Have the agent retrieve sources from a real search or database and cite only what it actually read. Check every reference against its source before you rely on it.
- **Keep reproducible records.** Log the prompts, code, data versions, random seeds, and tool outputs a run depends on, so results can be re-run and audited. This is ordinary research reproducibility applied to agent runs; see {doc}`Reproducible Research <../s2_swe_for_research/reproducible_research>` and plan for it in your {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
- **Check that the code matches the claim.** An agent can write code that scores well without doing what the text says, for example by leaking test data or optimizing a metric rather than the task. Read the code behind a reported result, and confirm the method described is the method that ran.
- **Keep a human accountable.** You are responsible for what you publish or act on, regardless of how it was produced. Review an agent's proposals before approving consequential actions, and scope its autonomy to match the stakes (see the permission modes in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`).

## Research integrity and compliance

Using an agent does not change who is accountable for the result, and it adds disclosure obligations.

- **Disclose substantial AI use.** Journals and preprint servers require authors to disclose significant use of generative AI and hold them fully responsible for the content, however it was generated. [arXiv's policy](https://info.arxiv.org/help/moderation/index.html) states that authors take full responsibility for all contents irrespective of how they were generated. AI tools cannot be listed as authors, because they cannot take responsibility for the work; see [Nature's AI editorial policy](https://www.nature.com/nature-portfolio/editorial-policies/ai) for a representative statement.
- **Follow the data rules.** An agent inherits the data-handling rules of whatever service it uses. Do not send confidential data to an external AI service, and keep data on the cluster within its approved level. See {doc}`Security and Compliance <../s6_security_and_compliance/README>` and the data-level guidance in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`; running an open-weight model locally, as in {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`, keeps everything on the cluster.

## Pitfalls and limitations

- **Fabricated citations and results.** The most common and damaging failure: confident, well-formatted output that is simply wrong. Verify before you trust.
- **Error propagation.** In a multi-agent pipeline, a mistake early on can be amplified by later stages that treat it as given.
- **Automation bias.** Fluent output invites over-trust. The more capable and autonomous the agent, the more disciplined your review needs to be.
- **Early-stage autonomy.** Fully autonomous research agents remain largely at the pilot stage, strong at parts of the process and unreliable at others. Treat end-to-end autonomous results as leads to verify, not findings to report.
- **Cost and compute.** Long agent runs consume API budget or GPU time. Track both, and see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>` for staying within your allocation.

## Getting started on the cluster

Putting it together: choose a tool for the stage you want to accelerate ({doc}`Agentic AI Tools <agentic_ai_tools>`), run it responsibly in an interactive or batch job ({doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`), and if you want to keep everything on the cluster, serve an open-weight model yourself ({doc}`HPC Agentic Recipes <hpc_agentic_recipes>`). Start with one stage, keep a human review point, and verify the output before it leaves your hands.

## Further reading

- [Science-One: a verifiable autonomous research framework via chain of evidence](https://research.google/blog/science-one-framework-a-verifiable-autonomous-research-framework-via-chain-of-evidence/), Google Research. The chain-of-evidence approach to making autonomous research verifiable.
- [Accelerating scientific breakthroughs with an AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/), Google Research. A multi-agent system for generating and refining research hypotheses.
- [Sakana AI Scientist](https://github.com/SakanaAI/AI-Scientist). A publicly available framework that runs the full pipeline from idea to draft paper.
- [Towards Scientific Intelligence: A Survey of LLM-based Scientific Agents](https://arxiv.org/abs/2503.24047). A survey of scientific agents across hypothesis generation, experiment design, analysis, and their evaluation.
- [arXiv moderation and content policy](https://info.arxiv.org/help/moderation/index.html) and [Nature's AI editorial policy](https://www.nature.com/nature-portfolio/editorial-policies/ai), for disclosure and authorship expectations.

```{seealso}
For the data, integrity, and compliance rules that govern this work, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`. The rest of this section, linked above, covers the tools, how to run them on the cluster, and how to serve open-weight models locally.
```
