# Fairshare Policy


## Fairshare

The Kempner cluster uses a system called fairshare to determine prioritization and which jobs run when. The fairshare algorithm prioritizes a balanced allocation of resources, aimed at facilitating the timely completion of tasks from various user groups. This means that jobs, particularly those that are resource intensive or are being run in labs with high recent usage, may not run immediately or on demand. 

As an approved user of the Kempner cluster, you will be part of one or more [fairshare groups (called slurm accounts)](resource_management:understanding_slurm:slurm_accounts), through which you receive a share of the cluster resources.  For more information, please see the [Cluster Governance guidelines](https://sites.harvard.edu/kempner/computing/).

```{tip}
One common misconception around fairshare is that a given user or lab should have access at any given moment to exactly "their share" of the cluster. Instead, fairshare guarantees access to resources averaged over a period of several months. At any given moment, a user or lab may be using a greater or lesser amount of their available share.
```

A fairshare score is computed for each fairshare group (SLURM account) based on the prior usage of the cluster by that group and their share of the cluster (the fraction of the cluster the account has been granted). Note that for some accounts, such as lab accounts, the share is determined by the lab. Individual users do not have their own subshares of the lab share. This means that if a lab has collectively been overusing the cluster, individual members of that lab may have a low fairshare score even if they were not running jobs. 


## Job Priority
When you submit a job, a priority number will be calculated for that job, which determines the position of the job in the pending queue. This priority number is calculated based on a few factors: your fairshare score and the job age. This secondary factor ensures that jobs that have been waiting for a while to run are increasing in priority over time. This means that jobs from accounts with low fairshare will eventually run. You can see the Pending queue of jobs for a partition (such as `kempner`) by running `showq -o -p <partitionname>`. 

```{seealso}
Find a more complete explanation of fairshare scores and priority calculations [here](https://docs.rc.fas.harvard.edu/kb/fairshare/).
```

