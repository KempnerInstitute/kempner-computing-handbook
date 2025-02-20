# Cluster Usage Policies


## Expected use cases

Users are expected to use the Kempner cluster solely for Kempner-related research that they are conducting themselves. It is not permitted to use cluster access to run jobs for other people or for projects unrelated to Kempner research.


## Good citizenship on the cluster

We don’t limit jobs on the basis of size and encourage users to use capacity when it is available. However, even with efficient code, users submitting large jobs may monopolize resources on the cluster and prevent others from being able to engage in research.  Thus, we rely on users to act in good faith and use consideration when submitting jobs.

Please use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition if you want to try out something resource intensive but not urgent. This work may be requeued by higher priority work, so you should implement checkpointing in the event that something higher priority interrupts your run.

The cluster should never be used for CPU-only jobs. There are two types of Kempner Institute nodes on the cluster: Nodes with A100 40GB GPUs (`kempner` partition) and nodes with H100 80GB GPUs (`kempner_h100` partition). All nodes have 4 GPUs. Jobs should be submitted with **no more than**:

- 16 cores and 250 GB per GPU for `kempner` partition, and 
- 24 cores and 375 GB per GPU for `kempner_h100` partition.  

::::{important}
Users should not submit jobs that utilize more than 10% of the cluster resources or that run for extended periods (exceeding 4 hours). Given the current resources, 10% of the cluster comprises:

- 12 A100 GPUs (3 nodes) in the `kempner` partition, and
- 12 H100 GPUs (3 nodes) in the `kempner_h100` partition.

See the following guidelines for jobs that exceed this limit.
::::

If your job exceeds this predefined limit, please adhere to the following guidelines:

- Use the [Kempner requeue](https://docs.rc.fas.harvard.edu/kb/kempner-partitions/) partition. This allows jobs to be preempted by other jobs and then restarted, thus allowing large jobs to run without disrupting access for the rest of the community.
- If not using the requeue partition, only submit jobs when there is significant excess capacity and actively monitor the cluster (hourly) to ensure that there are still resources available for other users.
- Use a run-time limit to prevent large jobs from running for a long period of time unexpectedly.
- Consider running the job with a smaller number of GPUs over a longer time-period.

If none of the above strategies will work, users should submit a reservation request (see [Cluster Governance Guideline](https://sites.harvard.edu/kempner/computing/)) so that large projects can be planned and communicated to the community, limiting disruptions for other users.  


::::{warning}
Users who monopolize cluster resources may have jobs canceled without notice, have fairshare significantly reduced, and in serious or repeated circumstances, may lose access to the cluster.
::::


## Efficient use of resources

Please be mindful of how you use this resource to ensure everyone gets to use it as much as possible. Try to write efficient code that takes advantage of the GPUs you are requesting. Be mindful about tools like Jupyter notebooks, it is easy to accidentally bog down the cluster. 

## Communication

Please ensure you are in the `#cluster-users` slack channel in the Kempner slack space. Make use of this channel if you run into any issues. 

