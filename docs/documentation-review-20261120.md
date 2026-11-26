# Documentation and README screenshots · 20 November 2026

Reviewed the README and the current development, learning/storage, data-source and deployment guides against application commit `62f79cb` and the 19–20 November UI review. Dated earlier reports retain their original scope and verification claims.

## Corrections and additions

- Documented the current desktop/mobile navigation, phone Display disclosure, collapsed lookup controls, learning-settings layout and information-page contents lists.
- Replaced the old code-badge/outer More information description with the current answer, reference, picture and sibling-source sections.
- Documented visible German alternatives in both learning directions, with ambiguous alternatives separate from accepted answers. The existing audit covers all 47 current alternatives for 34 species.
- Clarified that scientific-name explanations match the displayed name, including the eleven reviewed 2026 combinations, rather than blindly reusing the stored 2025 source key.
- Retained French/Dutch coverage of 940 species and Finnish coverage of 933, with missing-name exclusion and interface-language fallback for explanation prose.
- Corrected the stale JSON/gzip schema description to version 3, retained v1/v2 import compatibility, and included saved species in the atomic-storage description.
- Distinguished version-2 lesson/evidence handling from version-3 portable backups and added the missing module references to the development guide.

## Screenshot provenance

All six README captures were made from the unchanged application in a separate local origin on 20 November 2026, at **430 × 932 CSS pixels**, German interface, light theme. They are ordinary viewport screenshots, not full-page composites or physical-phone captures. No production progress was read or modified, and no browser state was injected to manufacture the views.

The README gallery was subsequently refreshed on 26 November; see the [new capture record](readme-screenshots-20261126.md). The links below retain the original 20 November images in a dated archive.

| Image | Visible state |
| --- | --- |
| [Lookup](screenshots/20261120/mobile-lookup.jpg) | Blaumeise search result expanded; scrolled to show every name language, official codes and the save action |
| [Daily learning](screenshots/20261120/mobile-daily-learning.jpg) | Ready daily round, three new English names, Germany/autumn and collapsed shared settings |
| [Practice](screenshots/20261120/mobile-practice.jpg) | Buntspecht think-first question after revealing four options |
| [Feedback](screenshots/20261120/mobile-feedback.jpg) | Correct Buntspecht answer, scientific name, codes and credited comparison pictures; scrolled to the answer/photo area |
| [Progress](screenshots/20261120/mobile-progress.jpg) | Three started species after a completed three-question example round; no secure status or due review yet |
| [Saved species](screenshots/20261120/mobile-saved-species.jpg) | Blaumeise saved locally, with the saved-round language/method controls |

The example daily round introduced Buntspecht, Rohrweihe and Rostgans, then completed all three questions correctly through the UI. The statistics screenshot’s next-review timestamp belongs to that example. The saved list contains Blaumeise. All six files replace or extend the README’s 8 November images. Bird photos in feedback retain their credits and have explicit source/licence links below the README gallery.

Archived feedback photos: Charles J. Sharp, [male](https://commons.wikimedia.org/wiki/File:Great_spotted_woodpecker_(Dendrocopos_major)_male_Drenthe.jpg) and [female](https://commons.wikimedia.org/wiki/File:Great_spotted_woodpecker_(Dendrocopos_major)_female_Drenthe.jpg) Great Spotted Woodpecker, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0).

## Verification and limits

- Passed `npm test` and every `scripts/test-*.mjs` suite, all 47 Python tests, catalogue validation, scientific-name and EBD reproduction checks, private-EBD checks, media licence/hash validation, production JavaScript syntax and Git whitespace checks.
- Verified README/local documentation links and screenshot dimensions. Application/data files in `dist/` and `data/` have no changes in this documentation update.
- Browser checks exercised lookup/search details, saving a species, daily introductions, think-first choices, correct feedback, round completion and independent statistics. The reviewed statistics view measured 430 px document width at a 430 px viewport; no browser errors were recorded. The temporary viewport override and local server were reset/stopped after capture.
- This task does not repeat the full earlier multi-viewport, dark-mode or keyboard audit. Physical mobile keyboards and screenreader speech were not tested. The full native backup-import replacement was not repeated; automated backup/recovery tests passed. See [the UI review](ui-review-20261120.md) for the wider preceding audit and its limits.
