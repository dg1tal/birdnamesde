# BirdNames DE

Public, buildless, browser-local bird-name dictionary and spaced-repetition trainer. No runtime dependencies, analytics, server database, or authentication. Hosting identity: `.openai/hosting.json`.

## Application

- `dist/species.json`: independently replaceable species data and provenance metadata.
- `dist/logic.js`: search normalization, answer acceptance, repetition scheduling and import validation.
- `dist/app.js`: lookup, text/flashcard/multiple-choice learning, IndexedDB persistence, statistics, JSON export/import and theme.
- `dist/study-state.js`: serializable lesson recovery, single grading and separate first-question/retry progress.
- `dist/style.css`: responsive layout and dark mode.
- `dist/validation.json`: complete machine validation result, code collisions and limitations.

## Checks

```
python scripts/finalize-data.py
python scripts/validate-data.py
node scripts/test.mjs
node scripts/test-study-state.mjs
node scripts/test-photo-cache.mjs
node --check dist/app.js
```

No build step required. Serve `dist/` as static assets; publish using the Sites workflow. Original creation had no visual browser QA. The Wikimedia update was checked in Chrome preview: inline photo and license links, no photo before flashcard grading, photo after grading, and eBird fallback after a missing-image response. No physical iOS-device test was performed.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` deploys `dist/` from `main` without a build step. In the GitHub repository, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**. The app's data, scripts, styles, photos and license links use relative paths, so the repository URL path works without a custom base URL. Keep the existing Sites publication independent of this workflow.

Learning progress is stored per browser origin. Before switching domains, open **Statistik → Lernstand sichern und verwalten** on the existing site and export the JSON backup. On GitHub Pages, open the same section and import that file. Import replaces the current progress on the Pages origin after confirmation, so export any progress made there first. Browser settings and a paused lesson are not part of the progress export.

## Data provenance and reproduction

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

Official common-name quick codes are literal `com_quick_codes` entries. When that field is empty, the official `banding_code` entry supplies the eBird entry shortcut; these cases are explicitly marked in the UI and validation report. Scientific quick codes are excluded. Multiple common-name variants and code collisions are intentional; no code is generated from a name. The Blackbird primary common-name quick code is EUBL, with the official alternate COBL accepted. Code groups and aliases must stay attached to the official species ID.

Learning levels are editorial vocabulary sets, independent of learning progress. Learning schedules are separate per species ID and target (`en`/`code`). Correct unhinted intervals: 1, 3, 7, 14, 30, 60 days; wrong or hinted: ten minutes and streak reset. Three correct unhinted answers in a row mark a target as mastered. Failed session questions are retried after up to three intervening questions, at most twice per item. Session repetitions are included in accuracy statistics.

## Limits

No account sync or promised offline mode. Species photos are local static assets with their own documented licenses. Local browser data can be cleared by privacy modes or storage cleanup; JSON export is the portable backup. The validation proves source alignment and structural integrity, not ongoing availability of every external eBird page. Occurrence source periods and editorial status interpretation are documented in the app.

## Wikimedia Commons photos

`dist/photos.json` maps every species ID to locally served Wikimedia Commons photos in `dist/images/`. Six additional historical scientific illustrations are clearly labeled; converted, cropped or PDF-rendered assets record their transformation and original legend. Existing photos remain unchanged. A primary record can contain `additional` records, with `sexes` and German `label` fields for a photographed male, female or pair. Each image retains its own author, optional required attribution, image title, Commons description URL, license and license URL, download URL, source SHA-1 and local SHA-256. The browser never contacts Wikimedia to display a photo. It shows source and license links beside each image; full titles and optional attribution are available under Bildnachweis. Failed image loads provide the eBird species gallery. Learning photos appear only after grading, alongside a permanent eBird species link. All images are prepared by the existing lesson cache. `data/photo-sex-review.json` records the scope and source evidence of the sex review; size alone cannot be compared using these photos.

Images were selected from the corresponding English Wikipedia species articles, with scientific-name redirects and Wikidata P225 taxon names checked. Four taxonomic exceptions are documented in `data/commons-taxon-exceptions.json`; the Thrush Nightingale uses an alternative Wikidata P18 photo under CC BY-SA 4.0. `data/commons-photo-sources.json` retains the retrieved file metadata, including descriptions and licensing information. Image licenses apply separately to each image.

Run `node scripts/validate-photos.mjs` to verify coverage, taxon mappings, attribution, licenses and local file hashes. `python scripts/fetch-commons-photos.py` restores missing image files from their recorded Wikimedia URLs and verifies their hashes. It uses only the Python standard library and does not overwrite an existing file with different bytes. Derived illustration assets must be restored from Git; their source file is not byte-identical to the displayed conversion/crop/PDF render. See `docs/illustrations-update-20261021.md`.

## Learning photo cache

`dist/photo-cache.js` prefetches and decodes the current and next two question photos only when lesson photos are enabled. It retains up to 12 decoded image objects and reuses the actual element after grading, avoiding lazy-load scheduling and repeat decoding for nearby retries. Compressed responses are stored in the browser Cache API (`birdnames-photos-v1`) with content-hash URLs; old versions of a replaced photo are removed. Cache restrictions or quota errors fall back to memory reuse, and a host that rejects blob image URLs falls back to a preloaded normal image URL. Image caching is separate from IndexedDB learning records. The browser can evict either storage under its usual policies; this does not make the whole app available offline.

Run `node scripts/test-photo-cache.mjs` for network deduplication, decoded-object reuse, persistent cache reuse without network, invalidation, memory limits and recovery tests.

## UI/UX update

See `docs/ui-ux-update-20261021.md` for the approved UX scope, storage compatibility and browser verification. Existing learning records are preserved; only new UI settings and a resumable lesson state are added.

## German alternative and historical names

`dist/german-names.json` adds a sourced editorial overlay without changing the eBird species dataset. Names are separated into current alternatives (including regional and traditional names) and historical attestations, with per-name source and usage notes. `dist/logic.js` includes these names in search; English and code answers retain their existing acceptance rules. Lookup and all answer reveals/feedback share the same centered-in-study display. See `docs/german-names-update-20261022.md` and run `node scripts/test-german-names.mjs`.

## English interface and reverse learning

The header language button switches between German UI (German → English) and English UI (English → German), including during a lesson. It saves and pauses the current lesson before switching. The language choice persists in this browser. Each direction retains its own settings and paused lesson. German-name progress uses `species-id:de`; existing `:en` and shared `:code` records retain their meaning. JSON export/import includes all directions and remains compatible with existing version-1 backups.

English mode supports text, flashcards and multiple choice. German main names and sourced current alternatives are accepted; historical or ambiguous overlay names are excluded. Umlaut transliterations (`ae`, `oe`, `ue`) and `ss` are accepted. UI labels and species groups are translated by `dist/i18n.js`; original species names, attribution and source notes are retained. English data/privacy text explains both directions. Run `node scripts/test-language-mode.mjs` alongside the existing tests.

## Regional learning with GitHub Actions

`EBIRD_API_KEY` is a repository Actions secret. The Pages workflow uses it only in the Python refresh step, never in browser code, repository files or published artifacts. Standard GitHub-hosted runners in this public repository keep this workflow within GitHub's free compute offering; no external backend is used. The schedule runs daily at 04:23 UTC, with manual and push triggers also available. Scheduled jobs can be delayed or disabled by GitHub after prolonged repository inactivity.

`scripts/update-regions.py` discovers Germany's 16 official eBird subregions, then fetches all-time taxon lists and recent species observations (`back=30`, `cat=species`, provisional observations excluded). Only exact species-ID matches in the existing local learning dataset are retained. No taxonomy changes or speculative mappings are made. Original eBird taxon counts can exceed the app's coverage and can include non-species taxa in the all-time lists. Recent records indicate reports, not abundance or sighting probability.

The generated `dist/regions.json` contains public region labels, matched species IDs, total returned taxon counts and per-list fetch timestamps. It is generated during deployment, not committed. The browser never sends a request to eBird. The updater loads the previous public Pages snapshot without credentials and retains successful lists independently if a refresh fails; a failed region discovery or completely unusable first snapshot stops deployment. Credentials are sent only to the fixed HTTPS eBird API origin, and redirects are rejected. Response bodies and credential-bearing exceptions are not logged. Only allowlisted fields can be copied from the previous snapshot. A list older than three days is visibly marked in the UI.

Region and list mode persist with each language's study settings. Region membership intersects vocabulary, group and progress filters. Missing or empty selected lists produce no eligible questions. Regional multiple-choice distractors also come from the selected regional snapshot, and paused lessons retain their original regional membership. Learning records and export format are unchanged.

Checks: `python3 -m unittest discover -s scripts -p 'test_regions.py'` and `node scripts/test-regions.mjs`. API reference: https://documenter.getpostman.com/view/664302/S1ENwy59?version=latest .
