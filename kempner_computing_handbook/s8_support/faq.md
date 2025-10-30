# FAQ

1. I am trying to clone a repository on HPC but I get the following error:

    ```bash
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    IT IS POSSIBLE THAT SOMEONE IS DOING SOMETHING NASTY!
    Someone could be eavesdropping on you right now (man-in-the-middle attack)!
    It is also possible that a host key has just been changed.
    The fingerprint for the RSA key sent by the remote host is
    ...
    ```
    
    This can happen if you do not add your ssh key to your github account. Follow these links to add your ssh key to your github account:
    - [Checking for existing SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)
    - [Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent?platform=linux)
    - [Adding a new SSH key to your GitHub account](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)


2. I am trying to `git push` (`git pull` or `git fetch`) however I get the following error: 

    ```bash
    (gnome-ssh-askpass:134672): Gtk-WARNING **: 07:19:13.800: cannot open display: 
    error: unable to read askpass response from '/usr/libexec/openssh/gnome-ssh-askpass'
    Username for 'https://github.com':
    ```

    This error is due to the fact that you are trying to use `https` instead of `ssh`. You can change the remote url to `ssh` by running the following command:

    ```bash
    git remote set-url origin git@github.com:[Github account]/[Github repository].git
    ```

    Replace `[Github account]` with your github account and `[Github repository]` with the repository you are trying to push to.