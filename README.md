# BirdNames DE

Public, buildless, browser-local bird-name dictionary and spaced-repetition trainer. No runtime dependencies, analytics, server database, or authentication. Hosting identity: `.openai/hosting.json`.

## Application

- `dist/species.json`: independently replaceable species data and provenance metadata.
- `dist/logic.js`: search normalization, answer acceptance, repetition scheduling and import validation.
- `dist/app.js`: lookup, text/flashcard/multiple-choice learning, IndexedDB persistence, statistics, JSON export/import and theme.
- `dist/style.css`: responsive layout and dark mode.
- `dist/validation.json`: complete machine validation result, code collisions and limitations.

## Checks

```
python scripts/finalize-data.py
python scripts/validate-data.py
node scripts/test.mjs
node --check dist/app.js
```

No build step required. Serve `dist/` as static assets; publish using the Sites workflow. Original creation had no visual browser QA. The Wikimedia update was checked in Chrome preview: inline photo and license links, no photo before flashcard grading, photo after grading, and eBird fallback after a missing-image response. No physical iOS-device test was performed.

## Data provenance and reproduction

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

Official common-name quick codes are literal `com_quick_codes` entries. When that field is empty, the official `banding_code` entry supplies the eBird entry shortcut; these cases are explicitly marked in the UI and validation report. Scientific quick codes are excluded. Multiple common-name variants and code collisions are intentional; no code is generated from a name. The Blackbird primary common-name quick code is EUBL, with the official alternate COBL accepted. Code groups and aliases must stay attached to the official species ID.

Learning levels are editorial vocabulary sets, independent of learning progress. Learning schedules are separate per species ID and target (`en`/`code`). Correct unhinted intervals: 1, 3, 7, 14, 30, 60 days; wrong or hinted: ten minutes and streak reset. Three correct unhinted answers in a row mark a target as mastered. Failed session questions are retried after up to three intervening questions, at most twice per item. Session repetitions are included in accuracy statistics.

## Limits

No account sync or promised offline mode. Species photos are local static assets with their own documented licenses. Local browser data can be cleared by privacy modes or storage cleanup; JSON export is the portable backup. The validation proves source alignment and structural integrity, not ongoing availability of every external eBird page. Occurrence source periods and editorial status interpretation are documented in the app.

## Wikimedia Commons photos

`dist/photos.json` maps every species ID to one locally served, unmodified Wikimedia Commons thumbnail in `dist/images/`. Each record retains the author, optional required attribution, image title, Commons description URL, license and license URL, download URL, source SHA-1 and local SHA-256. The browser never contacts Wikimedia to display a photo. It shows source and license links beside the image; full titles and optional attribution are available under Bildnachweis. Failed image loads provide the eBird species gallery. Learning photos appear only after grading.

Images were selected from the corresponding English Wikipedia species articles, with scientific-name redirects and Wikidata P225 taxon names checked. Four taxonomic exceptions are documented in `data/commons-taxon-exceptions.json`; the Thrush Nightingale uses an alternative Wikidata P18 photo under CC BY-SA 4.0. `data/commons-photo-sources.json` retains the retrieved file metadata, including descriptions and licensing information. Image licenses apply separately to each image.

Run `node scripts/validate-photos.mjs` to verify coverage, taxon mappings, attribution, licenses and local file hashes. `python scripts/fetch-commons-photos.py` restores missing image files from their recorded Wikimedia URLs and verifies their hashes. It uses only the Python standard library and does not overwrite an existing file with different bytes.

## Learning photo cache

`dist/photo-cache.js` prefetches and decodes the current and next two question photos only when lesson photos are enabled. It retains up to 12 decoded image objects and reuses the actual element after grading, avoiding lazy-load scheduling and repeat decoding for nearby retries. Compressed responses are stored in the browser Cache API (`birdnames-photos-v1`) with content-hash URLs; old versions of a replaced photo are removed. Cache restrictions or quota errors fall back to memory reuse, and a host that rejects blob image URLs falls back to a preloaded normal image URL. Image caching is separate from IndexedDB learning records. The browser can evict either storage under its usual policies; this does not make the whole app available offline.

Run `node scripts/test-photo-cache.mjs` for network deduplication, decoded-object reuse, persistent cache reuse without network, invalidation, memory limits and recovery tests.
