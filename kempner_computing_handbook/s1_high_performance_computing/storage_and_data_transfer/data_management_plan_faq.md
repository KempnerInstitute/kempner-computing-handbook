# FAQ: Data Management and Offboarding

This FAQ should be read together with the [Data Management Plan](data_management_plan.md), which summarizes
Kempner, Harvard, and FASRC expectations for research data ownership, storage,
sharing, retention, and deletion.

## General principles

- Plan the handoff before your Kempner appointment, project role, or account
  access ends.
- Harvard asserts ownership of research data for projects conducted at the
  University, under its auspices, or with University resources. PIs are
  responsible for ensuring proper data management, storage, accessibility,
  retention, confidentiality, sharing, and sponsor compliance.
- Data in FASRC lab directories and lab shares are owned and managed by the PI or
  group owner. FASRC can update ownership or permissions with written approval
  from the PI or group owner.
- Scratch storage is temporary. Data older than 90 days are purged on a rolling
  basis, so scratch must not be used for long-term retention or archival storage.
- Harvard guidance states that research records should generally be retained for
  no fewer than seven years after the end of the research project or activity.
  Check any stricter requirements from funders, data use agreements, IRB
  protocols, publishers, or collaborators.
- Kempner research is open science where allowed. Prepare shareable data, code,
  and models for release with clear documentation, metadata, licenses, and
  provenance. If data have confidentiality, privacy, or other compliance
  obligations, coordinate with FASRC and the Kempner Institute before placing or
  sharing them on the cluster.
- Use an appropriate long-term repository for data that must be preserved or
  shared, such as [Harvard Dataverse](https://library.harvard.edu/services-tools/harvard-dataverse)
  or a funder- or discipline-specific repository.

```{note}
Note on Federal Grants (e.g., NIH): While overarching federal frameworks like Uniform Guidance ([2 CFR § 200.334](https://www.ecfr.gov/current/title-2/part-200/section-200.334)) and the NIH Grants Policy Statement ([Section 8.4.2](https://grants.nih.gov/grants/policy/nihgps/html5/section_8/8.4.2_record_retention_and_access.htm)) only require a three (3) year data retention baseline, Harvard University's 7-year policy supersedes the federal minimum. All Kempner cluster users must ensure data used to validate grant outcomes are preserved for the full 7-year horizon.
```

## I am a Kempner Fellow. What happens to my data after I leave?

You are responsible for coordinating the data handoff before you leave, in
consultation with your PI, group owner, supervisor, or Kempner contact. Do not
assume that personal home directories, scratch directories, or project spaces
will remain available after your account status changes.

Before offboarding:

- Identify which data, code, models, records, and metadata must be retained.
- Move anything that must be retained out of scratch and Kempner lab/project
  space into an approved repository or archival location.
- Confirm whether NIH, NSF, other sponsor rules, data use agreements, IRB
  requirements, or publisher policies require specific retention or sharing
  steps.
- Deposit data or models that must be preserved in an appropriate repository,
  such as Harvard Dataverse or a funder- or discipline-specific repository.
- Make software repositories public when open release is allowed, and record the
  relevant repository links.
- Share final data locations, repository links, documentation, access
  requirements, and any restricted-data obligations during Kempner offboarding.

Data in your FASRC home directory are handled according to FASRC account and
storage rules; check with FASRC for the applicable timeline. Data in Kempner lab
or project spaces will not be retained there after you leave. Any data that must
be preserved should be placed in the appropriate repository before offboarding,
with final locations and access requirements shared with Kempner.

## I am a graduate or undergraduate student working with a PI. What happens to my data after I finish my term at Kempner?

Data in the PI's lab space are managed by the PI or group owner. Before your term
ends, review your project data with the PI and agree on what should be retained,
archived, shared, or deleted. Do not delete, move, or take sole control of lab
data without the PI's approval.

If ownership or permissions need to change on FASRC storage, you or your PI
should contact FASRC. FASRC requires written approval from the PI or group owner
before changing ownership or access for lab directories and lab shares.

## I am an undergraduate or summer intern using `kempner_undergrad` storage. What should I do before my term ends?

Contact your PI or supervisor before your term ends and migrate any data that
must be retained to the PI-approved persistent storage location or repository.
Document the final locations and any access requirements.

After your term ends, access to `kempner_undergrad` resources may end, and data
in that space should be considered at risk of deletion. Do not rely on
`kempner_undergrad` storage, scratch, or any personal workspace to satisfy
project retention requirements.

## I am Kempner-affiliated faculty. How do I increase my storage space?

For example, your FASRC account is `jharvard_lab` and your Kempner account is
`kempner_jharvard_lab`. The Kempner account is intended for compute access.
Storage increases should be requested through the FASRC-associated lab account
and storage endpoints, such as `jharvard_lab`. Contact FASRC for quota or storage
expansion requests, and make sure the requested storage tier matches the
lifecycle of the data: persistent storage for long-term files and scratch only
for temporary active-job data.
