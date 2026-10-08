# Key Concepts

The pages in this section share a small vocabulary. This page explains how an agent works, then defines the terms the rest of the section uses, with links to where each one is used in practice.

(agentic_ai:agentic_loop)=
## How an agent works

When you give an agent a task, the answer does not come from the model alone. The agent tool runs a loop: it calls a model to decide what to do, carries out the actions the model asks for, and repeats until the task is done.

```{mermaid}
flowchart LR
    U(["You"]) -->|task| H["Agent tool<br/>on your compute node"]
    H -->|"prompt, context,<br/>tool definitions"| M["Model<br/>provider or your endpoint"]
    M -->|"text and<br/>tool requests"| H
    H -->|runs if permitted| T["Tools<br/>files, shell, MCP servers"]
    T -->|results| H
    C["Instructions, skills,<br/>permission rules, hooks"] -.->|shape| H
    classDef you fill:#C6C8F4,color:#14154C,stroke:#3D3E82;
    classDef harness fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef model fill:#A51C30,color:#ffffff,stroke:#A51C30;
    classDef other fill:#ffffff,color:#14154C,stroke:#3D3E82;
    class U you;
    class H harness;
    class M model;
    class T,C other;
```

- **The agent tool is the harness, not the brain.** Claude Code, or OpenAI's Codex, runs on your compute node, holds the conversation, and runs tools. The reasoning happens in the model, on the provider's servers or on your own endpoint, as in {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`.
- **Each step is a model call.** The agent tool sends your prompt, the context so far, and the available tools. The model replies with text and, when it needs to act, with requests to use a tool.
- **Tools run on the node.** Reading a file, editing code, or running a command happens on the compute node, against your own files and shell, and the result goes back to the model. One prompt can drive many model calls and tool uses.
- **You gate the actions.** Between the model's request and the tool running, the agent tool asks you, lets a classifier decide, or follows your rules, depending on its permission mode; see {ref}`Permission modes <agentic_ai:permission_modes>`. Press Esc to interrupt at any point.

Other terminal agents, such as Gemini CLI, follow the same loop.

## The agent and the model

- **Model.** The large language model that does the reasoning, such as a Claude, GPT, or Gemini model, or an open-weight model you serve yourself. A model only produces text, including structured requests to use tools; it cannot act on its own.
- **Agent tool (the harness).** The program you run, such as Claude Code or Codex. It sends your task and the current context to the model and carries out the tool calls the model makes.
- **Agentic loop.** The cycle of model call, tool use, and observing the result, repeated until the task is finished or the agent stops to ask you.
- **Tool call.** A request from the model to take an action: read a file, edit code, run a shell command, or query an MCP server. The agent tool decides whether to run it, ask you first, or refuse, based on its permission settings.
- **Context window.** How much text the model can consider at once: your instructions, the files it has read, command output, and the conversation so far. Long sessions fill it, and older details can be summarized away or dropped. Larger context also costs more.
- **Token.** The unit models read and write, often part of a word. Context limits and API prices are measured in tokens.

## Running agents

- **Interactive session.** You give a task and follow along as the agent works, approving or steering its actions, in a terminal or an editor. See {doc}`Your First Agentic Workflow on the Cluster <first_agentic_workflow>`.
- **Print mode.** A one-shot, non-interactive run (for example `claude -p "your task"` in Claude Code, or `codex exec` in Codex) that prints the result and exits. This is how an agent runs inside a batch job. See {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
- **Permission modes.** Settings for how much an agent may do without asking: asking before edits and commands, accepting file edits, planning without editing files, or auto mode, where a second model, the classifier, reviews actions and blocks risky ones. See {ref}`Permission modes <agentic_ai:permission_modes>`.
- **Endpoint.** The network address of a model server. A cloud agent uses its provider's endpoint; {doc}`HPC Agentic Recipes <hpc_agentic_recipes>` shows how to serve a model on the cluster and point an agent at it.
- **Open-weight model.** A model whose weights you can download and run on your own hardware, so prompts and code stay on the cluster.

## Configuring and extending agents

- **Project instructions.** A file in your repository that the agent reads at the start of each session, with build and test commands, conventions, and layout. AGENTS.md is the cross-tool standard; Claude Code reads CLAUDE.md, or AGENTS.md when a project has no CLAUDE.md. See {doc}`Configuring Agents for Your Project <configuring_agents>`.
- **Skill.** A packaged, reusable workflow, such as instructions plus helper scripts, that an agent loads when a task calls for it. See {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.
- **MCP (Model Context Protocol).** An open standard for connecting agents to external tools and data. An MCP server exposes a set of tools; the agent calls them like any other tool. See {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.
- **Subagent.** A scoped helper that the main agent hands a task to. It works in its own context and can be limited to a smaller set of tools. See {doc}`Multi-Agent Orchestration <multi_agent_orchestration>`.
- **Permission rules.** Allow, ask, and deny lists that decide which tools and commands run without asking, which need your approval, and which are blocked. See {ref}`Permission rules <agentic_ai:permission_rules>`.
- **Hook.** A script the agent tool runs before or after an action, whatever the model decides. Hooks can block an action or record it. See {ref}`Hooks <agentic_ai:hooks>`.

## Safety and trust

- **Prompt injection.** Instructions hidden in content the agent reads, such as a web page, a file, or a dataset, that try to redirect it. Treat what an agent reads as data, not commands. See {ref}`Agent security <agentic_ai:agent_security>`.
- **Least privilege.** Giving an agent only the access its task needs. See {ref}`Scoping an agent to its task <agentic_ai:scoping>`.
- **Sandbox.** Isolation enforced by the operating system or a container that limits which files an agent's commands can change and which network addresses they can reach, regardless of what the model intends. See {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.
- **Human in the loop.** A review point where you check the agent's work before it continues or acts. See {doc}`Evaluating and Monitoring Agents <evaluating_and_monitoring_agents>` and {doc}`Agentic AI in Research <agentic_ai_in_research>`.
