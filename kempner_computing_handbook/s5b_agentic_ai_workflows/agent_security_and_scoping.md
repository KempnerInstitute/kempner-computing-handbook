# Agent Security and Scoping

An agent runs as you, so it can reach whatever your account can reach on a shared cluster. This page covers how an agent can be turned against you, who can steer it when remote control is on, and how to shrink what a misdirected agent can touch. For the guardrails you set in Claude Code itself, such as permission rules and hooks, see {ref}`Guardrails <agentic_ai:guardrails>`.

(agentic_ai:agent_security)=
## Agent security

An agent acts on the content it reads, and not all of that content is trustworthy. A web page, PDF, dataset, code comment, or tool result can carry text written to look like an instruction. If the agent follows it, that is prompt injection, the most common way an agent is turned against its user.

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

The core habit is to treat everything the agent reads, including tool output, as data rather than commands. A few controls reduce the risk on shared infrastructure:

- **Keep a human on consequential actions.** Approve anything that deletes data, moves files, pushes code, or spends budget (see {ref}`Permission modes <agentic_ai:permission_modes>`).
- **Give the agent only the access it needs.** Scope subagents to read-only tools where you can (see {doc}`Configuring Agents for Your Project <configuring_agents>`), and do not run agents with elevated permissions on shared paths.
- **Cap autonomous loops.** Bound long or unattended runs with `--max-turns`, `--max-budget-usd`, and a SLURM `--time`, so a misdirected agent cannot run away; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.
- **Keep secrets out of reach.** A misdirected agent can leak anything your account can read, and read-only commands such as `cat` run without a prompt even outside your project. Keep credentials out of the project, and block reads of credential files with deny rules in `~/.claude/settings.json`, for example `Read(~/.ssh/**)`, or turn on `permissions.blockReadsOutsideWorkingDirectories`.

For the risk categories and defenses in depth, see OWASP's [Top 10 for Agentic Applications](https://genai.owasp.org/agentic-security-initiative/) and [Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/); the latter ranks prompt injection first. For cluster data rules, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

(agentic_ai:remote_control)=
### Remote control

