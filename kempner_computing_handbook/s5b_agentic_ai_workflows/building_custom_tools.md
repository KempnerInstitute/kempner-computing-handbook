# Building Custom Tools and MCP Servers

This page shows how to write your own tools: a skill for a procedure you repeat, and a small MCP server that gives an agent safe access to your data and cluster tools. Start with the simplest option that does the job.

## Choose the right kind of tool

| You want to | Use | Why |
|---|---|---|
| Reuse a written procedure, such as a checklist or a data-cleaning routine | A skill | Instructions and optional scripts, loaded only when needed |
| Let the agent run a command-line tool you already have | The tool and a permission rule | Nothing to build; the rule decides whether it runs without asking |
| Give the agent structured access to data or a service, with limits in your own code | An MCP server | Typed tools with input checks, usable from any agent that supports MCP |

## Write a skill

A skill is a folder with a `SKILL.md` file: `.claude/skills/<name>/` in a project, or `~/.claude/skills/<name>/` for your own use. Give it a `description` in the frontmatter, because the agent uses it to decide when the skill applies. The skill's name defaults to the folder's name.

This skill, saved as `.claude/skills/check-job/SKILL.md`, captures the lessons from {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`:

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

The agent loads the skill when a request matches its description, or when you type `/check-job`. In a test on the cluster, `claude -p "/check-job 51161725"` followed all four steps and, as the skill says, trusted the job's log over its misleading memory record. To share skills, subagents, hooks, and MCP servers as one package, use a plugin; [KempnerForge](https://github.com/KempnerInstitute/KempnerForge) ships one, described in {doc}`Working with Unfamiliar Research Codebases <unfamiliar_codebases>`. See the [skills documentation](https://code.claude.com/docs/en/skills).

## Build a read-only MCP server

An MCP server is a small program that offers the agent a set of tools with defined inputs and outputs. You write the code, so you decide exactly what the agent can do through it. This server, saved as `tools/slurm_readonly_server.py`, lets an agent look up your SLURM jobs and nothing more:

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

Install the Python SDK with `uv add "mcp[cli]"` or `pip install "mcp[cli]"`. With no arguments, `mcp.run()` talks to the agent over standard input and output. In a test on the cluster with version 2.3.0 of the SDK, the server listed its two tools, returned a finished job's accounting record, and rejected the input `1; rm -rf ~`.

```{note}
Version 2 of the MCP Python SDK renamed `FastMCP` to `MCPServer`, so older examples that import from `mcp.server.fastmcp` fail with `ModuleNotFoundError`. The separate `fastmcp` package from Prefect still has its own `FastMCP` class. See the SDK's [migration guide](https://py.sdk.modelcontextprotocol.io/migration/).
```

Keep these five rules in any server you write:

- **Expose only what the task needs.** These tools only read. Keep actions that change things behind your own approval.
- **Check every input.** The job ID must match a strict pattern before it reaches a command.
- **Run commands without a shell, with a timeout.** Arguments go in a list, so input cannot become shell syntax, and a hung command cannot hang the agent.
- **Return summaries, not dumps.** Tool output fills the agent's context. Claude Code warns above 10,000 tokens and limits output to 25,000 by default.
- **Keep standard output for the protocol.** Anything else printed to standard output breaks the connection, so send logs to standard error.

### Connect it to Claude Code

Register the server from your project directory. The `--` separates Claude Code's options from the server's command:

```bash
claude mcp add --scope project slurm-readonly -- .venv/bin/python tools/slurm_readonly_server.py
```

`--scope project` saves the server in `.mcp.json` at the project root, which you can commit for your labmates. The default scope, `local`, keeps it to you, and `user` makes it available in all your projects. The paths are relative, so start Claude Code from the project root.

:::{dropdown} The .mcp.json file this writes
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
:::

In a test on the cluster, `claude mcp add` wrote exactly this file, and an agent in print mode then looked up a job through `job_summary`.

- **Approval.** In an interactive session, Claude Code asks each person to approve a project's servers before first use. `/mcp` shows each server's status and tools.
- **Permission rules.** The tools are named after the server, such as `mcp__slurm-readonly__job_summary`, and a rule for `mcp__slurm-readonly` covers all of them.
- **A first check.** Ask the agent to call each tool once, and compare its answers with running `squeue --me` and `sacct` yourself.

See the [Claude Code MCP documentation](https://code.claude.com/docs/en/mcp) and the MCP guide to [building a server](https://modelcontextprotocol.io/docs/develop/build-server).

## Keep custom tools safe

- **They run with your permissions.** MCP servers run outside the agent sandbox, with your full access, so the limits in your server code are the limits that hold; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.
- **Their output goes to the model.** What a tool returns enters the agent's context and, with a cloud model, the provider. Keep secrets and restricted data out of tool output; see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
- **Review third-party servers like code.** A server from someone else can read what you can read. Check what it does, pin its version, and prefer servers that ask for less access.
- **Review shared configuration.** A `.mcp.json` or skill in a repository runs for everyone who uses it with an agent, so review changes to them like code.

```{seealso}
For the guardrails these tools work alongside, see {ref}`Guardrails <agentic_ai:guardrails>`. For existing MCP servers for science, see {doc}`Agentic AI Tools <agentic_ai_tools>`.
```
