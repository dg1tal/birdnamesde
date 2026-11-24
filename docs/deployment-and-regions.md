# Deployment and regional data

[Back to the README](../README.md)

Reviewed against commit `62f79cb` on 20 November 2026.

Paths in code examples are relative to the repository root. UI labels use the English interface. Dated review reports retain their release-specific results; the thematic guides describe the documented current behavior.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys `dist/` from `main` without a build step. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The app's data, scripts, styles, photos and license links use relative paths, so the repository URL path works without a custom base URL. Keep the existing Sites publication independent of this workflow.

Learning progress is stored per browser origin. Before switching domains, open **Statistics → Back up and restore progress** on the existing site and export the JSON backup. On GitHub Pages, open the same section and import that file. Import replaces the current progress on the Pages origin after confirmation, so export any progress made there first. Browser settings and a paused lesson are not part of the progress export.

## Regional refresh with GitHub Actions

`EBIRD_API_KEY` is a repository Actions secret. The Pages workflow uses it only in the Python refresh step, never in browser code, repository files or published artifacts. Standard GitHub-hosted runners in this public repository keep this workflow within GitHub's free compute offering; no external backend is used. The schedule runs daily at 04:23 UTC, with manual and push triggers also available. On each run, the workflow reuses a validated public regional snapshot when every list is less than 24 hours old; only an expired or incomplete snapshot triggers eBird requests. Manual runs can force a refresh. Scheduled jobs can be delayed or disabled by GitHub after prolonged repository inactivity.

`scripts/update-regions.py` discovers Germany's 16 federal states, the Netherlands' 12 provinces and the United Kingdom's four constituent countries (England, Scotland, Wales and Northern Ireland), Finland's 19 regions and France's 13 regions, then fetches all-time taxon lists and recent species observations (`back=30`, `cat=species`, provisional observations excluded). `data/region-countries.json` declares supported countries independently of name-language and UI support. Country and region are separate selectors. Source taxa are resolved only through official v2025 species IDs and REPORT_AS links. Daily refreshes report candidate species and unknown source taxa; they never add catalogue entries automatically. Original eBird taxon counts can exceed the app's coverage and can include non-species taxa in the all-time lists. Recent records indicate reports, not abundance or sighting probability.

The generated `dist/regions.json` contains public region labels, matched species IDs, total returned taxon counts and per-list fetch timestamps. It is generated during deployment, not committed. The browser never sends a request to eBird. The updater loads the previous public Pages snapshot without credentials and retains successful lists independently if a refresh fails; a failed region discovery or completely unusable first snapshot stops deployment. Credentials are sent only to the fixed HTTPS eBird API origin, and redirects are rejected. Response bodies and credential-bearing exceptions are not logged. Only allowlisted fields can be copied from the previous snapshot. A list older than three days is visibly marked in the UI.

