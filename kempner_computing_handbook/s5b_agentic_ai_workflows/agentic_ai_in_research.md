# Agentic AI in Research

Agents can take on parts of the research process: searching the literature, proposing hypotheses, designing and running experiments, analyzing results, and drafting write-ups. Used well, an agent speeds up this work while you stay accountable for it. Used carelessly, it produces plausible but unverified claims. This page covers how to fit agents into a research workflow and keep their output trustworthy.

## Where agents fit in the research lifecycle

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

Work moves through these stages, you review and steer between them, and results can loop back to an earlier stage. You do not have to hand the whole pipeline to an agent. Today the most valuable uses are often a single stage with you steering, such as a literature agent that returns a cited brief, or an analysis agent working on one dataset. Keep fuller autonomy for well-scoped, low-stakes tasks.

## Workflow patterns

- **One agent or several.** A single capable agent handles many tasks. Several agents with separate roles, such as a solver and an independent evaluator, can help on large problems but add overhead and pass errors along. Compare both on your own task before you adopt the more complex one; see {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
- **Bounded loops.** Many research agents work in a design, run, measure, and revise loop. Give the loop a stopping criterion and a budget.
- **Review points.** Add explicit points where you check intermediate output, add domain knowledge, or change course. Treat the agent's output as a draft to check.

(agentic_ai:trustworthy_practices)=
## Best practices for trustworthy agentic research

- **Build verification in, not after.** Make every claim carry its evidence from the moment it is produced. Google Research's [Science-One](https://research.google/blog/science-one-framework-a-verifiable-autonomous-research-framework-via-chain-of-evidence/) calls this a chain of evidence: each reported number, method, or conclusion links to the record that supports it, so anyone can trace and confirm it.
- **Ground citations in retrieval, not model memory.** Have the agent retrieve sources from a real search or database, cite only what it read, and check every reference; see {doc}`Literature Review and Data Exploration <literature_review_and_data_exploration>`.
- **Keep reproducible records.** Log the prompts, code, data versions, seeds, and tool outputs a run depends on, so results can be rerun and audited; see {doc}`Reproducible Research <../s2_swe_for_research/reproducible_research>` and your {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
- **Check that the code matches the claim.** An agent can write code that scores well without doing what the text says, for example by leaking test data or optimizing the metric instead of the task. Read the code behind a reported result.
- **Keep a human accountable.** You are responsible for what you publish or act on, however it was produced. Review consequential actions, and match the agent's autonomy to the stakes; see {ref}`Permission modes <agentic_ai:permission_modes>`.

## Research integrity and compliance

- **Disclose substantial AI use.** Journals and preprint servers require authors to disclose significant use of generative AI and hold them responsible for all content. [arXiv's policy](https://info.arxiv.org/help/moderation/index.html) makes authors fully responsible however the content was generated, and AI tools cannot be authors; see [Nature's AI editorial policy](https://www.nature.com/nature-portfolio/editorial-policies/ai).
- **Follow the data rules.** An agent inherits the data rules of the service it uses. Send confidential data (Level 2 and above) only to a service with an agreement that covers its level, and keep data on the cluster within the cluster's approved level; see {ref}`Before you start <agentic_ai:before_you_start>` and {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

## Pitfalls and limitations

- **Automation bias.** Fluent output invites over-trust. The more capable and autonomous the agent, the more careful your review must be.
- **Early-stage autonomy.** Fully autonomous research agents are still largely at the pilot stage: strong at parts of the process, unreliable at others. Treat end-to-end autonomous results as leads to verify, not findings to report.
- **Cost, compute, and energy.** Long runs use API budget, GPU time, and the energy behind both, and an idle model server holds GPUs that draw power and that others could use. Bound unattended runs and release allocations you are not using; see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`.

## Further reading

- [Accelerating scientific breakthroughs with an AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/), Google Research: a multi-agent system for generating and refining hypotheses.
- [Sakana AI Scientist](https://github.com/SakanaAI/AI-Scientist): an open framework that runs the pipeline from idea to draft paper.
- [Towards Scientific Intelligence: A Survey of LLM-based Scientific Agents](https://arxiv.org/abs/2503.24047): a survey of scientific agents and how they are evaluated.

```{seealso}
For checking agent output, see {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>`. For the data and compliance rules behind this work, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```
