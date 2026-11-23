# Photos for the Finland and France catalogue extension

Reviewed on 23 November 2026 against the 994-species catalogue.

The 54 newly added species have 68 new, locally served Wikimedia Commons
photographs. The preceding 940 species' manifest entries and image files are
preserved. The complete catalogue now has 1,420 photographs and eight labelled
historical illustrations.

Discovery used scientific-name Wikipedia article redirects and Wikidata P225
taxon names. Each selected file additionally has an explicit scientific or
species-level vernacular identification in its Commons description, title or
categories. The full Commons imageinfo records, original authors, licence links,
source URLs and source SHA-1 values are retained in
`data/commons-photo-sources.json`. The manifest records each local SHA-256 and
download URL. Files are unmodified source thumbnails; no new illustration was
introduced.

All 68 selected photographs were visually inspected in labelled contact sheets.
Selection excluded a mounted sandgrouse specimen, redundant unlabelled/same-sex
supplements, and a Starling supplement containing another bird species. Coconut
Lorikeet uses an explicitly labelled photograph from Papua New Guinea; older
Australian images labelled broadly as “Rainbow Lorikeet” were excluded because
that label can refer to a different current species.

Fourteen new species have explicit male/female source evidence, retained per
photograph in `data/photo-sex-review.json`. Seven have an article statement that
the sexes look similar. The other 33 have a single selected photograph without a
claim of complete sex comparison or monomorphism. These categories are source
assessments, not inferences from appearance. The complete catalogue now has
explicit both-sex coverage for 370 species.

Validation: `node scripts/validate-photos.mjs` passes for all 994 species,
including distinct sources, exact taxa, licences, authors, dimensions, source
evidence, local file hashes, the two-images-per-species limit and preserved
original media. The selected Commons raw records also match each manifest source
URL and source SHA-1.

The acquisition workflow is `scripts/collect-commons-photos.py` with `discover`,
`sex-search` and `stage` phases. An acquisition baseline can be recovered from
`82517d2:dist/photos.json`; pass that saved manifest with `--baseline-manifest` to
restrict collection to this extension. Discovery and staging produce review
files before any repository manifest is changed.
