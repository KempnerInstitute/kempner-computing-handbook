# Building Custom Tools and MCP Servers

{doc}`Configuring Agents for Your Project <configuring_agents>` introduces skills and the Model Context Protocol (MCP). This page is about writing your own: packaging a procedure you repeat as a skill, and giving an agent safe, structured access to your own data and cluster tools through a small MCP server. Start with the simplest option that does the job.

## Choose the right kind of tool

| You want to | Use | Why |
|---|---|---|
| Reuse a written procedure, such as a checklist, a plotting convention, or a data-cleaning routine | A skill | Instructions plus optional scripts, loaded only when a task needs them |
| Let the agent run a command-line tool you already have | The tool itself, plus a permission rule | Nothing to build; the rule decides whether it runs without asking |
| Give the agent structured access to a data source or service, with the boundary in code you control | An MCP server | Typed tools with input checks, usable from any agent that supports MCP |

## Write a skill

A skill is a folder with a `SKILL.md` file: under `.claude/skills/<name>/` in a project, shared through version control, or under `~/.claude/skills/<name>/` for your own use. The frontmatter is optional, but give it a `description`, since that is how the agent decides when the skill applies. The skill's name defaults to its folder's name.

This skill, saved as `.claude/skills/check-job/SKILL.md`, captures the lessons from {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`, so every check of a finished job follows them:

```markdown
---
description: Check a finished SLURM job. Use when asked why a job failed or how efficiently it ran.
---

# Check a finished job

1. Run `clustertool jobs debug <job_id>` and report the state, elapsed time, and diagnosis.
2. Read the end of the job's output file for the actual error. Do not rely on the recorded
   peak memory for a job that ran out of memory; the log is definitive.
3. If the job completed, run `clustertool jobs scope <job_id> --diagnose` and report GPU
   activity. For jobs shorter than a few minutes, say that these numbers are unreliable.
4. Propose a fix to the batch script. Do not submit or cancel anything.
```

The agent loads the skill when a request matches its description, or you can call it by name with `/check-job`. To share skills, subagents, hooks, and MCP servers as one package, bundle them in a plugin; KempnerForge ships one, described in {doc}`Working with Unfamiliar Research Codebases <unfamiliar_codebases>`. See the [skills documentation](https://code.claude.com/docs/en/skills).

## Build a read-only MCP server

An MCP server is a small program that offers the agent a set of tools, each with defined inputs and outputs. Because you write the code, you decide exactly what the agent can and cannot do through it. This server, saved as `tools/slurm_readonly_server.py`, lets an agent look up your SLURM jobs and nothing more:

```python
"""A small MCP server that lets an agent look up your SLURM jobs, read-only.

Its tools only read: they list or describe jobs and never submit, change, or
cancel anything. Commands run without a shell, and job IDs are checked before
use, so text from the agent cannot turn into extra commands.
"""
import re
import subprocess

from mcp.server import MCPServer

mcp = MCPServer("slurm-readonly")


def _run(args: list[str]) -> str:
    """Run a command (no shell) and return its output, or its error message."""
    result = subprocess.run(args, stdin=subprocess.DEVNULL, capture_output=True,
                            text=True, timeout=60)
    if result.returncode != 0:
        return f"error: {result.stderr.strip()}"
    return result.stdout


@mcp.tool()
def my_jobs() -> str:
    """List your queued and running SLURM jobs."""
    return _run(["squeue", "--me", "--format=%.12i %.20j %.12P %.9T %.10M %R"])


@mcp.tool()
def job_summary(job_id: str) -> str:
    """Show the state, run time, peak memory, and exit code of one job."""
    if not re.fullmatch(r"\d+(_\d+)?", job_id):
        return "error: job_id must look like 12345678 or 12345678_3"
    return _run(["sacct", "-j", job_id, "--parsable2",
                 "--format=JobID,JobName,State,Elapsed,MaxRSS,ExitCode"])


if __name__ == "__main__":
    mcp.run()
```

Install the official Python SDK with `uv add "mcp[cli]"` (or `pip install "mcp[cli]"`). With no arguments, `mcp.run()` talks to the agent over standard input and output. In a test on the cluster with version 2.3.0 of the SDK, this server listed its two tools, returned the accounting record of a finished job, and rejected the input `1; rm -rf ~` with its error message.

```{note}
Version 2 of the MCP Python SDK renamed the `FastMCP` class to `MCPServer`. Older examples that import from `mcp.server.fastmcp` now fail with `ModuleNotFoundError`. The separate `fastmcp` package from Prefect still provides a `FastMCP` class of its own. See the SDK's [migration guide](https://py.sdk.modelcontextprotocol.io/migration/).
```

The example follows five rules worth keeping in any server you write:

- **Expose only what the task needs.** These tools read; none submits, cancels, or deletes. Put actions that change things behind your own approval instead.
- **Check every input.** The job ID must match a strict pattern before it reaches a command.
- **Run commands without a shell, with a timeout.** Arguments go in a list, so input cannot be interpreted as shell syntax, and a hung command cannot hang the agent.
- **Return summaries, not dumps.** Everything a tool returns fills the agent's context. Claude Code warns when a tool's output passes 10,000 tokens and, by default, limits it to 25,000, so return the rows and fields the task needs.
- **Keep standard output for the protocol.** In a server that talks over standard input and output, printing anything else to standard output breaks the connection. Send logs to standard error.

### Connect it to Claude Code

Register the server from your project directory. The `--` separates Claude Code's options from the command that starts the server:

```bash
claude mcp add --scope project slurm-readonly -- .venv/bin/python tools/slurm_readonly_server.py
```

`--scope project` records the server in `.mcp.json` at the project root, which you can commit so labmates get the same tool; the default scope, `local`, keeps it to you, and `user` makes it available in all your projects. The project file looks like this; its paths are relative, so start Claude Code from the project root:

```json
{
  "mcpServers": {
    "slurm-readonly": {
      "type": "stdio",
      "command": ".venv/bin/python",
      "args": ["tools/slurm_readonly_server.py"],
      "env": {}
    }
  }
}
```

In an interactive session, Claude Code asks each person to approve a project's servers before it first uses them, and `/mcp` shows whether each server is connected and which tools it offers. The tools then go through the same permission checks as any other tool, under names that combine the server and the tool, such as `mcp__slurm-readonly__job_summary`; a rule for `mcp__slurm-readonly` covers every tool from the server. Before you rely on a new server, ask the agent to call each tool once, and compare its answers with running `squeue --me` and `sacct` yourself. See the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) and the MCP guide to [building a server](https://modelcontextprotocol.io/docs/develop/build-server).

## Keep custom tools safe

- **They run with your permissions.** MCP servers run outside the agent sandbox, with your full access to files, jobs, and the network, so the limits you write into the server are the limits that hold; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.
- **Their output goes to the model.** Whatever a tool returns enters the agent's context and, with a cloud model, the provider. Keep secrets, credentials, and data above the level your tool is approved for out of tool output; see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
- **Review third-party servers like any other code.** A server you install from someone else can read what you can read. Check what it does, pin its version, and prefer servers that ask for the least access.
- **Review shared configuration.** A `.mcp.json` or skill committed to a repository runs for everyone who uses that repository with an agent, so review changes to them as carefully as code changes.

```{seealso}
For the built-in guardrails these tools work alongside, see {ref}`Guardrails <agentic_ai:guardrails>`. For the wider tool landscape, including existing MCP servers for science, see {doc}`Agentic AI Tools <agentic_ai_tools>`.
```
