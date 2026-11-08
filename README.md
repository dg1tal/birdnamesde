# BirdNames DE

Public, buildless, browser-local bird-name dictionary and spaced-repetition trainer. No runtime dependencies, analytics, server database, or authentication. The GitHub Pages workflow publishes `dist/`; `.openai/hosting.json` retains the separate Sites hosting identity.

Documentation reviewed against the repository on 5 November 2026. UI labels below use the English interface. Dated reports in `docs/` retain their release-specific verification results; later changes are noted where they supersede earlier behavior.

## License and third-party material

The original application code in `dist/` (HTML, CSS and JavaScript), the code in `scripts/`, and project configuration are licensed under the [MIT License](LICENSE), copyright (c) 2026 DG1TAL. A copy of the license in `dist/LICENSE` accompanies the hosted application. This grant does not cover the JSON datasets, images, or other third-party material in this repository.

The photos and illustrations in `dist/images/` retain their individual licenses and attribution requirements, recorded per image in `dist/photos.json`. The eBird/Clements taxonomy, common names, quick codes, EBD-derived seasonal groups and API-derived regional data are sourced from Cornell Lab of Ornithology/eBird; this project's MIT license does not grant rights to those materials. Review the [eBird API terms](https://www.birds.cornell.edu/home/ebird-api-terms-of-use/) and [eBird data access terms](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/) before reusing or redistributing them. Other source material and editorial provenance are documented below.

## eBird data sources and citation

**The eBird Basic Dataset (EBD) itself is not included in this repository.**
Neither the country download archives nor raw observation or sampling-event
records are published here. The seasonal data files contain derived aggregates:
regional species groups and summary checklist counts.

The seasonal frequency groups for Germany, the Netherlands and the UK are derived
from the **eBird Basic Dataset (EBD), September 2026 release**, restricted to
2021–2025. The previous histogram exports are historical provenance only.
Regional all-time/30-day species lists and current notable reports still use the
eBird API. Taxonomy, names and quick codes retain their existing sources below.

Source dataset used to calculate the seasonal aggregates:

> eBird Basic Dataset. Version: EBD_relSep-2026. Cornell Lab of Ornithology, Ithaca, New York. Sep 2026.

General eBird project reference:

