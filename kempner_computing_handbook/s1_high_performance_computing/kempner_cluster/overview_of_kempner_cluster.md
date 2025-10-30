# Overview of Cluster

The Kempner institute has dedicated compute resources for its mission toward advanced research on intelligence from biological, cognitive, and computational perspectives. 

## What is the Kempner Institute AI Cluster?

The Kempner cluster is a cluster of data center GPUs stacked in servers and racks, networked in such a way that the entire cluster can be utilized for both serial and distributed GPU workflows. The Kempner Institute collaborates with FAS Research Computing [FASRC](https://www.rc.fas.harvard.edu/) on the infrastructure and maintenance of this cluster.

## Who is eligible to use the Kempner Institute AI Cluster?

In general terms, the cluster is reserved for individuals who are either associated with a lab that is affiliated with the Kempner Institute or those who are engaged in a project that has received approval from the Kempner Institute.


## What are the specifications of the Kempner Institute AI Cluster?

The following table provides an overview of the Kempner Institute AI cluster:

| Specification             | A100 40GB                                      | H100 80GB                                             |
|---------------------------|------------------------------------------------|-------------------------------------------------------|
| **Total GPUs**            | 144                                            | 384                                                   |
| **Servers (per rack)**    | 36                                             | 24                                                    |
| **GPUs per Server**       | 4                                              | 4                                                     |
| **CPU Cores per Server**  | 64                                             | 96                                                    |
| **RAM per Server**        | 1 TB                                           | 1.5 TB                                                |


```{figure} figures/svg/cluster_diagram.svg
---
height: 500 px
name: Diagram of AI Cluster
---
This is a diagram of the Kempner AI cluster within the FASRC infrastructure showing the arrangement of nodes, networking, and storage systems.
```

Currently, there are five GPU racks in production at the Massachusetts Green High Performance Computing Center (MGHPCC): one A100 GPU rack and four H100 GPU racks. In the following diagram, these racks are shown along with a network core designed for non-blocking communication between GPUs.


```{figure} figures/svg/Clusters_1.svg
---
height: 500 px
name: GPU Racks and Network Core
---
This is a diagram of the GPU racks and network core.
```


## Can I buy into the Kempner Institute AI Cluster?

If you have a Kempner Institute affiliation, you may request to contribute funds towards a Kempner cluster purchase. If you contribute funds we will increase your priority on the cluster to reflect the proportion of the cluster you have contributed. Please see the Cluster Governance guidelines for more information: https://sites.harvard.edu/kempner/computing/

## How is priority set on the Kempner Institute AI Cluster?

Priority is set through Fairshare scheduling.   For more information, please see the Cluster Governance guidelines: https://sites.harvard.edu/kempner/computing/


## Can I reserve GPUs on the Kempner Institute AI Cluster?

Generally we hope to have enough GPUs available on the cluster for most use cases.  However, for situations in which you need a large number of GPUs that are dedicated for a period of time, or need a smaller subset for a longer period of time, you can make a reservation request. Please see the full governance guidelines for further details: https://sites.harvard.edu/kempner/computing/

## Where is the Kempner Institute AI Cluster located physically?

The cluster is located at the [Massachusetts Green High-Performance Computing Center](https://www.mghpcc.org) (MGHPCC) in Holyoke, MA. This is a state-of-the-art datacenter that is shared among the Boston-area universities. It runs off of hydropower, making it one of the “greenest” computing centers in the world. FASRC also provides co-located [storage resources](https://docs.rc.fas.harvard.edu/kb/storage-service-center/) at MGHPCC.
