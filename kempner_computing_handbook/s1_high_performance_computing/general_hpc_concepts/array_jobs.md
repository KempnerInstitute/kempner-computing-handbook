(resource_management:array_jobs)=
# Array Jobs

Array jobs in SLURM are particularly useful for machine learning (ML) research because they enable the running of multiple instances of the same job, allowing users to map them to different parameters, datasets, etc. A couple of use cases for array jobs include:

- **Parameter Sweeps**: Automate hyperparameter testing with array jobs, running multiple configurations in parallel for faster tuning.
- **Cross-Validation**: Parallelize cross-validation by treating each fold as a separate array job, accelerating model training.
- **Dataset Comparison**: Use array jobs to test models on different datasets simultaneously, simplifying performance comparison.
- **Algorithm Comparison**: Compare algorithms efficiently by running each as an individual array job, facilitating easy performance assessment.
- **Large-scale Inference**: Leverage array jobs to spread large-scale inference tasks across multiple nodes, speeding up processing.


## Submitting Array Jobs

To submit an array job, you need to specify the number of tasks in the array and the range of task IDs. And in your implementation, you need to add logic to read the task ID and use it to determine the specific configuration or data to use for that task. 

```{tip}
Make sure that your code works correctly with one set of parameters before running it as an array job. This will help you identify and fix any issues (e.g., lack of sufficient resources, incorrect path, module loads) that may arise when running multiple tasks in parallel.
```
All you need to do is add the job array directive to your job script. 

```bash
#SBATCH --array=1-12
```

This executes 12 parallel tasks, each assigned a unique task ID ranging from 1 to 12. Within your script, the `$SLURM_ARRAY_TASK_ID` environment variable grants access to the task ID. For array jobs with a high number of tasks, employing the `%` operator limits how many tasks run at once. This approach is advised to lessen the burden on both the scheduler and cluster resources.

```{note}
Prepare the SLURM directives and resources as though for a single job; each task in the array job will inherit these settings.
```

The following is an example of a simple array job script that runs 12 tasks (max 4 tasks at a time) in parallel. To follow this example, create a folder, and inside the folder create the following files: 
    - `hyperparameters.csv`
    - `hyperparameter_tuning.py`
    - `run.sh`

Here is the content of each file:

*`hyperparameters.csv`*
```bash
learning_rate,batch_size,num_epochs
0.01,32,10
0.001,64,20
0.0001,128,30
0.02,16,5
0.005,48,15
0.002,96,25
0.0005,24,35
0.01,40,10
0.0015,56,20
0.0002,112,30
0.02,28,40
0.003,80,50
```
*`hyperparameter_tuning.py`*
```python
import csv
import argparse
import time

def read_hyperparameters(task_id, file_path):
    """
    Reads the hyperparameters from a CSV file for the given task ID.
    """
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for i, row in enumerate(reader):
            if i == task_id:
                return row
    return None


def main():
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('--task_id', type=int, required=True, 
                        help='SLURM task ID')
    args = parser.parse_args()

    # Read the hyperparameters for the given task ID
    hyperparameters = read_hyperparameters(args.task_id,
                                           'hyperparameters.csv')

    if hyperparameters is not None:
        # Write the hyperparameters to an output file
        output_file = f'output_{args.task_id}.txt'
        with open(output_file, 'w') as f:
            for key, value in hyperparameters.items():
                f.write(f'{key}: {value}\n')
        print(f"Hyperparameters for task {args.task_id} written to {output_file}")

        # Sleep for 10 minutes
        print("Sleeping for 10 minutes...")
        time.sleep(600)  
    else:
        print(f"No hyperparameters found for task {args.task_id}")

if __name__ == "__main__":
    main()
```

*`run.sh`*
```bash
#!/bin/bash
#SBATCH --job-name=job-array
#SBATCH --account=kempner_dev
#SBATCH --output=%A_%a.out
#SBATCH --nodes=1           
#SBATCH --ntasks-per-node=1
#SBATCH --gpus-per-node=1 
#SBATCH --cpus-per-task=1
#SBATCH --time=30:00
#SBATCH --mem=12GB
#SBATCH --partition=kempner
#SBATCH --array=1-12%4

module load python

python hyperparameter_tuning.py --task_id $SLURM_ARRAY_TASK_ID
```
This script will run 12 tasks in parallel (max 4 tasks at a time) using the hyperparameters from the `hyperparameters.csv` file. Each task will write its hyperparameters to an output file and sleep for 10 minutes. The output files will be named `output_<task_id>.txt`. Many different configurations can be tested in parallel using this approach.
