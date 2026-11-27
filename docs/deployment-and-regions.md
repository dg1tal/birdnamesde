# Deployment and regional data

[README](../README.md)

## GitHub Pages

[pages.yml](../.github/workflows/pages.yml) publishes `dist/` from `main` without
a build step. Set **Settings → Pages → Source** to **GitHub Actions**. Assets use
relative paths. The separate Sites publication is independent.

Triggers: push, manual dispatch and daily at 04:23 UTC. GitHub may delay scheduled
runs or disable them after repository inactivity. `force_refresh` forces regional
and DDA refreshes. The job has a 20-minute timeout. Each attempt uses a unique Pages
artifact and waits up to two minutes for its metadata before deploying.

`EBIRD_API_KEY` is an Actions secret used only by Python refresh scripts. Browser
code fetches published static JSON. Refreshes are included in the deployment
artifact, not committed. Domain changes require exporting progress from the old
origin and importing it at the new one; see [backups](learning-and-storage.md#backup-and-restore-flow).

## Regional refresh with GitHub Actions

`python3 scripts/update-regions.py --if-due` reuses complete, validated snapshots under 24 hours
old. It otherwise discovers regions and fetches all-time lists and recent
observations (`back=30`, `cat=species`, provisional records excluded).

| Country | First-level regions | Additional level |
| --- | ---: | --- |
| Germany (`DE`) | 16 states | Garmisch-Partenkirchen |
| Netherlands (`NL`) | 12 provinces | — |
| United Kingdom (`GB`) | 4 constituent countries | eBird local regions |
| Finland (`FI`) | 19 regions | — |
| France (`FR`) | 13 metropolitan regions, including Corsica | Overseas territories excluded |

`data/region-countries.json` defines coverage. Official v2025 species IDs and
REPORT_AS links resolve source taxa; unknown/non-species taxa are reported for
review, never added automatically. `dist/regions.json` contains labels, hierarchy,
matched species IDs, returned taxon counts and per-list timestamps. Occurrence
does not establish breeding status, abundance or sighting probability.

Three network workers share a 0.5-second request-start interval. Credentials go
only to the fixed HTTPS eBird origin; redirects are rejected. Responses and
credential-bearing exceptions are not logged. Fallback snapshots copy only
allowlisted fields and retain successful lists and their original timestamps.
Failed discovery or an unusable first snapshot stops deployment. The UI marks
lists older than three days. Catalogue fingerprints invalidate incompatible caches.

## UK local regions

UK selectors follow country → constituent country → `subnational2` region,
discovered from eBird when `includeLocalRegions` is enabled. Changing a parent
resets its narrower selection; stored local regions restore on reload.
Unavailable local lists do not broaden learning to a larger area.

## Hybrid regional learning

Default: Germany, whole country, seasonal Frequent and Medium groups. Lookup
remembers its geography independently. Species/name filters apply to discovery;
custom progress filters apply only to custom rounds. Started targets remain due
for review outside the current selection. Saved-species rounds use their own list.

Seasonal groups use complete-checklist reporting proportions: Frequent ≥10%,
Medium 1–<10%, Rare >0–<1%. Zero reports form no group. EBD covers 2021–2025:
September 2026 release for DE/NL/GB, October for FI/FR. There are 178 exact
aggregates in the reviewed 191-region hierarchy; 13 UK local codes lack historical
samples. The gate is ≥300 independent complete checklists overall and ≥3 years
with ≥100 each. Missing/insufficient samples use the labelled regional-list
fallback. Missing API lists can still use valid seasonal data; unavailable
selections never enable unrestricted learning.

`scripts/update-current.py` adds recent notable reports (`back=14`,
`includeProvisional=false`, `obsValid === true`). `current-notable.json` publishes
only catalogue IDs and observation/expiry dates. Snapshots under 24 hours are
reused; failures preserve timestamps and never extend validity. The client ignores
snapshots older than three days. Reports expire at 00:00 UTC, fourteen days after
observation, and do not imply increased frequency.

Current additions are automatic, share species/name filters and take priority
among new daily targets without a fixed quota. Existing seasonal members are not
duplicated. Rounds freeze their selection, source version and dated metadata;
new rounds reassess expiry. Regional custom-round distractors stay within saved
regional membership; daily distractors may use the eligible catalogue.

`scripts/build-ebd-seasonal.py` generates seasonal data, provenance, terms and the bilingual
coverage page from the reviewed aggregate and exact region match. Daily API
refreshes do not change historical aggregates. See [EBD import](ebd-import.md) for
commands, filters and source terms; the user-facing method is in
`dist/seasonal-data.html`.

## DDA abbreviation refresh

`python3 scripts/update-dda.py --if-due` requires no secret. It reuses validated successful fetches
under 24 hours old and retains the last good snapshot or committed bootstrap on
failure. Source date and fetch time are shown separately under Data & privacy.

Known mappings accept new abbreviations/display names. New IDs and changed
scientific concepts enter `meta.review` pending review. `VERALTET:`/`OLD:` rows
enter `meta.deprecated` and are excluded from search/learning. Malformed responses,
duplicate IDs and conflicting mappings reject the candidate.

After mapping changes, regenerate with `python3 scripts/update-dda.py --from-records`
and run `--check`. The [full checks](development.md#checks) include Node DDA,
regional/hybrid selection and Python DDA/region/current-data tests.
