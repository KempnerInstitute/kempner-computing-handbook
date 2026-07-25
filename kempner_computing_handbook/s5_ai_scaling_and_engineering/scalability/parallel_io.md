(parallel_io)=
# Parallel I/O

In AI and ML workloads, storage I/O is often the real bottleneck: if data cannot reach the GPUs fast enough, expensive accelerators sit idle. This page covers matching data to the right filesystem, striping on Lustre, feeding the GPUs, parallel file formats, and efficient checkpointing.

## Choosing a filesystem

The cluster provides filesystems with very different performance characteristics. Match the filesystem to the access pattern:

| Storage | Path | Type | Best for |
|---|---|---|---|
| Scratch | `/n/netscratch/<lab>` | VAST (all-flash) | Active training data, checkpoints, high-IOPS and random small-file reads |
| Lustre | `/n/holylfs*` | parallel filesystem | Large files read or written with high sequential bandwidth |
| Home | `/n/home<NN>` | NFS | Code and small configs, not heavy I/O |
| Node-local | `/tmp` | local SSD | Per-node cache of hot data during a job (cleared when the job ends) |

```{tip}
For active training, keep your working data on scratch (`$SCRATCH/<lab>`, VAST). Its all-flash design handles the many small, random reads of ML data loading far better than a disk-based parallel filesystem. See {doc}`Storage Options <../../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>` for quotas and the 90-day scratch policy.
```

```{warning}
Do not run I/O-heavy jobs against your home directory. It is a small NFS share and is easily overwhelmed.
```

## Lustre striping for large files

On Lustre (`/n/holylfs*`), each file is split into stripes spread across Object Storage Targets (OSTs). Reading or writing a striped file uses several OSTs at once, so aggregate bandwidth grows with the stripe count. The default is a single stripe of 1 MB:

```bash
lfs getstripe -d /n/holylfs06/LABS/<lab>   # show a directory's default layout
lfs setstripe -c 8 -S 1M <directory>       # 8 stripes, 1 MB stripe size
```

Striping is set per directory and applies only to files created afterward. For files whose size varies a lot, a Progressive File Layout adds stripes as the file grows:

```bash
# 1 stripe up to 2 GB, then 4 stripes to 4 GB, then 16 stripes beyond
lfs setstripe -E 2G -c 1 -E 4G -c 4 -E -1 -c 16 <file>
```

```{warning}
Stripe only large files. Spreading many small files across OSTs adds overhead and hurts performance, so leave small-file directories at the default single stripe. VAST scratch is not Lustre and needs no striping.
```

See {doc}`Storage Options <../../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>` for the full striping workflow, including how to re-stripe existing data.

## Keeping the GPUs fed

```{warning}
The most common ML I/O mistake is storing a dataset as millions of tiny files, one per image or sample. Every file open is a metadata operation, and metadata is the slowest part of any shared filesystem, so data loading stalls the GPUs.
```

