# Configuring Agents for Your Project

An agent becomes far more useful once it knows your project's conventions, can run your repeatable steps, and can reach your own tools and data. Four mechanisms do most of that work, and most agents offer the same four under different file names. A fifth, the guardrails at the end of this page, limits what the agent can do whatever the model decides:

```{mermaid}
flowchart LR
    A["AGENTS.md / CLAUDE.md<br/>project rules"] --> AG(["Agent"])
    S["Skills<br/>repeatable workflows"] --> AG
    M["MCP servers<br/>your tools and data"] --> AG
    G["Subagents<br/>scoped, least privilege"] --> AG
    R["Guardrails<br/>permission rules, hooks, caps"] -.->|limit| AG
    classDef cfg fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef agent fill:#A51C30,color:#ffffff,stroke:#A51C30;
    classDef guard fill:#ffffff,color:#A51C30,stroke:#A51C30;
    class A,S,M,G cfg;
    class AG agent;
    class R guard;
```

The examples below use Claude Code, but the ideas carry to other agents.

## Project instructions

Put the context you would otherwise re-explain every session into an instructions file at the repository root: build and test commands, coding conventions, and project layout. [AGENTS.md](https://agents.md) is the cross-tool standard for this, a README for agents that many tools read natively. Claude Code reads its own `CLAUDE.md`, and recent versions read `AGENTS.md` instead when a repository has no `CLAUDE.md`. If your repository has both, point `CLAUDE.md` at `AGENTS.md` with a one-line import (`@AGENTS.md`) or a symlink so both stay in sync.

Keep the file short (aim for under 200 lines) and specific: "run `uv run pytest` before committing" works better than "test your changes." Running `/init` generates a starting file from your codebase. Instructions can live at project scope, shared through version control, or at user scope (`~/.claude/`), which applies to all your projects and is not shared.

```{tip}
These files load every session and consume context tokens, so keep them lean. Move long, multi-step procedures into skills, which load only when used.
```

## Skills

A skill packages a repeatable workflow (a release checklist, a data-cleaning routine, a plotting convention) so you stop pasting the same steps into chat. In Claude Code a skill is a `SKILL.md` file under `.claude/skills/`, and the agent loads it only when it is relevant or when you invoke it by name. Because the body loads on demand, long reference material costs almost nothing until you need it. To write your own, see {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.

## Connecting tools and data with MCP

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that lets an agent reach external tools, data, and services through one interface: a database, an internal API, a file store, or a domain toolset. Point the agent at an existing server, or write one for your own tools; {doc}`Building Custom Tools and MCP Servers <building_custom_tools>` covers both. For scientific work, servers such as ToolUniverse expose many biomedical and research tools to any MCP-enabled agent; see {doc}`Agentic AI Tools <agentic_ai_tools>`.

```{warning}
An MCP server can hold credentials and reach real systems. Keep its configuration and any keys out of shared or world-readable paths, and give it only the access it needs. See the secrets guidance in {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`.
```

## Subagents

A subagent is a scoped helper the main agent delegates to; it runs in its own context and returns a summary. Two reasons to use them on shared infrastructure: they keep noisy exploration out of your main session, and they let you apply least privilege. In Claude Code a subagent is a markdown file with frontmatter under `.claude/agents/`, and its `tools` field is an allowlist, so a review or research subagent can be given read-only tools and nothing else. That is a mechanical limit the model cannot override at runtime, which also caps what a misdirected agent could do.

(agentic_ai:guardrails)=
## Guardrails

Instructions and skills shape what an agent tries to do. Guardrails limit what it can do, whatever the model decides, so they are the layer to rely on when an agent works on a shared cluster or runs unattended. Combine several: each covers gaps in the others.

(agentic_ai:permission_rules)=
### Permission rules

Permission rules sort tool calls into three lists: `allow` runs without asking, `ask` waits for your approval, and `deny` is blocked. Claude Code checks deny first, then ask, then allow, and the first match decides; a deny in any settings file wins. Rules live in `~/.claude/settings.json` (your user settings), `.claude/settings.json` (project settings, shared through version control), and `.claude/settings.local.json` (your personal project settings, kept out of version control).

For cluster work, a useful starting point lets the agent look but not act: read-only queries to SLURM and to ClusterTool, the Kempner command-line tool for cluster tasks, run freely, while anything that submits or cancels work waits for you.

```json
{
  "permissions": {
    "allow": [
      "Bash(squeue *)",
      "Bash(sacct *)",
      "Bash(sinfo *)",
      "Bash(clustertool jobs list *)",
      "Bash(clustertool jobs debug *)",
      "Bash(clustertool jobs scope *)"
    ],
    "ask": [
      "Bash(sbatch *)",
      "Bash(srun *)",
      "Bash(salloc *)",
      "Bash(scancel *)",
      "Bash(scontrol hold *)",
      "Bash(scontrol release *)",
      "Bash(scontrol requeue *)",
      "Bash(scontrol update *)",
      "Bash(clustertool jobs submit *)",
      "Bash(clustertool jobs new *)",
      "Bash(clustertool jobs cancel *)",
      "Bash(clustertool jobs hold *)",
      "Bash(clustertool jobs release *)",
      "Bash(clustertool jobs requeue *)",
      "Bash(clustertool gpu session *)",
      "Bash(clustertool diag *)"
    ]
  }
}
```

A rule such as `Bash(squeue *)` matches `squeue` with any arguments, including none. Commands on neither list follow the session's permission mode, and in auto mode a classifier decides whether they run, so put every command that should always wait for you on the `ask` list. {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>` lists which ClusterTool commands are safe to allow.

```{warning}
Permission rules match the command as written, so they are a convenience, not a security boundary. A deny rule for `rm` does not stop `/bin/rm`, `bash -c "rm ..."`, or a Python script that deletes files itself. For limits that must hold, use the sandbox with its escape hatches closed (see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`) and file permissions. A hook, described next, catches more variants than a rule, but it too sees only the command line. See the [permissions documentation](https://code.claude.com/docs/en/permissions).
```

(agentic_ai:hooks)=
### Hooks

A hook is a script that Claude Code runs before or after a tool call. A `PreToolUse` hook receives the call as JSON on standard input and can block it by exiting with code 2; the message it writes to standard error goes back to the agent. Exit code 1, or a hook that times out, does not block. A hook's block holds even when permission checks are bypassed, which makes hooks the place for rules that should apply in every permission mode.

This hook blocks the common forms of job cancellation and recursive deletion, including when they are wrapped in another command. If `jq`, which it uses to read the call, is missing, it blocks everything rather than letting calls through unchecked:

```bash
#!/bin/bash
# .claude/hooks/guard.sh: block job cancellation and recursive deletes.
# The tool call arrives as JSON on stdin; exit code 2 blocks it.
command -v jq >/dev/null || { echo "guard.sh needs jq; blocking." >&2; exit 2; }
cmd=$(jq -r '.tool_input.command // empty')
if [[ "$cmd" =~ scancel|clustertool[[:space:]]+jobs[[:space:]]+cancel ]] ||
   [[ "$cmd" =~ rm[[:space:]](.*[[:space:]])?(-[[:alpha:]]*[rR]|--recursive) ]] ||
   [[ "$cmd" =~ find[[:space:]].*-delete|git[[:space:]]+clean ]]; then
  echo "Blocked by project hook: run this yourself if you mean it." >&2
  exit 2
fi
exit 0
```

Make the script executable (`chmod +x .claude/hooks/guard.sh`) and register it in `.claude/settings.json`. The second hook appends every shell command the agent tries to run, including ones that are then blocked or fail, to a log you can review later. The matcher covers both Bash and Monitor, the tool Claude Code uses to watch a command's output in the background:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Monitor",
        "hooks": [
          {"type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard.sh"},
          {"type": "command", "command": "jq -r '.tool_input.command // empty' >> ~/.claude/command-log.txt"}
        ]
      }
    ]
  }
}
```

In a test on a compute node, this hook blocked eleven forms it targets, among them `scancel 12345`, `clustertool jobs cancel 12345`, `rm -f -r build`, `bash -c 'rm -R tmp'`, `find . -name '*.tmp' -delete`, and `git clean -fdx`, and allowed six ordinary commands such as `squeue --me` and `rm notes.txt`. A hook sees the command line, not what a script does once it runs, so it does not stop `python cleanup.py` if that script cancels jobs. It also errs toward blocking: a harmless command that mentions `scancel`, such as a search for the word, is blocked too, and you can run it yourself. Hooks also run with your full permissions, outside any sandbox, so keep them short and review them like any other code. Codex supports hooks in a similar form. See the [hooks documentation](https://code.claude.com/docs/en/hooks).

(agentic_ai:run_caps)=
### Caps on unattended runs

An agent running in print mode (`claude -p`) inside a batch job has no one watching, so set its limits before it starts:

```bash
claude -p "Read the logs in logs/ and summarize why each failed job failed." \
  --permission-mode dontAsk --tools "Read,Grep,Glob" --max-turns 20 --max-budget-usd 2.00
```

- `--permission-mode` sets how much the agent may do. Always pass it in print mode, since print mode can also start in auto mode. In print mode no one is there to approve a request, so anything that would need approval is refused; `dontAsk` makes that explicit for a locked-down run. `plan` blocks file edits, but where auto mode is available, a classifier can still approve shell commands while the agent plans.
- `--max-turns` caps the number of agentic turns, and `--max-budget-usd` stops the run at an estimated spend. Both apply to print mode only, and the budget is an estimate made on your machine, not a billing limit.
- `--tools` restricts which tools the agent can use at all, while `--allowedTools` only pre-approves tools; use `--tools` when you want a hard limit, as in the example above, where the agent can only read and search. With `--permission-mode dontAsk`, which refuses anything that would need approval, `--allowedTools` also works as an allowlist, as in the batch examples in {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
- Pass the rules for a print-mode run on the command line. In print mode, Claude Code ignores the allow rules in a project's `.claude/settings.json` unless you have trusted the folder in an interactive session, though it still runs the project's hooks.
- The SLURM `--time` limit is the final stop. When a job reaches it, SLURM signals the job, and Claude Code exits and stops the commands it started.

(agentic_ai:git_undo)=
### Git as the undo layer

Commit or stash your work and start a branch before you hand an agent a task. Its changes then show up in `git diff`, and `git restore` or `git revert` undoes them. Claude Code's checkpoints can rewind its own file edits, but they do not track files changed by shell commands, such as a script that rewrites outputs or a `sed -i`, so git is the undo you can count on. Results and data outside the repository have no undo at all: have the agent write to a new directory rather than overwrite existing outputs, and keep copies of anything it must not lose.

```{seealso}
For the tool landscape and the MCP introduction, see {doc}`Agentic AI Tools <agentic_ai_tools>`. For running agents on the cluster, permission modes, sandboxing, and handling secrets, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For guardrails applied to real cluster tasks, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
```
