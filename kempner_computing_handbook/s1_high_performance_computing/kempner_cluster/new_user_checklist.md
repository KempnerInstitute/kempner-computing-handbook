(kempner_cluster:new_user_checklist)=
# New User Checklist

Use this checklist when onboarding to the Kempner AI cluster for the first time. It is intended as a step-by-step path through the main setup tasks, with links to the handbook sections that explain each topic in more detail.

## Before Requesting Access

- [ ] Confirm that your work is eligible for Kempner AI cluster access. See {doc}`Overview of Cluster <overview_of_kempner_cluster>`.
- [ ] Review the expected use cases, fair-use expectations, GPU-only policy, and communication norms in {doc}`Cluster Usage Policies <kempner_policies_for_responsible_use>`.


## Request Your FASRC and Kempner AI Cluster Account

### FASRC Account

If you already have a FASRC account set up, you may jump to the *Kempner AI Cluster Account* section below.

- [ ] Request a FASRC account through the [FASRC account request portal](https://portal.rc.fas.harvard.edu/request/account/new).
- [ ] Select the correct PI and approver for your role. See {doc}`Introduction and Basics <introduction_and_cluster_basics>`.
- [ ] Wait for your approver to approve the account request in the FASRC portal.
- [ ] Set your FASRC account password when your account is created.

### Kempner AI Cluster Account

Once you have an active FASRC account, you can request access to the Kempner AI cluster:

- [ ] Reach out to your PI and fill out the Kempner AI cluster account request form. Your PI will guide you through the form. See {doc}`Introduction and Basics <introduction_and_cluster_basics>` for whom to contact.
- [ ] Allow up to two business days for the PI to confirm approval and for the account to be set up on the Kempner AI cluster.
- [ ] If you have not heard back, email [rchelp@rc.fas.harvard.edu](mailto:rchelp@rc.fas.harvard.edu) with the subject `kempner cluster account`.

## Set Up Required Authentication

- [ ] Install and configure OpenAuth two-factor authentication. See {ref}`kempner_cluster:installing_openauth_2fa`.
- [ ] Install the Cisco Secure Client (formerly AnyConnect) if you plan to use Open OnDemand or other VPN-only FASRC services.
- [ ] Configure the FASRC VPN using `vpn.rc.fas.harvard.edu`. See {doc}`Accessing the Cluster <accessing_and_navigating_the_cluster>`.
- [ ] Confirm that you can generate an OpenAuth code from your phone, password manager, Duo Mobile, or Java desktop app.

## Log In for the First Time

- [ ] Connect by SSH:

  ```bash
  ssh <username>@login.rc.fas.harvard.edu
  ```

  See {ref}`ssh_access`.

- [ ] Confirm that you can log in with your FASRC password and OpenAuth code.
- [ ] Remember that login nodes are for file management, job submission, and lightweight tasks only. Do not run compute-heavy code on login nodes.
- [ ] If you prefer a browser interface, connect to the VPN and open [Open OnDemand](https://vdi.rc.fas.harvard.edu/). See {ref}`ondemand_access` and {ref}`general_hpc_concepts:open_ondemand`.

## Learn Where Files Should Go

- [ ] Find your home directory (`/n/home<NN>/<username>`) and understand its 100 GB persistent storage limit. Check current usage with `df -h ~/`. See {doc}`Storage Options <../storage_and_data_transfer/understanding_storage_options>`.
- [ ] Find your lab directory at `/n/holylabs/LABS/<your_lab_name>` for persistent lab storage (4 TB per lab). See {doc}`Storage Options <../storage_and_data_transfer/understanding_storage_options>`.
- [ ] Find your scratch directory under `$SCRATCH/<your_lab_name>` (typically `/n/netscratch/<your_lab_name>`) for active high-performance work (50 TB per lab), and review the 90-day scratch retention policy. See {doc}`Storage Options <../storage_and_data_transfer/understanding_storage_options>`.
- [ ] Choose an appropriate data transfer method before moving files: `scp` or `rsync` for smaller transfers, and Globus for large transfers. See {ref}`storage_and_data_transfer:data_transfer`.

## Set Up a Working Environment

- [ ] Learn how to inspect and load software modules with `module avail`, `module load`, `module list`, and `module purge`. See {ref}`development_and_runtime_envs:software_module_and_environment_management`.
- [ ] Configure conda to use `conda-forge` as the default channel. See {ref}`development_and_runtime_envs:using_conda_env:conda_forge_default`.
- [ ] Create a project-specific conda environment. See {ref}`development_and_runtime_envs:using_conda_env:creation`.
- [ ] If you will use Jupyter or JupyterLab, install `ipykernel` in your conda environment. See {ref}`development_and_runtime_envs:using_conda_env:jupyter`.
- [ ] If you will use VSCode, review the remote development workflow in {ref}`development_and_runtime_envs:using_vscode_for_remote_development`.

## Run a First GPU Job

- [ ] Learn the basics of SLURM partitions, accounts, and job submission. The Kempner partitions are GPU-only, so every job must request a GPU with `--gres=gpu:`. See {doc}`Understanding SLURM <../general_hpc_concepts/understanding_slurm>`.
- [ ] Identify which SLURM (fairshare) account you should charge jobs to. If you are in multiple groups, confirm the right account before submitting jobs.
- [ ] Start with a small interactive GPU allocation to test your environment, then connect to the allocated node. See {doc}`Job Submission Basics <../general_hpc_concepts/job_submission_basics>`.

  ```bash
  salloc --partition=kempner --account=<your_account> --time=0-01:00 --mem=64G --gres=gpu:1 --cpus-per-task=16
  ```

- [ ] Submit a small batch job with `sbatch` after your interactive test works. See {ref}`resource_management:job_submission_basics:batch_jobs`.
- [ ] Check that your job requests a GPU and uses Kempner resources responsibly. Revisit {doc}`Cluster Usage Policies <kempner_policies_for_responsible_use>` before scaling up.

## Get Help and Stay Connected

- [ ] Join the `#cluster-users` channel in the Kempner Slack space.
- [ ] Use the Kempner Slack channel for Kempner-specific workflow questions, community advice, and handbook update suggestions.
- [ ] Review FASRC training and support options in {doc}`Support and Troubleshooting <../../s8_support/README>`.
- [ ] Direct your questions to [rchelp@rc.fas.harvard.edu](mailto:rchelp@rc.fas.harvard.edu) with the subject line containing the word `kempner`, such as `kempner account setup`.
