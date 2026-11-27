# Private EBD import and active seasonal release

[README](../README.md)

`import-ebd.py` streams private ZIP archives into a reviewable aggregate.
`build-ebd-seasonal.py` publishes seasonal groups, provenance, terms and the
bilingual coverage page. The active dataset is
`ebd-relSepOct-2026-2021-2025-catalog-v3`. Raw EBD stays outside Git and Pages.

## Reproduce

Run from the repository root with completed archives named explicitly:

```sh
python3 scripts/import-ebd.py \
  "$HOME/EBD/downloads/ebd_DE_smp_relSep-2026.zip" \
  "$HOME/EBD/downloads/ebd_NL_smp_relSep-2026.zip" \
  "$HOME/EBD/downloads/ebd_GB_smp_relSep-2026.zip" \
  "$HOME/EBD/downloads/ebd_FI_202101_202512_smp_relOct-2026.zip" \
  "$HOME/EBD/downloads/ebd_FR_202101_202512_smp_relOct-2026.zip"
python3 scripts/build-ebd-seasonal.py
python3 -m unittest discover -s scripts -p 'test_ebd*.py'
python3 scripts/build-ebd-seasonal.py --check
python3 scripts/check-private-ebd.py
```

The importer writes `data/ebd-seasonal-preview.json` and adjacent `.terms.txt`;
use `--output /tmp/ebd-preview.json` for a separate review. It reads sampling,
accepted-observation, citation and terms members to EOF and verifies ZIP CRCs,
SHA-256, size and modification time. Raw records are never extracted or uploaded.
Processing the UK archive can take several minutes. Date-filtered ZIPs must cover
the full 2021–2025 period.

## Selection and calculation

- **Period/seasons:** 2021–2025. Winter is December/January/February of each
  calendar year; spring March–May, summer June–August, autumn September–November.
- **Checklists:** `ALL SPECIES REPORTED = 1`, Stationary/Traveling/Area only.
  No extra duration/distance filter. For each shared group choose the actual
  checklist with the lexicographically smallest sampling-event ID; never union
  copies. Eligible lists without catalogue detections stay in the denominator.
- **Observations:** `APPROVED = 1`, positive counts or `X` presence. Exclude
  escapees (`EXOTIC CODE = X`); retain naturalized/provisional exotic codes.
- **Taxa:** exact concept IDs and REPORT_AS links in `data/taxonomy.csv`, plus
  reviewed tuples in `data/ebd-taxon-crosswalk.json`. Deduplicate species per
  checklist. Exclude hybrids, slash/unidentified taxa and unsupported concepts.
  Unknown concepts sharing a catalogue scientific name stop import for review.
- **Frequency:** checklists reporting the species divided by all eligible
  independent complete checklists in that region/season. Frequent ≥10%,
  Medium 1–<10%, Rare >0–<1%; zero detections form no group.
- **Sample gate:** ≥300 independent complete checklists overall and ≥3 years
  with ≥100 each. Preview groups below the gate remain inspectable; the app
  uses its labelled regional-occurrence fallback.
- **Geography:** country/first-level regions for DE/NL/GB/FI/FR; local rollups for
  Garmisch-Partenkirchen and configured UK regions. County/state mismatches omit
  the local rollup but retain country/state evidence and an audit count.

Reporting frequency is not abundance or detection probability. Sensitive data
may be withheld; missing accepted records do not establish absence. These groups
can differ from eBird histogram exports.

## Coverage

| Country | Source release | Independent complete checklists | Aggregates |
| --- | --- | ---: | ---: |
| Germany | September 2026 | 323,771 | 18 |
| Netherlands | September 2026 | 111,224 | 13 |
| United Kingdom | September 2026 | 1,377,253 | 113 |
| Finland | October 2026 | 111,255 | 20 |
| France | October 2026 | 238,323 | 14 |

All national selections pass in every season. Regional exceptions: Saarland
passes none; Garmisch-Partenkirchen and Drenthe pass spring/summer only. All UK
constituent countries and all 13 French regions pass all seasons. Finland has
seven regions passing all seasons, five some, and seven none. Local UK regions
need their own gate. The preview records annual/per-season samples and groups.

## Activation and future updates

`data/ebd-region-match.json` records the reviewed 191-region API hierarchy.
All 178 aggregates match exact IDs; 13 UK codes lack historical samples. There
is no name/nearest-region substitution. The coverage page shows fallbacks.

The builder rejects changed periods/thresholds, unexpected releases, unresolved
concepts, overlapping groups, inconsistent samples, missing national aggregates,
crosswalk/citation mismatches and codes absent from the hierarchy. Review new
releases and assign a new dataset ID. Generate all four published artifacts
together; `--check` detects stale outputs. Daily API refreshes do not alter EBD
aggregates. New rounds snapshot sources; paused rounds retain their earlier queue
and metadata, including absent source metadata on legacy rounds.

The October import added FI/FR without changing the 144 DE/NL/GB aggregates.
Six reviewed concept/category/name tuples roll up revised infraspecific groups
and narrower 2026 Robin/Flycatcher concepts into retained 2025 species. These are
rollups, not claims of equivalent concepts. Category/name drift stops import;
ambiguous domestic geese and out-of-catalogue swifts remain excluded. The crosswalk
hash and per-concept counts are recorded in preview provenance.

`build-seasonal.py` is the retired histogram builder; it overwrites active outputs
and fails the EBD reproducibility check. Rollbacks must restore matching code,
data, method page and cache versions together; learning storage needs no reset.

## Source acknowledgement and citation

Use the archives' `recommended_citation.txt`, as specified by the
[eBird citation guidance](https://science.ebird.org/en/use-ebird-data/citation):

> eBird Basic Dataset. Version: EBD_relSep-2026. Cornell Lab of Ornithology, Ithaca, New York. Sep 2026.

> eBird Basic Dataset. Version: EBD_relOct-2026. Cornell Lab of Ornithology, Ithaca, New York. Oct 2026.

General reference: Sullivan, B.L., C.L. Wood, M.J. Iliff, R.E. Bonney, D. Fink, and
S. Kelling. 2009. eBird: a citizen-based bird observation network in the biological
sciences. Biological Conservation 142: 2282–2292.
[DOI](https://doi.org/10.1016/j.biocon.2009.05.006).

`data/ebird-citation.json` supplies these credits and the acknowledgement to
Cornell and eBird contributors for the generated JSON/method/information pages.
Each country's release remains explicit. EBD supplies seasonal groups; the API
supplies regional/current records; `species.json` retains taxonomy/name sources.

## Public repository and terms

The preview publishes region labels/codes, grouped species IDs, sample totals,
methods, hashes and citations. It contains no checklist/observer IDs, coordinates,
comments or individual observation dates. Only compact aggregates, provenance and
terms are served by the app; the preview itself is not fetched.

Derived data are outside the MIT code licence and retain the full archive terms
in `data/ebd-seasonal-preview.terms.txt` and `dist/ebd-terms.txt`, also available at
[eBird Data Access Terms](https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/).
Attribution does not imply endorsement. The supplied terms require an electronic
copy of the published derived product to be sent to eBird; tooling sends no message.

Keep raw archives under `$HOME/EBD/` or another directory outside Git.
`check-private-ebd.py` checks filenames and raw observation/sampling headers;
run it before committing. The educational use follows the declared data request.
