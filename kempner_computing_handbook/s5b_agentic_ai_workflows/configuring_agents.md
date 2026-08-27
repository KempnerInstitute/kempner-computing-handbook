# Configuring Agents for Your Project

An agent becomes far more useful once it knows your project's conventions, can run your repeatable steps, and can reach your own tools and data. Four mechanisms do most of that work, and modern agents wire them up the same way:

```{mermaid}
flowchart LR
    A["AGENTS.md / CLAUDE.md<br/>project rules"] --> AG(["Agent"])
    S["Skills<br/>repeatable workflows"] --> AG
    M["MCP servers<br/>your tools and data"] --> AG
    G["Subagents<br/>scoped, least privilege"] --> AG
    classDef cfg fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef agent fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class A,S,M,G cfg;
    class AG agent;
```

The examples below use Claude Code, but the ideas carry to other agents.

## Project instructions

Put the context you would otherwise re-explain every session into an instructions file at the repository root: build and test commands, coding conventions, and project layout. [AGENTS.md](https://agents.md) is the cross-tool standard for this, a README for agents that many tools read natively. Claude Code reads its own `CLAUDE.md`; if your repository already has an `AGENTS.md`, point `CLAUDE.md` at it with a one-line import (`@AGENTS.md`) or a symlink so both stay in sync.

Keep the file short (aim for under 200 lines) and specific: "run `uv run pytest` before committing" works better than "test your changes." Running `/init` generates a starting file from your codebase. Instructions can live at project scope, shared through version control, or user scope (`~/.claude/`), which stays on your machine.

```{tip}
These files load every session and consume context tokens, so keep them lean. Move long, multi-step procedures into skills, which load only when used.
```

## Skills

A skill packages a repeatable workflow (a release checklist, a data-cleaning routine, a plotting convention) so you stop pasting the same steps into chat. In Claude Code a skill is a `SKILL.md` file under `.claude/skills/`, and the agent loads it only when it is relevant or when you invoke it by name. Because the body loads on demand, long reference material costs almost nothing until you need it.

## Connecting tools and data with MCP

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that lets an agent reach external tools, data, and services through one interface: a database, an internal API, a file store, or a domain toolset. Point the agent at an existing server, or write one for your own tools. For scientific work, servers such as ToolUniverse expose many biomedical and research tools to any MCP-enabled agent; see {doc}`Agentic AI Tools <agentic_ai_tools>`.

```{warning}
An MCP server can hold credentials and reach real systems. Keep its configuration and any keys out of shared or world-readable paths, and give it only the access it needs. See the secrets guidance in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.
```

## Subagents

A subagent is a scoped helper the main agent delegates to; it runs in its own context and returns a summary. Two reasons to use them on shared infrastructure: they keep noisy exploration out of your main session, and they let you apply least privilege. In Claude Code a subagent is a markdown file with frontmatter under `.claude/agents/`, and its `tools` field is an allowlist, so a review or research subagent can be given read-only tools and nothing else. That is a mechanical limit the model cannot override at runtime, which also caps what a misdirected agent could do.

```{seealso}
For the tool landscape and the MCP introduction, see {doc}`Agentic AI Tools <agentic_ai_tools>`. For running agents on the cluster, permission modes, and handling secrets, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.
```
