# Using Agentic AI on the Cluster

Once you have chosen a tool (see {doc}`Agentic AI Tools <agentic_ai_tools>`), this page covers how to run it on the Kempner AI cluster. Agentic tools come in two forms, and both work on the cluster: a terminal agent that runs in an SSH session, and an IDE agent that runs through a VS Code Remote-SSH connection. The setup below uses [Claude Code](https://www.anthropic.com/claude-code) as a concrete example, but the same steps apply to other terminal agents.

(agentic_ai:before_you_start)=
## Before you start

```{warning}
Cloud-based agents send your prompts, and any code or data they can read, to an external provider. FASRC permits generative AI tools on the cluster only for non-sensitive, public data (security Level 1). Do not point a cloud agent at Level 2 or higher data unless your school has arranged a contractual agreement with the provider first. See FASRC's [Anthropic API guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/), {doc}`Agentic AI Tools <agentic_ai_tools>` for approved-tool data levels, and {doc}`Security and Compliance <../s6_security_and_compliance/README>`.
```

A few things to have ready:

- An API key or account for your tool (see the auth step below).
- Awareness of your data's security level, and whether the tool is cleared for it.
- A compute node. Do not run agents on a login node: they can spawn long-running processes and consume CPU and memory that login nodes share across all users. Start an interactive session first, as shown below.

## Running a terminal agent

The following walks through Claude Code end to end.

1. Start an interactive session on a compute node. A terminal agent itself only needs CPU and memory to talk to the cloud API, so a modest CPU allocation is enough unless the agent will run GPU code on your behalf:

   ```bash
   salloc --partition=test --time=0-02:00 --mem=16G --cpus-per-task=4
   ```

   Request a GPU (for example `--partition=kempner --account=<your_account> --gres=gpu:1`) only when the agent needs one to run your workload, so you do not hold a GPU idle while you work. See {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`.

2. Install Claude Code. The native installer needs no other dependencies and keeps itself up to date:

   ```bash
   curl -fsSL https://claude.ai/install.sh | bash
   ```

   This installs to `~/.local/bin`; make sure that directory is on your `PATH`. Confirm the install:

   ```bash
   claude --version
   ```

   If you prefer to manage it inside an environment, you can instead install it with npm in a conda environment that provides Node.js 22 or later (`conda install -c conda-forge "nodejs>=22"`): `npm install -g @anthropic-ai/claude-code`. To set one up, see {doc}`Conda Environment <../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>`.

   Your home directory is shared by every node, and an update can delete an older version that a session on another node is still running, which crashes that session. If you run agents in several jobs at once, turn off automatic updates by adding `"env": {"DISABLE_AUTOUPDATER": "1"}` to `~/.claude/settings.json`, and run `claude update` yourself when no agent jobs are running.

3. Authenticate. Claude Code accepts either a Claude.ai subscription or an API key:

   - **Subscription.** If you have a paid Claude.ai plan (Pro, Max, Team, or Enterprise), whether a personal or a lab-provided account, run `claude` and follow the login prompt, or use the `/login` command inside a session. Over SSH the login gives you a URL to open in your local browser and a code to paste back. The free Claude.ai plan does not include Claude Code.
   - **API key.** Create a key in the [Claude Console](https://platform.claude.com) and make it available to the tool:

     ```bash
     export ANTHROPIC_API_KEY="your-key-here"
     ```

     Keep the key out of anything shared or version-controlled: do not commit it to a repository, and do not leave it in a world-readable file on shared storage. If you store it in a file, restrict access with `chmod 600`. PIs can create a lab key billed through a HUIT billing code rather than a personal card; see FASRC's [Anthropic API guidance](https://docs.rc.fas.harvard.edu/kb/anthropic/).

4. Start the agent from your project directory:

   ```bash
   claude
   ```

   With a subscription, this launches the login flow on first use; with `ANTHROPIC_API_KEY` set, Claude Code asks you to approve using the key. Either way it then opens an interactive session.

(agentic_ai:permission_modes)=
### Permission modes

Claude Code has several permission modes that trade oversight for speed. Press `Shift+Tab` during a session to cycle through them, or choose one at startup with `--permission-mode`. New interactive sessions start in auto mode where it is available, and otherwise in manual mode. The modes, with their `--permission-mode` values:

- **Manual** (`default`): approve each edit and command as the agent proposes it. This is the safest mode while you are learning how the agent behaves on your code.
- **Auto-accept edits** (`acceptEdits`): file edits and common filesystem commands in the working directory apply without prompting, so the agent can work through a task uninterrupted. This set includes deletions (`rm`, `rmdir`) alongside `mkdir`, `touch`, `mv`, `cp`, and `sed`, so watch what it does on shared storage.
- **Plan mode** (`plan`): the agent researches and proposes a plan without editing files. Where auto mode is available, a classifier can still approve shell commands while it plans. Use it to review the approach before any edits happen.
- **Auto mode** (`auto`): the agent runs without routine prompts, but a separate classifier reviews each action first and blocks anything risky, such as a command that reaches beyond your task or destroys data. This means far fewer interruptions than manual mode while keeping a safety check in place. It requires a supported model, and an organization can turn it off.
- **Don't ask** (`dontAsk`): anything that would need your approval is refused without a prompt, so the agent can only read files, run read-only commands, and do what your permission rules allow. It is meant for unattended runs and is set only at startup; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`.

```{warning}
Avoid the `--dangerously-skip-permissions` flag (bypass mode) on the cluster. It lets the agent run any command without asking, on a shared system that can read your files, write to your storage, and submit jobs under your account. Anthropic recommends this mode only in isolated environments such as containers or VMs without internet access, where the agent cannot cause damage. Cluster compute nodes have outbound access, so that condition does not hold here. Stay in manual, plan, or auto mode, where you or the classifier still vet actions, rather than skipping checks entirely.
```

(agentic_ai:keeping_a_session_alive)=
### Keeping a session alive

An interactive session lives inside your SSH connection, so when your laptop sleeps or the VPN drops, the session ends with it. Run it inside `tmux` (or `screen`) on the login node so it survives a dropped connection:

1. On a login node, note which node you are on, then start a named session:

   ```bash
   hostname          # for example boslogin07.rc.fas.harvard.edu
   tmux new -s agent
   ```

2. Inside tmux, start your interactive job and the agent as usual (`salloc`, then `claude`).
3. If the connection drops, SSH back to that same login node by its full name and reattach:

   ```bash
   ssh <username>@boslogin07.rc.fas.harvard.edu
   tmux attach -t agent
   ```

Connecting to `login.rc.fas.harvard.edu` puts you on any of several login nodes, and a tmux session exists only on the node where you started it. See FASRC's [terminal access guide](https://docs.rc.fas.harvard.edu/kb/terminal-access/), which also explains the login nodes' per-session limits (1 core and 8 GB of memory, with at most 5 sessions per user) and notes that login nodes are rebooted during monthly maintenance, which ends any tmux session on them. tmux keeps your terminal alive; it does not extend your job, so the session still ends when the job reaches its `--time` limit.

To pick up the conversation after a session ends, start Claude Code again in the same project directory:

- `claude --continue` reopens the most recent conversation in the current directory. It does not pick up sessions started with `claude -p`.
- `claude --resume` lets you choose an earlier conversation, or takes a session ID.

Conversations are saved under `~/.claude/projects/`, which lives in your home directory and is available on every node. Claude Code can also run a task as a background session (`claude --bg "your task"`, then `claude attach` to reconnect), a research preview at the time of writing. A background session survives closing your terminal, but it runs on the node where it started, so on the cluster it still ends when your job does, and an interactive job ends when the terminal that started it closes. It does not replace tmux. To check on a session from another device, log in to the cluster and reattach tmux rather than turning on remote control; see {ref}`Remote control <agentic_ai:remote_control>`.

### Long or unattended runs

For a task that runs a long time, use a batch job rather than holding an interactive session open. Claude Code runs non-interactively in print mode (`claude -p "your task"`), which you can call from inside an `sbatch` script; see {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`. A batch job has no one to answer prompts, so scope what the agent may do ahead of time with permission rules and a permission mode such as `dontAsk`, which refuses anything the rules do not allow, and cap the run with `--max-turns` and `--max-budget-usd`; see {ref}`Caps on unattended runs <agentic_ai:run_caps>`. Do not reach for bypass mode just to get past the prompts. For a complete batch example, see {doc}`SLURM Jobs and Cluster Workflows <slurm_jobs_and_cluster_workflows>`.

```{note}
If you connect the agent to external tools through the Model Context Protocol (MCP), those servers run from your session the same way, and the same rules apply: keep any credentials in their configuration out of shared or world-readable paths. See {doc}`Agentic AI Tools <agentic_ai_tools>` for MCP background.
```

(agentic_ai:agentic_loop)=
## Under the hood: the agentic loop

When you type a prompt, the answer does not come from the model alone. Claude Code runs an agentic loop on your compute node: it calls a model to reason, uses tools to act, and repeats until the task is done.

```{mermaid}
flowchart LR
    U(["You"]) -->|prompt| H["Claude Code<br/>on the compute node"]
    H -->|"model call:<br/>prompt, context,<br/>tool definitions"| M["Model<br/>(API or local endpoint)"]
    M -->|"reasoning and<br/>tool requests"| H
    H -->|"approved tool use:<br/>read, edit, run, search"| T["Your files and shell<br/>on the node"]
    T -->|"results"| H
    H -->|"final answer"| U
    classDef harness fill:#A51C30,color:#ffffff,stroke:#A51C30;
    classDef remote fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#C6C8F4,color:#14154C,stroke:#14154C;
    class H harness;
    class M,T remote;
    class U you;
```

- **Claude Code is the harness, not the brain.** It runs on your compute node, holds the conversation, and orchestrates the work; the reasoning is done by a Claude model. The model runs remotely on the Anthropic API, or on your own endpoint if you self-host, as in {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`.
- **Each step is a model call.** Claude Code sends your prompt, the conversation and file context so far, and the definitions of the available tools to the model, which replies with text and, when it needs to act, with requests to use a tool.
- **Tools run on the node.** When the model asks to read a file, edit code, run a shell command, or search, Claude Code runs that tool on the compute node against your own files and shell, then feeds the result back to the model. This is why the agent can work across your whole project.
- **It loops until the turn is done.** The model gathers context, takes an action, and checks the result, using each result to decide the next step, until it produces a final answer. A single prompt can drive many model calls and tool uses.
- **You gate the actions.** The approval happens between the model's request and the tool running: in manual mode Claude Code asks you first, and in auto mode a classifier vets the action (see {ref}`Permission modes <agentic_ai:permission_modes>`). You can interrupt at any point.
- **Other terminal agents work the same way.** OpenAI Codex, Gemini CLI, and similar tools follow the same loop of model call, tool use, and iteration; the names differ but the shape is the same.

## Running an IDE agent

If you work in VS Code, you can use an IDE agent or extension against the cluster over Remote-SSH:

1. Connect VS Code to a compute node with Remote-SSH, as described in {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`.
2. Install the agent's extension (for example Claude Code, Codex, or GitHub Copilot) in the remote window, using its **Install in SSH** button, so it runs against the cluster-side files.
3. Provide credentials the same way as above, through the extension's sign-in or an API key.

FASRC documents several editor and notebook AI extensions, including Jupyter AI for JupyterLab through Open OnDemand. See FASRC's [AI extensions guidance](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/).

## Responsible use on shared infrastructure

Agents act on their own, so a few habits keep them from disrupting shared resources or your own account:

- **Stay within your allocation.** Run agents inside an interactive job or batch script, not on login nodes. Do not let an agent submit unbounded SLURM jobs (see {doc}`Understanding SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>`) or launch its own long-running background processes without your review.
- **Do not hold GPUs idle.** If the agent is only reading, planning, or editing code, use a CPU allocation. Request a GPU when the work needs one, and release the session when you are done.
- **Review before it acts.** Read the commands an agent proposes before approving them, especially anything that deletes files, rewrites history, or moves data. Treat an agent's suggestions the same way you would treat a pull request from a stranger.
- **Watch cost and quota.** API usage is billed per token and shown in the Claude Console, and a subscription has usage limits, which `/usage` shows inside a session; cluster jobs draw on your fairshare allocation. See {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Protect secrets and data.** Keep API keys out of repositories and shared paths, and block the agent from reading credentials and sensitive data, as described under {ref}`Agent security <agentic_ai:agent_security>`.

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

## Common pitfalls

- The agent tries to `sudo`, install system packages, or modify files outside your space. You do not have root on the cluster; keep changes within your own directories and environments.
- The agent cannot reach the provider's API. Compute nodes have outbound access, so check your key, environment, and any typo first; if calls still fail, see {doc}`Support and Troubleshooting <../s8_support/README>`.
- The session ends when your connection drops or your job reaches its time limit. Run it inside tmux and resume the conversation afterward; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
- SLURM commands stall and then fail inside the agent sandbox. Exclude them from it, and have the agent run them as simple calls; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

For more fixes, such as signing in from a cluster node or a `claude: command not found` error after installing, see the agentic AI entries in the {doc}`FAQ <../s8_support/faq>`.

```{seealso}
For the landscape of available tools, see {doc}`Agentic AI Tools <agentic_ai_tools>`. For a hands-on walkthrough, see {doc}`Your First Agentic Workflow on the Cluster <first_agentic_workflow>`. To keep everything on the cluster with no external provider, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`. For data-handling rules, see {doc}`Security and Compliance <../s6_security_and_compliance/README>` and the {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
```
