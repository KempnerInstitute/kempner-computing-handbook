(security_and_compliance)=
# Security and Compliance

Working on the Kempner AI Cluster is a shared responsibility. The cluster is part of Harvard's [FASRC](https://docs.rc.fas.harvard.edu/) environment, so your account, your data, and the jobs you run are all subject to university and FASRC policy. This page summarizes the practices and rules that keep the cluster secure and your research compliant. It points to the authoritative Harvard and FASRC pages for the details, which take precedence over anything summarized here.

```{seealso}
The overarching policies live in the [FASRC Acceptable Use Policy](https://docs.rc.fas.harvard.edu/kb/acceptable-use/) and [Harvard Research Data Management and Policy Compliance](https://research.harvard.edu/research-policies-compliance/research-data-management/). For cluster-specific expectations, see {doc}`Cluster Usage Policies <../s1_high_performance_computing/kempner_cluster/kempner_policies_for_responsible_use>`.
```

## Account and access security

Your cluster account is tied to you personally, and you are accountable for everything done under it.

```{warning}
Never share your account or credentials with anyone, including labmates. Account sharing violates university policy: accounts found sharing credentials may be **disabled or banned**, access can be **revoked**, and further university action may follow. If someone needs access, they must request their own account. See [Can I share my account?](https://docs.rc.fas.harvard.edu/kb/can-i-share-my-account/).
```

To keep your credentials safe:

