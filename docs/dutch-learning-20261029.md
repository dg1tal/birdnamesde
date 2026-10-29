# Dutch learning and Netherlands regions — 29 October 2026

The interface language is separated from question and answer languages. German, English and Dutch can be combined in both interfaces. The shared name-language registry supplies labels, primary names and accepted answers; new languages need an entry plus a sourced JSON overlay. Dutch names are literal workbook entries, not automatic translations.

## Data

- 313/313 Dutch names extracted from the retained `Dutch` column in `data/official-records.json`.
- Source workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`; https://support.ebird.org/en/support/solutions/articles/48000804865-bird-names-in-ebird .
- The generator verifies scientific-name alignment before extracting a translation. Existing IDs, scientific names, English/German names, codes, images and licences are unchanged.
- The learning catalogue remains the original 313 species. Dutch regional reports outside it remain excluded with visible coverage counts. Regional membership does not assign difficulty or automatically expand the taxonomy. The known Grauschnäpper ID migration remains separate.
- Germany and the Netherlands are declared in `data/region-countries.json`; the GitHub updater discovers official subregion IDs and fetches all-time and recent-30-day lists for each country and its states/provinces. Only matched species IDs and public metadata are published. Credentials remain in Actions secrets.

## Storage and compatibility

Existing English/German/code target keys and version-1 backups retain their meaning. Dutch adds `species-id:nl`. Progress is tied to the answer language; switching the question language does not reset learning. Statistics can select each registered name language. New lesson snapshots save source and name-target languages. Legacy snapshots infer the original source language from their existing interface slot. UI preferences and paused lessons retain their per-interface storage slots, and interface switching pauses the current lesson as before.

Name-language coverage is shown before starting. Same-language name quizzes are disabled; code quizzes remain possible in any source language. Missing source/answer translations exclude the species. If an overlay cannot load, affected paused lessons are retained and resuming is disabled rather than accepting or displaying a name from another language.

## Verification

Automated checks cover all 313 Dutch entries against the original records, registered language pairs, Dutch search and acceptance, accents/Unicode normalization, empty/unsupported answers, missing translations, independent target records, legacy/Dutch import and lesson recovery, region membership and API-output sanitization.

Local browser checks: German UI Deutsch → Niederländisch text answer (Gartengrasmücke → Tuinfluiter), English UI English → Dutch flashcard (Green-winged Teal → Wintertaling), Dutch → English multiple choice (Putter → European Goldfinch), Dutch search (Boomklever → Kleiber), Dutch statistics and recovery of an old English → German graded lesson. Live Netherlands data and both interfaces are checked after deployment.
