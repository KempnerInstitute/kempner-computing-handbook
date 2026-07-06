# Cluster Usage Policies


## Expected use cases

Users are expected to use the Kempner cluster solely for Kempner-related research that they are conducting themselves. It is not permitted to use cluster access to run jobs for other people or for projects unrelated to Kempner research.


## Good citizenship on the cluster

We don’t limit jobs on the basis of size and encourage users to use capacity when it is available. However, even with efficient code, users submitting large jobs may monopolize resources on the cluster and prevent others from being able to engage in research.  Thus, we rely on users to act in good faith and use consideration when submitting jobs.

Please use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition if you want to try out something resource intensive but not urgent. This work may be requeued by higher priority work, so you should implement checkpointing in the event that something higher priority interrupts your run.

The cluster should never be used for CPU-only jobs. There are four types of Kempner Institute nodes on the cluster: Nodes with A100 40GB GPUs (`kempner` partition), nodes with H100 80GB GPUs (`kempner_h100` partition), nodes with H200 141GB GPUs (`kempner_h200` partition), and nodes with RTX6000 96GB GPUs (`kempner_rtx`). The RTX nodes have 8 GPUs and other nodes have 4 GPUs. Jobs should be submitted with **no more than**:

- 16 cores and 240 GB per GPU for `kempner` partition, and 
- 24 cores and 360 GB per GPU for `kempner_h100` partition.  
- 16 cores and 360 GB per GPU for `kempner_h200` partition, and 
- 16 cores and 190 GB per GPU for `kempner_rtx` partition.  

::::{important}
Users should not submit jobs that utilize more than the following cluster resources or that run for extended periods. Given the current resources, the limits in each partition are:

- 8 A100 GPUs across up to 4 nodes in the `kempner` partition, and a 2-day runtime limit.
- 8 H100 GPUs across up to 4 nodes in the `kempner_h100` partition, and a 2-day runtime limit.
- 8 H200 GPUs across up to 4 nodes in the `kempner_h200` partition, and a 2-day runtime limit.
- 8 RTX6000 GPUs across up to 4 nodes in the `kempner_rtx` partition, and a 2-day runtime limit.

See the following guidelines for jobs that exceed this limit.
::::

If your job exceeds this predefined limit, please adhere to the following guidelines:

- Use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition. This allows jobs to be preempted by other jobs and then restarted, thus allowing large jobs to run without disrupting access for the rest of the community.
- If not using the requeue partition, only submit jobs when there is significant excess capacity and actively monitor the cluster (hourly) to ensure that there are still resources available for other users.
- Use a run-time limit to prevent large jobs from running for a long period of time unexpectedly.
- Consider running the job with a smaller number of GPUs over a longer time-period.

If none of the above strategies will work, users should submit a reservation request (see [Cluster Governance Guideline](https://kempnerinstitute.harvard.edu/kempner-community/)) so that large projects can be planned and communicated to the community, limiting disruptions for other users.  


::::{warning}
Users who monopolize cluster resources may have jobs canceled without notice, have fairshare significantly reduced, and in serious or repeated circumstances, may lose access to the cluster.
::::


## Efficient use of resources

Please be mindful of how you use this resource to ensure everyone gets to use it as much as possible. Try to write efficient code that takes advantage of the GPUs you are requesting. Be mindful about tools like Jupyter notebooks, as it is easy to accidentally bog down the cluster. 

## Communication

Please ensure you are in the `#cluster-users` slack channel in the Kempner slack space. Make use of this channel if you run into any issues. 

