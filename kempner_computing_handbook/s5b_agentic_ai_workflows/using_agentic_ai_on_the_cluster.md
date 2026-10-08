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

## Common pitfalls

- The agent tries to `sudo`, install system packages, or modify files outside your space. You do not have root on the cluster; keep changes within your own directories and environments.
- The agent cannot reach the provider's API. Compute nodes have outbound access, so check your key, environment, and any typo first; if calls still fail, see {doc}`Support and Troubleshooting <../s8_support/README>`.
- The session ends when your connection drops or your job reaches its time limit. Run it inside tmux and resume the conversation afterward; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
- SLURM commands stall and then fail inside the agent sandbox. Exclude them from it, and have the agent run them as simple calls; see {ref}`Agent sandboxing <agentic_ai:agent_sandboxing>`.

For more fixes, such as signing in from a cluster node or a `claude: command not found` error after installing, see the agentic AI entries in the {doc}`FAQ <../s8_support/faq>`.

```{seealso}
For the landscape of available tools, see {doc}`Agentic AI Tools <agentic_ai_tools>`. For prompt injection, remote control, scoping, and the agent sandbox, see {doc}`Agent Security and Scoping <agent_security_and_scoping>`. For a hands-on walkthrough, see {doc}`Your First Agentic Workflow on the Cluster <first_agentic_workflow>`. To keep everything on the cluster with no external provider, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`. For data-handling rules, see {doc}`Security and Compliance <../s6_security_and_compliance/README>` and the {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
```
