# Private EBD import and active seasonal release

The EBD importer prepares an intermediate aggregate for review. Since the release
of 5 November 2026, `scripts/build-ebd-seasonal.py` uses the reviewed aggregate to
generate the active `dist/seasonal-species.json`, its provenance/terms, and the
bilingual method and coverage page. The app's daily API refresh is unchanged.
Learning progress and existing rounds are retained. New seasonal rounds snapshot
`ebd-relSep-2026-2021-2025-v1`; old rounds without source metadata stay unassigned.

## Reproduce

Use completed country archives explicitly, never a directory glob while downloads
are in progress. The working checkout is `/Users/thumax/git/birdnamesde`.

```sh
python3 scripts/import-ebd.py \
  /Users/thumax/EBD/downloads/ebd_DE_smp_relSep-2026.zip \
  /Users/thumax/EBD/downloads/ebd_NL_smp_relSep-2026.zip \
  /Users/thumax/EBD/downloads/ebd_GB_smp_relSep-2026.zip
python3 scripts/build-ebd-seasonal.py
python3 -m unittest discover -s scripts -p 'test_ebd*.py'
python3 scripts/build-ebd-seasonal.py --check
python3 scripts/check-private-ebd.py
```

The outputs are `data/ebd-seasonal-preview.json` and its adjacent `.terms.txt`.
`--output /private/tmp/ebd-preview.json` can be used for a local review instead.
Only ZIP members for sampling events, accepted observations, citation and terms
are read. Observation data are never extracted, copied into Git or sent over the
network. Full observation and sampling streams are read to EOF, checking ZIP CRCs;
archive SHA-256, size and modification-time checks document source integrity.
GB is larger than DE and NL combined; processing can take several minutes.

## Selection and calculation

- Period: 2021–2025, matching the existing seasonal baseline. The September 2026
  release also contains 2026 observations, which are deliberately excluded.
- Complete checklists only (`ALL SPECIES REPORTED = 1`); observation types
  Stationary, Traveling and Area. Specialized surveys, incidental and historical
  protocols are excluded. No additional duration/distance filter is imposed.
- One actual complete checklist per shared group, chosen by the lexicographically
  smallest sampling-event identifier. Selection is independent of archive row order;
  records from other copies are not unioned into the selected list. Complete,
  eligible lists without catalog detections remain in the denominator.
- Accepted (`APPROVED = 1`) positive counts and `X` presence records only. Escapees
  (`EXOTIC CODE = X`) are excluded; naturalized and provisional exotic codes remain.
- Species and supported infraspecific records are mapped through exact taxon
  concept IDs in `data/taxonomy.csv` and its official `REPORT_AS` species links.
  Multiple taxon records for a species on one checklist count only once. Hybrids,
  slash taxa and unidentified taxa are excluded. An unknown concept with an exact
  catalog scientific name stops the import for review rather than guessing a map.
- Reporting frequency is the number of selected checklists reporting a species
  divided by **all** selected complete checklists for that region/season. It is
  not an individual count, population estimate or detection probability. Missing
  approved records are not evidence of true absence; sensitive data may be withheld.
- Groups: frequent ≥10%, medium ≥1% and <10%, rare >0% and <1%. Zero detections
  do not form a group. Groups are retained even below the sample gate, for inspection;
  the app applies ≥300 checklists and ≥3 years with ≥100 checklists each.
- Winter uses December, January and February of each calendar year, matching the
  existing app convention. Other seasons are March–May, June–August, September–November.
- Country and state/province aggregates are generated. Local aggregates follow
  `data/region-countries.json`: Garmisch-Partenkirchen in DE, all source local regions
  in GB, none in NL. Source county codes outside their declared state are omitted
  from local rollups and counted in the audit; country/state evidence is retained.

These rules can produce different counts and group membership from histogram
exports. The import is a reproducible educational selection, not a reconstruction
of eBird's bar charts or a statistical abundance model.

## Source acknowledgement and citation

