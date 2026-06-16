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

## Policy quick reference

| Policy | What it covers |
|--------|----------------|
| [Kempner Open Science Policies](https://kempnerinstitute.harvard.edu/open-science-policies/) | The Institute's commitment to openly sharing research data and outputs. |
| [FASRC Research Data Management](https://www.rc.fas.harvard.edu/services/research-data-management/) | How to write a DMP; University data policies; organization, storage, and security recommendations. |
| [FASRC Research Data Retention and Deletion Policy](https://docs.rc.fas.harvard.edu/kb/fas-rc-research-data-retention-and-deletion-policy/) | FASRC standards and procedures for retaining and deleting research data, outputs, and temporary files. |
| [FASRC Data Ownership and Access Policy](https://docs.rc.fas.harvard.edu/kb/data-ownership-and-access-policy/) | Ownership and permission management of data in FASRC lab directories and shares. |
| [Harvard Research Data Ownership Policy](https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/f/106/files/2022/10/Data-Ownership-Policy-2019_2021.pdf) | University ownership of research data and PI responsibilities. |
| [Retention and Maintenance of Research Records and Data (FAQs)](https://research.harvard.edu/files/2022/10/research_records_and_data_retention_and_maintenance_guidance_rev_2017.pdf) | Guidance on retaining research records for at least seven years. |

```{seealso}
Related handbook pages: [Storage Options](understanding_storage_options.md) · [Data Transfer](data_transfer.md) · [Shared Data/Model Repository](shared_data_repository.md) · [Data Management and Offboarding FAQ](data_management_plan_faq.md)
```
