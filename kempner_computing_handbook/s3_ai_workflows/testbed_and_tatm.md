# Data Discovery and Tokenization

The Research and Engineering team at the Kempner Institute is actively developing a testbed to support AI/ML research and development. The testbed is a collection of hardware and software resources that are used to test and validate new AI/ML models, algorithms, and tools. Currently
the primary focus of the testbed is easing access and exploration of data, through the `tatm` python library. Specific details on using `tatm` can be found in the [tatm documentation](https://kempnerinstitute.github.io/tatm/), but key points regarding Kempner specific usage are detailed below.

## Using `tatm` on the Kempner AI Cluster

You should follow the instructions in the [tatm documentation](https://kempnerinstitute.github.io/tatm/getting_started.html) to install the `tatm` library. Once you have installed `tatm`, you can use it to access data on the Kempner AI cluster. The `tatm` library provides a simple interface to access data on the cluster, and it is designed to be easy to use. In order to take advantage of the semantic name resolution provided by `tatm`, you need to 
be using at least version `0.2.0` of the library and have the the `TATM_BASE_DIR` environment variable set to `/n/holylfs06/LABS/kempner_shared/Everyone/testbed` (the path to the root of the data directory on the cluster). Path based data access will still work if you do not have the `TATM_BASE_DIR` environment variable set. 

For a brief overview of loading data using `tatm`, you can refer to the guide in the documentation [here](https://kempnerinstitute.github.io/tatm/text_dataset.html) which covers basic use of the `get_dataset` function.

## Online Data Exploration

In order to support exploration of data available, we have deployed an online data exploration tool. This tool allows you to search for data available on the cluster, and provides the command to load the data using `tatm`. You can access the online data exploration tool at [https://data.eng.kempnerinstitute.harvard.edu](https://data.eng.kempnerinstitute.harvard.edu). THe username to log in is `kempneruser@kempner.edu` and the password is `K3mpnerData!`.

## Using `tatm` with OLMo

We have built support for custom PyTorch datasets (including those output by the `tatm` `get_dataset` function) into the 
[Kempner fork of OLMo](https://github.com/KempnerInstitute/OLMo). We've also had a PR accepted
into the [main AllenAI branch of OLMo](https://github.com/allenai/OLMo) bringing that support into the mainline 
codebase which should be available in future releases. In order to use data made available by `tatm` with OLMo, you will
need to utilize that custom dataset support. The following `data` section of the OLMo config file is an example of how to do this:

```{yaml}
data:
  pad_direction: right
  num_workers: 2
  drop_last: true
  pin_memory: true
  prefetch_factor: 1
  persistent_workers: true
  timeout: 0
  custom_dataset:
    name: "tatm.data.get_dataset"
    args:
      metadata: "Red Pajama v1-tokenized_t5-base_arxiv"
      context_length: 2048
    collate_config:
      input_id_field: "token_ids"
```

The `custom_dataset` provides OLMo the necessary information to load the dataset. The `name` section provides the name of the python object or function that will return a Pytorch dataset object (in this case the `tatm.data.get_dataset` function). The `args` section specifies the keyword arguments to the function or class constructor in `name`. For these specfic arguments, the `metadata` field specifies the semantic name of the dataset to load and can also be used to point to a metadata file on disk or a directory containing a metadata file, and the `context_length` field specifies the length of the input sequences. The `collate_config` section specifies how to collate the data into batches. In this case, we are using the custom collator in OLMo which maps output fields in a custom class to expected fields in the OLMo model. The `input_id_field` specifies the name of the field in the dataset that contains the input IDs. This maps the `token_ids` field in the dataset to the `input_ids` field in the OLMo dataset.

Using this config in an environment with OLMo and `tatm` installed and running OLMo as normal should allow you to load the dataset and train a model using the data.

### Known Issues

- We have observed memory issues when using `tatm` datasets in contexts where multiple copies of the dataset object are created in multiple processes with the torch DistributedSampler and when new processes are created with the `spawn` method. We are working to identify the root cause of this issue and will update this document when we have more information. In the meantime, we recommend using a small number of worker processes alongside large amounts of host memory to avoid this issue. Spawning processes with `fork` is also recommended if possible, although this is not always possible in the context of OLMo. 