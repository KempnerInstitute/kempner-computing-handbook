# Agentic AI Tools

An agentic tool uses a large language model to plan and carry out multi-step tasks, not just answer a question: it can read a codebase, write and run code, call external tools, inspect the results, and iterate toward a goal. Tools differ in how much autonomy they take, from suggesting an edit you approve to running a whole task on their own. This page introduces widely used tools for research productivity; for how to run them on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

```{note}
This is a fast-moving area, and the list below is representative rather than exhaustive. Check each tool's current status and pricing before adopting it. To suggest a new tool, or a change to something already listed, open an issue in the [computing handbook GitHub repository](https://github.com/KempnerInstitute/kempner-computing-handbook/issues).
```

## Coding assistants and agents

The most common agentic tools for research or engineering write and edit code across a whole project. Most run as a terminal (CLI) command, a VS Code extension, or both, so you can use them in whichever surface you prefer.

| Tool | What it is |
|------|-----------|
| [Claude Code](https://www.anthropic.com/claude-code) | Anthropic's coding agent, as a CLI and a VS Code extension |
| [OpenAI Codex](https://github.com/openai/codex) | OpenAI's coding agent, as a CLI and an IDE extension |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Google's coding agent, as a CLI and a VS Code extension |
| [GitHub Copilot](https://github.com/features/copilot) | GitHub's assistant with an agent mode, as an editor extension |
| [Cline](https://cline.bot) | Open-source autonomous coding agent for VS Code |
| [Aider](https://aider.chat) | Git-aware pair-programming agent in the terminal |

Other tools are self-contained rather than add-ons to your editor:

| Tool | What it is |
|------|-----------|
| [Cursor](https://cursor.com) | AI-native code editor with a project-wide agent mode |
| [Devin Desktop](https://devin.ai/desktop) | AI editor and agent platform from Cognition (formerly Windsurf) |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Open-source platform for autonomous software-engineering agents |

## Research and science agents

Beyond coding, agentic tools can take on parts of the research process itself: searching and synthesizing the literature, and running experiments.

**Scientific literature:**

| Tool | What it is |
|------|-----------|
| [Edison Scientific](https://edisonscientific.com) | Web and API platform of science agents for literature search and analysis, spun out of the nonprofit FutureHouse lab; FutureHouse's PaperQA2 library is open source |
| [Elicit](https://elicit.com) | Research assistant for finding, screening, and summarizing papers |
| [Consensus](https://consensus.app) | Search engine that synthesizes findings across the research literature |

**Autonomous and domain-specific:**

| Tool | What it is |
|------|-----------|
| [Claude Science](https://www.anthropic.com/news/claude-science-ai-workbench) | Anthropic's multi-agent workbench for scientific research, with curated skills for genomics, proteomics, structural biology, and cheminformatics |
| [Google AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) | Google's multi-agent system for generating and refining research hypotheses |
| [Biomni](https://biomni.stanford.edu) | Biomedical research agent (Stanford) with a large toolset and connected databases |
| [Sakana AI Scientist](https://github.com/SakanaAI/AI-Scientist) | Publicly available framework that generates ideas, runs experiments, and drafts papers end to end |

General assistants also offer a **deep research** mode that plans, searches the web, and returns a cited report, for example [OpenAI Deep Research](https://openai.com/index/introducing-deep-research/), [Gemini Deep Research](https://gemini.google/overview/deep-research/), and [Perplexity](https://www.perplexity.ai).

## Frameworks for building agents

When you need a custom agent or pipeline rather than an off-the-shelf assistant, these frameworks help you define agents, give them tools, and orchestrate them.

| Framework | What it is |
|-----------|-----------|
| [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview) | Anthropic's SDK for building agents on Claude |
| [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/) | OpenAI's lightweight multi-agent framework |
| [LangGraph](https://www.langchain.com/langgraph) | Graph-based framework for stateful, multi-step agents |
| [Microsoft AutoGen](https://github.com/microsoft/autogen) | Framework for multi-agent conversations and workflows |
| [CrewAI](https://www.crewai.com) | Role-based multi-agent orchestration |
| [LlamaIndex](https://www.llamaindex.ai) | Data framework for building agents over your own data |
| [Hugging Face smolagents](https://github.com/huggingface/smolagents) | Minimal library for code-writing agents |
| [NVIDIA NemoClaw](https://www.nvidia.com/en-us/ai/nemoclaw/) | Open blueprints from NVIDIA and LangChain for building governed autonomous agents |

## Model Context Protocol (MCP)

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that lets agents connect to external tools, data, and services, for example files, databases, or APIs, through a common interface. Most of the tools above can act as MCP clients, so an MCP server you write or install becomes available to all of them.

```{seealso}
For scientific work, [ToolUniverse](https://zitniklab.hms.harvard.edu/ToolUniverse/) from the Zitnik Lab at Harvard Medical School exposes more than 1,000 scientific and biomedical tools, for example for drug discovery, protein design, and literature review, to any MCP-enabled agent.
```

## Choosing a tool

Before adopting an external tool, check whether Harvard or FAS already provides a vetted one, and at what data level: see the [HUIT AI Tool Comparison](https://www.huit.harvard.edu/ai/tools), [AI Tools Available to the FAS](https://atg.fas.harvard.edu/ai-at-fas), and the [HUIT AI APIs and developer tools](https://www.huit.harvard.edu/ai-developer-tools) for programmatic access. A few further considerations narrow the field:

- **Cloud or local.** Cloud services (Claude, GPT, Gemini) are often the most capable, but they send your prompts and code to an external provider. If you prefer to keep everything on the cluster, you can run an open-weight model yourself; see {doc}`HPC Agentic Recipes <local_agentic_models>`.
- **Data sensitivity.** Do not enter confidential data (Level 2 and above) into a public AI service. Harvard also provides approved tools with data-protection agreements, each cleared for a specific data level; for example, the [Harvard AI Sandbox](https://www.huit.harvard.edu/ai-sandbox) is approved for up to Level 3. Check a tool's approved data level before using it with the cluster's data, and see {doc}`Security and Compliance <../s6_security_and_compliance/README>` and Harvard's [Generative AI Guidelines](https://www.huit.harvard.edu/ai/guidelines).
- **Cost.** Cloud tools bill by usage; self-hosting uses your GPU allocation. Track both.
- **Form factor.** Both terminal and IDE tools work on the cluster: terminal agents run directly in an SSH session, and IDE or extension tools connect through VS Code Remote-SSH (see {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`). Pick whichever fits your workflow.

```{seealso}
For setup and responsible use on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. The {doc}`New User Checklist <../s1_high_performance_computing/kempner_cluster/new_user_checklist>` links FASRC's guidance on AI extensions and the Anthropic API.
```
