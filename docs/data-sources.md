# Data sources and reproduction

[Back to the README](../README.md)

Reviewed against commit `62f79cb` on 20 November 2026.

Paths in code examples are relative to the repository root. UI labels use the English interface. Dated review reports retain their release-specific results; the thematic guides describe the documented current behavior.

## Scientific-name meanings

Scientific-name meanings: `dist/scientific-names.json` supplies separate, concise
editorial explanations of the genus and epithet for all 940 catalogue species, in German,
English and Dutch. Explicit entries in `data/scientific-name-*.txt` are compiled by
`python3 scripts/build-scientific-names.py`; `--check` verifies the tracked output.
The reviewed source matches are recorded in
[scientific-name-feasibility-20261107.json](scientific-name-feasibility-20261107.json). Jobling (2010) is the main
etymological reference; individual pages and supplementary publications are linked
with the explanations. No source dictionary text is bundled. Glosses are short
editorial renderings, not translations of entire entries or new accepted answers.
Uncertain derivations are marked. `data/scientific-name-overrides.json` resolves
taxon-specific homonyms: the two Fischers, the two Naumanns, and the different
Sandwich localities. Generic and specific names have separate case-sensitive
entries; meanings are never inferred by stripping suffixes at runtime.

The 23 November 2026 revision adds source languages, attested source words and
the constituents of compounds, rather than stopping at a translated meaning.
Diminutives explain their base word; borrowed bird names give the recorded form
and language where known. Historical genus combinations are distinguished from
direct lexical compounds. Ambiguous ancient bird names and disputed derivations
are not assigned speculative roots. The review record and coverage are in
[scientific-name-depth-review-20261123.json](scientific-name-depth-review-20261123.json).
A subsequent [targeted content review](scientific-name-content-review-20261123.json)
checked 20 terms, including 16 previously marked uncertain, and corrected or
qualified nine explanations in all three languages. In particular, the robin’s
`rubecula` now distinguishes the diminutive analysis from a competing historical
hypothesis rather than presenting one word formation as settled.
The subsequent [systematic uncertainty review](scientific-name-uncertainty-review-20261123.json)
covers all 31 remaining marked terms: together, these two content reviews cover
every term marked uncertain at the start of that pass. Thirty existing glosses
were revised in German, English and Dutch; `kundoo` was retained as unresolved.
The shared epithet `biarmicus` now has separate reedling/falcon histories, while
`rubetra` distinguishes its documented word formation from uncertain historical
bird identifications. The review lists consulted passages and unavailable sources.

The [systematic review of previously unmarked terms](scientific-name-unmarked-review-20261123.json)
then covered all 1,191 remaining entries: 389 genera and 802 epithets, including
taxon-specific overrides. It revised 49 explanations in German, English and Dutch,
corrected reference records for ten terms, and added 18 uncertainty markers.
In total, 55 entries used by 76 species changed; the earlier 47 uncertain entries
were retained unchanged. Corrections include `Acrocephalus` (high rather than
pointed head), the bird/plant distinction in `Junco`, diminutives in `Glareola`
and `Dumetella`, and taxon-specific readings of `pilaris` and `phoenicuroides`.
Competing analyses for `Entomyzon`, `moschata`, `philomelos` and `Thalasseus`
are attributed and qualified. `Sibirionetta` now cites Boetticher’s original
1929 proposal; the `audouinii` dedication cites Payraudeau, with BnF restricted
to person identity. The per-term report records consulted entries, cross-references,
source-spelling variants and before/after hashes. It also distinguishes fresh
full-text checks from the published abstract used for `richardi` and the earlier
DHLE finding carried forward for `aura`, whose page was unavailable in this pass.

