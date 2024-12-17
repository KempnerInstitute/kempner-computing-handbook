# Customizing Shell Configuration File

Including useful aliases and shortcuts into your shell configuration file (`~/.bashrc` in your home directory) can significantly streamline your workflow on the Kempner HPC Cluster, especially when working with GPU-accelerated machine learning (ML) tasks. These aliases can save you time by **reducing the need to type long commands** and **help avoid potential mistakes in repetitive tasks**. 

This section provides examples of aliases and shortcuts that can be particularly useful in such environments.

## Shortcut to Lab or Project Storage
Define aliases to quickly navigate to your lab or project storage directories on the Kempner HPC cluster,

```bash
export USERDIR='/n/holylabs/LABS/<lab_name>/Users/$USER'
alias golab='cd $USERDIR; pwd' 
alias goproject='cd $USERDIR/<project_name>; pwd'
```

Replace `<lab_name>`, `<project_name>` with your lab name (e.g., `kempner_grads`) and project folder name (`OLMo`). Defining `$USERDIR` as a separate variable helps organize your submission scripts and makes your code more portable when moving between systems.

##  Quick Access to Scratch Space
Define an alias for quick navigation to your scratch space, a temporary storage location for running jobs.


```bash
export SCRATCHDIR='/n/netscratch/<lab_name>/Users/$USER'
alias goscratch='cd $SCRATCHDIR; pwd'
```

Replace `<lab_name>` with your lab name (e.g., `kempner_grads`).

## Module Loading Shortcuts
Loading and unloading modules is a frequent task in HPC environments. You can simplify this process with aliases. Use `loadml <module_name>` with the specific modules you use.

```bash
alias loadml='module load $1'
alias unloadml='module unload $1'
```

You can use the alias as `loadml <module_name>`, where `<module_name>` is the name of available module. 

## Monitoring Shortcuts

Submitting and monitoring jobs is a core part of working on the Kempner HPC cluster. Simplify these commands to save time:

```bash
alias myjobs='squeue -u $USER'
alias sq='showq -u $USER'
```

Get detailed information about a specific job.

```bash
alias jobinfo='scontrol show job $1'
```

Use this command as `jobinfo <job_id>`, where `<job_id>`is the job ID assgined by SLURM.

Check status of jobs in a given partition,

```bash
alias partinfo='showq -o -p $1'
```

Pass one of the Kempner partitions to this command (e.g., `partinfo kempner`). 


## Interactive Jobs

Define an alias to speed up interactive session request (default to one GPU with 250G RAM):

```bash
alias onegpu='salloc -p kempner_requeue --account=<fairshare_account> --nodes=1 --ntasks=1 --cpus-per-task=16 --mem=250G --gres=gpu:1 -t 00-07:00:00'
```

## Canceling All Your Jobs
Quickly cancel all your jobs. 

```bash
alias killmyjobs='scancel -u $USER'
```

```{warning}
Use this command with caution!
```

## Tips for Customizing Shell Configuration File

- **Personalize Aliases**: The examples provided are a starting point. Modify and expand them based on your workflow and frequently used commands.
- **Keep `~/.bashrc` Organized**: As you add more aliases, keep your file organized by grouping related aliases together. This practice makes it easier to find and modify them later.
- **Test**: After adding new aliases, test them to ensure they work as expected. This step will help avoid disruptions in your workflow.

```{note}
You can add `shopt -s expand_aliases` to your shell configuration file (`~/.bashrc`) to enable alias expansion in your SLURM batch jobs. However, you will need to use `source ~/.bashrc` in your batch job submission script.
```
