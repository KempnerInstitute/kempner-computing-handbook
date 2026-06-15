(storage_and_data_transfer:data_management_plan)=
# Data Management Plan

A data management plan (DMP) describes how research data are organized, stored, secured, shared, retained, and eventually disposed of across the full lifecycle of a project. Many funding agencies require a DMP as part of a grant proposal, and a well-considered plan makes your research more reproducible while keeping it compliant with University, legal, and sponsor requirements.

This page summarizes the policies that govern research data at the Kempner Institute and on the FASRC cluster, and links to the practical resources elsewhere in this handbook for putting a plan into practice.

```{note}
The policies summarized here are maintained by Harvard and FAS Research Computing (FASRC). These summaries are provided for convenience; always consult the linked source documents for the authoritative and most current language.
```

## Open science at the Kempner Institute

All research conducted at the Kempner Institute is open science: data, code, and models are intended to be shared openly with the broader research community. Plan for open release from the outset: choose open formats, document your datasets thoroughly, and track the licenses and provenance of any third-party data you incorporate.

```{seealso}
Kempner Institute [Open Science Policies](https://kempnerinstitute.harvard.edu/open-science-policies/)
```

## Writing your plan

FASRC provides comprehensive guidance for authoring a DMP, covering University data policies, data organization recommendations, and storage and security requirements.

A complete plan typically addresses:

- **Data types and formats**: what data you will generate or collect, and in what formats.
- **Organization and documentation**: naming conventions, directory structure, and metadata/`README` files that make the data understandable to others.
- **Storage and security**: where active and archival data live and how they are protected (see [Storage Options](understanding_storage_options.md)).
- **Access and sharing**: who may access the data and how they are shared internally and externally (see [Data Transfer](data_transfer.md)).
- **Retention and disposal**: how long data are kept and how they are deleted at the end of their lifecycle.
- **Data transitions and offboarding**: what happens to project data when researchers leave Harvard, change groups, or move a project to another institution.

```{seealso}
[FASRC Research Data Management](https://www.rc.fas.harvard.edu/services/research-data-management/): writing a data management plan, University data policies, organizational recommendations, and storage and security requirements.
```

## Data ownership

Harvard University asserts ownership of research data for all projects conducted at the University, under its auspices, or with University resources. Principal Investigators (PIs) are responsible for ensuring proper data management, storage, and accessibility, and for meeting all University, legal, and sponsor requirements. This includes establishing procedures for data retention, confidentiality, and sharing while honoring any data use agreements. Researchers should keep records current and coordinate with the Vice Provost for Research on any data transfers or related inquiries.

On the cluster, data stored in FASRC lab directories and other lab shares are owned and managed by the PI or group owner. Upon written approval from the PI or group owner, FASRC can modify data permissions to grant ownership and access as required.

```{seealso}
- [Harvard Research Data Ownership Policy](https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/f/106/files/2022/10/Data-Ownership-Policy-2019_2021.pdf)
- [FASRC Data Ownership and Access Policy](https://docs.rc.fas.harvard.edu/kb/data-ownership-and-access-policy/)
```

## Storage and security

The Kempner AI cluster provides several storage tiers, each suited to a different stage of the data lifecycle:

- **Home and lab directories**: persistent storage for long-term files, checkpoints, and datasets.
- **Scratch (VAST)**: high-performance, *temporary* storage for data actively used by running jobs.

Match each part of your plan to the appropriate tier, and never treat scratch as long-term or archival storage. For full quotas, paths, and retention details, see [Storage Options](understanding_storage_options.md).

```{warning}
Scratch storage is purged on a rolling basis: data older than 90 days will be deleted. Do not rely on scratch to satisfy data retention requirements. Copy anything you must keep to persistent or archival storage.
```

Because Kempner research is open science, the cluster is generally used for non-sensitive data. If your project involves data with confidentiality, privacy, or other compliance obligations (for example, data governed by a data use agreement), coordinate with FASRC and the Kempner Institute *before* placing such data on the cluster to confirm the appropriate handling and security controls.

## Data retention and deletion

Harvard guidance states that research records should generally be retained for **no fewer than seven (7) years** after the end of a research project or activity. Build this requirement into your plan by identifying, well before a project ends, which data and records must be preserved and where they will be archived.

FASRC maintains its own standards and procedures for the retention and deletion of research data, outputs, temporary files, and associated digital resources held on FASRC storage.

```{important}
Plan for the full seven-year retention horizon from the start. Active cluster storage, especially scratch, is not an archival solution; arrange durable archival storage for any data you are obligated to keep.
```