Source attribution was checked on 5 November 2026 against the supplied archive
terms and the [official eBird citation guidance](https://science.ebird.org/en/use-ebird-data/citation).
The terms require full and appropriate acknowledgement and citation in materials
and publications derived wholly or partly from eBird data; the dataset supplies
the relevant citation. The EBD-specific guidance explicitly points to the supplied
`recommended_citation.txt` rather than the generic website citation.

All three archives contain the same citation, reproduced verbatim:

> eBird Basic Dataset. Version: EBD_relSep-2026. Cornell Lab of Ornithology, Ithaca, New York. Sep 2026.

The general project reference identified by the citation guidance is also included:

Sullivan, B.L., C.L. Wood, M.J. Iliff, R.E. Bonney, D. Fink, and S. Kelling. 2009. eBird: a citizen-based bird observation network in the biological sciences. Biological Conservation 142: 2282-2292.
[DOI](https://doi.org/10.1016/j.biocon.2009.05.006).

The original bibliography in `dist/species.json` concerns taxonomy, names and the
editorial species catalogue. It remains applicable. EBD supplies the seasonal
groups; the API supplies regional occurrence lists and current notable reports.
The retired histogram exports are not presented as the active seasonal source.
No Status and Trends product or GBIF/EOD release is used for this EBD analysis.

`data/ebird-citation.json` retains the source/guidance links, project reference and
bilingual acknowledgement to Cornell and the eBird contributors. The generator
copies these credits and the supplied dataset citation into both published JSON
artifacts and the method page. The main information page displays the same credits.
The README and this document include the dataset citation for repository users.

## Public repository and terms

Raw archives stay under `/Users/thumax/EBD/`, outside Git. The public preview contains
regional names/codes, grouped catalog species IDs, annual sample totals, methods,
source hashes and citation. It contains no checklist IDs, observer IDs, coordinates,
comments or individual observation dates. Source archive names are not download links.

The preview and accompanying terms are excluded from the project's MIT code licence.
They are derived eBird data and remain under the complete terms copied from the
archives in `data/ebd-seasonal-preview.terms.txt`, also available at
<https://www.birds.cornell.edu/home/ebird-data-access-terms-of-use/>.
The intended educational use matches the purpose declared in the user's data request.
There is no endorsement by Cornell or eBird. When the EBD-derived product is published,
the supplied terms also require an electronic copy to be sent to eBird. No message is
sent automatically by the importer or this workflow.

The ignore rules and `check-private-ebd.py` catch archives and typical raw filenames;
the guard also checks the first line for a raw observation/sampling header, including
renamed files. Run it before committing, since a CI check cannot undo a public push.
The Pages workflow publishes only `dist/`. The intermediate preview is not fetched
by the app; the compact active aggregates, source terms and provenance are public.

## Import reviewed on 5 November 2026

All three September 2026 archives were read successfully, with no unresolved catalog
taxon concepts. The resulting preview covers 144 currently configured regions.

| Country | Independent complete checklists, 2021–2025 | Regional aggregates |
| --- | ---: | ---: |
| Germany | 323,771 | 18 |
| Netherlands | 111,224 | 13 |
| United Kingdom | 1,377,253 | 113 |

The country aggregates pass the sample gates in all four seasons. Fifteen of the
16 German states pass in all seasons; Saarland passes in none. Garmisch-Partenkirchen
passes in spring/summer. Eleven Dutch provinces pass in all seasons; Drenthe passes
in spring/summer only. All four UK constituent countries pass in all seasons;
individual local regions still require their own sample gate.

There were 49 eligible German sampling rows with a county/state hierarchy mismatch;
the county rollup was omitted as described above. The two other archives had none.
The archived source names and hashes, total input rows, pre/post-group checklist
counts, annual samples and per-season groups are recorded in the preview itself.

## Activation and future updates

`data/ebd-region-match.json` retains the minimal public API labels and hierarchy
reviewed for activation (145 selectable regions). Every EBD code matches exactly;
GB-ENG-HAL has no historical sample. No name-based or nearest-region substitution is
performed. New API regions without matching EBD data use the existing regional-list
fallback. The published coverage page includes the reviewed hierarchy, with explicit
zero-sample fallback cells for Halton.

Run the builder after a reviewed import. It rejects changed periods, selection
thresholds, unexpected releases, unresolved catalog concepts, overlapping groups,
inconsistent annual samples or source codes missing from the reviewed hierarchy.
It generates all four published artifacts together. `--check` in CI detects stale
artifacts; daily API refreshes never modify the historical aggregates. New EBD
releases require a new dataset ID and review of the source period and metadata.

The historical histogram builder is retained only for archival reproduction;
invoking it overwrites seasonal outputs and will fail the active EBD artifact check.
To roll back an app release, restore all matching data/code/method/cache-version
changes from Git together. Learning storage does not require migration or reset.