Further literature suggested by the user: Viktor Wember (2005), *Die Namen der
Vögel Europas. Bedeutung der deutschen und wissenschaftlichen Namen*,
Aula-Verlag, Wiebelsheim, ISBN 3-89104-678-2. The publication was checked
bibliographically against the [Hamburg ornithological book review](https://ornithologie-hamburg.de/buchbesprechungen?start=50).
Its full text was not available for this revision, so it is recorded as further
reading and is not presented as a consulted source for individual derivations.

The follow-up review is recorded in [scientific-name-followup-20261108.json](scientific-name-followup-20261108.json).
`data/scientific-name-evidence.json` adds references with explicit scopes: word
meaning, word component, naming history, dedication, person identity or naming
context. These labels appear in the explanation language. A partial reference
supplements the main source; it does not certify the entire explanation or turn
a description without a dedication into evidence for one.

The closed disclosure appears below lookup names, in introductions, and after
grading/revealing an answer. It never appears alongside an unanswered question or
answer choices. Study uses the session's question language; lookup uses its title
language. French, Finnish and scientific-name questions/titles fall back to the interface language.
All three prose languages are independent of the German/English interface.
Source titles retain their original language. Loading failures omit this optional
content without affecting lessons. A changed scientific combination cannot reuse
an explanation merely because the species ID stayed the same.

Validation checks complete three-language coverage, exact current scientific
names, source links, ambiguous dedications/localities, safe rendering, language
selection and graceful failure. The initial feasibility categories are preliminary
and are not runtime translation rules. The data remain outside the code's MIT grant.

## Taxonomy and national selection

Official taxonomy CSV: https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2026/04/eBird_taxonomy_v2025-4.csv

Official eBird workbook: `eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`, from the “Download all common names” link on https://support.ebird.org/en/support/solutions/articles/48000804865 . The workbook includes `full_sparse`, `4_letter_codes`, and `species_groups`. Store the download temporarily as `data/names.xlsx`; `scripts/build-data.py` extracts those sheets using openpyxl. Full temporary source downloads are excluded from Git. `data/official-records.json` preserves the literal workbook records used for the selected species; it is the input for routine regeneration and validation.

DDA report: https://www.dda-web.de/downloads/publications/statusreports/vid_bestandssituation_2025.pdf . Regular native breeders (I) and established introduced breeders (III), excluding extinct populations, are the foundation. The report's wintering/resting waterbird tables add regular nonbreeders. `data/selection.json` preserves extracted fact rows. Additions cover regular winter landbirds and coastal migrants, with occurrence statuses checked against DO-G's national checklist v3.2 (2019). The selection is editorial, not a national checklist or independent peer-reviewed product. Later DDA notes correct Aquatic Warbler and Little Gull breeding extinction. Domestic Swan Goose is excluded as a domestic form without a matching species-level eBird concept; feral pigeon is retained under Rock Pigeon with an explicit note. Merged Redpoll and Tundra Swan concepts are documented in species notes.

## Official quick-code policy

Entry codes are literal `sci_quick_codes`, `com_quick_codes` and `banding_code` entries from the official `eBird_Taxonomy_v2026_5-tab_27Oct2026.xlsx` workbook, available through the same eBird Bird Names download page (Box link and SHA-256 in `data/code-records.json`). Species limits and common names remain pinned to v2025; eleven concept-verified scientific name changes use the 2026 name for display and learning, with the 2025 name also shown and accepted. `spofly1` (Spotted Flycatcher) retains its official 2025 codes because that ID is a slash in v2026; the exception is recorded explicitly. Scientific quick codes are primary and visibly labelled in both lookup and study cards. No code is generated from a name.

`scripts/code_policy.py --workbook /path/to/eBird_Taxonomy_v2026_5-tab_27Oct2026.xlsx` imports the checksum-verified source and updates the catalogue. Without `--workbook`, it regenerates code fields from the saved records. The full source species table supplies worldwide collision counts across scientific codes, common-name variants and banding codes, counting each species once per code. The retained 2025 Spotted Flycatcher concept is included. Scientific codes lead the list. Within scientific and other candidates separately, prefer the fewest matching species worldwide; ties prefer the banding code, then alphabetical order. All other current candidates remain accepted and searchable. This selects ANFA/ANSE for the two bean geese, TUME for Blackbird and GAGL for Eurasian Jay. `scientificCodes` identifies the highlighted badges; `scientificCodeName` preserves the exact source name. Where the v2026 scientific name differs from the retained v2025 catalogue name, both views display both dated names and explain that both are accepted. Some species have no unique official code. The saved source includes the relevant literal records, global counts, source provenance and exception, and routine catalogue rebuilding applies this policy to retained and added species alike.

Historical numeric `level` metadata remains in the catalogue for compatibility; species packages no longer control the interface or learning selection. See [learning contexts and scheduling](learning-and-storage.md#learning-progress-terminology).

## Catalogue and lookup

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
python3 scripts/build-name-language.py --language fi --column Finnish
python3 scripts/build-name-language.py --language fr --column French
python3 scripts/validate-data.py
```

The official workbook source is
https://cornell.box.com/s/zjci66divvqnz00k98r7pmmb6kpc69zs
(`eBird_Taxonomy_v2025_5-tab_30Oct2025.xlsx`). Review candidates, exclusions,
missing names/codes and the complete output diff before activating another
catalogue. Reimport all three private EBD country archives using the commands in
[ebd-import.md](ebd-import.md), then regenerate the seasonal release. The new release ID is
`ebd-relSep-2026-2021-2025-catalog-v2`; the sampling period, checklist rules and
thresholds are unchanged. Regional and current-notable caches carry the catalogue
fingerprint; an older catalogue's fresh cache cannot suppress the required first
refresh. Older paused lessons and progress remain keyed by the same IDs.

Lookup first adopts the learning country (not its subregion), then independently
remembers its own geography. Existing saved lookup regions are retained. Country
selection is available in **Search area and display**; the shared catalogue is
available under **All supported countries**. Active geography remains visible
when the controls are collapsed. Optional subregion and 30-day controls apply within one
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

## German alternative and historical names

`dist/german-names.json` adds a sourced editorial overlay without changing the eBird species dataset. Names are separated into current alternatives (including regional and traditional names) and historical attestations, with per-name source and usage notes. `dist/logic.js` includes these names in search; English and code answers retain their existing acceptance rules. When German participates in a learning pair, current alternatives appear in the answer/reference area in both directions; ambiguous alternatives are labelled separately from accepted answers. Historical names and their qualifications remain in source disclosures. See [german-names-update-20261022.md](german-names-update-20261022.md) and run `node scripts/test-german-names.mjs`.

## Code collision audit

The [quick-code policy](#official-quick-code-policy) describes the mixed source versions and accepted scientific-name updates. The stored `sci` field remains the 2025 source key for provenance and media; explanations instead match the displayed name from `primaryName(species, 'sci')`, including the eleven reviewed 2026 combinations. The validator and renderer reject stale explanations whose exact name does not match; the original `sci` field is not reused by species ID alone. No concept equivalence is inferred from a shared species ID, code or similar spelling. Concept changes for Spotted Flycatcher, European Robin and Great Horned Owl remain migration decisions for a future taxonomy update. See [the identity review](catalog-identity-review-20261108.md) and [the quality review and fixes](quality-review-20261108.md).

Run `python3 scripts/audit-codes.py` to validate all catalogue code fields against the saved literal source records and regenerate [quick-code-audit.json](quick-code-audit.json). The report lists every ambiguous code, its species and source types. In the current 940-species catalogue, 197 of 1,966 distinct accepted codes match multiple species. There are 42 common-name/banding collisions and 12 scientific/banding collisions (categories can overlap). Adding banding codes to scientific and common-name codes creates 46 additional ambiguous codes; some ambiguities already exist within a single source type. These are catalogue counts, not worldwide counts. Three-letter source entries are outside the app's four-letter code policy.

Banding codes use teal badges in lookup and learning answers. Scientific codes retain purple badges; a code with both roles keeps purple and lists both roles in its accessible description and tooltip. Other badges represent English quick codes. A bilingual legend shows only the source types present on that card, labelled scientific, eBird and banding, in the matching badge style using smaller proportional text. It warns that codes can match multiple species. Each ambiguous code lists the other species from the complete app catalogue in its tooltip and accessible description; badge colours describe the source type for the current species, regardless of roles at other species. Accepted answers and code ordering are unchanged.

## Species photos and illustrations

`dist/photos.json` maps every species ID to locally served Wikimedia Commons and iNaturalist photos in `dist/images/`. Eight historical scientific illustrations are clearly labeled; converted, cropped or PDF-rendered assets record their transformation and original legend. Existing photos remain unchanged. A primary record can contain `additional` records, with `sexes` and German `label` fields for a photographed male, female or pair. Each image retains its own author, optional required attribution, image title, source description URL, license and license URL, download URL, source SHA-1 when provided and local SHA-256. The browser loads all displayed pictures locally. It shows source and license links beside each image; full titles and optional attribution are available under Image credit. Failed image loads provide the eBird species gallery. Learning photos appear during first introductions and after grading; feedback also includes a permanent eBird species link. Lesson images are prepared by the existing lesson cache when pictures are enabled. `data/photo-sex-review.json` records the scope and source evidence of the sex review; size alone cannot be compared using these photos.

Images were selected from the corresponding English Wikipedia species articles, with scientific-name redirects and Wikidata P225 taxon names checked. Four taxonomic exceptions are documented in `data/commons-taxon-exceptions.json`; the Thrush Nightingale uses an alternative Wikidata P18 photo under CC BY-SA 4.0. `data/commons-photo-sources.json` retains the retrieved file metadata, including descriptions and licensing information. Image licenses apply separately to each image.

Run `node scripts/validate-photos.mjs` to verify coverage, taxon mappings, attribution, licenses and local file hashes. `python scripts/fetch-commons-photos.py` restores missing image files from their recorded source URLs and verifies their hashes. It uses only the Python standard library and does not overwrite an existing file with different bytes. Derived illustration assets must be restored from Git; their source file is not byte-identical to the displayed conversion/crop/PDF render. See [illustrations-update-20261021.md](illustrations-update-20261021.md).

The 5 November 2026 expansion adds images for all 627 newly catalogued species: the 940-species catalogue now includes 1,352 photographs and eight labelled historical illustrations. Both sexes have explicit source evidence for 356 species. Eleven recognised comparison gaps remain flagged; “single-image” and “not-established” review states do not establish that a species is monomorphic. The original 313 species’ records and assets are preserved and checked against `data/photo-baseline-20261105.json`.

Redundant unlabelled lead images have been removed where two labelled comparison images exist. A validator enforces at most two images per species in the manifest, which is shared by lookup, image dialogs and learning.

The acquisition commands in `scripts/collect-commons-photos.py` stage candidates for review rather than publish automatically. Use its `--help` for discovery, sex searches, source enrichment and staging phases. `scripts/collect-inaturalist-photos.py` supplements missing candidates with exact research-grade taxon matches and compatible individual-photo licenses. `data/inaturalist-photo-sources.json` retains selected taxon, photo-license and explicit sex-annotation evidence without observation coordinates. See [the acquisition review](photos-expansion-20261105.md) for selection decisions, limitations and remaining gaps.

## EBD import and activation

`scripts/import-ebd.py` streams explicitly selected private country ZIP archives from
`$HOME/EBD/downloads/` into `data/ebd-seasonal-preview.json`. This intermediate
aggregate is reviewed before activation; `scripts/build-ebd-seasonal.py` generates
the active app data from it. The raw data remain outside Git and Pages. Both the
preview and published aggregates are derived eBird data excluded from the MIT code
licence. See [ebd-import.md](ebd-import.md) for reproduction, filters and source terms.
Run `python3 -m unittest discover -s scripts -p 'test_ebd*.py'`,
`python3 scripts/build-ebd-seasonal.py --check` and
`python3 scripts/check-private-ebd.py` before committing an update.

## DDA breeding-survey abbreviations

The [interactive DDA list](https://www.dda-web.de/monitoring/mhb/artkuerzel) is the
source for DDA abbreviations. Retrieved 22 November 2026 through the same public
`/api/species/abbreviations` endpoint used by that page. The page still states
28 February 2020. Its 262 records contain 261 active mapped entries and one
explicitly deprecated Swan Goose record repeating `Hög`; that record is excluded.
Compared with the supplied PDF, no abbreviation changed. Five display names
changed: Brachvogel (Großer), Höckergans (Schwanengans), Kleinsumpfhuhn,
Nachtschwalbe (Ziegenmelker), and Zitronenzeisig.

`data/dda-code-records.json` retains allowlisted source rows, the response hash,
fetch time and reviewed mappings from DDA IDs to catalogue IDs. The scientific
name is checked against each reviewed mapping. Lesser Redpoll, feral Rock Pigeon
and domestic Swan Goose have explicit narrower-scope notes. The source name is
shown in their DDA questions; no new catalogue taxa are created.

`python3 scripts/update-dda.py --from-records` regenerates the committed
`dist/dda-codes.json` bootstrap without network access. `--check` verifies it.
The deployed snapshot is updated separately by the daily Pages workflow; see
[deployment and regional data](deployment-and-regions.md#dda-abbreviation-refresh).
New IDs or changed scientific concepts appear in its `meta.review` list until
reviewed; deprecated entries appear in `meta.deprecated` and are not searchable
or learnable. Original mixed case and umlauts are preserved.