Lookup has an independently remembered optional region filter with all-time or recent-30-day records; its former vocabulary-level filter has been removed. Learning region and list mode persist with the shared study settings. Regional discovery intersects species-group and name-availability filters; custom practice also applies its progress filter. Every new learning selection requires a country or region; missing geography never enables unrestricted learning. Missing or empty regional lists prevent introductions/custom questions from that selection; daily due reviews of started targets remain available. Regional custom-practice distractors use the saved regional membership, while daily-round distractors can come from the whole eligible catalogue. Paused lessons preserve their original queue. Daily regional data does not automatically change the reviewed catalogue. Version-2 lesson/evidence handling is separate from the current version-3 backup format; see [learning and storage](learning-and-storage.md#backup-and-restore-flow).

Checks: `python3 -m unittest discover -s scripts -p 'test_regions.py'` and `node scripts/test-regions.mjs`. API reference: https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest .

UK uses the official eBird country code `GB`. The country selector offers “United Kingdom (UK)”, with whole-country and constituent-country lists. German subregion labels are declared in the country configuration; their keys are verified against the discovered official eBird region codes. Both recent and all-time lists participate in the existing daily refresh and last-good-snapshot fallback. Region coverage remains limited to the existing learning catalogue.

Finland (`FI`) and France (`FR`) support whole-country and first-level regional lists in both learning and lookup, including recent 30-day records and current notable reports. The 23 November 2026 source review mapped 483 Finnish and 659 French species into the expanded 994-species catalogue. France follows eBird’s `FR` scope (13 metropolitan regions including Corsica); separately coded overseas territories are not included. Since 24 November 2026, both countries use reviewed seasonal EBD data for 2021–2025 from the October 2026 release. Country-wide lists and all French regions pass the sample gate in every season; Finnish region/seasons with insufficient samples keep the labelled regional-list fallback.

## UK local regions

UK now uses the eBird hierarchy country → constituent country → local (`subnational2`) region. The updater discovers the available local regions under each UK constituent country from eBird rather than maintaining invented boundaries. Selecting a country or constituent country resets the narrower selection; stored local selections are restored on reload. Unavailable local lists remain unavailable instead of silently broadening the quiz. Existing country/state/province selections and paused lessons remain compatible.

`includeLocalRegions` in the country configuration enables the additional discovery level. Three bounded network workers share a global 0.5-second request-start interval (at most two starts per second), and individual failed lists retain the previous valid snapshot. The workflow timeout is 20 minutes to accommodate the larger first refresh. Only matched species IDs, counts, timestamps and public hierarchy metadata are published; no coordinates, checklist records or credentials are included. The app uses the reviewed DE/NL/UK/FI/FR union catalogue; recent and all-time records also support the hybrid seasonal selection described below.

## Hybrid regional learning

New users start with Germany — whole country (`DE`). Existing settings without a region migrate to this country and the default seasonal groups, with a dismissible one-time explanation. Existing regions, other learning preferences, progress and paused queues are preserved. Lookup keeps its optional independent regional filter. Country selection starts with the whole country; all lists use the reviewed country-union catalogue and report unresolved/non-species source taxa separately. Missing API lists can still use supported seasonal data; unavailable selections are labelled and never broadened to the unrestricted catalogue.

Regional learning defaults to the seasonal frequency groups “Frequent” (≥10%) and “Medium” (1–<10%). “Rare” (>0–<1%) can be added or selected independently. Rates are weighted complete-checklist reporting proportions for the selected region and season, not abundance or difficulty. Zero/missing seasonal reports do not form a rare group. Current notable records are always included automatically in regional learning; the former checkbox and opt-out setting have been removed. Legacy species-package selections are removed from preferences and no longer restrict discovery. Shared language/species-group filters still apply; progress filters apply to custom practice. Daily due reviews remain eligible beyond the current species selection. See `dist/seasonal-data.html` for user-facing methods, limitations and source terms.

`dist/seasonal-species.json` contains seasonal groups from the eBird Basic Dataset, September 2026 release for DE, NL and GB and October 2026 release for FI and FR, restricted to 2021–2025 for all five countries. It is built from the reviewed aggregate preview, never from raw observations in CI. All 178 source region codes exactly match the reviewed 191-region public API hierarchy; 13 UK local codes without a historical sample use the regional fallback. The preview's complete-checklist, observation-type, taxon-concept, accepted-record and shared-group rules are documented in [ebd-import.md](ebd-import.md). The sample gate remains ≥300 independent complete checklists overall and ≥3 years with ≥100 each. Winter uses December, January and February of the respective calendar years. Unsupported or missing region/seasons visibly fall back to the regional occurrence list. Reporting proportions do not measure abundance, learning difficulty or sighting probability. Raw EBD is never redistributed. `dist/seasonal-provenance.json` records the sources, hashes, method and exact region matching; `dist/ebd-terms.txt` supplies the full source terms.

`scripts/update-current.py` runs after the regional-list refresh in the existing daily Pages workflow, using the existing `EBIRD_API_KEY` secret. It requests recent notable reports (`back=14`, `includeProvisional=false`) and additionally requires `obsValid === true`. Only catalog species IDs and observation/expiry dates are published in `current-notable.json`; no observer identities, checklist IDs or coordinates. Its tracked empty file is a bootstrap; deployment generates the actual snapshot. Valid snapshots under 24 hours are reused. Fetch failures retain the original timestamps and never extend validity. The client ignores snapshots older than three days and observations after their exclusive expiry at 00:00 UTC, fourteen days after observation. A report indicates a notable occurrence, not an increase in frequency.

Current species outside the selected base are automatically included in regional discovery and labelled as additions in setup and questions. Observation and expiry dates appear in the folded answer explanation. Species already in the selected historical group are not duplicated or reclassified. Shared species-group and name filters apply to the current layer; custom progress filters narrow custom rounds. Regional eligibility feeds the daily/practice queue builders, whose due/new priorities determine the actual round. Daily discovery gives current additions priority among potential new targets; it does not reserve a fixed share of the round. “All” in custom practice includes every eligible species. Active and paused rounds freeze their selection, chosen frequency groups and dated metadata; their folded answer explanation refers to the start of the round. New rounds apply expiry afresh. Derived seasonal and current data retain the eBird source terms and are excluded from the MIT code license.

Checks: `node scripts/test-hybrid-learning.mjs` and `python3 -m unittest discover -s scripts -p 'test_current.py'`, alongside the existing app/regional tests.

Reproduce the active EBD release with `python3 scripts/build-ebd-seasonal.py`; verify tracked outputs with `--check`. The generator takes the reviewed `data/ebd-seasonal-preview.json` and `data/ebd-region-match.json`, checks the unchanged period/thresholds and exact region IDs, and generates the compact seasonal data, provenance, full terms and bilingual method/coverage page together. The coverage tables derive from the data, including absent historical samples. New regional rounds snapshot the dataset source/version; legacy and paused rounds retain their existing queue, metadata and progress without retrospective source assignment. See [ebd-import.md](ebd-import.md) for rebuilding the private import. The former histogram importer `scripts/build-seasonal.py` and `data/seasonal-histogram-provenance.json` remain as historical reproduction tools/audit and are not used for the active release.

## DDA abbreviation refresh

The existing daily Pages workflow also runs `scripts/update-dda.py --if-due`.
It revalidates the previous public `dda-codes.json` snapshot and reuses it while
its successful fetch is less than 24 hours old. The existing manual
`force_refresh` option forces both regional and DDA requests. DDA needs no secret.
The browser fetches only the published static JSON, never the DDA API.

New source rows and rows whose scientific concept differs from their reviewed
mapping are reported in `meta.review`, without automatic catalogue additions.
Known mappings accept updated abbreviations and display names. Source rows
marked `VERALTET:` or `OLD:` are excluded. Malformed responses, duplicate source
IDs and conflicting catalogue mappings reject the candidate. On request or
validation failures the updater retains the last valid published snapshot,
including its original timestamp, or the committed bootstrap if unavailable.
The app's Data & privacy page shows the DDA source date and successful fetch time
separately and links the downloadable snapshot/update report.

The committed bootstrap is reproducibility-checked before network refreshes.
Deployment updates are included in the Pages artifact rather than committed by
the workflow. After changing mappings, regenerate the bootstrap and run
`node scripts/test-dda.mjs`, `python3 -m unittest discover -s scripts -p test_dda.py`
and `python3 scripts/update-dda.py --check` alongside the normal checks.

Pages artifacts use a unique name per workflow run and attempt. Before deployment,
the workflow polls artifact metadata for up to two minutes. This handles delayed
artifact visibility and prevents same-name collisions when rerunning a failed
publication job. `actions: read` permits this metadata check; application data
and DDA source processing do not need additional credentials.
