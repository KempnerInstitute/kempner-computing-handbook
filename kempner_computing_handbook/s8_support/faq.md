(support_and_troubleshooting:faq)=
# FAQ

Answers to common questions, grouped by topic. Select a question to expand its answer. To suggest a new entry, use the `#cluster-users` channel in the Kempner Slack space (see {doc}`Support and Troubleshooting <README>`) or open an issue in the [computing handbook GitHub repository](https://github.com/KempnerInstitute/kempner-computing-handbook/issues).

## Git and GitHub

:::{dropdown} Cloning a repository fails with a "REMOTE HOST IDENTIFICATION HAS CHANGED" warning
When you try to clone a repository, you see an error like:

```text
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
Someone could be eavesdropping on you right now (man-in-the-middle attack)!
It is also possible that a host key has just been changed.
The fingerprint for the RSA key sent by the remote host is
...
```

This means the host key the server now presents does not match the one cached in your `~/.ssh/known_hosts` file, for example after GitHub rotated its SSH host keys. Remove the stale entry and reconnect to accept the new key:

```bash
ssh-keygen -R github.com
```

The next connection prompts you to accept the new key. Verify its fingerprint against [GitHub's published SSH key fingerprints](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/githubs-ssh-key-fingerprints) before accepting.

If you instead see `Permission denied (publickey)`, your SSH key is not registered with your GitHub account. Add it using these guides:

- [Checking for existing SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)
- [Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent?platform=linux)
- [Adding a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
:::

:::{dropdown} `git push`, `pull`, or `fetch` prompts for a username or shows an askpass error
When you run `git push`, `git pull`, or `git fetch`, you see an error like:

```text
(gnome-ssh-askpass:134672): Gtk-WARNING **: 07:19:13.800: cannot open display:
error: unable to read askpass response from '/usr/libexec/openssh/gnome-ssh-askpass'
Username for 'https://github.com':
```

This happens because the repository's remote uses `https` instead of `ssh`. Switch the remote to SSH:

```bash
git remote set-url origin git@github.com:[Github account]/[Github repository].git
```

Replace `[Github account]` with your GitHub account and `[Github repository]` with the repository you are pushing to.
:::

## VSCode

:::{dropdown} VSCode keeps dropping its connection to the cluster ("dynamic port forwarding failed")
VSCode Remote-SSH can stop reconnecting when leftover port forwards accumulate on the shared SSH connection, showing `dynamic port forwarding failed!` or `Address already in use` in its Remote-SSH log. Release the stuck port with `ssh -O cancel -D <port> cannon`, or reset the shared connection with `ssh -O exit cannon` and reconnect. For the full steps, see {ref}`Troubleshooting connection drops <development_and_runtime_envs:using_vscode_for_remote_development:troubleshooting_connection_drops>` on the VSCode page.
:::

## Agentic AI

:::{dropdown} What data can I use with a cloud agent on the cluster?
A cloud agent sends your prompts, and any code or data it reads, to its provider. On the cluster, it may work only with public data (Level 1), unless your school has an agreement with the provider that covers your data. Most unpublished research code and data are Level 2, so check with your school whether your account is covered; see {ref}`Before you start <agentic_ai:before_you_start>`. A model served on the cluster, as in {doc}`HPC Agentic Recipes <../s5b_agentic_ai_workflows/hpc_agentic_recipes>`, keeps your data on the cluster, but FASRC's rule also covers "other GenAI models", so the same check applies.
:::

:::{dropdown} Signing in to Claude Code or Codex from a cluster node
Sign in with the Claude or ChatGPT access that HUIT provides through Harvard SSO. FASRC states that using personal accounts or API keys for work on the cluster is not in accordance with Harvard policy; see its [AI Agents guidance](https://docs.rc.fas.harvard.edu/kb/ai-agents/). A cluster node cannot open a browser, so both tools use a sign-in flow you finish on your own computer.

- **Claude Code.** Run `claude`, or `/login` inside a session. It prints a URL; open it in your local browser, sign in with Harvard SSO, and paste the code it shows back into the terminal. `/status` shows which organization you are signed in to. The login is saved in your home directory, so it works on every node and in batch jobs. If `ANTHROPIC_API_KEY` is set, print mode (`claude -p`) uses it instead, so leave it unset; see {ref}`Running a terminal agent <agentic_ai:running_a_terminal_agent>`.
- **Codex.** Run `codex login --device-auth`, open the link it prints, sign in to ChatGPT with Harvard SSO, and enter the one-time code. Device code login is in beta, and for a workspace account such as ChatGPT Edu, the workspace admin must turn it on first. See the Codex [authentication documentation](https://learn.chatgpt.com/docs/auth).

Treat saved logins like passwords: keep them out of shared directories and repositories.
:::

:::{dropdown} `claude: command not found` after installing
The native installer puts `claude` in `~/.local/bin`, which may not be on your `PATH`. Add it in `~/.bashrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Then run `source ~/.bashrc`, or log in again, and check with `claude --version`. `claude doctor` reports problems with the installation. If you installed Claude Code with npm inside a conda environment, it is on your `PATH` only while that environment is active. Batch jobs inherit the `PATH` of the shell you submit them from.
:::

:::{dropdown} The agent stops with a usage or rate limit message
Your account limits how much you can use Claude Code or Codex in a period of time. Inside a Claude Code session, `/usage` shows how much of your limits you have used. Every agent you run counts against the same limits, so several sessions in parallel, or an array of agent jobs, reach them sooner. Cap how many run at once (for example `--array=0-49%4`); see {ref}`Watch cost and context <agentic_ai:watch_cost>`.
:::

:::{dropdown} An agent extension in VSCode cannot see my cluster files
An agent extension must run where your files are. In a Remote-SSH window, install it from the Extensions view with its **Install in SSH** button; an extension installed only on your laptop works on your laptop's files. Connect the window to a compute node rather than a login node, as described in {doc}`VSCode for Remote Dev <../s1_high_performance_computing/development_and_runtime_envs/using_vscode_for_remote_development>`, so the agent's commands do not run on a shared login node. If the connection itself keeps dropping, see {ref}`Troubleshooting connection drops <development_and_runtime_envs:using_vscode_for_remote_development:troubleshooting_connection_drops>`.
:::

:::{dropdown} My agent session ended when my connection dropped
An interactive session lives inside your SSH connection. Run it inside tmux on the login node so it survives a dropped connection. If the job has ended, start a new one, `cd` to the same project directory, and run `claude --continue` to pick the conversation back up; see {ref}`Keeping a session alive <agentic_ai:keeping_a_session_alive>`.
:::
