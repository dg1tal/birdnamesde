# BirdNames DE

Public, buildless, browser-local bird-name dictionary and spaced-repetition trainer. No runtime dependencies, analytics, server database, or authentication. The GitHub Pages workflow publishes `dist/`; `.openai/hosting.json` retains the separate Sites hosting identity.

Documentation reviewed against the repository on 2 November 2026. UI labels below use the English interface. Dated reports in `docs/` retain their release-specific verification results; later changes are noted where they supersede earlier behavior.

## License and third-party material

The original application code in `dist/` (HTML, CSS and JavaScript), the code in `scripts/`, and project configuration are licensed under the [MIT License](LICENSE), copyright (c) 2026 DG1TAL. A copy of the license in `dist/LICENSE` accompanies the hosted application. This grant does not cover the JSON datasets, images, or other third-party material in this repository.

The photos and illustrations in `dist/images/` retain their individual licenses and attribution requirements, recorded per image in `dist/photos.json`. The eBird/Clements taxonomy, common names, quick codes and API-derived regional data are sourced from Cornell Lab of Ornithology/eBird; this project's MIT license does not grant rights to those materials. Review the [eBird API terms](https://www.birds.cornell.edu/home/ebird-api-terms-of-use/) and [eBird data access terms](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/) before reusing or redistributing them. Other source material and editorial provenance are documented below.

## Application

- `dist/species.json`: independently replaceable species data and provenance metadata.
- `dist/logic.js`: search normalization, answer acceptance, repetition scheduling and import validation.
- `dist/app.js`: lookup, text/flashcard/multiple-choice learning, IndexedDB persistence, statistics, JSON export/import and theme.
- `dist/study-state.js`: serializable lesson recovery, single grading and separate first-question/retry progress.
- `dist/style.css`: responsive layout and dark mode.
- `dist/validation.json`: complete machine validation result, code collisions and limitations.

## Checks

```sh
npm test
for test in scripts/test-*.mjs; do node "$test" || exit 1; done
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/validate-data.py
node scripts/validate-photos.mjs
for file in dist/*.js; do node --check "$file" || exit 1; done
git diff --check
```

No build step is required. Serve `dist/` as static assets, for example with `python3 -m http.server 8000 --directory dist`. The Pages workflow runs the deployment checks and refreshes regional/current data before uploading this directory. `scripts/finalize-data.py` regenerates data and is not a read-only check; run it only when intentionally updating the dataset.

Browser verification and its limits are recorded in the dated reports below. Recent checks include responsive layouts, keyboard navigation, backup/restore and lesson recovery. Physical mobile keyboards and actual screenreader speech remain unverified.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys `dist/` from `main` without a build step. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The app's data, scripts, styles, photos and license links use relative paths, so the repository URL path works without a custom base URL. Keep the existing Sites publication independent of this workflow.

Learning progress is stored per browser origin. Before switching domains, open **Statistics → Back up and manage progress** on the existing site and export the JSON backup. On GitHub Pages, open the same section and import that file. Import replaces the current progress on the Pages origin after confirmation, so export any progress made there first. Browser settings and a paused lesson are not part of the progress export.

## Data provenance and reproduction

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

Official common-name quick codes are literal `com_quick_codes` entries. When that field is empty, the official `banding_code` entry supplies the eBird entry shortcut; these cases are explicitly marked in the UI and validation report. Scientific quick codes are excluded. Multiple common-name variants and code collisions are intentional; no code is generated from a name. The Blackbird primary common-name quick code is EUBL, with the official alternate COBL accepted. Code groups and aliases must stay attached to the official species ID.