Sullivan, B.L., C.L. Wood, M.J. Iliff, R.E. Bonney, D. Fink, and S. Kelling. 2009. eBird: a citizen-based bird observation network in the biological sciences. Biological Conservation 142: 2282-2292.
[DOI](https://doi.org/10.1016/j.biocon.2009.05.006).

We thank the Cornell Lab of Ornithology for providing the eBird data and the eBird
contributors for their observations. The source EBD is available through the
[official eBird data access page](https://science.ebird.org/en/use-ebird-data/download-ebird-data-products).
Derived data retain the [eBird Data Access Terms of Use](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/),
including the full terms distributed in `dist/ebd-terms.txt`; they are excluded from
the code's MIT licence. Attribution does not imply endorsement by Cornell or eBird.

## Application

- `dist/species.json`: independently replaceable species data and provenance metadata.
- `dist/logic.js`: search normalization, answer acceptance, progress helpers and import validation.
- `dist/learning-model.js`: daily introduction budget, learning contexts, evidence and review scheduling.
- `dist/practice-queue.js`: custom and direct-continuation practice queues.
- `dist/learning-method.js`: bilingual learning-method explanations and research references.
- `dist/learning-selection-copy.js`: shared species-selection and daily introduction wording.
- `dist/app.js`: lookup, daily/custom learning, text/flashcard/direct-choice/think-first answers, IndexedDB persistence, statistics, JSON export/import and theme.
- `dist/study-state.js`: serializable lesson recovery, single grading and separate first-question/retry progress.
- `dist/style.css`: responsive layout and dark mode.
- `dist/validation.json`: complete machine validation result, code collisions and limitations.

## Checks

CI selects Node.js 26 LTS and standard CPython 3.15, taking current stable patches
within those release lines, on Ubuntu 26.04. Use the same runtime lines locally.
The app has no npm dependencies; no npm install or package-manager cache is needed.

```sh
npm test
for test in scripts/test-*.mjs; do node "$test" || exit 1; done
python3 -m unittest discover -s scripts -p 'test_*.py'
python3 scripts/validate-data.py
python3 scripts/build-scientific-names.py --check
python3 scripts/build-ebd-seasonal.py --check
python3 scripts/check-private-ebd.py
node scripts/validate-photos.mjs
for file in dist/*.js; do node --check "$file" || exit 1; done
git diff --exit-code -- dist data
git diff --check
```

No build step is required. Serve `dist/` as static assets, for example with `python3 -m http.server 8000 --directory dist`. The Pages workflow runs the deployment checks and refreshes regional/current data before uploading this directory. `scripts/finalize-data.py` regenerates data and is not a read-only check; run it only when intentionally updating the dataset.

Browser verification and its limits are recorded in the dated reports below. Recent checks include responsive layouts, keyboard navigation, backup/restore and lesson recovery. Physical mobile keyboards and actual screenreader speech remain unverified.

### Optional workbook tooling

Only the legacy `scripts/build-data.py` importer needs openpyxl. Install its pinned
development dependency in a virtual environment outside the checkout:

```sh
python3.15 -m venv /tmp/birdnames-workbook-venv
/tmp/birdnames-workbook-venv/bin/python -m pip install -r requirements-dev.txt
```

Routine checks and deployment do not install this dependency. Loading the workbook
for inspection does not require running the importer or regenerating datasets.

### Dependency maintenance

GitHub Actions are pinned to full commit SHAs with release-version comments.
Dependabot proposes monthly updates for Actions and the optional Python dependency,
targeting `main`, with at most five open pull requests per ecosystem and no automatic
merging. Review migration notes and run the checks before merging. Runtime major
upgrades are reviewed separately; patch releases within the selected lines are
picked up by the setup actions. The workflows log their runtime versions.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys `dist/` from `main` without a build step. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The app's data, scripts, styles, photos and license links use relative paths, so the repository URL path works without a custom base URL. Keep the existing Sites publication independent of this workflow.

Learning progress is stored per browser origin. Before switching domains, open **Statistics → Back up and restore progress** on the existing site and export the JSON backup. On GitHub Pages, open the same section and import that file. Import replaces the current progress on the Pages origin after confirmation, so export any progress made there first. Browser settings and a paused lesson are not part of the progress export.

## Data provenance and reproduction

Scientific-name meanings: `dist/scientific-names.json` supplies separate, concise
editorial glosses of the genus and epithet for all 940 catalogue species, in German,
English and Dutch. Explicit entries in `data/scientific-name-*.txt` are compiled by
`python3 scripts/build-scientific-names.py`; `--check` verifies the tracked output.
The reviewed source matches are recorded in
`docs/scientific-name-feasibility-20261107.json`. Jobling (2010) is the main
etymological reference; individual pages and supplementary publications are linked
with the explanations. No source dictionary text is bundled. Glosses are short
editorial renderings, not translations of entire entries or new accepted answers.
Uncertain derivations are marked. `data/scientific-name-overrides.json` resolves
taxon-specific homonyms: the two Fischers, the two Naumanns, and the different
Sandwich localities. Generic and specific names have separate case-sensitive
entries; meanings are never inferred by stripping suffixes at runtime.

The closed disclosure appears below lookup names, in introductions, and after
grading/revealing an answer. It never appears alongside an unanswered question or
answer choices. Study uses the session's question language; lookup uses its title
language. Scientific-name questions/titles fall back to the interface language.
All three prose languages are independent of the German/English interface.
Source titles retain their original language. Loading failures omit this optional
content without affecting lessons. A changed scientific combination cannot reuse
an explanation merely because the species ID stayed the same.

Validation checks complete three-language coverage, exact current scientific
names, source links, ambiguous dedications/localities, safe rendering, language
selection and graceful failure. The initial feasibility categories are preliminary
and are not runtime translation rules. The data remain outside the code's MIT grant.

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

Entry codes are literal `sci_quick_codes`, `com_quick_codes` and `banding_code` entries from the official `eBird_Taxonomy_v2026_5-tab_27Oct2026.xlsx` workbook, available through the same eBird Bird Names download page (Box link and SHA-256 in `data/code-records.json`). Taxonomy and names remain pinned to v2025. `spofly1` (Spotted Flycatcher) retains its official 2025 codes because that ID is a slash in v2026; the exception is recorded explicitly. Scientific quick codes are primary and visibly labelled in both lookup and study cards. No code is generated from a name.

`scripts/code_policy.py --workbook /path/to/eBird_Taxonomy_v2026_5-tab_27Oct2026.xlsx` imports the checksum-verified source and updates the catalogue. Without `--workbook`, it regenerates code fields from the saved records. The full source species table supplies worldwide collision counts across scientific codes, common-name variants and banding codes, counting each species once per code. The retained 2025 Spotted Flycatcher concept is included. Scientific codes lead the list. Within scientific and other candidates separately, prefer the fewest matching species worldwide; ties prefer the banding code, then alphabetical order. All other current candidates remain accepted and searchable. This selects ANFA/ANSE for the two bean geese, TUME for Blackbird and GAGL for Eurasian Jay. `scientificCodes` identifies the highlighted badges; `scientificCodeName` preserves the exact source name. Where the v2026 scientific name differs from the retained v2025 catalogue name, both views explicitly state which name the code refers to. Some species have no unique official code. The saved source includes the relevant literal records, global counts, source provenance and exception, and routine catalogue rebuilding applies this policy to retained and added species alike.

The former editorial species packages are no longer used in the interface or learning selection. Historical numeric `level` metadata stays in the catalogue for data compatibility. Learning evidence is separated by species, question language, answer name/code and method family. The daily-round and scheduling rules are described under [Learning-progress terminology](#learning-progress-terminology).

## Limits

No account sync or promised offline mode. Species photos are local static assets with their own documented licenses. Local browser data can be cleared by privacy modes or storage cleanup; JSON export is the portable backup. The validation proves source alignment and structural integrity, not ongoing availability of every external eBird page. Occurrence source periods and editorial status interpretation are documented in the app.

## Species photos and illustrations

`dist/photos.json` maps every species ID to locally served Wikimedia Commons and iNaturalist photos in `dist/images/`. Eight historical scientific illustrations are clearly labeled; converted, cropped or PDF-rendered assets record their transformation and original legend. Existing photos remain unchanged. A primary record can contain `additional` records, with `sexes` and German `label` fields for a photographed male, female or pair. Each image retains its own author, optional required attribution, image title, source description URL, license and license URL, download URL, source SHA-1 when provided and local SHA-256. The browser loads all displayed pictures locally. It shows source and license links beside each image; full titles and optional attribution are available under Image credit. Failed image loads provide the eBird species gallery. Learning photos appear during first introductions and after grading; feedback also includes a permanent eBird species link. Lesson images are prepared by the existing lesson cache when pictures are enabled. `data/photo-sex-review.json` records the scope and source evidence of the sex review; size alone cannot be compared using these photos.

Images were selected from the corresponding English Wikipedia species articles, with scientific-name redirects and Wikidata P225 taxon names checked. Four taxonomic exceptions are documented in `data/commons-taxon-exceptions.json`; the Thrush Nightingale uses an alternative Wikidata P18 photo under CC BY-SA 4.0. `data/commons-photo-sources.json` retains the retrieved file metadata, including descriptions and licensing information. Image licenses apply separately to each image.

Run `node scripts/validate-photos.mjs` to verify coverage, taxon mappings, attribution, licenses and local file hashes. `python scripts/fetch-commons-photos.py` restores missing image files from their recorded source URLs and verifies their hashes. It uses only the Python standard library and does not overwrite an existing file with different bytes. Derived illustration assets must be restored from Git; their source file is not byte-identical to the displayed conversion/crop/PDF render. See `docs/illustrations-update-20261021.md`.

The 5 November 2026 expansion adds images for all 627 newly catalogued species: the 940-species catalogue now includes 1,352 photographs and eight labelled historical illustrations. Both sexes have explicit source evidence for 356 species. Eleven recognised comparison gaps remain flagged; “single-image” and “not-established” review states do not establish that a species is monomorphic. The original 313 species’ records and assets are preserved and checked against `data/photo-baseline-20261105.json`.

Redundant unlabelled lead images have been removed where two labelled comparison images exist. A validator enforces at most two images per species in the manifest, which is shared by lookup, image dialogs and learning.

The acquisition commands in `scripts/collect-commons-photos.py` stage candidates for review rather than publish automatically. Use its `--help` for discovery, sex searches, source enrichment and staging phases. `scripts/collect-inaturalist-photos.py` supplements missing candidates with exact research-grade taxon matches and compatible individual-photo licenses. `data/inaturalist-photo-sources.json` retains selected taxon, photo-license and explicit sex-annotation evidence without observation coordinates. See [the acquisition review](docs/photos-expansion-20261105.md) for selection decisions, limitations and remaining gaps.

## Learning photo cache

`dist/photo-cache.js` prefetches and decodes the current and next two question photos only when lesson photos are enabled. It retains up to 12 decoded image objects and reuses the actual element after grading, avoiding lazy-load scheduling and repeat decoding for nearby retries. Compressed responses are stored in the browser Cache API (`birdnames-photos-v1`) with content-hash URLs; old versions of a replaced photo are removed. Cache restrictions or quota errors fall back to memory reuse, and a host that rejects blob image URLs falls back to a preloaded normal image URL. Image caching is separate from IndexedDB learning records. The browser can evict either storage under its usual policies; this does not make the whole app available offline.

Run `node scripts/test-photo-cache.mjs` for network deduplication, decoded-object reuse, persistent cache reuse without network, invalidation, memory limits and recovery tests.

## UI/UX update

See `docs/ui-ux-density-20261030.md` for follow-ups reviewed on 4 November, including lookup regions, species packages, regional previews and the current daily-learning flow. See `docs/ui-ux-update-20261021.md` for the approved UX scope, storage compatibility and browser verification. Historical learning records are preserved. Current evidence, daily introduction budgets and saved lessons use the version-2 learning model described below.

## German alternative and historical names

`dist/german-names.json` adds a sourced editorial overlay without changing the eBird species dataset. Names are separated into current alternatives (including regional and traditional names) and historical attestations, with per-name source and usage notes. `dist/logic.js` includes these names in search; English and code answers retain their existing acceptance rules. Lookup and all answer reveals/feedback share the same centered-in-study display. See `docs/german-names-update-20261022.md` and run `node scripts/test-german-names.mjs`.

## Modular bird-name languages

The header offers explicit German and English interface choices. In either interface, question and answer names are independently selectable: German, English, Dutch and the binomial scientific name. A swap button reverses them. Names, codes and mixed lessons support text entry, flashcards, direct multiple choice and “Think first” (options initially hidden). Both names must exist for a species to be eligible; missing translations never fall back to a different answer language. A paused lesson whose name data cannot be loaded is preserved and cannot be resumed until the data returns.

Dutch names for the expanded catalogue come from the `Dutch` column of the retained official `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx` records. Reproduce them with `python3 scripts/build-name-language.py --language nl --column Dutch`. `dist/languages/nl.json` records provenance and exact official names. Names are literal official records; the catalogue expansion retains the pinned v2025 taxonomy without speculative translations. Dutch names are searchable and shown in lookup alongside the existing names, photos and attribution.

`dist/name-languages.js` is the shared registry and resolver for names, labels, accepted alternatives and Unicode-aware answer comparison. To add another language, add its registry entry and a sourced JSON file in the same version-1 schema. Session and progress validation derive supported name targets from this registry. UI translations remain separate in `dist/i18n.js`; bird names marked `data-name-content` are never transformed by UI translation.

Progress records retain the outer `species-id:target` keys: `:en`, `:de`, `:code`, `:nl` and `:sci`. Within each record, `contexts` separates question language and method family: text uses recall, flashcards use self-assessment, and direct choice/“Think first” share recognition. Changing direction or method family does not transfer secure status. See [Backup and restore flow](#backup-and-restore-flow) for export contents and legacy compatibility.

Settings and the current lesson use shared storage across both interface languages; legacy lessons recover their original question language on migration. New lessons save the selected names explicitly, so changing setup does not alter an existing queue. Statistics have an answer-name selector and use the current question language and method family for secure/due counts; aggregate answer totals retain historical answers across methods.

Checks: `node scripts/test-multilingual.mjs`, alongside the existing answer, alias and lesson-state tests. See `docs/dutch-learning-20261029.md`.

## Regional learning with GitHub Actions

`EBIRD_API_KEY` is a repository Actions secret. The Pages workflow uses it only in the Python refresh step, never in browser code, repository files or published artifacts. Standard GitHub-hosted runners in this public repository keep this workflow within GitHub's free compute offering; no external backend is used. The schedule runs daily at 04:23 UTC, with manual and push triggers also available. On each run, the workflow reuses a validated public regional snapshot when every list is less than 24 hours old; only an expired or incomplete snapshot triggers eBird requests. Manual runs can force a refresh. Scheduled jobs can be delayed or disabled by GitHub after prolonged repository inactivity.

`scripts/update-regions.py` discovers Germany's 16 federal states, the Netherlands' 12 provinces and the United Kingdom's four constituent countries (England, Scotland, Wales and Northern Ireland), then fetches all-time taxon lists and recent species observations (`back=30`, `cat=species`, provisional observations excluded). `data/region-countries.json` declares supported countries independently of name-language and UI support. Country and region are separate selectors. Source taxa are resolved only through official v2025 species IDs and REPORT_AS links. Daily refreshes report candidate species and unknown source taxa; they never add catalogue entries automatically. Original eBird taxon counts can exceed the app's coverage and can include non-species taxa in the all-time lists. Recent records indicate reports, not abundance or sighting probability.

The generated `dist/regions.json` contains public region labels, matched species IDs, total returned taxon counts and per-list fetch timestamps. It is generated during deployment, not committed. The browser never sends a request to eBird. The updater loads the previous public Pages snapshot without credentials and retains successful lists independently if a refresh fails; a failed region discovery or completely unusable first snapshot stops deployment. Credentials are sent only to the fixed HTTPS eBird API origin, and redirects are rejected. Response bodies and credential-bearing exceptions are not logged. Only allowlisted fields can be copied from the previous snapshot. A list older than three days is visibly marked in the UI.

Lookup has an independently remembered optional region filter with all-time or recent-30-day records; its former vocabulary-level filter has been removed. Learning region and list mode persist with the shared study settings. Regional discovery intersects species-group and name-availability filters; custom practice also applies its progress filter. Every new learning selection requires a country or region; missing geography never enables unrestricted learning. Missing or empty regional lists prevent introductions/custom questions from that selection; daily due reviews of started targets remain available. Regional custom-practice distractors use the saved regional membership, while daily-round distractors can come from the whole eligible catalogue. Paused lessons preserve their original queue. Daily regional data does not automatically change the reviewed catalogue; progress/export compatibility follows the version-2 learning model below.

Checks: `python3 -m unittest discover -s scripts -p 'test_regions.py'` and `node scripts/test-regions.mjs`. API reference: https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest .

UK uses the official eBird country code `GB`. The country selector offers “United Kingdom (UK)”, with whole-country and constituent-country lists. German subregion labels are declared in the country configuration; their keys are verified against the discovered official eBird region codes. Both recent and all-time lists participate in the existing daily refresh and last-good-snapshot fallback. Region coverage remains limited to the existing learning catalogue.

## Fine UK regional filters

UK now uses the eBird hierarchy country → constituent country → local (`subnational2`) region. The updater discovers the available local regions under each UK constituent country from eBird rather than maintaining invented boundaries. Selecting a country or constituent country resets the narrower selection; stored local selections are restored on reload. Unavailable local lists remain unavailable instead of silently broadening the quiz. Existing country/state/province selections and paused lessons remain compatible.

`includeLocalRegions` in the country configuration enables the additional discovery level. Three bounded network workers share a global 0.5-second request-start interval (at most two starts per second), and individual failed lists retain the previous valid snapshot. The workflow timeout is 20 minutes to accommodate the larger first refresh. Only matched species IDs, counts, timestamps and public hierarchy metadata are published; no coordinates, checklist records or credentials are included. The app uses the reviewed DE/NL/UK union catalogue; recent and all-time records also support the hybrid seasonal selection described below.

### Shared learning setup

The interface switch translates the current learning context. Settings use `birdnames-ui-shared-v1`; the first visit adopts the current interface's legacy settings, falling back to the other interface. Old preference keys remain as recovery copies. IndexedDB `lesson-state-v2` shares the current lesson and preserves a second legacy paused lesson until the first is finished. Learning records now include method/direction evidence; exports use version 2 and imports accept versions 1 and 2. Active questions, drafts and feedback survive interface switches; ordinary reloads still pause the lesson.

Learning setup leads with the daily round and a shared settings disclosure. Species selection determines new introductions; already started targets remain eligible for due review independently of those species filters. Shared settings include question/answer names, method, region, species groups, pictures and regional selection. Regional previews compare all records, seasonal selection and recent records, with counts, species lists and automatic current additions. Their counts apply shared species/name filters and exclude the custom progress filter. Seasonal frequency choices show counts and expandable lists.

Learning settings remain collapsible, with four equally framed groups for learning target/languages, region, species selection and answer method/pictures. Species-group filters and selections from statistics belong inside the species-selection frame. The collapsed summary includes matching species and picture state; selection errors remain visible above the settings disclosure. All learning selections use regional data and additional species-group filters.

“Build another round yourself” adds custom question-count and progress controls. “Keep learning” uses the shared settings with up to ten questions and all progress states, irrespective of those custom controls. Code-only learning hides unused answer-language/swap controls. `node scripts/test-learning-settings.mjs` checks migration and selection messages; `node scripts/test-practice-queue.mjs` checks direct continuation.

English editorial metadata is centralized in `dist/editorial-en.js`. `node scripts/test-editorial-translations.mjs` checks coverage of every species status/note, German-name explanation/region and photo label/comparison/transformation in the current dataset. Names and original source titles remain unchanged.

Study feedback and backup errors use explicit locale-aware message composition. `node scripts/test-study-translations.mjs` checks counters, review/hint/retry combinations, singular/plural forms and import errors in English and German. Selected-group chips render translated labels; species names in difficult-species statistics keep their original language.

### Data and privacy information

`dist/info-page.js` renders matching German and English information sections. Species/media totals and regional coverage/timestamps derive from loaded data; the review date is separate from taxonomy and dataset dates. English source links have English descriptions and retain original titles in a disclosure. The page documents the Actions-only eBird fetch, hosting requests, shared learning context, local storage/cache, backup scope and domain migration. Tests: `node scripts/test-information.mjs`.

### Learning-progress terminology

The daily round offers at most ten targets, due reviews first, with three new introductions per local calendar day across languages and methods. Region/season/species filters govern discovery, while started targets remain eligible for review. Free practice retains the full filters and can introduce more targets. “Keep learning” starts an optional round of up to ten questions directly from completion or an exhausted daily queue, preserving shared species/language/method settings while ignoring hidden custom progress filters and question counts. Custom and direct practice share the queue builder in `dist/practice-queue.js` (`node scripts/test-practice-queue.mjs`). New pairs are introduced before practice. Introduction cards lead with a short memorisation instruction and use the focused study view with Next/Pause controls and compact spacing. At viewport widths of at least 900 px and heights of at least 650 px, actions stay inside the card using sticky positioning; smaller viewports retain the fixed action bar. Image heights budget for all image rows, captions and card padding, with readable minimum sizes and scrolling on small screens. The monospace code badge follows the full answer name on introduction, flashcard and feedback views; code-only answers are not duplicated. “Think first” hides options until requested, without a timer; option order, introduction state and feedback survive pause/reload.

`dist/learning-model.js` owns the shared product constants and pure scheduling logic. Evidence is separated by species, question language, answer target and method family (recognition, recall, self-assessment). Three consecutive due successes at least 24 hours after the previous graded attempt confirm security; initial practice, hints, retries and early practice do not. Fixed intervals remain 1/3/7/14/30/60 days. Errors reduce the stage and schedule a ten-minute review. Correct early practice/retries preserve scheduled dates; a successful due short-gap repair schedules the next day without confirmation. Hints preserve confirmations and retain earlier dates. Feedback explanations remain below the images. First answers, supported answers and bounded extra attempts are counted separately. A retry requires at least one intervening question and is preferably placed after three.

The completion summary places direct continuation before supplementary details, offers additional due reviews when available and omits the next-review timestamp.

`#lernmethode` is a separate bilingual view with the actual rules, seven research sources and explicit distinction between research principles and product thresholds. Footer/setup/statistics links open it; active sessions are paused. `#info` retains data, storage, network, licensing and backup information. Tests: `node scripts/test-learning-model.mjs` and `node scripts/test-learning-method.mjs`.

### Backup and restore flow

Statistics visibly identifies browser/device-local storage and links directly to backup controls. The dated JSON download includes all answer-language/code records, method/direction evidence and the daily introduction ledger independently of current filters; preferences, paused sessions, drafts and cached media are excluded. Selecting a file only validates and previews it, showing its date, supported learning-target/species counts and the current browser counts. Explicit replacement overwrites all progress without merging and ends paused sessions. Users can download their current records before replacement or cancel without changing them. Empty backups have a distinct removal warning; files containing only unsupported records are rejected, while partially supported files report skipped records.

`dist/learning-storage.js` writes records, the daily ledger and saved lessons in one transaction. Restore publishes the new in-memory state only after the transaction commits; quota, closed-database or synchronous write failures preserve the prior state. Export format v2 includes method/direction evidence and the daily introduction ledger. Imports accept v1/v2; old counters/dates are retained as historical data, with no invented source-language or method evidence. The first graded legacy review claims its old date once for the selected context. Paused v1 sessions remain resumable. Browser downloads are announced as started, rather than claiming the file has been saved to disk.

### Keyboard and screenreader behavior

The first Tab reaches Skip to content; activating it focuses the current search, answer field or heading without changing routes. Route changes, removed group/species controls, statistics-language changes and paused-session preparation preserve meaningful focus. Queued render focus never overrides an intervening user focus change. Native modal picture dialogs start at Close, support Escape and return focus to the invoking picture.

Typed questions describe their language pair, bird and attempt type. Feedback focuses the result with accepted names, learning consequences and progress as its description; photos and source credits are outside that automatic announcement. The folded explanation and optional image/source controls precede Next in reading/tab order. Flashcard reveal focuses the answer group before the two grading buttons. Search announcements are coalesced and route changes cancel stale messages. Scientific names use the valid Latin language tag, and the redundant scientific-name lookup row was removed. Keyboard focus has an explicit visible outline, including forced-colors styling.

### WAVE report and initial document

The initial HTML has a meaningful heading, four original hash-route containers and a fifth for the learning-method view, with descriptions and a no-JavaScript explanation. The WAVE results below record the earlier four-view release; they are not a new audit of the current application. These are the same containers used by the running application. Only the active view is shown; inactive content is cleared so stale forms, duplicate control IDs and inactive headings do not enter navigation.

The [public WAVE report](https://wave.webaim.org/report#/https://dg1tal.github.io/birdnamesde/) originally found 0 errors, 0 contrast errors and 6 alerts (one heading-structure alert and five broken same-page targets). After deployment, a rerun found 0 errors, 0 contrast errors and 1 alert: the intentional `noscript` element explaining the JavaScript requirement in both languages. All six original alerts were resolved.

The report frame contained no scripts and an unloaded stylesheet (`link.sheet` was null). Its heading/fragment findings concern the initial document; its contrast result does not assess the application palette. The live quiz, feedback, backup interactions and styled contrast require separate checks. WebAIM recommends its browser extension for dynamic content. Initial descriptions and noscript guidance do not make the app work without JavaScript.

## Hybrid regional learning

New users start with Germany — whole country (`DE`). Existing settings without a region migrate to this country and the default seasonal groups, with a dismissible one-time explanation. Existing regions, other learning preferences, progress and paused queues are preserved. Lookup keeps its optional independent regional filter. Country selection starts with the whole country; all lists use the reviewed country-union catalogue and report unresolved/non-species source taxa separately. Missing API lists can still use supported seasonal data; unavailable selections are labelled and never broadened to the unrestricted catalogue.

Regional learning defaults to the seasonal frequency groups “Frequent” (≥10%) and “Medium” (1–<10%). “Rare” (>0–<1%) can be added or selected independently. Rates are weighted complete-checklist reporting proportions for the selected region and season, not abundance or difficulty. Zero/missing seasonal reports do not form a rare group. Current notable records are always included automatically in regional learning; the former checkbox and opt-out setting have been removed. Legacy species-package selections are removed from preferences and no longer restrict discovery. Shared language/species-group filters still apply; progress filters apply to custom practice. Daily due reviews remain eligible beyond the current species selection. See `dist/seasonal-data.html` for user-facing methods, limitations and source terms.

`dist/seasonal-species.json` contains seasonal groups from the eBird Basic Dataset, September 2026 release, restricted to 2021–2025 for DE, NL and GB. It is built from the reviewed aggregate preview, never from raw observations in CI. All 144 source region codes exactly match the reviewed public API hierarchy; GB-ENG-HAL has no historical sample and uses the regional fallback. The preview's complete-checklist, observation-type, taxon-concept, accepted-record and shared-group rules are documented in `docs/ebd-import.md`. Frequency thresholds remain frequent ≥10%, medium ≥1% and <10%, rare >0% and <1%; the default remains frequent + medium. The sample gate remains ≥300 independent complete checklists overall and ≥3 years with ≥100 each. Winter uses December, January and February of the respective calendar years. Unsupported or missing region/seasons visibly fall back to the regional occurrence list. Reporting proportions do not measure abundance, learning difficulty or sighting probability. Raw EBD is never redistributed. `dist/seasonal-provenance.json` records the sources, hashes, method and exact region matching; `dist/ebd-terms.txt` supplies the full source terms.

`scripts/update-current.py` runs after the regional-list refresh in the existing daily Pages workflow, using the existing `EBIRD_API_KEY` secret. It requests recent notable reports (`back=14`, `includeProvisional=false`) and additionally requires `obsValid === true`. Only catalog species IDs and observation/expiry dates are published in `current-notable.json`; no observer identities, checklist IDs or coordinates. Its tracked empty file is a bootstrap; deployment generates the actual snapshot. Valid snapshots under 24 hours are reused. Fetch failures retain the original timestamps and never extend validity. The client ignores snapshots older than three days and observations after their exclusive expiry at 00:00 UTC, fourteen days after observation. A report indicates a notable occurrence, not an increase in frequency.

Current species outside the selected base are automatically included in regional discovery and labelled as additions in setup and questions. Observation and expiry dates appear in the folded answer explanation. Species already in the selected historical group are not duplicated or reclassified. Shared species-group and name filters apply to the current layer; custom progress filters narrow custom rounds. Regional eligibility feeds the daily/practice queue builders, whose due/new priorities determine the actual round. Daily discovery gives current additions priority among potential new targets; it does not reserve a fixed share of the round. “All” in custom practice includes every eligible species. Active and paused rounds freeze their selection, chosen frequency groups and dated metadata; their folded answer explanation refers to the start of the round. New rounds apply expiry afresh. Derived seasonal and current data retain the eBird source terms and are excluded from the MIT code license.

Checks: `node scripts/test-hybrid-learning.mjs` and `python3 -m unittest discover -s scripts -p 'test_current.py'`, alongside the existing app/regional tests.

Reproduce the active EBD release with `python3 scripts/build-ebd-seasonal.py`; verify tracked outputs with `--check`. The generator takes the reviewed `data/ebd-seasonal-preview.json` and `data/ebd-region-match.json`, checks the unchanged period/thresholds and exact region IDs, and generates the compact seasonal data, provenance, full terms and bilingual method/coverage page together. The coverage tables derive from the data, including absent historical samples. New regional rounds snapshot the dataset source/version; legacy and paused rounds retain their existing queue, metadata and progress without retrospective source assignment. See `docs/ebd-import.md` for rebuilding the private import. The former histogram importer `scripts/build-seasonal.py` and `data/seasonal-histogram-provenance.json` remain as historical reproduction tools/audit and are not used for the active release.

Answer-card explanations: the first-attempt label is hidden; in-round retries show only “Repeat”. After grading, a closed “Why am I seeing this bird?” disclosure follows all photos and their credits, before the Next action in reading/tab order. It contains the pre-grading question reason, method-specific confirmations and scheduling details. Reasons are captured before reviewing the answer and saved with the lesson queue; older graded sessions use neutral wording rather than inferring the reason from updated records. Screenreader feedback focus describes the answer, without automatically reading the folded learning details.

Regional round selection (region, season, chosen frequency groups and historical period) is shown in the folded answer-card explanation instead of above every question. A current addition retains only a short “Currently reported” badge; its observation/expiry dates are shown in the explanation together with the original round-selection snapshot.

The completion summary offers “Back to learning settings”, which opens the editable setup without starting a round. A click on the already-active Learn navigation link also opens setup instead of waiting for a hashchange. Existing settings and any saved session are preserved; if another session remains, setup is expanded and its separate resume action remains available.

## EBD import and activation

`scripts/import-ebd.py` streams explicitly selected private country ZIP archives from
`/Users/thumax/EBD/downloads/` into `data/ebd-seasonal-preview.json`. This intermediate
aggregate is reviewed before activation; `scripts/build-ebd-seasonal.py` generates
the active app data from it. The raw data remain outside Git and Pages. Both the
preview and published aggregates are derived eBird data excluded from the MIT code
licence. See `docs/ebd-import.md` for reproduction, filters and source terms.
Run `python3 -m unittest discover -s scripts -p 'test_ebd*.py'`,
`python3 scripts/build-ebd-seasonal.py --check` and
`python3 scripts/check-private-ebd.py` before committing an update.

## Reviewed international catalogue and lookup (5 November 2026)

The catalogue now contains 940 species: the union of public all-time eBird country
lists for DE (596 mapped species), NL (587) and GB/UK (875), retaining all 313
original German entries. Historical rarities and recorded introduced/escaped birds
may occur in these lists. Membership is an occurrence record, not a breeding or
establishment classification. Source taxa that cannot be mapped to one v2025
species are listed in `dist/catalog-review.json`; the source lists and retrieval
date are retained in `data/catalog-country-lists.json`. The exact official v2025
workbook is pinned by SHA-256, while `data/taxonomy.csv` supplies species/concept
and REPORT_AS links. The original catalogue is retained in
`data/catalog-baseline.json` to verify IDs, names, codes, aliases and editorial
metadata. The old Germany-only `finalize-data.py` refuses to overwrite this union.

Run the manual **Review catalogue sources** Actions workflow to obtain fresh
unfiltered national lists using the existing eBird secret. Its artifact contains
public taxon IDs only. Catalogue updates require review; they are not part of the
daily Pages refresh. To regenerate from the reviewed source workbook:

```sh
python3 scripts/build-catalog.py --workbook /tmp/birdnames-v2025.xlsx --countries data/catalog-country-lists.json
python3 scripts/build-name-language.py --language nl --column Dutch
python3 scripts/validate-data.py
```

The official workbook source is
https://cornell.box.com/s/zjci66divvqnz00k98r7pmmb6kpc69zs
(`eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`). Review candidates, exclusions,
missing names/codes and the complete output diff before activating another
catalogue. Reimport all three private EBD country archives using the commands in
`docs/ebd-import.md`, then regenerate the seasonal release. The new release ID is
`ebd-relSep-2026-2021-2025-catalog-v2`; the sampling period, checklist rules and
thresholds are unchanged. Regional and current-notable caches carry the catalogue
fingerprint; an older catalogue's fresh cache cannot suppress the required first
refresh. Older paused lessons and progress remain keyed by the same IDs.

Lookup first adopts the learning country (not its subregion), then independently
remembers its own geography. Existing saved lookup regions are retained. Country
selection is always visible; the shared catalogue is available under **All
supported countries**. Optional subregion and 30-day controls apply within one
country. Reset preserves country and name languages, clearing search, species
group, subregion and period. Title/sort language and additional name languages are
independent of geography and study settings. Scientific names and codes remain
visible; missing title names use the scientific name with an explicit notice.
Search still includes every available language and alias. Results render 60 cards
at a time. Only German selections display the retained German status and notes;
those national statements never become subregional breeding claims.

New species need no local picture: the existing gallery fallback handles missing
media. Existing pictures and licences are retained. A species can only enter a
study language pair if both required names exist, and code questions require an
actual official code. Coverage and counts in the information view are dynamic.

Checks: `node scripts/test-lookup-settings.mjs`,
`python3 -m unittest discover -s scripts -p 'test_catalog.py'`, the existing complete
Node/Python suite, data validation, EBD reproducibility and media validation.

## Protected progress recovery (5 November 2026)

Saved learning state is validated before migration or any normal write. The same
counter/date rules apply to backups and local records, including method contexts
and legacy values; optional historical counters remain optional. Unsupported
entries retain the existing skip-and-report behavior during backup import. Local
startup never silently removes unsupported or damaged records.

If records, the daily ledger or a saved lesson cannot be restored safely, Learn
and Statistics show a recovery view in the selected interface language. Lookup
remains available. Normal learning writes are blocked, and the original stored
state is kept until the user explicitly replaces it with a checked v1/v2 backup.
Readable original state can be downloaded as a separately marked rescue JSON
file; this is diagnostic material, not an importable progress backup. A failed
replacement keeps both the original data and the recovery lock. A reload retries
storage initialization. Opening/reading storage is bounded to ten seconds; late
callbacks cannot publish state or start normal writes after a timeout. Backup
format version 2 and IndexedDB database version 1 remain unchanged.

Round recovery uses the catalogue size and `RULES.maxRetries`: at most two initial
targets per species, each with its permitted extra attempts (5,640 entries for
940 species and two retries). Large v1/v2 rounds retain their queue, counters,
feedback and draft instead of being discarded at the former 1,878-entry limit.

`dist/progress-validation.js` owns shared record and daily-ledger validation;
`dist/learning-storage.js` owns bounded loading and atomic replacement. Run
`node scripts/test-learning-recovery.mjs` for the fixed 1,750-question large-round
regression, maximum sizes, legacy backup round trips, malformed counters/dates,
failed/aborted/blocked reads, late callbacks and preservation of original data.
See `docs/quality-review-20261105.md` for the original findings and verification.


## Completion messages and module consistency

A positive completion message requires all round questions and extra attempts to
be finished. Daily-round completion additionally checks the currently offered
questions for the same learning direction/method and remaining reviews today.
Ending a round early preserves its graded answers and reports its open questions.
Setup and completion share `dailyLearningPlan()`; current additions retain their
priority among new candidates without reserving a fixed share. The unused former
quota queue has been removed. `scripts/test-hybrid-learning.mjs` exercises the
actual daily/practice paths, and `scripts/test-progress-copy.mjs` checks the
completion conditions in German and English.

Run `node scripts/test-module-versions.mjs` to check that production imports and
the HTML entry point use a single URL version for each local JavaScript module.
This check runs in the existing Pages test loop.

### Code collision audit

Run `python3 scripts/audit-codes.py` to validate all catalogue code fields against the saved literal source records and regenerate `docs/quick-code-audit.json`. The report lists every ambiguous code, its species and source types. In the current 940-species catalogue, 197 of 1,966 distinct accepted codes match multiple species. There are 42 common-name/banding collisions and 12 scientific/banding collisions (categories can overlap). Adding banding codes to scientific and common-name codes creates 46 additional ambiguous codes; some ambiguities already exist within a single source type. These are catalogue counts, not worldwide counts. Three-letter source entries are outside the app's four-letter code policy.

Banding codes use teal badges in lookup and learning answers. Scientific codes retain purple badges; a code with both roles keeps purple and lists both roles in its accessible description and tooltip. Other badges represent English quick codes. A bilingual legend shows each source type in the matching badge style, using smaller proportional text, and warns that codes can match multiple species. Accepted answers and code ordering are unchanged.
