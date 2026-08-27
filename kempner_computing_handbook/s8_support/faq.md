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
