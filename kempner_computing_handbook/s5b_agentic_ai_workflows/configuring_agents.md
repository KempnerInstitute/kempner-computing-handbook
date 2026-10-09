# Configuring Agents for Your Project

An agent is far more useful once it knows your project's conventions, can repeat your routine steps, and can reach your own tools and data. Four mechanisms do most of that work, and most agents offer all four under different names. A fifth, the guardrails, limits what the agent can do, whatever the model decides.

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

The examples use Claude Code, but the ideas carry to other agents.

## Project instructions

Put what you would otherwise explain every session into an instructions file at the repository root: build and test commands, conventions, and layout. [AGENTS.md](https://agents.md) is the cross-tool standard; in a test on the cluster, Codex followed an instruction in `AGENTS.md` with no setup. Claude Code reads `CLAUDE.md`, and recent versions read `AGENTS.md` when a repository has no `CLAUDE.md`. If your repository has both, add the line `@AGENTS.md` to `CLAUDE.md`, or make `CLAUDE.md` a symlink, so both stay in sync.

Keep the file short (under 200 lines) and specific: "run `uv run pytest` before committing" works better than "test your changes." `/init` writes a first version from your code. A project-level file is shared through version control; a user-level file in `~/.claude/` applies to all your projects.

```{tip}
Instruction files load every session and use context, so keep them lean. Move long procedures into skills, which load only when needed.
```

## Skills

A skill packages a repeatable workflow, such as a release checklist or a data-cleaning routine, so you stop pasting the same steps into chat. In Claude Code, a skill is a `SKILL.md` file in its own folder under `.claude/skills/`. The agent loads it when a task needs it or when you call it by name, so long reference material costs almost nothing until you use it. To write one, see {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.

## Connecting tools and data with MCP

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard that connects an agent to external tools, data, and services, such as a database, an internal API, or a domain toolset. You can use an existing server or write your own; {doc}`Building Custom Tools and MCP Servers <building_custom_tools>` covers both. For science, servers such as ToolUniverse expose many research tools; see {doc}`Agentic AI Tools <agentic_ai_tools>`.

```{warning}
An MCP server can hold credentials and reach real systems. Keep its configuration and keys out of shared or world-readable paths, and give it only the access it needs. See the secrets guidance in {ref}`Agent security <agentic_ai:agent_security>`.
```

## Subagents

A subagent is a helper the main agent hands a task to. It works in its own context and returns a summary, which keeps noisy exploration out of your main session. In Claude Code, a subagent is a markdown file under `.claude/agents/`, and its `tools` field is an allowlist. A review subagent can get read-only tools and nothing else, a limit the model cannot override.

(agentic_ai:guardrails)=
## Guardrails

Instructions and skills shape what an agent tries to do. Guardrails limit what it can do, whatever the model decides, so rely on them on a shared cluster and in unattended runs. Combine several, because each covers gaps in the others.

(agentic_ai:permission_rules)=
### Permission rules

Permission rules sort tool calls into three lists: `allow` runs without asking, `ask` waits for your approval, and `deny` is blocked. Claude Code checks deny, then ask, then allow, and the first match decides. Rules live in `~/.claude/settings.json` (your user settings), `.claude/settings.json` (shared project settings), and `.claude/settings.local.json` (your personal project settings).

A good start for cluster work lets the agent look but not act. Read-only queries to SLURM and to [ClusterTool](https://github.com/KempnerInstitute/clustertool), the Kempner command-line tool for cluster tasks, run freely. Anything that submits, changes, or cancels work waits for you, and the agent cannot read your SSH keys or stored tokens:

```json
{
  "permissions": {
    "allow": [
      "Bash(squeue *)", "Bash(sacct *)", "Bash(sinfo *)",
      "Bash(clustertool jobs list *)", "Bash(clustertool jobs debug *)", "Bash(clustertool jobs scope *)"
    ],
    "ask": [
      "Bash(sbatch *)", "Bash(srun *)", "Bash(salloc *)", "Bash(scancel *)",
      "Bash(scontrol hold *)", "Bash(scontrol uhold *)", "Bash(scontrol release *)",
      "Bash(scontrol requeue *)", "Bash(scontrol requeuehold *)", "Bash(scontrol top *)",
      "Bash(scontrol update *)", "Bash(scrontab *)",
      "Bash(clustertool jobs submit *)", "Bash(clustertool jobs new *)", "Bash(clustertool jobs cancel *)",
      "Bash(clustertool jobs hold *)", "Bash(clustertool jobs release *)", "Bash(clustertool jobs requeue *)",
      "Bash(clustertool gpu session *)", "Bash(clustertool diag nccl *)",
      "Bash(clustertool diag nvlink *)", "Bash(clustertool diag io-probe *)"
    ],
    "deny": [
      "Read(~/.ssh/**)", "Read(~/.netrc)", "Read(~/.cache/huggingface/**)", "Read(~/.config/gh/**)"
    ]
  }
}
```

`Bash(squeue *)` matches `squeue` with any arguments, or none. Commands on neither list follow the permission mode, and in auto mode a classifier decides, so put every command that must wait for you on the `ask` list. {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>` lists which ClusterTool commands are safe to allow; its administrator commands fail without administrator rights.

```{warning}
Rules match the command as written, so they are a convenience, not a security boundary. A deny rule for `rm` does not stop `/bin/rm`, `bash -c "rm ..."`, or a Python script that deletes files. For limits that must hold, use file permissions and the sandbox with its escape hatches closed (see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`). A hook catches more variants than a rule, but it also sees only the command line. See the [permissions documentation](https://code.claude.com/docs/en/permissions).
```

(agentic_ai:hooks)=
### Hooks

A hook is a script that Claude Code runs before or after a tool call. A `PreToolUse` hook receives the call as JSON and blocks it by exiting with code 2; its message to standard error goes back to the agent. Exit code 1, or a timeout, does not block. A hook's block holds even when permission checks are bypassed, so use hooks for rules that must apply in every mode.

This hook blocks common forms of job cancellation and recursive deletion, and deletion through `find` and `xargs`, even inside another command. If `jq` is missing, it blocks everything rather than let calls through unchecked. Save the script, make it executable (`chmod +x .claude/hooks/guard.sh`), and register it in `.claude/settings.json`:

::::{tab-set}
:::{tab-item} .claude/hooks/guard.sh
```bash
#!/bin/bash
# .claude/hooks/guard.sh: block job cancellation and recursive deletes.
# The tool call arrives as JSON on stdin; exit code 2 blocks it.
command -v jq >/dev/null || { echo "guard.sh needs jq; blocking." >&2; exit 2; }
cmd=$(jq -r '.tool_input.command // empty')
if [[ "$cmd" =~ scancel|clustertool[[:space:]]+jobs[[:space:]]+cancel ]] ||
   [[ "$cmd" =~ rm[[:space:]](.*[[:space:]])?(-[[:alpha:]]*[rR]|--r) ]] ||
   [[ "$cmd" =~ find[[:space:]].*(-delete|-exec(dir)?[[:space:]]+rm)|xargs[[:space:]](.*[[:space:]])?rm([[:space:]]|$) ]] ||
   [[ "$cmd" =~ git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?clean ]]; then
  echo "Blocked by project hook: run this yourself if you mean it." >&2
  exit 2
fi
exit 0
```
:::
:::{tab-item} .claude/settings.json
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

The second hook appends every command the agent tries, including blocked and failed ones, to a log. The log holds whole command lines, including any password or API key typed into one, so keep it private. The matcher covers Bash and Monitor, the tool Claude Code uses to watch a command's output.
:::
::::

In a test on a compute node, this hook blocked each of the 16 targeted commands tried, among them `scancel 12345`, `clustertool jobs cancel 12345`, `rm -f -r build`, `bash -c 'rm -R tmp'`, `find . -name '*.tmp' | xargs rm`, and `git -C . clean -fdx`. It allowed 9 ordinary commands such as `squeue --me`, `rm notes.txt`, and `git commit -m "clean up docs"`. In a live Claude Code session, it also blocked `scancel` and `rm -rf` that the permission rules allowed, and the log recorded both attempts.

Know its limits. A hook sees the command line, not what a script does, so it does not stop `python cleanup.py` if that script cancels jobs. It does not catch every form, such as `rm *.pt` or `rsync --delete`. It also errs toward blocking: a search for the word `scancel`, or an option such as `--norm -r` that contains `rm -r`, is blocked too; run such commands yourself. Hooks run with your full permissions, outside any sandbox, so keep them short and review them like code. Codex has hooks too. See the [hooks documentation](https://code.claude.com/docs/en/hooks).

(agentic_ai:run_caps)=
### Caps on unattended runs

A print-mode run (`claude -p`) in a batch job has no one watching, so set its limits before it starts:

```bash
claude -p "Read the logs in logs/ and summarize why each failed job failed." \
  --permission-mode dontAsk --tools "Read,Grep,Glob" --max-turns 20 --max-budget-usd 2.00
```

- **`--permission-mode`.** Always pass it, because print mode can also start in auto mode. With no one to answer, a request that needs approval is refused, except in auto mode, where the classifier decides. Use `dontAsk` when refusal must be certain; `plan` blocks file edits but not every command.
- **`--max-turns` and `--max-budget-usd`.** They cap the agentic turns and the estimated spend. Both apply to print mode only, and the budget is an estimate, not a billing limit.
- **`--tools` and `--allowedTools`.** `--tools` limits which built-in tools exist at all; in the example, the agent can only read and search. `--allowedTools` only pre-approves tools, but with `dontAsk` it works as an allowlist, as in {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`. `--tools` does not cover MCP tools, which include your claude.ai connectors when you sign in with a Claude account. With `dontAsk`, MCP tools you have not allowed are refused; add `--disallowedTools "mcp__*"` to remove them from the agent's view as well.
- **Sandbox auto-allow.** With the agent sandbox's default settings, sandboxed commands run even with `dontAsk`; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.
- **Rules on the command line.** In print mode, Claude Code ignores a project's allow rules unless you have trusted the folder interactively, and prints a warning saying how many it ignored. It still runs the project's hooks.
- **The SLURM `--time` limit.** It is the final stop: at the limit, SLURM signals the job, and Claude Code exits and stops the commands it started.

(agentic_ai:git_undo)=
### Git as the undo layer

Commit or stash your work and start a branch before you give an agent a task. Its changes then show in `git diff`, and `git restore` or `git revert` undoes them. Claude Code's checkpoints rewind its own edits but not files changed by shell commands, such as a `sed -i`, so git is the undo you can count on. Files outside the repository have no undo: have the agent write to a new directory, and keep copies of anything it must not lose.

```{seealso}
For the tool landscape, see {doc}`Agentic AI Tools <agentic_ai_tools>`. For permission modes, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`; for sandboxing and secrets, see {doc}`Agent Security and Scoping <agent_security_and_scoping>`. For these guardrails on real cluster tasks, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.
```
