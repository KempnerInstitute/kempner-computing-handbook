# Using Agentic AI on the Cluster

Once you have chosen a tool (see {doc}`Agentic AI Tools <agentic_ai_tools>`), this page covers how to run it on the Kempner AI cluster. Agentic tools come in two forms, and both work on the cluster: a terminal agent that runs in an SSH session, and an IDE agent that runs through a VS Code Remote-SSH connection. The setup below uses [Claude Code](https://www.anthropic.com/claude-code) as a concrete example, but the same steps apply to other terminal agents.

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

   If you prefer to manage it inside an environment, you can instead install with npm (Node.js 22 or later) in a {doc}`conda <../s1_high_performance_computing/development_and_runtime_envs/using_conda_env>` or {doc}`uv <../s1_high_performance_computing/development_and_runtime_envs/using_uv_env>` environment: `npm install -g @anthropic-ai/claude-code`.

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

### Permission modes

Claude Code has several permission modes that trade oversight for speed, and you can switch between them at any time with `Shift+Tab`. Which mode a new session starts in depends on your plan: recent versions start Pro, Max, and Team sessions in Auto mode, while Enterprise and API-key sessions start in Manual mode, where the agent asks before each action. The modes:

- **Manual**: approve each edit and command as the agent proposes it. This is the starting mode for Enterprise and API-key sessions, and the safest while you are learning how the agent behaves on your code.
- **Auto-accept edits**: file edits and common filesystem commands in the working directory apply without prompting, so the agent can work through a task uninterrupted. This set includes deletions (`rm`, `rmdir`) alongside `mkdir`, `touch`, `mv`, `cp`, and `sed`, so watch what it does on shared storage.
- **Plan mode**: the agent researches and proposes a plan without changing anything. Use it to review the approach before any edits happen.
- **Auto mode**: the agent runs without routine prompts, but a separate classifier reviews each action first and blocks anything risky, such as a command that reaches beyond your task or destroys data. This means far fewer interruptions than manual mode while keeping a safety check in place, and on Pro, Max, and Team plans it is the mode new sessions start in. It requires a supported model, and an organization can turn it off.

```{warning}
Avoid the `--dangerously-skip-permissions` flag (bypass mode) on the cluster. It lets the agent run any command without asking, on a shared system that can read your files, write to your storage, and submit jobs under your account. Anthropic recommends this mode only in isolated environments such as containers or VMs without internet access, where the agent cannot cause damage. Cluster compute nodes have outbound access, so that condition does not hold here. Stay in manual, plan, or auto mode, where you or the classifier still vet actions, rather than skipping checks entirely.
```

### Long or unattended runs

For a task that runs a long time, use a batch job rather than holding an interactive session open. Claude Code runs non-interactively in print mode (`claude -p "your task"`), which you can call from inside an `sbatch` script; see {doc}`Job Submission Basics <../s1_high_performance_computing/general_hpc_concepts/job_submission_basics>`. A batch job has no one to answer prompts, so scope what the agent may do ahead of time with permission rules or a mode you trust. Do not reach for bypass mode just to get past the prompts.

```{note}
If you connect the agent to external tools through the Model Context Protocol (MCP), those servers run from your session the same way, and the same rules apply: keep any credentials in their configuration out of shared or world-readable paths. See {doc}`Agentic AI Tools <agentic_ai_tools>` for MCP background.
```

## Running an IDE agent

If you work in VS Code, you can use an IDE agent or extension against the cluster over Remote-SSH:

1. Connect VS Code to a compute node with Remote-SSH, as described in {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`.
2. Install the agent's extension (for example Claude Code, GitHub Copilot, or a coding assistant) in the remote window so it runs against the cluster-side files.
3. Provide credentials the same way as above, through the extension's sign-in or an API key.

FASRC documents several editor and notebook AI extensions, including Jupyter-AI for JupyterLab through Open OnDemand. See FASRC's [AI extensions guidance](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/) and the {doc}`New User Checklist <../s1_high_performance_computing/kempner_cluster/new_user_checklist>`.

## Responsible use on shared infrastructure

Agents act on their own, so a few habits keep them from disrupting shared resources or your own account:

- **Stay within your allocation.** Run agents inside an interactive job or batch script, not on login nodes. Do not let an agent submit unbounded {doc}`SLURM <../s1_high_performance_computing/general_hpc_concepts/understanding_slurm>` jobs or launch its own long-running background processes without your review.
- **Do not hold GPUs idle.** If the agent is only reading, planning, or editing code, use a CPU allocation. Request a GPU when the work needs one, and release the session when you are done.
- **Review before it acts.** Read the commands an agent proposes before approving them, especially anything that deletes files, rewrites history, or moves data. Treat an agent's suggestions the same way you would treat a pull request from a stranger.
- **Watch cost and quota.** API and subscription usage bills to your account, which you can track in the Claude Console; cluster jobs draw on your fairshare allocation. See {doc}`Fairshare Policy <../s1_high_performance_computing/efficient_use_of_resources/fair_use_and_prioritization_policies>`.
- **Protect secrets and data.** Keep API keys out of repositories and shared paths, and do not let an agent read directories that hold credentials or sensitive data.

## Common pitfalls

- The agent tries to `sudo`, install system packages, or modify files outside your space. You do not have root on the cluster; keep changes within your own directories and environments.
- The agent cannot reach the provider's API. Compute nodes have outbound access, so check your key, environment, and any typo first; if calls still fail, see {doc}`Support and Troubleshooting <../s8_support/README>`.

```{seealso}
For the landscape of available tools, see {doc}`Agentic AI Tools <agentic_ai_tools>`. To keep everything on the cluster with no external provider, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`. For data-handling rules, see {doc}`Security and Compliance <../s6_security_and_compliance/README>` and the {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
```
