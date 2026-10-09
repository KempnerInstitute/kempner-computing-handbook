# Agentic AI Tools

Agentic tools read code, write and run it, call other tools, check the results, and repeat until a task is done. They differ in how much autonomy they take, from suggesting an edit you approve to running a whole task on their own. This page lists widely used tools for research; to run them on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.

```{note}
This area moves fast, and the lists are representative, not complete. Check a tool's current status and pricing before you adopt it. To suggest a tool or a change, open an issue in the [computing handbook GitHub repository](https://github.com/KempnerInstitute/kempner-computing-handbook/issues).
```

## Coding assistants and agents

The most common agentic tools write and edit code across a whole project. Most run as a terminal command, a VS Code extension, or both.

| Tool | What it is |
|------|-----------|
| [Claude Code](https://www.anthropic.com/claude-code) | Anthropic's coding agent, as a CLI and a VS Code extension |
| [OpenAI Codex](https://github.com/openai/codex) | OpenAI's coding agent, as a CLI and an IDE extension |
| [Gemini CLI](https://github.com/google-gemini/gemini-cli) | Google's coding agent, as a CLI and a VS Code extension |
| [GitHub Copilot](https://github.com/features/copilot) | GitHub's assistant with an agent mode, as an editor extension |
| [Cline](https://cline.bot) | Open-source autonomous coding agent for VS Code |
| [Aider](https://aider.chat) | Git-aware pair-programming agent in the terminal |
| [opencode](https://opencode.ai) | Open-source terminal coding agent that works with many model providers, including your own endpoint |
| [Goose](https://github.com/aaif-goose/goose) | Open-source agent, as a CLI and a desktop app, now part of the Agentic AI Foundation at the Linux Foundation |
| [Qwen Code](https://github.com/QwenLM/qwen-code) | Open-source terminal agent, originally based on Gemini CLI, for Qwen and other models through OpenAI, Anthropic, and Gemini APIs |

Other tools are self-contained rather than add-ons to your editor:

| Tool | What it is |
|------|-----------|
| [Cursor](https://cursor.com) | AI-native code editor with a project-wide agent mode |
| [Devin Desktop](https://devin.ai/desktop) | AI editor and agent platform from Cognition (formerly Windsurf) |
| [OpenHands](https://github.com/All-Hands-AI/OpenHands) | Open-source platform for autonomous software-engineering agents |

**Cloud coding agents** run in the provider's cloud rather than on your machine. You give one a task on a GitHub repository; it works in a temporary cloud environment and opens a pull request for you to review.

| Tool | What it is |
|------|-----------|
| [Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web) | Claude Code sessions on Anthropic-managed infrastructure, started from claude.ai/code or with `claude --cloud` |
| [OpenAI Codex cloud](https://learn.chatgpt.com/docs/cloud) | Codex working through coding tasks in the cloud, then committing or opening a pull request |
| [GitHub Copilot cloud agent](https://docs.github.com/en/copilot/concepts/copilot-surfaces/copilot-on-github) | Copilot researching a repository, planning, and implementing changes in an ephemeral cloud environment |
| [Jules](https://jules.google/docs/) | Google's experimental coding agent, which works in a cloud virtual machine and opens a pull request |

Claude Code can also run inside [GitHub Actions](https://code.claude.com/docs/en/github-actions), responding when someone mentions `@claude` in an issue or pull request.

```{warning}
A cloud coding agent copies your repository to the provider's infrastructure, so the code, and any data or secrets committed to it, leave Harvard. Use these agents only on repositories whose contents are cleared for that service, keep data and credentials out of the repository, and review each pull request as you would an outside contribution. See {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```

## Research and science agents

Beyond coding, agentic tools can take on parts of the research process: searching the literature and running experiments.

**Scientific literature:**

| Tool | What it is |
|------|-----------|
| [Edison Scientific](https://edisonscientific.com) | Web and API platform of science agents for literature search and analysis, spun out of the nonprofit FutureHouse lab; FutureHouse's PaperQA2 library is open source |
| [Elicit](https://elicit.com) | Research assistant for finding, screening, and summarizing papers |
| [Consensus](https://consensus.app) | Search engine that synthesizes findings across the research literature |
| [Ai2 Asta](https://asta.allen.ai) | Research assistant from the Allen Institute for AI for finding papers, summarizing literature, and analyzing data |
| [Semantic Scholar](https://www.semanticscholar.org) | Free academic search engine from the Allen Institute for AI, covering more than 200 million papers |

**Autonomous and domain-specific:**

| Tool | What it is |
|------|-----------|
| [Claude Science](https://www.anthropic.com/news/claude-science-ai-workbench) | Anthropic's multi-agent workbench for scientific research, with curated skills for genomics, proteomics, structural biology, and cheminformatics |
| [Google AI co-scientist](https://research.google/blog/accelerating-scientific-breakthroughs-with-an-ai-co-scientist/) | Google's multi-agent system for generating and refining research hypotheses |
| [Biomni](https://biomni.stanford.edu) | Biomedical research agent (Stanford) with a large toolset and connected databases |
| [Sakana AI Scientist](https://github.com/SakanaAI/AI-Scientist) | Publicly available framework that generates ideas, runs experiments, and drafts papers end to end |

General assistants also offer a **deep research** mode that plans, searches the web, and returns a cited report, for example [OpenAI Deep Research](https://openai.com/index/introducing-deep-research/), [Gemini Deep Research](https://gemini.google/overview/deep-research/), [Claude Research](https://support.claude.com/en/articles/11088861-use-research-on-claude), and [Perplexity](https://www.perplexity.ai). For a workflow that keeps every citation checkable, see {doc}`Literature Review and Data Exploration <literature_review_and_data_exploration>`.

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

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that connects agents to external tools, data, and services, such as files, databases, or APIs. Most of the tools above are MCP clients, so a server you write or install works with all of them; see {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.

```{seealso}
For scientific work, [ToolUniverse](https://zitniklab.hms.harvard.edu/ToolUniverse/) from the Zitnik Lab at Harvard Medical School exposes more than 1,000 scientific and biomedical tools, spanning drug discovery, protein design, and literature review, to any MCP-enabled agent.
```

## Choosing a tool

Before you adopt an external tool, check whether Harvard or FAS already provides a vetted one, and at what data level: see the [HUIT AI Tool Comparison](https://www.huit.harvard.edu/ai/tools), [AI Tools Available to the FAS](https://atg.fas.harvard.edu/ai-at-fas), and the [HUIT AI APIs and developer tools](https://www.huit.harvard.edu/ai-developer-tools). Then consider:

- **Cloud or local.** Cloud models (Claude, GPT, Gemini) are often the most capable, but they send your prompts and code to an external provider. To keep everything on the cluster, serve an open-weight model yourself; see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`. Open-source agents such as opencode, Goose, Qwen Code, Cline, and Aider can connect to any OpenAI-compatible endpoint, including one on the cluster.
- **Data sensitivity.** Do not enter confidential data (Level 2 and above) into a public AI service. Harvard's approved tools have data-protection agreements, each for a specific data level; for example, the [Harvard AI Sandbox](https://www.huit.harvard.edu/ai-sandbox) is approved up to Level 3. Check a tool's approved level before you use it with the cluster's data; on the cluster, the rule in {ref}`Before you start <agentic_ai:before_you_start>` also applies. See {doc}`Security and Compliance <../s6_security_and_compliance/README>` and Harvard's [Generative AI Guidelines](https://www.huit.harvard.edu/ai/guidelines).
- **Cost.** Cloud tools bill by usage; self-hosting uses your GPU allocation. Track both.
- **Form factor.** Terminal agents run in an SSH session, and IDE extensions connect through VS Code Remote-SSH (see {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`). Both work on the cluster.

```{seealso}
For setup and responsible use on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. FASRC also documents [AI extensions on its clusters](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/) and [using the Anthropic API](https://docs.rc.fas.harvard.edu/kb/anthropic/).
```
