# The Kempner Testbed and `tatm`

The research and engineering team at the Kempner Institute is actively developing a testbed to support AI/ML research and development. The testbed is a collection of hardware and software resources that are used to test and validate new AI/ML models, algorithms, and tools. Currently
the primary focus of the testbed is easing access and exploration of data, through the `tatm` python library. Specific details on using `tatm` can be found in the [tatm documentation](https://kempnerinstitute.github.io/tatm/), but key points regarding Kempner specific usage are detailed below.

## Using `tatm` on the Kempner HPC Cluster

You should follow the instructions in the [tatm documentation](https://kempnerinstitute.github.io/tatm/getting_started.html) to install the `tatm` library. Once you have installed `tatm`, you can use it to access data on the Kempner HPC cluster. The `tatm` library provides a simple interface to access data on the cluster, and it is designed to be easy to use. In order to take advantage of the semantic name resolution provided by `tatm`, you need to 
be using at least version `0.2.0` of the library and have the the `TATM_BASE_DIR` environment variable set to `/n/holylfs06/LABS/kempner_shared/Everyone/testbed` (the path to the root of the data directory on the cluster). Path based data access will still work if you do not have the `TATM_BASE_DIR` environment variable set. 

## Online Data Exploration

In order to support exploration of data available, we have deployed an online data exploration tool. This tool allows you to search for data available on the cluster, and provides the command to load the data using `tatm`. You can access the online data exploration tool at [https://data.eng.kempnerinstitute.harvard.edu](https://data.eng.kempnerinstitute.harvard.edu). THe username to log in is `kempneruser@kempner.edu` and the password is `K3mpnerData!`.