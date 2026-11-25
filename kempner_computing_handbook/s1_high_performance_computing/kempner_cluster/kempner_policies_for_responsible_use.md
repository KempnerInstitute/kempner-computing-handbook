# Cluster Usage Policies


## Expected use cases

Users are expected to use the Kempner cluster solely for Kempner-related research that they are conducting themselves. It is not permitted to use cluster access to run jobs for other people or for projects unrelated to Kempner research.


## Good citizenship on the cluster

We don’t limit jobs on the basis of size and encourage users to use capacity when it is available. However, even with efficient code, users submitting large jobs may monopolize resources on the cluster and prevent others from being able to engage in research.  Thus, we rely on users to act in good faith and use consideration when submitting jobs.

Please use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition if you want to try out something resource intensive but not urgent. This work may be requeued by higher priority work, so you should implement checkpointing in the event that something higher priority interrupts your run.

The GPU partitions are for GPU jobs only, and every job on them must request a GPU. Run CPU-only work on the `kempner_cpu` partition; see {ref}`CPU-only jobs <kempner_cluster:kempner_cpu_partition>`. There are four types of Kempner Institute nodes on the cluster: Nodes with A100 40GB GPUs (`kempner` partition), nodes with H100 80GB GPUs (`kempner_h100` partition), nodes with H200 141GB GPUs (`kempner_h200` partition), and nodes with RTX6000 96GB GPUs (`kempner_rtx`). The RTX nodes have 8 GPUs and other nodes have 4 GPUs. Jobs should be submitted with **no more than**:

- 16 cores and 240 GB per GPU for the `kempner` partition,
- 16 cores and 328 GB per GPU for the `kempner_h100` partition,
- 16 cores and 360 GB per GPU for the `kempner_h200` partition, and
- 16 cores and 180 GB per GPU for the `kempner_rtx` partition.

On `kempner_h100`, a job that does not set `-c` or `--mem` gets 16 cores and 328 GB per GPU. The `kempner_requeue` partition allows at most 16 cores and 328 GB per GPU on every node type, so a job that needs more than 328 GB per H200 GPU must use `kempner_h200`.

::::{important}
Total GPU usage across the `kempner`, `kempner_h100`, `kempner_h200`, and `kempner_rtx` partitions is capped for each user and each Kempner account:

- Each **user** may hold at most **16 GPUs** at once, summed across these four partitions.
- Each **account** (for example, `kempner_<lab>_lab`) may hold at most **96 GPUs** at once, summed across these four partitions.
- The `kempner_undergrads` account has a lower cap of **4 GPUs** at once across these four partitions.

Each of these partitions also has a **2-day runtime limit** per job. The caps cover only these four partitions; the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition is not subject to them, so it can be used for additional capacity.
::::

If you need more capacity than these caps allow, please adhere to the following guidelines:

- Use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition. This allows jobs to be preempted by other jobs and then restarted, thus allowing large jobs to run without disrupting access for the rest of the community.
- If not using the requeue partition, only submit jobs when there is significant excess capacity and actively monitor the cluster (hourly) to ensure that there are still resources available for other users.
- Use a run-time limit to prevent large jobs from running for a long period of time unexpectedly.
- Consider running the job with a smaller number of GPUs over a longer time-period.

If none of the above strategies will work, users should submit a [reservation request](https://docs.google.com/forms/d/e/1FAIpQLSflr2ksP44isrgqpahRQCUD3mw8AKwUaLM0fU0aMDtVzoACVQ/viewform) (see [Cluster Governance Guideline](https://kempnerinstitute.harvard.edu/kempner-community/)) so that large projects can be planned and communicated to the community, limiting disruptions for other users.  


::::{warning}
Users who monopolize cluster resources may have jobs canceled without notice, have fairshare significantly reduced, and in serious or repeated circumstances, may lose access to the cluster.
::::

(kempner_cluster:kempner_cpu_partition)=
## CPU-only jobs

Use the `kempner_cpu` partition for work that does not need a GPU, such as agentic workflows, data preprocessing, evaluation, and analysis. It runs on the 96 H100 nodes and uses up to 32 cores of each node, 3,072 cores in total. The other 64 cores of each node serve GPU jobs.

- **Per job.** Up to 32 cores and 128 GB of memory.
- **Per user.** Up to 32 cores and 128 GB across all your `kempner_cpu` jobs, for example one 32-core job or four 8-core jobs. Extra jobs wait in the queue until earlier jobs finish.
- **Per account.** Up to 256 cores across all users of a lab account.
- **Memory.** 4 GB per core is both the default and the maximum. Keep `--mem` at or below 4 GB times `-c`. If you ask for more, SLURM adds cores to match, and these cores count toward your 32.
- **Time limit.** Set one with `-t`, up to 7 days. A job without a time limit is rejected.
- **No GPUs and no whole nodes.** Do not request a GPU or `--exclusive`.

```bash
sbatch -p kempner_cpu -A <your_account> -t 1-00:00:00 -c 8 --mem=32G job.sh
```

A new job can show the pending reason "Nodes required for job are DOWN, DRAINED or reserved for jobs in higher priority partitions" for about a minute before it starts. This is normal.


## Efficient use of resources

Please be mindful of how you use this resource to ensure everyone gets to use it as much as possible. Try to write efficient code that takes advantage of the GPUs you are requesting. Be mindful about tools like Jupyter notebooks, as it is easy to accidentally bog down the cluster. 

## Communication

Please ensure you are in the `#cluster-users` Slack channel in the Kempner Slack space. Make use of this channel if you run into any issues. 