- Use a password manager. Harvard provides [1Password](https://www.huit.harvard.edu/password-manager) free to the community, and its use is encouraged.
- Keep your two-factor (OpenAuth) device secure, and never share one-time codes. See the {doc}`New User Checklist <../s1_high_performance_computing/kempner_cluster/new_user_checklist>` for setup.
- Report a suspected account compromise immediately (see **Reporting a concern** below).

## Data classification and what the cluster can host

Harvard classifies data into five security levels. The level determines where the data may be stored and processed.

| Level | Meaning | Examples |
|---|---|---|
| L1 | Public | Published papers, open datasets |
| L2 | Low-risk confidential | Most unpublished research data, non-sensitive code |
| L3 | Confidential and sensitive | Many types of personal data, some regulated data |
| L4 | High risk | Sensitive personal or regulated data |
| L5 | Extremely sensitive | The most tightly controlled data |

See the [Harvard Data Classification Table](https://security.harvard.edu/data-classification-table) for the authoritative definitions.

```{warning}
The Kempner AI Cluster is rated for data up to **Level 2 (L2)** only. Do **not** place L3 or higher data on the cluster. Level 3 data must be handled in Harvard's dedicated [FASSE secure environment](https://docs.rc.fas.harvard.edu/kb/fasse/), which is rated for L3 only; Level 4 and above are not permitted on any FASRC system. For regulated (Level 4) data, use Harvard University Research Computing's [Regulated Data Services](https://rc.harvard.edu/services/regulated-data-services-user-guide/).
```

```{warning}
This means **no PII, HIPAA/PHI, or other regulated high-risk data** on the cluster, since Harvard classifies these Level 3 or higher (HIPAA/PHI and PII are Level 4). If you are unsure how your data is classified, confirm with your PI and Harvard security before uploading it.
```

## Data ownership and handling

Research data generated at Harvard is owned by the University; you are its steward, not its private owner. How you move and share it is governed by grant terms, data use agreements (DUAs), and your PI's direction.

```{warning}
Do not move data out of a PI's lab space, whether to another location on the cluster or to any external destination, without **PI approval** and confirmation that it complies with the relevant grant terms and data use agreements. Unauthorized copying or sharing of lab data can breach funding and legal obligations.
```

```{note}
Any required data use agreement must be in place **before** the data is stored on the cluster, and the PI is responsible for ensuring approved access stays compliant. For planning your data lifecycle, see {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>` and {doc}`Storage Options <../s1_high_performance_computing/storage_and_data_transfer/understanding_storage_options>`.
```

```{note}
**Retention and deletion.** Research records must be kept for the retention period Harvard and your sponsor require, generally at least seven years, and you may not independently delete or remove research data. Scratch storage is purged after 90 days, so it is not a retention solution; copy anything you must keep to persistent or archival storage. See the [FASRC Research Data Retention and Deletion Policy](https://docs.rc.fas.harvard.edu/kb/fas-rc-research-data-retention-and-deletion-policy/) and the {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
```

## Responsible use of AI tools

AI coding assistants and other generative AI tools are useful on the cluster, but their use must follow university guidance.

```{note}
Follow Harvard's [Generative AI Guidelines](https://www.huit.harvard.edu/ai/guidelines) and the [Provost's guidance on using ChatGPT and other generative AI tools](https://provost.harvard.edu/guidelines-using-chatgpt-and-other-generative-ai-tools-harvard). In particular, do not paste confidential (L2 and above) data into public AI services.
```

```{warning}
Take extra care when running AI tools in automated or agentic mode, where the tool executes commands on its own. Before enabling autonomous execution:

- Review the actions the agent proposes rather than approving them blindly.
- Scope the agent to your own directories, and avoid destructive operations (for example, recursive deletes).
- Ensure it cannot affect shared paths, other labs' data, or cluster-wide resources.

An unsupervised agent can delete data or disrupt shared resources far faster than a person.
```

```{note}
Agentic tools are also exposed to prompt injection: untrusted content the agent reads, such as web pages, files, or datasets, can carry hidden instructions. Treat what an agent reads as data rather than commands, keep a human approving consequential actions, and give the agent least privilege. See OWASP's [Top 10 for Agentic Applications](https://genai.owasp.org/agentic-security-initiative/) and, for running these tools here, {doc}`Using Agentic AI on the Cluster <../s5b_agentic_ai_workflows/using_agentic_ai_on_the_cluster>`.
```

```{warning}
**Prohibited AI under the NDAA.** Harvard's [NDAA 2026 Guidance and Prohibition on use of certain Artificial Intelligence](https://bpb-us-e1.wpmucdn.com/websites.harvard.edu/dist/f/106/files/2026/01/NDAA-2026-Guidance-and-Prohibition-on-use-of-certain-Artificial-Intelligence.pdf) prohibits anyone performing work under a U.S. Department of Defense (DoD) contract from using AI developed by **DeepSeek**, its parent company High Flyer, or affiliated entities, in any activity related to that contract. The prohibition covers faculty, staff, students, and visitors working on the contract, and it applies to self-hosting the open-weight DeepSeek models on the cluster as well as the hosted service. If your work is, or may be, under a DoD contract, do not use these tools, and contact the Office of the Vice Provost for Research if you are unsure whether the policy applies to you.
```

## External data and network conduct

Datasets you download or scrape from external providers come with terms of use, and the whole cluster shares a small pool of public IP addresses.

```{warning}
Respect the terms of service and rate limits of any external data source. Aggressive downloading or scraping that violates a provider's terms can get the cluster's **shared public IP blocked**, breaking access for **every** user, and may breach the provider's agreement. When in doubt, throttle your requests and read the source's terms first.
```

See the [FASRC Acceptable Use Policy](https://docs.rc.fas.harvard.edu/kb/acceptable-use/) for the full expectations on network conduct.

## Software licensing

You may install software relevant to your research, provided you comply with the [FASRC Acceptable Use Policy](https://docs.rc.fas.harvard.edu/kb/acceptable-use/) and the licensing terms of each package.

```{note}
FASRC does not purchase software for labs. Commercial or licensed software must be acquired by your lab, department, or school (for example, through HUIT software licensing), and must have a Linux-compatible license to run on the cluster. See [Installing Software](https://docs.rc.fas.harvard.edu/kb/installing-software-yourself/) and [FAS licensed software](https://docs.rc.fas.harvard.edu/kb/fas-licensed-software-for-local-use/).
```

Respect the license of every dataset, model, and library you use, including non-commercial and attribution clauses. This is both a legal and a compliance requirement.

## Compliance and grant obligations

Your work is also bound by the requirements of whoever funds and governs it.

- **Funding agencies.** Follow the data management, sharing, and access requirements of your grants (for example, NIH and NSF data policies). These often flow into your {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
- **Retention periods.** Keep research data for the retention period your sponsor and Harvard require. Funding agencies set their own minimums, and Harvard's longer retention period supersedes shorter federal minimums. See the {doc}`Data Management Plan <../s1_high_performance_computing/storage_and_data_transfer/data_management_plan>`.
- **Data use agreements.** Honor every DUA and contract that applies to data you use, as directed by your PI.
- **University policy.** You are responsible for knowing and following applicable Harvard Information Security and Research Data Security policies.

```{admonition} Reporting a concern
:class: important
If you suspect a security incident, a compromised account, or a policy violation, report it promptly. Contact FASRC at [rchelp@rc.fas.harvard.edu](mailto:rchelp@rc.fas.harvard.edu) and, for security incidents, Harvard's Information Security office at [ithelp@harvard.edu](mailto:ithelp@harvard.edu). Acting quickly limits the impact on you, your lab, and the wider cluster.
```