Species packages (stored as the existing numeric learning levels) are editorial sets, independent of learning progress or difficulty: Getting started (106 species), Building on the basics (103), Exploring further (104). Each species belongs to exactly one package; packages can be combined. The learning setup explains their scope and provides complete alphabetic lists before other filters. Shared labels and controls live in `dist/species-packages.js`. Learning schedules are separate per species ID and target (`de`/`en`/`nl`/`sci`/`code`). Correct unhinted intervals: 1, 3, 7, 14, 30, 60 days; wrong or hinted: ten minutes and streak reset. Three correct unhinted answers in a row mark a target as mastered. Failed session questions are retried after up to three intervening questions, at most twice per item. Session repetitions are included in accuracy statistics.

## Limits

No account sync or promised offline mode. Species photos are local static assets with their own documented licenses. Local browser data can be cleared by privacy modes or storage cleanup; JSON export is the portable backup. The validation proves source alignment and structural integrity, not ongoing availability of every external eBird page. Occurrence source periods and editorial status interpretation are documented in the app.

## Wikimedia Commons photos

`dist/photos.json` maps every species ID to locally served Wikimedia Commons photos in `dist/images/`. Six additional historical scientific illustrations are clearly labeled; converted, cropped or PDF-rendered assets record their transformation and original legend. Existing photos remain unchanged. A primary record can contain `additional` records, with `sexes` and German `label` fields for a photographed male, female or pair. Each image retains its own author, optional required attribution, image title, Commons description URL, license and license URL, download URL, source SHA-1 and local SHA-256. The browser never contacts Wikimedia to display a photo. It shows source and license links beside each image; full titles and optional attribution are available under Image credit. Failed image loads provide the eBird species gallery. Learning photos appear only after grading, alongside a permanent eBird species link. Lesson images are prepared by the existing lesson cache when pictures are enabled. `data/photo-sex-review.json` records the scope and source evidence of the sex review; size alone cannot be compared using these photos.

Images were selected from the corresponding English Wikipedia species articles, with scientific-name redirects and Wikidata P225 taxon names checked. Four taxonomic exceptions are documented in `data/commons-taxon-exceptions.json`; the Thrush Nightingale uses an alternative Wikidata P18 photo under CC BY-SA 4.0. `data/commons-photo-sources.json` retains the retrieved file metadata, including descriptions and licensing information. Image licenses apply separately to each image.

Run `node scripts/validate-photos.mjs` to verify coverage, taxon mappings, attribution, licenses and local file hashes. `python scripts/fetch-commons-photos.py` restores missing image files from their recorded Wikimedia URLs and verifies their hashes. It uses only the Python standard library and does not overwrite an existing file with different bytes. Derived illustration assets must be restored from Git; their source file is not byte-identical to the displayed conversion/crop/PDF render. See `docs/illustrations-update-20261021.md`.

## Learning photo cache

`dist/photo-cache.js` prefetches and decodes the current and next two question photos only when lesson photos are enabled. It retains up to 12 decoded image objects and reuses the actual element after grading, avoiding lazy-load scheduling and repeat decoding for nearby retries. Compressed responses are stored in the browser Cache API (`birdnames-photos-v1`) with content-hash URLs; old versions of a replaced photo are removed. Cache restrictions or quota errors fall back to memory reuse, and a host that rejects blob image URLs falls back to a preloaded normal image URL. Image caching is separate from IndexedDB learning records. The browser can evict either storage under its usual policies; this does not make the whole app available offline.

Run `node scripts/test-photo-cache.mjs` for network deduplication, decoded-object reuse, persistent cache reuse without network, invalidation, memory limits and recovery tests.

## UI/UX update

See `docs/ui-ux-density-20261030.md` for follow-ups through 2 November, including lookup regions, species packages and regional previews. See `docs/ui-ux-update-20261021.md` for the approved UX scope, storage compatibility and browser verification. Existing learning records are preserved; only new UI settings and a resumable lesson state are added.

## German alternative and historical names

