# Agent Security and Scoping

An agent runs as you, so it can reach whatever your account can reach on a shared cluster. This page covers how an agent can be turned against you, who can steer it when remote control is on, and how to limit what a misdirected agent can touch. For the guardrails you set in Claude Code itself, such as permission rules and hooks, see {ref}`Guardrails <agentic_ai:guardrails>`.

(agentic_ai:agent_security)=
## Agent security

An agent acts on what it reads, and not everything it reads is trustworthy. A web page, PDF, dataset, code comment, or tool result can contain text written to look like an instruction. If the agent follows it, that is prompt injection, the most common way an agent is turned against its user.

```{mermaid}
flowchart LR
    U["Untrusted content<br/>web page, PDF,<br/>dataset, code comment"] --> R["Agent reads it"]
    R --> H{"Hidden<br/>instruction?"}
    H -->|treated as data| OK["Ignored;<br/>you stay in control"]
    H -->|followed as a command| BAD["Unintended action:<br/>exfiltration, deletion"]
    classDef n fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef good fill:#C6C8F4,color:#14154C,stroke:#14154C;
    classDef bad fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class U,R,H n;
    class OK good;
    class BAD bad;
```

Treat everything the agent reads, including tool output, as data, not commands. Then reduce the risk:

- **Keep a human on consequential actions.** Approve anything that deletes data, moves files, pushes code, or spends budget; see {ref}`Permission modes <agentic_ai:permission_modes>`.
- **Give the agent only the access it needs.** Limit subagents to read-only tools where you can; see {doc}`Configuring Agents for Your Project <configuring_agents>`.
- **Cap autonomous loops.** Bound unattended runs with `--max-turns`, `--max-budget-usd`, and a SLURM `--time`; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- **Keep secrets out of reach.** A misdirected agent can leak anything your account can read, and read-only commands such as `cat` run without a prompt even outside your project. Keep credentials out of the project, and block reads of credential files with deny rules in `~/.claude/settings.json`, for example `Read(~/.ssh/**)`, `Read(~/.netrc)` (where `wandb login` stores its key), `Read(~/.cache/huggingface/**)`, and `Read(~/.config/gh/**)`. Or turn on `permissions.blockReadsOutsideWorkingDirectories`. Both stop the agent's file tools and commands such as `cat`, but not a script that opens the file itself. With the sandbox on, the deny rules hold for scripts too; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

For risk categories and defenses, see OWASP's [Top 10 for Agentic Applications](https://genai.owasp.org/agentic-security-initiative/) and [Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/), which ranks prompt injection first.

(agentic_ai:untrusted_repositories)=
### Untrusted repositories

A repository you clone can ship project instructions, hooks in `.claude/settings.json`, MCP servers in `.mcp.json`, and skills in `.claude/skills/`, and they run as you. In print mode, Claude Code runs the hooks, starts the servers, and applies the settings' `env` block without asking, even in a folder you have never opened. Before you run an agent in a repository you did not write, read those files. With `claude -p`, add `--setting-sources user` to skip the project's settings and `.mcp.json`.

(agentic_ai:remote_control)=
### Remote control

