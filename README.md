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

No build step required. Serve `dist/` as static assets; publish using the Sites workflow. Visual desktop/mobile browser QA was unavailable in the creation environment; do not claim it was performed.

## Data provenance and reproduction

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

Official common-name quick codes are literal `com_quick_codes` entries. When that field is empty, the official `banding_code` entry supplies the eBird entry shortcut; these cases are explicitly marked in the UI and validation report. Scientific quick codes are excluded. Multiple common-name variants and code collisions are intentional; no code is generated from a name. The Blackbird primary common-name quick code is EUBL, with the official alternate COBL accepted. Code groups and aliases must stay attached to the official species ID.

Learning levels are editorial vocabulary sets, independent of learning progress. Learning schedules are separate per species ID and target (`en`/`code`). Correct unhinted intervals: 1, 3, 7, 14, 30, 60 days; wrong or hinted: ten minutes and streak reset. Three correct unhinted answers in a row mark a target as mastered. Failed session questions are retried after up to three intervening questions, at most twice per item. Session repetitions are included in accuracy statistics.

## Limits

No account sync, promised offline mode, or external image assets. Local browser data can be cleared by privacy modes or storage cleanup; JSON export is the portable backup. The validation proves source alignment and structural integrity, not ongoing availability of every external eBird page. Occurrence source periods and editorial status interpretation are documented in the app.
