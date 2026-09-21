# Open Source Hub

Welcome to the Open Source Hub of Kempner Institute's Research Engineering Team! This page catalogs all our open-source contributions across various domains, including AI, Agentic AI, NeuroAI, Research Software Engineering, AI Cluster, High-Performance Computing, and Cloud Computing.  

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
  }

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f8f9fa;
    font-weight: bold;
    cursor: pointer;
  }

  th:hover {
    background-color: #e9ecef;
  }

  tr:nth-child(even) {
    background-color: #f8f9fa;
  }

  tr:hover {
    background-color: #f1f3f5;
  }

  a {
    color: #007bff;
    text-decoration: none;
    font-weight: bold;
  }

  a:hover {
    text-decoration: underline;
  }
</style>

<table id="sortable">
  <thead>
    <tr>
      <th title="Click to sort by Name" onclick="sortTable(0)">Name</th>
      <th title="Click to sort by Type" onclick="sortTable(1)">Type</th>
      <th title="Click to sort by Topic" onclick="sortTable(2)">Topic</th>
      <th title="Click to sort by Description" onclick="sortTable(3)">Description</th>
      <th title="Click to sort by Link" onclick="sortTable(4)">Link</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>KempnerForge</td>
      <td>AI Tool</td>
      <td>AI</td>
      <td>PyTorch-native framework for fault-tolerant distributed training of foundation models on AI clusters</td>
      <td><a href="https://github.com/KempnerInstitute/KempnerForge">GitHub</a></td>
    </tr>
    <tr>
      <td>KempnerPulse</td>
      <td>Monitoring Tool</td>
      <td>AI Cluster</td>
      <td>Real-time GPU monitoring dashboard for DCGM metrics</td>
      <td><a href="https://github.com/KempnerInstitute/kempnerpulse">GitHub</a></td>
    </tr>
    <tr>
      <td>KempnerInsight</td>
      <td>Monitoring Tool</td>
      <td>AI Cluster</td>
      <td>Web dashboard for monitoring job-level and cluster-level performance metrics. <a href="../s1_high_performance_computing/kempner_cluster/kempnerinsight.html">Documentation</a></td>
      <td><a href="https://kempnerinsight.eng.kempnerinstitute.harvard.edu/">Website</a></td>
    </tr>
    <tr>
      <td>JobScope</td>
      <td>Command-Line Tool</td>
      <td>AI Cluster</td>
      <td>Reports CPU, memory, and GPU efficiency metrics for completed SLURM jobs</td>
      <td><a href="https://github.com/KempnerInstitute/jobscope">GitHub</a></td>
    </tr>
    <tr>
      <td>ClusterTool</td>
      <td>Command-Line Tool</td>
      <td>AI Cluster</td>
      <td>Single umbrella CLI that centralizes common HPC cluster tasks</td>
      <td><a href="https://github.com/KempnerInstitute/clustertool">GitHub</a></td>
    </tr>
    <tr>
      <td>TATM</td>
      <td>AI Tool</td>
      <td>AI</td>
      <td>Kempner AI Testbed Library</td>
      <td><a href="https://github.com/KempnerInstitute/tatm">GitHub</a></td>
    </tr>
    <tr>
      <td>AIND Ephys Pipeline</td>
      <td>Workflow</td>
      <td>NeuroAI</td>
      <td>Pipeline for spike sorting of extracellular electrophysiology data</td>
      <td><a href="https://github.com/KempnerInstitute/ephys-spike-sorting">GitHub</a></td>
    </tr>
    <tr>
      <td>NVIDIA NeMo Workflow</td>
      <td>Workflow</td>
      <td>AI</td>
      <td>Cluster-ready workflows for pretraining and finetuning large language models with NVIDIA NeMo</td>
      <td><a href="../s3_ai_workflows/nemo_workflow.html">Documentation</a></td>
    </tr>
    <tr>
      <td>vLLM Distributed Inference</td>
      <td>Workflow</td>
      <td>AI</td>
      <td>Distributed inference workflow with vLLM on Kempner AI cluster</td>
      <td><a href="https://github.com/KempnerInstitute/distributed-inference-vllm">GitHub</a></td>
    </tr>
    <tr>
      <td>HPC Agentic Recipes</td>
      <td>Workflow</td>
      <td>Agentic AI</td>
      <td>Recipes for serving open-weight models on the Kempner AI cluster and using them with agentic coding clients</td>
      <td><a href="https://github.com/KempnerInstitute/hpc-agentic-recipes">GitHub</a></td>
    </tr>
    <tr>
      <td>gpu-please</td>
      <td>Command-Line Tool</td>
      <td>Cloud Computing</td>
      <td>Provisions GPU EC2 instances on AWS using Terraform</td>
      <td><a href="https://github.com/KempnerInstitute/gpu-please">GitHub</a></td>
    </tr>
    <tr>
      <td>MLflow on Databricks</td>
      <td>Workflow</td>
      <td>AI</td>
      <td>Track ML experiments on Databricks-hosted MLflow from the cluster or a laptop</td>
      <td><a href="https://github.com/KempnerInstitute/mlflow-on-databricks">GitHub</a></td>
    </tr>
  </tbody>
</table>

<script>
function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("sortable");
  switching = true;
  dir = "asc"; 
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}
</script>