`dist/german-names.json` adds a sourced editorial overlay without changing the eBird species dataset. Names are separated into current alternatives (including regional and traditional names) and historical attestations, with per-name source and usage notes. `dist/logic.js` includes these names in search; English and code answers retain their existing acceptance rules. Lookup and all answer reveals/feedback share the same centered-in-study display. See `docs/german-names-update-20261022.md` and run `node scripts/test-german-names.mjs`.

## Modular bird-name languages

The header offers explicit German and English interface choices. In either interface, question and answer names are independently selectable: German, English, Dutch and the binomial scientific name. A swap button reverses them. Names, codes and mixed lessons support text entry, flashcards and multiple choice. Both names must exist for a species to be eligible; missing translations never fall back to a different answer language. A paused lesson whose name data cannot be loaded is preserved and cannot be resumed until the data returns.

Dutch names for all 313 existing species come from the `Dutch` column of the retained official `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx` records. Reproduce them with `python3 scripts/build-name-language.py --language nl --column Dutch`. `dist/languages/nl.json` records provenance and exact official names. No new taxa, speculative name translations or taxonomy migrations are introduced. The original German and English data, photos and attribution remain available. Dutch names are also searchable and shown in lookup.

`dist/name-languages.js` is the shared registry and resolver for names, labels, accepted alternatives and Unicode-aware answer comparison. To add another language, add its registry entry and a sourced JSON file in the same version-1 schema. Session and progress validation derive supported name targets from this registry. UI translations remain separate in `dist/i18n.js`; bird names marked `data-name-content` are never transformed by UI translation.

Progress is per species and answer name, independent of the question name. Existing `:en`, `:de` and `:code` records retain their meaning; Dutch uses `:nl` and scientific names use `:sci`. Version-1 JSON exports include every target, and older backups remain importable. Settings and the current lesson use shared storage across both interface languages; legacy lessons recover their original question language on migration. New lessons save the selected names explicitly, so changing setup does not alter an existing queue. Statistics have their own answer-name selector.

Checks: `node scripts/test-multilingual.mjs`, alongside the existing answer, alias and lesson-state tests. See `docs/dutch-learning-20261029.md`.

## Regional learning with GitHub Actions

`EBIRD_API_KEY` is a repository Actions secret. The Pages workflow uses it only in the Python refresh step, never in browser code, repository files or published artifacts. Standard GitHub-hosted runners in this public repository keep this workflow within GitHub's free compute offering; no external backend is used. The schedule runs daily at 04:23 UTC, with manual and push triggers also available. On each run, the workflow reuses a validated public regional snapshot when every list is less than 24 hours old; only an expired or incomplete snapshot triggers eBird requests. Manual runs can force a refresh. Scheduled jobs can be delayed or disabled by GitHub after prolonged repository inactivity.

`scripts/update-regions.py` discovers Germany's 16 federal states, the Netherlands' 12 provinces and the United Kingdom's four constituent countries (England, Scotland, Wales and Northern Ireland), then fetches all-time taxon lists and recent species observations (`back=30`, `cat=species`, provisional observations excluded). `data/region-countries.json` declares supported countries independently of name-language and UI support. Country and region are separate selectors. Only exact species-ID matches in the existing local learning dataset are retained. No taxonomy changes or speculative mappings are made. Original eBird taxon counts can exceed the app's coverage and can include non-species taxa in the all-time lists. Recent records indicate reports, not abundance or sighting probability.

The generated `dist/regions.json` contains public region labels, matched species IDs, total returned taxon counts and per-list fetch timestamps. It is generated during deployment, not committed. The browser never sends a request to eBird. The updater loads the previous public Pages snapshot without credentials and retains successful lists independently if a refresh fails; a failed region discovery or completely unusable first snapshot stops deployment. Credentials are sent only to the fixed HTTPS eBird API origin, and redirects are rejected. Response bodies and credential-bearing exceptions are not logged. Only allowlisted fields can be copied from the previous snapshot. A list older than three days is visibly marked in the UI.

