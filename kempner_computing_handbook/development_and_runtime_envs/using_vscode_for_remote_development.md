(development_and_runtime_envs:using_vscode_for_remote_development)=
# Using VSCode for Remote Development

For remote development, we recommend using Visual Studio Code (VSCode) with the Remote - SSH extension. This extension allows you to open any folder and file on the FASRC cluster and take full advantage of VSCode's feature set. 

## Prerequisites

You must install VSCode on your local machine and also ensure the Remote - SSH extension is installed.

- [Visual Studio Code](https://code.visualstudio.com/) 
- [Remote - SSH extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh)
- [Remote Explorer extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.remote-explorer)

```{note}
Please see [Install Visual Studio Code extensions](https://code.visualstudio.com/learn/get-started/extensions) for installing the extensions.
```

## Connecting to the FASRC cluster (login node)

- Step 1: The ssh configuration file on your local machine should have an entry for the FASRC cluster. 

For mac and linux users, the file is located at `~/.ssh/config`. For Windows users, the file is located at `C:\Users\<username>\.ssh\config`. Add the following entry to the `config` file:

```bash
Host cannon
  HostName login.rc.fas.harvard.edu
  User <username>
```

```bash
Host cannon02
  HostName login.rc.fas.harvard.edu
  User <username>
```
````

Please make sure that you use your FASRC username in place of `<username>`.

- Step 2: Open the VSCode and click on the Remote Explorer icon on the left-hand (or the right-hand) side of the window.

```{figure} figures/png/vscode_ssh_login_1.png
---
height: 500 px
name: VSCode SSH Login 1
```

- Step 3: Hover the mouse on your username or on `cannon` and click on the `->` button to connect to the FASRC cluster.

```{figure} figures/png/vscode_ssh_login_2.png
---
height: 500 px
name: VSCode SSH Login 2
```

- Step 4: Enter your FASRC password (and MFA code) when prompted.

```{figure} figures/png/vscode_ssh_login_3.png
---
height: 500 px
name: VSCode SSH Login 3
```

Once connected, you will see the file explorer on the left-hand side of the window. You can now open any folder or file on the FASRC cluster and take full advantage of VSCode's feature set. 

```{note}
Please do not run any computationally intensive tasks on the login node. Use the login node only for editing files and submitting jobs to the compute nodes.
```

You can use the terminal in VSCode to run SLURM commands and submit jobs to the compute nodes. Open the terminal by clicking on `Terminal` -> `New Terminal` in the top menu. 

```{figure} figures/png/vscode_ssh_login_4.png
---
height: 500 px
name: VSCode SSH Login 4
```

(development_and_runtime_envs:using_vscode_for_remote_development:compute_node)=
## Connecting to the FASRC cluster (Compute node)

Connecting to the compute nodes requries two additional configurations:

1. Add the compute node configuration to the ssh configuration file on your local machine.

```bash
Host cannon
  HostName login.rc.fas.harvard.edu
  User <username>
  ControlMaster auto
  ControlPath ~/.ssh/%r@%h:%p

Host holy*
    HostName %h
    User <username>
    ProxyJump cannon
```


2. Generate a public and private key on your local machine and submit the public key to the FASRC cluster.

Go to the `~/.ssh` directory on your local machine and see if you have a file named `id_rsa.pub`. If you don't have the file, you need to generate the keys using the following command:

```bash
ssh-keygen
```

Once you have the `id_rsa.pub` file, submit the public key to the FASRC cluster using the following command:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub <username>@login.rc.fas.harvard.edu
```
It will prompt you to enter your FASRC password. Once you enter the password, the public key will be added to the `~/.ssh/authorized_keys` file on the FASRC cluster.

After completing the above steps, you can connect to the compute nodes. First connect to the login node and allocate an interactive session. For example:

```bash
salloc --partition=kempner_requeue --account=kempner_dev --ntasks=1 --cpus-per-task=16 --mem=16G --gres=gpu:1 --time=00-03:00:00
```
This will allocate an interactive session on the `kempner_requeue` partition with 16 cores, 16GB of memory, and 1 GPU for 3 hours. Then node name is displayed int the terminal. 

```{tip}
You can also use the `squeue -u <username>` command to see the list of your running jobs and the nodes they are running on.
```

```{figure} figures/png/vscode_ssh_login_5.png
---
height: 500 px
name: VSCode SSH Login 5
```

Once you have the node name, go to the search bar of the VScode and type `>Remote-SSH: Connect to Host...` and then in the prompt, put `<username>@<node_name>` and press enter. 

```{figure} figures/png/vscode_ssh_login_6.png
---
height: 500 px
name: VSCode SSH Login 6
```
This will open a new window on the compute node. You can now use it to run your jobs interactively. 

```{figure} figures/png/vscode_ssh_login_7.png
---
height: 500 px
name: VSCode SSH Login 7
```

(development_and_runtime_envs:using_vscode_for_remote_development:jupyter)=
## Using Jupyter notebooks within VSCode


You can open, edit, and run Jupyter notebooks within VSCode. To do so, you need to first install the [Jupyter extension](https://marketplace.visualstudio.com/items?itemName=ms-toolsai.jupyter).


The interface for notebooks within VSCode is similar to other methods of accessing them - there are tools for running individual cells, all cells, clearing all outputs, etc. See the [VSCode jupyter notebook documention](https://code.visualstudio.com/docs/datascience/jupyter-notebooks) for a detailed overview of these options.


If you follow the instructions above, you will be able to open and run jupyter notebooks within an interactive session on the cluster. Open the notebook within VSCode and click on `Select Kernel` (in the top right corner):


```{figure} figures/png/vscode_jupyter_notebook_1.png
---
height: 300 px
name: VSCode Jupyter Notebook 1
```


If you click `Select Another Kernel` and then `Python environments`, you should see a list of possible kernels, including any [user-defined conda environments](development_and_runtime_envs:using_conda_env:creation) (if you installed ipykernel within them):


```{figure} figures/png/vscode_jupyter_notebook_2.png
---
height: 300 px
name: VSCode Jupyter Notebook 2
```


You can click on your preferred environment to use it within the jupyter notebook.


If you recently created the conda environment, you may need to reload before it shows up. To do this, open the command palette using `Ctrl + Shift + P` (Windows)/`Shift + Command + P` (Mac) and type and select `Reload Window`.