Some agents can be driven from another device. Claude Code's [Remote Control](https://code.claude.com/docs/en/remote-control) connects a session running on your machine to claude.ai/code or the Claude app on a phone. You turn it on with `/remote-control` in a session, `claude --remote-control`, or `claude remote-control`, or for every session with a setting. Codex offers the same kind of access through `codex remote-control`, experimental in the CLI, and through the ChatGPT app's [remote connections](https://learn.chatgpt.com/docs/remote-connections), which can also reach projects over SSH. In both, a device signed in to the same account can send the agent instructions and approve its actions, and everything runs on the connected machine.

On the cluster, that machine is your cluster account. With remote control on, a session there can be steered from any device signed in to your AI account, without the FASRC login, two-factor authentication, and VPN that normally guard the cluster. A phone left unlocked, or a browser still signed in on another computer, becomes a way into your cluster account. Claude Code also keeps the session's transcript, including tool activity, on Anthropic's servers while it is connected. Until there is specific guidance on these features, be careful:

- **Leave it off unless you need it.** Turn it on only for the session that needs it, and do not turn on Claude Code's "Enable Remote Control for all sessions" setting (`remoteControlAtStartup`) on the cluster.
- **Stop it when you are done.** End the Claude Code session, press Ctrl+C in `claude remote-control`, or run `codex remote-control stop`.
- **Protect the account that controls it.** Sign in only on devices you control, use multi-factor authentication, and consider Claude's Trusted Devices, which requires each device to be verified before it can view or steer a session. Never let anyone else use that account; sharing access to your cluster account is not allowed.
- **Rule it out where you do not want it.** Setting `"disableRemoteControl": true` in `~/.claude/settings.json` on the cluster turns Claude Code's Remote Control off entirely.
- **Prefer the usual way in.** To check on a long run from elsewhere, log in to the cluster and reattach your tmux session, or read the batch job's logs.

If you think someone else may have used a session, stop it and report it as described in {doc}`Security and Compliance <../s6_security_and_compliance/README>`.

(agentic_ai:scoping)=
## Scoping an agent to its task

Your account's authority is not the same as the authority a single task needs. Your account may legitimately reach many projects, directories, credentials, and services, but one agent task usually needs only a small part of that. Because an agent runs as your own process, not as a separate user, it can use whatever files, tools, and credentials that process can reach. If a bug, a bad input, or a prompt-injection payload misdirects it, the reach of the damage is everything the process can touch, not just what the task required. The question to ask is not only whether an action is allowed under your account, but whether the task has more effective authority than its purpose requires.

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

The goal is to shrink the agent's effective authority toward the inner box, so a misdirected agent can reach little more than the task required.

### Prefer enforceable boundaries over prompt instructions

A prompt such as "do not read files outside this directory" guides the model, but it is not an independent boundary and may not hold under adversarial input. Where the environment allows, prefer limits enforced outside the model: filesystem permissions, SLURM resource limits (see {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`), tool permission allowlists (see {doc}`Configuring Agents for Your Project <configuring_agents>`), and read-only subagents. Use both layers together: enforceable controls set the hard limit, and prompt instructions guide behavior within it.

### Before an unattended run

Before running an agent unattended, work through this checklist. A "no" or "unknown" answer does not by itself block the job; it flags a boundary to resolve first.

| Question | What to check |
|---|---|
| **Task boundary** | Can you state in one or two sentences exactly what the agent is meant to do? |
| **Read scope** | Which files and directories must it read? What unrelated locations can the process also see? |
| **Write scope** | Where may it create or change files? Can it reach shared environments, checkpoints, datasets, or repositories the task does not need to change? |
| **Credentials** | Which API tokens, SSH keys, cloud credentials, or authenticated sessions can the process reach? |
| **Network** | Which external endpoints does the task actually require? |
| **Data policy** | Is every dataset the agent may read permitted in this environment under the applicable data-use agreement and data level? See {doc}`Security and Compliance <../s6_security_and_compliance/README>`. |
| **Untrusted input** | Could it read web pages, papers, repository files, datasets, code comments, or tool output that may carry adversarial instructions? See {ref}`Agent security <agentic_ai:agent_security>`. |
| **Resource scope** | Are CPU, memory, GPU, wall time, and job concurrency bounded to what the task needs, and are autonomous loops capped? |
| **Execution evidence** | Will enough metadata exist to reconstruct the run, such as the SLURM job ID, code or image version, timestamps, and input and output locations, without logging secrets? |
| **Stop condition** | What event should make the agent halt and return control to a person rather than widen its own scope? |

When an unattended agent finds it needs data, credentials, external access, or actions outside its declared task, the safe default is to stop and ask for human review rather than widen its own scope. Set the stop conditions and loop limits before submission, and treat unexpected scope expansion as a signal to pause rather than proceed.

```{mermaid}
flowchart LR
    A["Agent needs something<br/>outside its declared task"] --> B{"Response"}
    B -->|fail closed| STOP["Stop and request<br/>human review"]
    B -->|avoid| EXPAND["Widen its own scope<br/>and continue"]
    classDef n fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef good fill:#C6C8F4,color:#14154C,stroke:#14154C;
    classDef bad fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class A,B n;
    class STOP good;
    class EXPAND bad;
```

### Container filesystem visibility

Running an agent inside a Singularity or Apptainer container does not by itself isolate it from the host filesystem. On the cluster, the default configuration makes `/n` (home, lab, and scratch space), your current working directory, and `/tmp` available inside the container, so unless you opt into isolation a containerized agent sees the same files as a non-containerized one. You control this: restrict what is mounted with options such as `--contain` or `--no-mount`, and add only the paths the task needs with `--bind`. Verify your container's effective filesystem visibility rather than assuming it is isolated. See {doc}`Containerization <../s1_high_performance_computing/development_and_runtime_envs/containerization>` and the [FASRC Singularity documentation](https://docs.rc.fas.harvard.edu/kb/singularity-on-the-cluster/) for bind-mount behavior.

```{mermaid}
flowchart LR
    subgraph HOST["Cluster host filesystem"]
        N["/n<br/>home, lab, scratch"]
        PWD["current working<br/>directory"]
        TMP["/tmp"]
    end
    subgraph CONT["Singularity / Apptainer container"]
        AG(["Agent process"])
    end
    N -.->|bound by default| AG
    PWD -.->|bound by default| AG
    TMP -.->|bound by default| AG
    style HOST fill:#C6C8F4,color:#14154C,stroke:#14154C
    style CONT fill:#14154C,color:#ffffff,stroke:#3D3E82
    classDef path fill:#ffffff,color:#14154C,stroke:#3D3E82;
    classDef agent fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class N,PWD,TMP path;
    class AG agent;
```

(agentic_ai:agent_sandboxing)=
### Agent sandboxing

Claude Code and Codex can run an agent's shell commands inside an operating-system sandbox that limits which files they can write and which network hosts they can reach. The operating system enforces these limits on every command inside the sandbox, whatever the model decides, and by default Claude Code runs sandboxed commands without asking you to approve each one. On Linux, both tools build the sandbox with a system tool called bubblewrap, and Claude Code also needs socat; both are installed on the cluster's compute nodes.

In Claude Code, turn the sandbox on with the `/sandbox` command, or in your settings:

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

Five things to know on the cluster:

- **It covers shell commands only.** The agent's own file-editing tools follow your permission rules instead, and hooks and MCP servers run outside the sandbox with your full access.
- **Close its two escape hatches.** By default, when a command fails inside the sandbox, Claude can retry it outside, subject to your permission mode, and if the sandbox cannot start at all, Claude Code runs commands without it. `allowUnsandboxedCommands: false` turns off the retry, and `failIfUnavailable: true` makes Claude Code exit at startup instead. With both set, only commands that match `excludedCommands` run outside the sandbox.
- **Decide whether it replaces your approvals.** By default, a command that runs inside the sandbox runs without a prompt in every permission mode except plan mode, including manual mode and `dontAsk`; only deny rules and specific ask rules, such as `Bash(git push *)`, still apply to it. That speeds up interactive work, but it also means a batch run's `--allowedTools` no longer limits which commands run. The settings above set `autoAllowBashIfSandboxed` to `false`, which keeps your usual approvals; remove that line if you want sandboxed commands to run without asking. In a test on the cluster under `dontAsk`, a sandboxed `touch` ran with auto-allow on and was refused with it off.
- **SLURM commands cannot reach the scheduler from inside it.** The sandbox gives commands their own network namespace, which cuts them off from the SLURM controller. In a test on the cluster with Claude Code's sandbox, `sinfo` waited almost two minutes and then failed with `Unable to contact slurm controller (connect failure)`, while the same command, excluded from the sandbox, answered at once. List the SLURM commands the agent needs in `excludedCommands`, as above, so they run outside the sandbox and go through your permission rules and hooks instead; see {ref}`Guardrails <agentic_ai:guardrails>`. `sbatch`, `srun`, and `salloc` then run whatever they launch outside the sandbox too, so keep them on the `ask` list in {ref}`Permission rules <agentic_ai:permission_rules>`.
- **Exclusions match only simple calls.** A call runs outside the sandbox only if every command in it matches an exclusion, and a redirect to a file, a `cd`, or a command substitution such as `$(...)` keeps the whole call inside. A call such as `squeue --me | grep RUNNING` or `jobid=$(sbatch --parsable job.sh)` therefore stays sandboxed and fails after a long wait. Add a line to your project instructions such as "Run SLURM and ClusterTool commands on their own, without pipes, redirects, `cd`, or `$(...)`."

Codex also sandboxes commands: `codex exec` starts in a read-only sandbox, and `--sandbox workspace-write` allows edits in the working directory while keeping network access off. In a test on the cluster, both held, and `sinfo` inside Codex's sandbox failed the same way after almost two minutes, so run SLURM commands yourself rather than through Codex's sandbox. See the [Claude Code sandboxing documentation](https://code.claude.com/docs/en/sandboxing) and the Codex [sandboxing documentation](https://learn.chatgpt.com/docs/sandboxing).

```{seealso}
For setting up and running agents on the cluster, see {doc}`Using Agentic AI on the Cluster <using_agentic_ai_on_the_cluster>`. For permission rules, hooks, and caps on unattended runs, see {doc}`Configuring Agents for Your Project <configuring_agents>`. For the university and FASRC rules behind this page, see {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```
