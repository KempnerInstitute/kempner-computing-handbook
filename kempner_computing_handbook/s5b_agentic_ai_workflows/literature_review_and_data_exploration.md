# Literature Review and Data Exploration

Literature searches and data exploration are where an agent saves hours, and where its mistakes are easy to miss: a citation that looks right but does not exist, or a plot that is correct for the wrong rows. For both, every claim must lead back to something you can open: a paper, or the code and data behind a number. This page covers both tasks, starting with what you may send to which tool.

```{mermaid}
flowchart LR
    Q["Set the question<br/>and criteria"] --> S["Search with a tool<br/>that retrieves"]
    S --> E["Screen and extract<br/>with quotes"]
    E --> V{"Verify every<br/>citation"}
    V --> W["Write from<br/>verified sources"]
    classDef agent fill:#14154C,color:#ffffff,stroke:#3D3E82;
    classDef you fill:#A51C30,color:#ffffff,stroke:#A51C30;
    class S,E,W agent;
    class Q,V you;
```

## Check what you may send

A literature search sends your question to the provider. Data exploration sends whatever the agent reads: rows, column names, file names, and the output of the code it runs.

- **Data on the cluster.** A cloud agent may work only with public data (Level 1) unless your school has an agreement with the provider; see {ref}`Before you start <agentic_ai:before_you_start>`. For a model served on the cluster, which keeps your data from leaving it, see {doc}`HPC Agentic Recipes <hpc_agentic_recipes>`, including the data rules that apply to it.
- **Material you received in confidence.** Manuscripts and proposals you review belong to their authors. NIH, for example, states that uploading content from a grant application or critique to online generative AI tools violates its peer review confidentiality requirements ([NOT-OD-23-149](https://grants.nih.gov/grants/guide/notice-files/NOT-OD-23-149.html)).

If a dataset is above your tool's approved level, the agent can still help without seeing it; see {ref}`Explore data the agent cannot see <agentic_ai:explore_data_agent_cannot_see>`.

## Review the literature

### Use a tool that retrieves

Asking a chat model for references from memory is how fabricated citations happen: in one study, 55% of the references from GPT-3.5 and 18% from GPT-4 were fabricated ([Walters and Wilder, 2023](https://doi.org/10.1038/s41598-023-41032-5)). Use a tool that searches a literature database and cites what it retrieved, such as Elicit, Consensus, Ai2's Asta, or the deep research mode of a general assistant; see {doc}`Agentic AI Tools <agentic_ai_tools>`. A terminal agent can also search, with web access or an MCP server for a literature database; see {doc}`Building Custom Tools and MCP Servers <building_custom_tools>`.

Retrieval makes invented papers much rarer, but it does not prevent a real paper cited for a claim it does not make. That is why citation checks end with reading.

### Set the question and criteria first

Write down the question, the inclusion criteria, and the sources before the agent starts, as for a systematic review. You can then check the agent's choices against your criteria and compare two runs.

> Find peer-reviewed papers and preprints from 2020 onward that measure how learning rate warmup affects training stability in transformer language models. Include only studies that train models with at least 100 million parameters. For each paper, give the title, authors, year, DOI, and one sentence on its main finding, with a quoted passage from the paper that supports it. Save the list to `review/papers.csv` with the columns doi, title, finding, and quote. Say which papers you could read only as an abstract, and list the papers you excluded, each with the reason.

Two checks show whether to trust the search and screening:

- **Seed papers.** Before the search, list 5 to 10 papers you know belong. If the agent's list misses several, the search is incomplete, whatever the agent says.
- **Screening sample.** Read a few included and a few excluded papers, and check the agent's decisions against your criteria.

### Verify every citation

Each reference must pass three checks: it exists, it matches the reference (title, authors, and year), and it supports the claim it is cited for. A short script handles the first check and the title part of the second. It looks up each DOI at doi.org, which covers DOIs from Crossref (most journals) and DataCite (arXiv and many data repositories), and compares the registered title with the cited one. A DOI it cannot look up, for example during a network problem, is marked for checking by hand.

:::{dropdown} check_refs.py
```python
"""Check each reference in a CSV file against the DOI registry.

The CSV needs the columns doi and title, as the agent reported them. Each DOI
is looked up at doi.org, and the registered title is compared with the cited one.
"""
import csv
import difflib
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request


def registered_title(doi):
    """Return the title registered for a DOI, or None if the DOI does not exist."""
    request = urllib.request.Request(
        "https://doi.org/" + urllib.parse.quote(doi),
        headers={"Accept": "application/vnd.citationstyles.csl+json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.load(response).get("title", "")
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


def similar(a, b):
    return difflib.SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()


with open(sys.argv[1], newline="") as f:
    for row in csv.DictReader(f):
        doi = re.sub(r"^(https?://(dx\.)?doi\.org/|doi:)", "", row["doi"].strip(), flags=re.I).strip()
        try:
            title = registered_title(doi)
        except Exception as err:  # a network problem or an unexpected answer
            print(f"{doi}: CHECK BY HAND ({err})")
            continue
        if title is None:
            status = "NOT FOUND"
        elif similar(title, row["title"]) < 0.9:
            status = f"TITLE MISMATCH (registered: {title})"
        else:
            status = "ok"
        print(f"{doi}: {status}")
```
:::

In a test on a compute node, given four references, one with a real DOI but another paper's title and one with an invented DOI, it reported:

```text
$ python check_refs.py review/papers.csv
10.1038/s41598-023-41032-5: ok
10.48550/arXiv.1706.03762: ok
10.1038/nature14539: TITLE MISMATCH (registered: Deep learning)
10.1038/s41598-023-99999-9: NOT FOUND
```

Run this check as code, not as a question to the model: a script gives the same answer every time and cannot be persuaded. For references without a DOI, Crossref's [Simple Text Query](https://www.crossref.org/documentation/retrieve-metadata/simple-text-query/) finds DOIs for pasted references. The third check is yours: open each paper at the quoted passage and confirm that it supports the claim in context.

### Write from the verified list

> Using only the papers in `review/papers.csv`, write a two-page summary of what is known about how warmup affects training stability. Cite a paper for every finding, and mark any statement that rests on a single study.

Check each finding against its quote before the summary goes anywhere, and disclose AI use as your journal or funder requires; see {doc}`Agentic AI in Research <agentic_ai_in_research>`.

## Explore a dataset

### Protect the raw data

Give the agent its own copy of the data, make the copy read-only, and have it write code and results to a new directory such as `explore/`:

```bash
chmod -R a-w data/raw    # writes to the copy now fail with "Permission denied"
```

Permission rules can deny edits to `data/raw/`, but they cover the agent's file tools and simple shell commands, not a Python script that opens files itself; see {ref}`Permission rules <agentic_ai:permission_rules>`. File permissions apply to every process, so they catch what rules miss. They are not absolute, because the agent runs as you and could change them back, so keep the original data where the agent does not work.

### Profile before you analyze

> Profile `data/raw/measurements.csv` without changing it: rows and columns, each column's type, missing values, duplicate rows, and the range of each numeric column. Flag anything suspicious, such as impossible values, mixed units, or a constant column. Write the code to `explore/profile.py` and the results to `explore/profile.md`.

The agent can describe the data, but only you know how it was collected. Check the profile against what you know, for example that temperatures should be in kelvin, or that a gap in the dates is a holiday and not lost data. When the agent cleans the data, have it report how many rows each step removes.

To see what the agent catches, plant known problems in a copy of the data, such as a duplicated row, a value in the wrong unit, and a block of missing values, and check that its profile finds them. This is {ref}`Evaluate against a baseline <agentic_ai:evaluate_against_baseline>` applied to your own data.

### Work in Jupyter

Claude Code reads notebooks, including their outputs, and edits individual cells, but it does not run cells. To use a terminal agent with JupyterLab on the cluster:

1. Start a JupyterLab session through {doc}`Open OnDemand <../s1_high_performance_computing/general_hpc_concepts/open_ondemand>`, with your Kempner account in the account field.
2. In JupyterLab, open a terminal (File > New > Terminal). It runs on your session's compute node.
3. Start the agent from your project directory. The agent and the notebook now share the same node, files, and environment.

Two habits keep a notebook trustworthy:

- **Reload after the agent edits.** JupyterLab does not pick up changes on disk to an open notebook. After the agent edits one, use File > Reload Notebook from Disk. If you save the old version instead, JupyterLab warns that the file changed on disk, and choosing Overwrite discards the agent's edits.
- **Rerun from the top.** Cells run out of order can show results the code no longer produces. Before you trust a notebook, use Kernel > Restart Kernel and Run All Cells.

FASRC also documents Jupyter AI, an assistant built into JupyterLab; see its [AI extensions guidance](https://docs.rc.fas.harvard.edu/kb/ai-extensions-on-fasrc-clusters/).

(agentic_ai:explore_data_agent_cannot_see)=
### Explore data the agent cannot see

When a dataset is above your tool's approved level, the agent can still write the analysis:

- Give it the schema (column names, types, and units) and a small synthetic sample, not the real rows.
- Have it write the code, then run the code yourself in a separate terminal, so the output does not go back to the model.

## Before you trust a finding

- Every cited paper exists, matches its reference, and supports the claim it is cited for.
- The search found the seed papers you listed in advance.
- Each number comes from code you can rerun from the top on a recorded version of the data.
- Rows removed during cleaning are counted and explained.
- Each plot shows what you asked for: check the axes, the units, and a few values by hand.

```{seealso}
For building evidence into a workflow from the start, see the chain of evidence under {ref}`Best practices for trustworthy agentic research <agentic_ai:trustworthy_practices>`. For literature and science tools, see {doc}`Agentic AI Tools <agentic_ai_tools>`.
```