```{seealso}
- [Retention and Maintenance of Research Records and Data (FAQs)](https://research.harvard.edu/files/2022/10/research_records_and_data_retention_and_maintenance_guidance_rev_2017.pdf)
- [FASRC Research Data Retention and Deletion Policy](https://docs.rc.fas.harvard.edu/kb/fas-rc-research-data-retention-and-deletion-policy/)
```

## Data transitions and offboarding

Data management plans should include a transition plan for people, including students, postdoctoral researchers, research fellows, and PIs, who leave Harvard, change labs, or move a project to another institution. The goal is to keep research data available to the PI, collaborators, Harvard, sponsors, and the broader research community as required.

Before a researcher leaves or changes groups, they should review data in home directories, lab directories, scratch, shared repositories, and external storage used for the project. In consultation with the PI or group owner, identify:

- Which data must remain available to the PI, lab, Kempner Institute, Harvard, sponsors, or collaborators.
- Which data should be moved from a personal or scratch location to a shared lab, project, repository, or archival location.
- Which data, if any, may be copied or transferred to a new institution or role.
- Which data, if any, may be deleted, and how deletion or migration will be documented.
- Which open science, sponsor, data use agreement, privacy, confidentiality, or publication obligations continue after departure.

Researchers may not independently decide to remove, transfer, or delete research data generated or curated at Harvard. Data disposition decisions should be made with the PI or group owner and, where needed, the Kempner Institute, the PI's department, the Vice Provost for Research, or other appropriate Harvard offices.

If a departing researcher wants to take a copy of data to a new institution or role, they must obtain approval from the PI and department. Data governed by a data use agreement, sponsor agreement, human subjects protocol, confidentiality restriction, or other compliance requirement may require additional review or written permission before it can be copied or transferred.

If a PI leaves Harvard and a project will move to another institution, consult the Harvard Research Data Ownership Policy and FASRC offboarding guidance before transferring original research data. Additional institutional approvals and written agreements may be required.

```{important}
Kempner open science obligations continue after a researcher leaves. Data, code, models, and other research outputs generated or curated through Kempner-supported work should continue to follow Kempner open science expectations unless an approved restriction applies.
```

At minimum, transition records should identify the dataset or directory, source location, destination location, date moved or deleted, person responsible, and any known access, sharing, or compliance restrictions.

```{seealso}
[FASRC Offboarding Policies and Procedures](https://docs.rc.fas.harvard.edu/kb/offboarding/)
```

```{note}
Note on Federal Grants (e.g., NIH): While overarching federal frameworks like Uniform Guidance ([2 CFR § 200.334](https://www.ecfr.gov/current/title-2/part-200/section-200.334)) and the NIH Grants Policy Statement ([Section 8.4.2](https://grants.nih.gov/grants/policy/nihgps/html5/section_8/8.4.2_record_retention_and_access.htm)) only require a three (3) year data retention baseline, Harvard University's 7-year policy supersedes the federal minimum. All Kempner cluster users must ensure data used to validate grant outcomes is preserved for the full 7-year horizon.
```
## Policy quick reference

| Policy | What it covers |
|--------|----------------|
| [Kempner Open Science Policies](https://kempnerinstitute.harvard.edu/open-science-policies/) | The Institute's commitment to openly sharing research data and outputs. |
| [FASRC Research Data Management](https://www.rc.fas.harvard.edu/services/research-data-management/) | How to write a DMP; University data policies; organization, storage, and security recommendations. |
| [FASRC Offboarding Policies and Procedures](https://docs.rc.fas.harvard.edu/kb/offboarding/) | Researcher and PI checklists for leaving Harvard or changing labs/groups, including data review, migration, deletion, account transitions, and approval before taking data to a new institution or role. |
| [FASRC Research Data Retention and Deletion Policy](https://docs.rc.fas.harvard.edu/kb/fas-rc-research-data-retention-and-deletion-policy/) | FASRC standards and procedures for retaining and deleting research data, outputs, and temporary files. |
| [FASRC Data Ownership and Access Policy](https://docs.rc.fas.harvard.edu/kb/data-ownership-and-access-policy/) | Ownership and permission management of data in FASRC lab directories and shares. |
| [Harvard Research Data Ownership Policy](https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/f/106/files/2022/10/Data-Ownership-Policy-2019_2021.pdf) | University ownership of research data and PI responsibilities. |
| [Retention and Maintenance of Research Records and Data (FAQs)](https://research.harvard.edu/files/2022/10/research_records_and_data_retention_and_maintenance_guidance_rev_2017.pdf) | Guidance on retaining research records for at least seven years. |

```{seealso}
Related handbook pages: [Storage Options](understanding_storage_options.md) · [Data Transfer](data_transfer.md) · [Shared Data/Model Repository](shared_data_repository.md)
```