Some agents can be steered from another device. Claude Code's [Remote Control](https://code.claude.com/docs/en/remote-control), started with `/remote-control` in a session, `claude --remote-control`, or `claude remote-control` (server mode), or for every session with a setting, connects a session on your machine to claude.ai/code or the Claude phone app. Codex has a similar feature: `codex remote-control` (experimental) and the ChatGPT app's [remote connections](https://learn.chatgpt.com/docs/remote-connections), which can also reach projects over SSH. Any device signed in to the same account can then send the agent instructions and approve its actions, and everything runs on the connected machine.

On the cluster, that machine is your cluster account. With remote control on, any device signed in to your AI account can steer the session, without the FASRC login, two-factor authentication, and VPN that normally protect the cluster. An unlocked phone or a browser left signed in becomes a way into your cluster account. Claude Code also keeps the session's transcript, including tool activity, on Anthropic's servers while it is connected. Until there is specific guidance on these features, be careful:

- **Leave it off unless you need it.** Turn it on only for the session that needs it. Do not turn on "Enable Remote Control for all sessions" (`remoteControlAtStartup`) on the cluster.
- **Stop it when you are done.** Run `/remote-control` again to disconnect, or end the session; in server mode, press Ctrl+C. For Codex, run `codex remote-control stop`.
- **Protect the account that controls it.** Sign in only on devices you control and use multi-factor authentication. Consider Claude's Trusted Devices, which requires each device to be verified before it can view or steer a session. Never let anyone else use the account.
- **Rule it out where you do not want it.** `"disableRemoteControl": true` in `~/.claude/settings.json` turns Claude Code's Remote Control off entirely.
- **Prefer the usual way in.** To check on a long run, log in to the cluster and reattach tmux, or read the batch job's logs.

If you think someone else used a session, stop it and report it as described in {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

(agentic_ai:scoping)=
## Scoping an agent to its task

Your account can reach many projects, directories, credentials, and services, but one task usually needs only a small part of them. The agent runs as your process, so a bug, bad input, or prompt injection can reach everything your account can. Ask whether the task has more access than its purpose needs, and shrink it toward the inner box.

```{mermaid}
flowchart TB
    subgraph ACCT["Account authority"]
        subgraph NEED["What the task needs"]
            AG(["Agent"])
        end
        EXCESS["Everything else the account can reach:<br/>the blast radius if the agent is misdirected"]
    end
    style ACCT fill:#C6C8F4,color:#14154C,stroke:#14154C
    style NEED fill:#14154C,color:#ffffff,stroke:#3D3E82
    classDef excess fill:#A51C30,color:#ffffff,stroke:#A51C30;
    classDef agent fill:#ffffff,color:#14154C,stroke:#14154C;
    class EXCESS excess;
    class AG agent;
```

### Prefer enforceable boundaries over prompt instructions

An instruction such as "do not read files outside this directory" guides the model, but it can fail under adversarial input. Prefer limits enforced outside the model: filesystem permissions, SLURM resource limits, tool restrictions such as `--tools` and read-only subagents, and the sandbox (see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`). {ref}`Permission rules <agentic_ai:permission_rules>` sit in between: Claude Code enforces them, but a command rule matches only the command as written, so it is not a boundary on its own. Use both layers: enforced limits set the hard boundary, and instructions guide behavior inside it.

(agentic_ai:before_an_unattended_run)=
### Before an unattended run

Answer these questions before you submit. If you cannot answer one, resolve it first.

| Question | What to check |
|---|---|
| **Task boundary** | Can you state in one or two sentences what the agent should do? |
| **Read scope** | Which files must it read, and what else can it see? |
| **Write scope** | Where may it write? Can it reach environments, checkpoints, datasets, or repositories it should not change? |
| **Credentials** | Which tokens, SSH keys, or signed-in sessions can it reach? |
| **Network** | Which external endpoints does the task need? |
| **Data policy** | Is every dataset it may read allowed here under its data-use agreement and data level? See {doc}`Security and Compliance <../s6_security_and_compliance/README>`. |
| **Untrusted input** | Could it read content that carries hidden instructions? See {ref}`Agent security <agentic_ai:agent_security>`. |
| **Resource scope** | Are CPU, memory, GPU, wall time, and concurrency bounded, and are loops capped? |
| **Evidence** | Will the job ID, code version, timestamps, and input and output paths be recorded, without secrets? |
| **Stop condition** | What should make the agent stop and return control to you? |

If an unattended agent needs data, credentials, network access, or actions outside its task, the safe default is to stop and ask for review, not to widen its own scope.

### Container filesystem visibility

A Singularity or Apptainer container does not isolate an agent from the cluster's files by default. The default configuration mounts `/n` (home, lab, and scratch space), your working directory, and `/tmp` inside the container. To restrict it, use `--contain` or `--no-mount`, and add only the paths the task needs with `--bind`. Check what your container can see rather than assume it is isolated. See {doc}`Containerization <../s1_high_performance_computing/development_and_runtime_envs/containerization>` and the [FASRC Singularity documentation](https://docs.rc.fas.harvard.edu/kb/singularity-on-the-cluster/).

(agentic_ai:agent_sandboxing)=
### Agent sandboxing

Claude Code and Codex can run an agent's shell commands in an operating-system sandbox that limits which files they can write and which hosts they can reach. The operating system enforces these limits, whatever the model decides. FASRC asks you to run agents in a sandbox or container where possible; see its [AI Agents guidance](https://docs.rc.fas.harvard.edu/kb/ai-agents/). On Linux, both use a tool called bubblewrap, and Claude Code also needs socat; both are installed on the compute nodes.

::::{tab-set}
:::{tab-item} Claude Code
Turn the sandbox on with `/sandbox`, or in a settings file such as `~/.claude/settings.json`:

```json
{
  "sandbox": {
    "enabled": true,
    "failIfUnavailable": true,
    "allowUnsandboxedCommands": false,
    "autoAllowBashIfSandboxed": false,
    "excludedCommands": [
      "squeue *", "sacct *", "sinfo *", "seff *", "sstat *", "scontrol *",
      "sbatch *", "srun *", "salloc *", "scancel *", "clustertool *"
    ]
  }
}
```

- **It covers shell commands only.** File-editing tools follow your permission rules, and hooks and MCP servers run outside the sandbox with your full access.
- **Close its escape hatches.** By default, Claude can retry a failed command outside the sandbox, and Claude Code runs without the sandbox if it cannot start. `allowUnsandboxedCommands: false` and `failIfUnavailable: true` turn both off, so only `excludedCommands` run outside.
- **Keep your approvals.** By default, sandboxed commands run without asking in every mode except plan, even manual and `dontAsk`, so a batch run's `--allowedTools` no longer limits them. `autoAllowBashIfSandboxed: false` keeps your usual approvals. In a test on the cluster under `dontAsk`, a sandboxed `touch` ran with auto-allow on and was refused with it off.
- **Run SLURM commands outside it.** The sandbox cuts commands off from the SLURM controller. In a test on the cluster, `sinfo` inside the sandbox waited almost two minutes, then failed with `Unable to contact slurm controller (connect failure)`; excluded, it answered at once. `sbatch`, `srun`, and `salloc` then run what they launch outside the sandbox too, so keep them on the `ask` list in {ref}`Permission rules <agentic_ai:permission_rules>`. `clustertool` in the list is [ClusterTool](https://github.com/KempnerInstitute/clustertool), the Kempner command-line tool for cluster tasks.
- **Allow what your work needs.** Sandboxed commands can write only to the working directory and a temporary directory, and reach other hosts only if you allow them, so `uv sync`, `pip install`, model downloads, and W&B online logging fail inside it. Add the paths and hosts they need with `filesystem.allowWrite` and `network.allowedDomains` in the sandbox settings, rather than excluding the tools.
- **Keep your deny rules.** Sandboxed commands can read most of the machine, including `~/.ssh`, but not the paths your `Read` deny rules cover; see {ref}`Agent security <agentic_ai:agent_security>`. In a test on the cluster, a script that opened a denied file printed it without the sandbox and failed with `FileNotFoundError` inside it.
- **Keep SLURM calls simple.** A call leaves the sandbox only if every command in it is excluded, and a redirect, a `cd`, or a `$(...)` keeps it inside. So `squeue --me | grep RUNNING` stays sandboxed and fails. Add to your project instructions: "Run SLURM and ClusterTool commands on their own, without pipes, redirects, `cd`, or `$(...)`."

See the [Claude Code sandboxing documentation](https://code.claude.com/docs/en/sandboxing).
:::
:::{tab-item} Codex
`codex exec` starts in a read-only sandbox, and `--sandbox workspace-write` allows edits in the working directory with network access off. In a test on the cluster, both held, and `sinfo` inside Codex's sandbox failed the same way after almost two minutes. Run SLURM commands yourself rather than through Codex's sandbox.

See the Codex [sandboxing documentation](https://learn.chatgpt.com/docs/sandboxing).
:::
::::

```{seealso}
For setting up and running agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For permission rules, hooks, and caps on unattended runs, see {doc}`Configuring Agents for Your Project <configuring_agents>`. For the university and FASRC rules behind this page, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```