**Shard your dataset.** Pack many samples into a few large files and read them sequentially. [WebDataset](https://github.com/webdataset/webdataset) stores samples in `tar` shards:

```python
import webdataset as wds

# Write: many samples into a few shards (a new shard every 10,000 samples).
with wds.ShardWriter("data-%06d.tar", maxcount=10000) as sink:
    for i, (array, label) in enumerate(samples):
        sink.write({"__key__": f"{i:06d}", "npy": array, "cls": str(label)})

# Read: stream shards through the WebDataset pipeline.
dataset = (wds.WebDataset("data-{000000..000099}.tar", shardshuffle=False)
             .decode()
             .to_tuple("npy", "cls"))
```

The `.cls` field decodes to an integer class index, so use another extension for non-integer labels. Other common sharded formats are [MosaicML Streaming (MDS)](https://github.com/mosaicml/streaming), [TFRecord](https://www.tensorflow.org/tutorials/load_data/tfrecord), and [Parquet](https://parquet.apache.org/).

**Tune the DataLoader.** For a map-style dataset, overlap data loading with GPU compute using several worker processes and prefetching:

```python
from torch.utils.data import DataLoader

loader = DataLoader(
    dataset,
    batch_size=256,
    num_workers=8,           # parallel loading processes
    prefetch_factor=4,       # batches each worker prepares ahead
    pin_memory=True,         # faster host-to-GPU copies
    persistent_workers=True, # keep workers alive between epochs
)
```

```{tip}
Stage hot data close to the GPUs: copy or shard it onto scratch (VAST) or, for data reused every epoch, onto node-local `/tmp` on each node at the start of the job.
```

```{note}
Node-local `/tmp` is fast local disk (the same volume as `/scratch`), so it does not count against your job's memory. Its capacity depends on the GPU node: roughly 400 GB on `kempner` (A100), 840 GB on `kempner_h100` and `kempner_h200`, and 6.9 TB on `kempner_rtx`. It is private to each node and cleared when the job ends, so stage only what fits and copy any results you want to keep back to scratch or a persistent directory.
```

## Chunked and parallel file formats

For large N-dimensional arrays (images, volumes, scientific data), a chunked format lets workers read different chunks in parallel. [Zarr](https://zarr.readthedocs.io) stores each chunk as a separate object:

```python
import zarr
import numpy as np

z = zarr.create_array(store="data.zarr", shape=(10000, 512), chunks=(1000, 512), dtype="f4")
z[:] = np.random.random((10000, 512)).astype("f4")
batch = z[0:1000]   # reads one chunk
```

For tightly coupled MPI jobs that must write a single shared file, **Parallel HDF5** and the lower-level **MPI-IO** let all ranks write collectively. Parallel HDF5 needs an `h5py` built against MPI that matches the cluster's MPI (for example, `conda install -c conda-forge "h5py=*=mpi_openmpi_*"`):

```python
from mpi4py import MPI
import h5py

f = h5py.File("shared.h5", "w", driver="mpio", comm=MPI.COMM_WORLD)
```

```{note}
Choose by data shape: sample-based datasets (images, text) suit shards such as WebDataset; large arrays suit chunked formats such as Zarr or HDF5.
```

## Checkpointing large models

When training across many GPUs, gathering the whole model onto one rank to save it is slow and memory-heavy. PyTorch [Distributed Checkpoint (DCP)](https://docs.pytorch.org/docs/stable/distributed.checkpoint.html) lets every rank write its own shard in parallel:

```python
import torch.distributed.checkpoint as dcp
from torch.distributed.checkpoint.state_dict import get_state_dict, set_state_dict

# Save: each rank writes its shard into the checkpoint directory.
model_sd, optim_sd = get_state_dict(model, optimizer)
dcp.save({"model": model_sd, "optim": optim_sd}, checkpoint_id="ckpt/step-1000")

# Load: DCP loads in place, then the state is applied back to the model.
model_sd, optim_sd = get_state_dict(model, optimizer)
dcp.load({"model": model_sd, "optim": optim_sd}, checkpoint_id="ckpt/step-1000")
set_state_dict(model, optimizer, model_state_dict=model_sd, optim_state_dict=optim_sd)
```

```{note}
A DCP checkpoint is a directory, not a single file: it holds one shard per rank plus a small `.metadata` file. Create the directory before the first save (for example, `os.makedirs(path, exist_ok=True)` on rank 0), and write it to scratch. See the FSDP section in {doc}`Distributed GPU Computing <distributed_gpu_computing>`.
```

```{seealso}
The Kempner Institute's [KempnerForge](https://github.com/KempnerInstitute/KempnerForge) framework for foundation-model training uses DCP for asynchronous checkpointing with auto-resume, on top of FSDP2 and tensor, expert, and pipeline parallelism. See {doc}`KempnerForge <../../s3_ai_workflows/kempnerforge>`.
```

## Best practices

- Put active training data on scratch (VAST); keep heavy I/O off your home directory.
- Shard datasets into large files instead of storing millions of small files.
- Stripe large Lustre files across OSTs; leave small-file directories at the default.
- Tune the `DataLoader` (`num_workers`, `prefetch_factor`, `pin_memory`) so I/O overlaps compute.
- Stage or cache hot data to scratch or node-local `/tmp`.
- Checkpoint large models with Distributed Checkpoint, writing to scratch.
- Measure before optimizing: profile the data-loading step, and use tools such as `ior` or Darshan to characterize I/O.
