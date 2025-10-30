# Intro to Parallel Computing

## Parallelizing Computations in High-Performance Computing (HPC)

Parallel computing is a technique used to enhance computational speeds by dividing tasks across multiple processors or computers/servers. This section introduces the basic concepts and techniques necessary for parallelizing computations effectively within a High-Performance Computing (HPC) environment.

### Loosely vs. Tightly Coupled Parallelism
**Loosely Coupled Parallelism**: In this model, each processor operates independently, with minimal need for communication. This is often used in distributed computing environments where tasks do not require constant interaction.

**Tightly Coupled Parallelism**: Contrasts with loosely coupled parallelism by featuring processors that work in close coordination, often requiring frequent data exchanges. This model is typical in systems with shared memory.

### Shared vs. Distributed Memory
**Shared Memory**: In a shared memory model, multiple processors access the same memory space. This allows for efficient communication but requires careful management to avoid conflicts.

**Distributed Memory**: Each processor has its own private memory in distributed memory models. Processors communicate by passing messages, which suits large, distributed systems.

### Parallel Programming Models
Parallel programming models are frameworks or paradigms that guide the development of parallel software.

**Message Passing Interface (MPI)**: A standard for passing messages between processes in a distributed memory system. Ideal for high scalability across multiple nodes.


```{figure} figures/png/mpi.png
---
height: 300px
name: MPI Workflow Diagram
---
MPI Workflow Diagram (*Credit: [hpc.nmsu.edu](https://hpc.nmsu.edu/discovery/mpi/introduction/)*)
```

**OpenMP (Open Multi-Processing)**: A model for shared-memory parallelism, suitable for multi-threading within a single node. It simplifies parallelism by allowing the addition of parallel directives into existing code.


```{figure} figures/png/openmp.png
---
height: 300px
name: OpenMP Architecture Diagram
---
OpenMP Architecture Diagram (*Credit: [nersc.gov](https://docs.nersc.gov/development/programming-models/openmp/)*)
```

**CUDA (Compute Unified Device Architecture)**: A parallel computing platform and application programming interface (API) model created by NVIDIA. It allows software developers to use a CUDA-enabled graphics processing unit (GPU) for general purpose processing.

```{figure} figures/png/gpu.png
---
height: 650px
name: CUDA Programming Model Diagram
---
CUDA Programming Model Diagram (*Credit: [nvidia.com](https://docs.nvidia.com/cuda/cuda-c-programming-guide/index.html)*)
```
