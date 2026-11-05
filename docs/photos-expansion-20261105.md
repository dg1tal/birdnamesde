# Catalogue image expansion · 5 November 2026

All 940 species now have local media: 1,414 photos and eight historical scientific illustrations (1,422 files). Added 1,007 images for the 627 new species; every original image, credit and record is unchanged. Both sexes are explicitly documented for 356 species.

## Acquisition and checks

Commons candidates come from species articles, gallery captions and targeted sex/taxon searches. Scientific names and documented synonyms are checked against Wikidata/taxobox data and the individual file metadata. Article placement alone is insufficient: misleading lead images of other taxa, mixed-species photographs and contradictory metadata were excluded. Amur Stonechat uses explicit Saxicola stejnegeri evidence rather than the lumped Siberian Stonechat lead image.

Sex labels require explicit filenames, species-specific categories, descriptions, article captions or numbered original legends. Photographer names such as “Drow male” are excluded. Sex is never inferred merely from a colourful bird. Behaviour-only differences are not treated as plumage dimorphism. Non-adult captions are excluded from sex assignments.

Eight iNaturalist photos supplement the Commons selection. These require exact research-grade species identification and individual CC0, CC BY or CC BY-SA photo licenses. Seven carry explicit non-disagreed Sex annotations (attribute 9; female 10, male 11), checked against the controlled-terms API. Group photographs whose annotation could not be assigned to a specific bird, and obscured or unsuitable comparison views, were not selected. API evidence is retained in data/inaturalist-photo-sources.json without observer coordinates. Research-grade identification and annotations are community evidence, not a guarantee against every identification error.

Only compatible CC0/BY/BY-SA/public-domain assets are included. Each image records author, exact source and license links, download URL and local SHA-256. Selected Commons API metadata is retained in data/commons-photo-sources.json. Original 313-species media are regression-checked against data/photo-baseline-20261105.json.

The new historical plates are Eskimo Curlew (Audubon; explicitly numbered sexes) and Swinhoe’s Storm-Petrel (Smit, 1896; no sex inferred). They are labelled as illustrations. They are not counted as modern photographs.

The internal browser was used to inspect all 627 new primary image thumbnails, selected sex comparison candidates, the real app image dialog and mobile layout. This caught a White-backed Vulture egg selected by the initial ranking; it was replaced with the living bird. Egg categories/descriptions are now rejected by the acquisition filter. Actual JPEG/PNG dimensions are read from downloaded bytes, avoiding incorrect Commons thumbnail dimension metadata.

## Remaining sex comparison gaps

These eleven recognised gaps are explicitly flagged in the app. No sex was invented to fill them:

- Bandammer / Chestnut-eared Bunting (`chebun2`)
- Dunkelwasserläufer / Spotted Redshank (`spored`)
- Gelbbrust-Pfeifgans / Fulvous Whistling-Duck (`fuwduc`)
- Nachtigallengrasmücke / Eastern Orphean Warbler (`eaowar2`)
- Orpheusgrasmücke / Western Orphean Warbler (`weowar2`)
- Schmucksittich / Elegant Parrot (`elepar1`)
- Schwirrnachtigall / Rufous-tailed Robin (`rutrob1`)
- Silberente / Silver Teal (`siltea1`)
- Steinortolan / Gray-necked Bunting (`gyhbun1`)
- Steppenflughuhn / Pallas's Sandgrouse (`palsan1`)
- Wüstenregenpfeifer / Greater Sand-Plover (`grsplo`)

A single-image or not-established review status does not mean that a species lacks visible sexual differences. Discovery of further reliable labelled images can extend comparisons without changing the catalogue. Sixty-nine newly added species have source text describing similar sexes; other unpaired records remain unclassified rather than being assumed monomorphic.

## Reproducibility

The collectors stage files for review and never publish them automatically. Run `python3 scripts/collect-commons-photos.py --help` and `python3 scripts/collect-inaturalist-photos.py --help` for their phase and cache options. Their output is a candidate pool, not an editorial approval. Use `python3 scripts/fetch-commons-photos.py` to restore the exact selected photo bytes from the published manifest, and `node scripts/validate-photos.mjs` to verify the final package. Derived historical crops/renders from the original collection must be restored from Git.

License policy reference: [iNaturalist media reuse](https://help.inaturalist.org/en/support/solutions/articles/151000169918); API: [iNaturalist API](https://api.inaturalist.org/v1/docs/).