Lookup has an independently remembered optional region filter with all-time or recent-30-day records; its former vocabulary-level filter has been removed. Learning region and list mode persist with the shared study settings. Region membership intersects species-group, name-availability and progress filters; global packages apply only without a region. Missing or empty selected lists produce no eligible questions. Regional multiple-choice distractors also come from the selected regional snapshot, and paused lessons retain their original regional membership. Learning records and export format are unchanged.

Checks: `python3 -m unittest discover -s scripts -p 'test_regions.py'` and `node scripts/test-regions.mjs`. API reference: https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest .

UK uses the official eBird country code `GB`. The country selector offers “United Kingdom (UK)”, with whole-country and constituent-country lists. German subregion labels are declared in the country configuration; their keys are verified against the discovered official eBird region codes. Both recent and all-time lists participate in the existing daily refresh and last-good-snapshot fallback. Region coverage remains limited to the existing learning catalogue.

## Fine UK regional filters

UK now uses the eBird hierarchy country → constituent country → local (`subnational2`) region. The updater discovers the available local regions under each UK constituent country from eBird rather than maintaining invented boundaries. Selecting a country or constituent country resets the narrower selection; stored local selections are restored on reload. Unavailable local lists remain unavailable instead of silently broadening the quiz. Existing country/state/province selections and paused lessons remain compatible.

`includeLocalRegions` in the country configuration enables the additional discovery level. Three bounded network workers share a global 0.5-second request-start interval (at most two starts per second), and individual failed lists retain the previous valid snapshot. The workflow timeout is 20 minutes to accommodate the larger first refresh. Only matched species IDs, counts, timestamps and public hierarchy metadata are published; no coordinates, checklist records or credentials are included. The app still uses the 313-species catalogue; recent and all-time records also support the hybrid seasonal selection described below.

### Shared learning setup

The interface switch translates the current learning context. Settings use `birdnames-ui-shared-v1`; the first visit adopts the current interface's legacy settings, falling back to the other interface. Old preference keys remain as recovery copies. IndexedDB `lesson-state-v2` shares the current lesson and preserves a second legacy paused lesson until the first is finished. Learning records and the version 1 JSON export/import format are unchanged. Active questions, drafts and feedback survive interface switches; ordinary reloads still pause the lesson.

Learning setup begins with country/region and species selection. Without a region, it offers the three global species packages. With a region, a live preview compares all records, seasonal selection and recent records, with counts, species lists and automatic current additions. Seasonal frequency choices show their counts and expandable species lists. Further filters and learning-target/session controls use disclosures before the start button. The summary includes active region, list mode or packages, groups, study scope and pictures. Code-only learning hides the unused answer-language/swap controls and explains separate code progress. `node scripts/test-learning-settings.mjs` checks migration and selection messages.

English editorial metadata is centralized in `dist/editorial-en.js`. `node scripts/test-editorial-translations.mjs` checks coverage of every species status/note, German-name explanation/region and photo label/comparison/transformation in the current dataset. Names and original source titles remain unchanged.

Study feedback and backup errors use explicit locale-aware message composition. `node scripts/test-study-translations.mjs` checks counters, review/hint/retry combinations, singular/plural forms and import errors in English and German. Selected-group chips render translated labels; species names in difficult-species statistics keep their original language.

### Data and privacy information

`dist/info-page.js` renders matching German and English information sections. Species/level/media totals and regional coverage/timestamps derive from loaded data; the review date is separate from taxonomy and dataset dates. English source links have English descriptions and retain original titles in a disclosure. The page documents the Actions-only eBird fetch, hosting requests, shared learning context, local storage/cache, backup scope and domain migration. Tests: `node scripts/test-information.mjs`.

### Learning-progress terminology

