# Open Source Hub

Welcome to the Open Source Hub of Kempner Institute's Research and Engineering Team! This page catalogs all our open-source contributions across various domains, including AI, NeuroAI, Research Software Engineering, AI Cluster, High-Performance Computing, and Cloud Computing.  

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
      <th title="Click to sort by Repository" onclick="sortTable(4)">Repository</th>
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
      <td>vLLM Distributed Inference</td>
      <td>Workflow</td>
      <td>AI</td>
      <td>Distributed inference workflow with vLLM on Kempner AI cluster</td>
      <td><a href="https://github.com/KempnerInstitute/distributed-inference-vllm">GitHub</a></td>
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