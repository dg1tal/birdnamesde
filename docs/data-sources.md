# Data sources and reproduction

[README](../README.md) · Commands run from the repository root.

## Taxonomy and national selection

The 994-species catalogue combines all-time eBird country lists for DE (597 mapped
species), NL (587), GB (875), FI (483) and FR (659), retaining the original 313
German entries. Occurrence includes historical rarities and introduced/escaped
birds; it does not establish breeding or establishment status.

| Source or record | Purpose |
| --- | --- |
| [Official v2025 CSV](https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv), saved as `data/taxonomy.csv` | Species concepts and REPORT_AS links |
| [Official v2025 workbook](https://cornell.box.com/s/zjci66divvqnz00k98r7pmmb6kpc69zs), `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx` | Common names and retained taxonomy, pinned by SHA-256 |
| `data/official-records.json` | Literal workbook records for regeneration |
| `data/catalog-country-lists.json` / `dist/catalog-review.json` | Source lists, retrieval date and excluded/unmapped taxa |
| `data/catalog-baseline.json` | Original IDs, names, codes and editorial metadata |
| [DDA report](https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf), `data/selection.json` | Original German breeding/wintering selection |

The German baseline is editorial: DDA categories I/III excluding extinct
populations, plus regular nonbreeders and migrants checked against DO-G v3.2
(2019). Species notes document later status corrections and merged concepts.
Feral pigeon is retained as Rock Pigeon; domestic Swan Goose has no separate
species entry. The legacy `finalize-data.py` refuses to overwrite the union.

## Catalogue and lookup

Run **Review catalogue sources** in Actions to fetch national taxon lists and
first-level regions with the repository eBird secret. Review additions and
exclusions before rebuilding; daily regional refreshes do not expand the catalogue.

```sh
python3 scripts/build-catalog.py --workbook /tmp/birdnames-v2025.xlsx --countries data/catalog-country-lists.json
python3 scripts/build-name-language.py --language nl --column Dutch
python3 scripts/build-name-language.py --language fi --column Finnish
python3 scripts/build-name-language.py --language fr --column French
python3 scripts/validate-data.py
```

Dutch and French cover all 994 species; Finnish covers 986. Names come from the
workbook columns shown above and are stored in `dist/languages/`. Missing names
exclude the affected learning pair. After catalogue changes, reimport all five
private EBD archives and regenerate the [seasonal release](ebd-import.md).
Catalogue fingerprints invalidate regional/current caches; progress keeps its IDs.

Lookup initially adopts the learning country, then remembers its own geography.
**Search area and display** controls country, optional subregion/30-day filter,
main name and additional languages. **All supported countries** searches the union.
Reset preserves country/name languages and clears other filters. Search covers
all available languages and aliases, loading 60 results at a time. Missing title
names use a labelled scientific-name fallback. German status notes appear only
for German selections. Ranking is described in [search design](search-design-20261108.md).

**All names for copying** includes the current scientific name, every available
language, deduplicated German alternatives and distinct British/US English lines,
regardless of display settings. Denied clipboard access selects the text for
manual copying. Tests: `scripts/test-lookup-settings.mjs`.

## Official quick-code policy

Codes are literal `sci_quick_codes`, `com_quick_codes` and `banding_code` values
from `eBird_Taxonomy_v2026_5-tab_27Oct2026.xlsx`; source URL, SHA-256 and worldwide
collision counts are in `data/code-records.json`. Names/species limits stay at
v2025. Twelve concept-verified scientific combinations use the 2026 display name;
both dated names are shown and accepted. `spofly1` retains 2025 codes because its
2026 ID denotes a slash taxon. Code values are never generated from names.

Scientific candidates rank first. Within scientific/other candidates, prefer the
fewest matching species worldwide, then banding codes, then alphabetical order.
All candidates remain accepted/searchable; some species lack a unique code.
`scientificCodes` identifies scientific badges; `scientificCodeName` keeps the
source name. `python3 scripts/code_policy.py --workbook /path/to/workbook.xlsx` imports a
checksum-verified source; without that option it reuses saved records.

The stored `sci` remains the 2025 provenance/media key. Explanations must match
`primaryName(species, 'sci')` exactly. Shared IDs or spelling do not establish
concept equivalence; Spotted Flycatcher, European Robin and Great Horned Owl
require separate migration decisions. See the [identity review](catalog-identity-review-20261108.md).

## Code collision audit

`python3 scripts/audit-codes.py` validates codes and regenerates
[quick-code-audit.json](quick-code-audit.json). Of 2,069 accepted codes, 218 are
ambiguous within the catalogue. There are 45 common-name/banding and 14
scientific/banding collisions; categories overlap. Adding banding codes creates
49 additional ambiguous codes. Three-letter entries are outside the four-letter
eBird policy. These catalogue counts differ from worldwide ranking counts.

Scientific badges are purple, banding teal and DDA blue; English-name eBird codes
have a separate palette. Dual-origin badges split their colours. The legend
includes origins shown in expanded collisions, whose badges retain each species'
provenance. Display groups preserve source ranking within each origin. References
show available systems; accepted-answer cards show only the selected system.

## Scientific-name meanings

`dist/scientific-names.json` explains genus and epithet for all 994 species in
German, English and Dutch. Entries in `data/scientific-name-*.txt` compile with
`python3 scripts/build-scientific-names.py`; `--check` verifies the output.
Jobling (2010), online *Key to Scientific Names* and linked supplementary sources
support short editorial explanations. Source languages, roots, compounds,
dedications and uncertainty are recorded per term; dictionary text is not bundled.

`data/scientific-name-overrides.json` separates homonyms and taxon-specific
histories. `data/scientific-name-evidence.json` labels reference scope (meaning,
component, history, dedication, identity or context). Explanations appear during
introductions, answer reveals and lookup, never beside unanswered questions.
Study uses question language, lookup its title language; French/Finnish/scientific
selections use the interface language. Loading failure omits optional explanations.

| Review | Evidence |
| --- | --- |
| Initial coverage and source scope | [Feasibility](scientific-name-feasibility-20261107.json), [follow-up](scientific-name-followup-20261108.json) |
| Word roots and disputed terms | [Depth](scientific-name-depth-review-20261123.json), [content](scientific-name-content-review-20261123.json), [uncertainty](scientific-name-uncertainty-review-20261123.json) |
| Previously unmarked terms | [Systematic review](scientific-name-unmarked-review-20261123.json) |
| Online Jobling and eponyms | [26 November comparison](scientific-name-source-comparison-20261126.json) |

The last review checked all current/alternate components online and the publisher
preview of Beolens, Watkins and Grayson's *The Eponym Dictionary of Birds* through
printed page 61. It records 29 revisions; the Tamil derivation of `kundoo` remains
a proposal. Further reading, not consulted in full: Viktor Wember (2005),
*Die Namen der Vögel Europas*, Aula-Verlag, ISBN 3-89104-678-2.

## German alternative and historical names

`dist/german-names.json` overlays sourced current alternatives and historical
attestations, with usage notes. Current alternatives are searchable and shown
when German participates in learning; ambiguous names are labelled separately
from accepted answers. Historical names remain in source disclosures. See the
[German-name review](german-names-update-20261022.md).

## Species photos and illustrations

All 994 species have media: 1,420 photographs and eight labelled historical
illustrations, stored locally in `dist/images/`. `dist/photos.json` records each
image's author/required attribution, title, source, licence, download URL,
source SHA-1 where available and local SHA-256. Transformations and original
legends are recorded for derived illustrations. Cards show credits and licences;
failed loads link to the eBird gallery.

There are at most two images per species. `data/photo-sex-review.json` records
explicit both-sex evidence for 370 species; single-image or unestablished states
do not imply monomorphism. Discovery uses Wikipedia, scientific-name redirects
and Wikidata P225. Records are retained in `data/commons-photo-sources.json`,
`data/commons-taxon-exceptions.json` and `data/inaturalist-photo-sources.json`.

```sh
node scripts/validate-photos.mjs
python3 scripts/fetch-commons-photos.py
```

The fetcher restores missing originals and verifies hashes; it rejects existing
different bytes. Restore converted/cropped/PDF illustrations from Git.
`python3 scripts/collect-commons-photos.py --help` describes discovery, sex-search, enrichment and
staging. `scripts/collect-inaturalist-photos.py` supplements exact research-grade taxon
matches with compatible photo licences. Both stage candidates for review.
[Acquisition decisions](photos-expansion-20261105.md) and the
[FI/FR extension](photos-finland-france-20261123.md) record review limits.

## EBD import and activation

[Private EBD import](ebd-import.md) documents source archives, aggregation rules,
terms and release `ebd-relSepOct-2026-2021-2025-catalog-v3`. Raw records stay outside
Git. `data/ebd-taxon-crosswalk.json` records reviewed source-concept rollups;
rounds retain each country's release.

## DDA breeding-survey abbreviations

The [interactive DDA list](https://www.dda-web.de/monitoring/mhb/artkuerzel) uses
`/api/species/abbreviations`. The reviewed 22 November 2026 response has 262 rows:
261 active mapped entries and a deprecated duplicate Swan Goose `Hög`. The page's
source date is 28 February 2020. `data/dda-code-records.json` retains source rows,
hash, fetch time and reviewed concept mappings, including narrower-scope notes.
Mixed case and umlauts are preserved.

`python3 scripts/update-dda.py --from-records` regenerates the bootstrap;
`--check` verifies it. New IDs/concepts require review; deprecated rows are excluded.
The [deployment guide](deployment-and-regions.md#dda-abbreviation-refresh) covers
live refreshes. Run the [full checks](development.md#checks) after data updates.