The UI distinguishes the fixed round questions (first attempts in the current round, which may include previously practised targets) from extra attempts after errors. The progress bar counts first attempts whether correct or incorrect; pending extra attempts remain visible even when the bar is full. Setup, pause, feedback and summaries use the same definitions. Statistics explain that due reviews and mastered targets can overlap, and feedback shows the current consecutive unhinted-correct streak before the photos. This is a presentation change; scheduling, grading, saved lessons and export formats retain their existing semantics.

### Backup and restore flow

Statistics visibly identifies browser/device-local storage and links directly to backup controls. The dated JSON download includes all answer-language/code records independently of current filters; preferences, paused sessions, drafts and cached media are excluded. Selecting a file only validates and previews it, showing its date, supported learning-target/species counts and the current browser counts. Explicit replacement overwrites all progress without merging and ends paused sessions. Users can download their current records before replacement or cancel without changing them. Empty backups have a distinct removal warning; files containing only unsupported records are rejected, while partially supported files report skipped records.

`dist/learning-storage.js` writes records and saved lessons in one transaction. Restore publishes the new in-memory state only after the transaction commits; quota, closed-database or synchronous write failures preserve the prior state. Export format version 1 remains compatible. Browser downloads are announced as started, rather than claiming the file has been saved to disk.

### Keyboard and screenreader behavior

The first Tab reaches Skip to content; activating it focuses the current search, answer field or heading without changing routes. Route changes, removed group/species controls, statistics-language changes and paused-session preparation preserve meaningful focus. Queued render focus never overrides an intervening user focus change. Native modal picture dialogs start at Close, support Escape and return focus to the invoking picture.

Typed questions describe their language pair, bird and attempt type. Feedback focuses the result with accepted names, learning consequences and progress as its description; photos and source credits are outside that automatic announcement. The next Tab reaches Next. Flashcard reveal focuses the answer group before the two grading buttons. Search announcements are coalesced and route changes cancel stale messages. Scientific names use the valid Latin language tag, and the redundant scientific-name lookup row was removed. Keyboard focus has an explicit visible outline, including forced-colors styling.

### WAVE report and initial document

The initial HTML now has a meaningful heading and four real hash-route containers, with descriptions and a no-JavaScript explanation. These are the same containers used by the running application. Only the active view is shown; inactive content is cleared so stale forms, duplicate control IDs and inactive headings do not enter navigation.

The public WAVE report at https://wave.webaim.org/report#/https://dg1tal.github.io/birdnamesde/ initially reported zero errors, zero contrast errors and six alerts: one missing heading structure and five broken same-page targets. Inspection showed the initial document in its report frame, with no application scripts. Its findings therefore do not cover the live quiz, feedback or backup interactions; these need separate browser/screenreader checks. WebAIM recommends its browser extension for highly dynamic content.

The post-deployment rerun of the same public report found **0 errors, 0 contrast errors and 1 alert**. All six original alerts were removed. The remaining alert identifies the intentional `noscript` element; its German/English content explains the JavaScript requirement and does not replace the accessible interactive UI.

WAVE scope clarification: inspection of the final report frame showed zero script elements and an unloaded app stylesheet (`link.sheet` was null). Its zero contrast findings therefore do not evaluate the actual application palette. The static heading/fragment checks remain useful; interactive behavior and styled contrast require evaluation of the loaded application, for example with the WAVE browser extension. The initial descriptions and noscript guidance do not make the application functional without JavaScript.

## Hybrid regional learning

Regional learning defaults to the experimental seasonal frequency groups “Frequent” (≥10%) and “Medium” (1–<10%). “Rare” (>0–<1%) can be added or selected independently. Rates are weighted complete-checklist reporting proportions for the selected region and season, not abundance or difficulty. Zero/missing seasonal reports do not form a rare group. Current notable records are always included automatically in regional learning; the former checkbox and opt-out setting have been removed. Global species packages do not restrict regional rounds; language, species-group and progress filters still apply. See `dist/seasonal-data.html` for user-facing methods, limitations and source terms.

`dist/seasonal-species.json` contains experimental derived species sets from one-off 2021–2025 eBird histogram exports for all 16 German states and DE-BY-GAP. Fifteen states support all four seasons. Saarland falls back in every season; DE-BY-GAP supports spring/summer only. For each season, sum reporting frequency × checklist count over its twelve four-per-month bins, then divide by their total checklist count. Assign positive-rate catalog species to the three mutually exclusive groups. The legacy `ids` array retains the ≥1% default set for older clients; new clients use `groups` and a persisted `frequencyGroups` selection. Accept the seasonal set only with ≥300 checklists overall and ≥3 separate years with ≥100 checklists in that season. December, January and February belong to the same calendar-year sample. The aggregate sets are static and must be regenerated from approved source data when expanding coverage; do not automate authenticated histogram downloads by exporting browser cookies. Regions/seasons without sufficient data visibly fall back to the regional occurrence list. The selection threshold is provisional and is not a difficulty classification or a guarantee of detectability. Raw exports are not redistributed.

`scripts/update-current.py` runs after the regional-list refresh in the existing daily Pages workflow, using the existing `EBIRD_API_KEY` secret. It requests recent notable reports (`back=14`, `includeProvisional=false`) and additionally requires `obsValid === true`. Only catalog species IDs and observation/expiry dates are published in `current-notable.json`; no observer identities, checklist IDs or coordinates. Its tracked empty file is a bootstrap; deployment generates the actual snapshot. Valid snapshots under 24 hours are reused. Fetch failures retain the original timestamps and never extend validity. The client ignores snapshots older than three days and observations after their exclusive expiry at 00:00 UTC, fourteen days after observation. A report indicates a notable occurrence, not an increase in frequency.

Current species outside the selected base are automatically included and labelled as additions in setup and questions, with observation and expiry dates. Species already in the selected historical group are not duplicated or reclassified. Species-group, progress and name filters still apply to the current layer. Normally up to one fifth of a fixed-size round consists of additions (at least one if eligible); they may fill a shortage of base questions. “All” includes every eligible species. Active and paused rounds freeze their selection, chosen frequency groups and dated metadata; their badge explicitly refers to the start of the round. New rounds apply expiry afresh. Derived seasonal and current data retain the eBird source terms and are excluded from the MIT code license.

Checks: `node scripts/test-hybrid-learning.mjs` and `python3 -m unittest discover -s scripts -p 'test_current.py'`, alongside the existing app/regional tests.

Reproduction: run `python3 scripts/build-seasonal.py /path/to/private/histogram-folder`. Inputs are `regions.json` (code/nameDe), `CODE-taxa.json` (scientific name → exact species ID from visible eBird links), `raw/CODE-2021-2025.tsv` and five `raw/CODE-YEAR.tsv` files per region. It validates 48 bins, rates, scientific-name mappings, and exact agreement between the individual-year sample sums and pooled samples. Outputs are the derived app sets and `data/seasonal-histogram-provenance.json` with source links, SHA-256 hashes, seasonal coverage and annual sample totals. The 102 original exports remain private and outside this repository. No EBD integration or automatic histogram download is configured. The client labels seasonal selection as experimental, including its question/session summary.

Answer-card explanations: the first-attempt label is hidden; in-round retries show only “Wiederholung” / “Repeat”. After grading, a closed “Warum sehe ich diesen Vogel?” disclosure follows all photos and their credits, before the Next action in reading/tab order. It contains the pre-grading question reason, mastery and scheduling details. Reasons are captured before reviewing the answer and saved with the lesson queue; older graded sessions use neutral wording rather than inferring the reason from updated records. Screenreader feedback focus describes the answer, without automatically reading the folded learning details.

Regional round selection (region, season, chosen frequency groups and historical period) is shown in the folded answer-card explanation instead of above every question. A current addition retains only a short “Aktuell gemeldet” badge; its observation/expiry dates are shown in the explanation together with the original round-selection snapshot.
