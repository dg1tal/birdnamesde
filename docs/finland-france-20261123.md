# Finland and France country selection

Updated on 23 November 2026. Publication continues through the existing GitHub Pages workflow from `dist/`.

Finland and France are available independently of name language in both learning and lookup. Whole-country and first-level regional selections use the official eBird hierarchy: 19 Finnish regions and 13 French metropolitan regions, including Corsica. Separately coded French overseas territories are outside the `FR` list. The selectors retain their saved country/region after reload; lookup keeps its own country, separate from learning.

## Sources and catalogue

The manual **Review catalogue sources** workflow fetched fresh public national taxon lists and first-level region references using the existing repository secret. No credentials or observation details appear in the artifacts. The reviewed source snapshot is retained in `data/catalog-country-lists.json`.

| Country | Mapped v2025 species |
| --- | ---: |
| Germany | 597 |
| Netherlands | 587 |
| United Kingdom | 875 |
| Finland | 483 |
| France | 659 |

The union plus the retained German baseline now contains **994 species**, adding 54 to the previous 940. All previous 940 species records, official code records and their worldwide code-specificity counts remain identical. Current sources also contribute Wilson's Plover from Germany. The original 313 German entries and their editorial status remain preserved. These are occurrence lists, including historical rarities and recorded introduced/escaped birds, not national breeding or establishment classifications.

Names use the checksum-verified official 30 October 2025 workbook and retained v2025 taxonomy/REPORT_AS links. New literal codes come from the checksum-verified 27 October 2026 workbook, following the existing worldwide-specificity policy. Source hashes remain in the catalogue and code metadata. Non-species/unknown source taxa remain excluded and documented in `dist/catalog-review.json`.

Dutch and French names cover all 994 species; Finnish covers 986. Every one of the 483 Finnish country species has an official Finnish name. Missing names continue to exclude the affected learning pair instead of substituting another language.

Source retrieval: `2026-11-23T21:33:08+00:00`.
Catalogue fingerprint: `db71ac7826adc0ac39b342e8699951e219026c1449fe8a7fdcc3e62e47701c8f`.

## Scientific-name continuity

The new House Bunting (`houbun3`) has the retained v2025 source name *Emberiza sahari* and the 2026 combination *Fringillaria sahari*. It receives the same reviewed alias treatment as the preceding eleven combinations: display and learning use the current name; both names are shown/accepted, while stored taxonomy/media keys remain unchanged.

This equivalence was checked against both checksum-verified workbooks, not inferred from the shared species ID. The species-level bio-concept codes normalize to the same `C7C1A6EB` (2025 `avibase-avibase-C7C1A6EB`; 2026 `avibase-C7C1A6EB`). Cornell's [official 2026 generic-change account](https://www.birds.cornell.edu/clementschecklist/updates-and-corrections-october-2026-page-2/) explicitly lists the same monotypic House Bunting under the old and new genera. Its source-backed current-genus explanation is included with the extension's scientific-name review.

## Regional updates and seasonal coverage

The daily Pages workflow discovers both countries and refreshes all-time, recent-30-day and dated notable-report lists with the existing eBird secret and pacing/fallback rules. Regional snapshots remain generated deployment artifacts, never committed. The expanded catalogue fingerprint invalidates previous cached regional/current data for the first refresh.

The reviewed seasonal EBD aggregates still cover DE, NL and GB only. Their existing regional memberships and sample gates are unchanged. Finland and France explicitly fall back to their own all-time regional lists in seasonal mode; recent-30-day selection and current notable additions remain available. No other country's seasonal sample is substituted.

All 54 new species also have licensed, locally served images and scientific-name explanations in German, English and Dutch. See [photo review](photos-finland-france-20261123.md) and `data/scientific-name-country-extension.json` for provenance. Existing images and scientific-name explanation content are preserved.

## Verification

Regression checks cover official FI/FR hierarchy and parent validation, snapshot reuse/fallback, country restoration in both selectors, Finnish/French source-name coverage, real daily learning queues in both language directions, seasonal fallback and independent recent/current layers. All 32 Node regression scripts, the npm smoke test, all 59 Python tests, source-data validation, code audit, EBD/scientific-name/DDA reproducibility, media hashes/licences, JavaScript syntax checks and module-URL consistency pass.

Local browser QA verified 483 Finnish and 659 French candidates, all official first-level region options, explicit seasonal fallback, persisted learning and lookup countries after reload, and the new Corsican Nuthatch's multilingual names and codes. New subregional occurrence lists are verified against the deployment-generated public snapshot after publication; the local preview uses the reviewed country lists and leaves unavailable subregional data visibly unavailable.

## Added species

| eBird ID | German name | Retained v2025 name |
| --- | --- | --- |
| arcwar2 | Kamtschatkalaubsänger | Phylloscopus examinandus |
| batlar1 | Sandlerche | Ammomanes cinctura |
| blawhe1 | Trauersteinschmätzer | Oenanthe leucura |
| blhwea1 | Schwarzkopfweber | Ploceus melanocephalus |
| bltacc1 | Schwarzkehlbraunelle | Prunella atrogularis |
| brakit1 | Brahmanenmilan | Haliastur indus |
| bratea1 | Amazonasente | Amazonetta brasiliensis |
| chswar | Gelbscheitel-Waldsänger | Setophaga pensylvanica |
| corfin1 | Korsenzeisig | Carduelis corsicana |
| cornut1 | Korsenkleiber | Sitta whiteheadi |
| egyplo1 | Krokodilwächter | Pluvianus aegyptius |
| foxspa | Fuchsammer | Passerella iliaca |
| grgowl | Bartkauz | Strix nebulosa |
| grnwoo3 | Iberiengrünspecht | Picus sharpei |
| gyhchi | Lapplandmeise | Poecile cinctus |
| houbun3 | Hausammer | Emberiza sahari |
| ibgshr1 | Iberienraubwürger | Lanius meridionalis |
| indsil | Indiensilberschnabel | Euodice malabarica |
| inpher1 | Paddyreiher | Ardeola grayii |
| kitplo1 | Hirtenregenpfeifer | Anarhynchus pecuarius |
| lagfal1 | Laggarfalke | Falco jugger |
| lesmoo1 | Zwergteichhuhn | Paragallinula angulata |
| mitpar | Rotmaskensittich | Psittacara mitratus |
| mstlar1 | Stummellerche | Alaudala rufescens |
| norshr4 | Taigaraubwürger | Lanius borealis |
| oricuc2 | Hopfkuckuck | Cuculus optatus |
| orihob2 | Schopfwespenbussard | Pernis ptilorhynchus |
| piebus1 | Elsterschmätzer | Saxicola caprata |
| pitsan1 | Spießflughuhn | Pterocles alchata |
| railor4 | Allfarblori | Trichoglossus haematodus |
| rempar | Guayaquilsittich | Psittacara erythrogenys |
| rennig1 | Rothals-Nachtschwalbe | Caprimulgus ruficollis |
| retwhe3 | Rostbürzel-Steinschmätzer | Oenanthe xanthoprymna |
| royter2 | Guineaseeschwalbe | Thalasseus albididorsalis |
| semfly1 | Halbringschnäpper | Ficedula semitorquata |
| shtshe | Kurzschwanz-Sturmtaucher | Ardenna tenuirostris |
| sibjay1 | Unglückshäher | Perisoreus infaustus |
| soghor1 | Rotgesicht-Hornrabe | Bucorvus leadbeateri |
| spaeag1 | Iberienadler | Aquila adalberti |
| spepig1 | Guineataube | Columba guinea |
| sposta1 | Einfarbstar | Sturnus unicolor |
| swisni1 | Waldbekassine | Gallinago megala |
| thelar1 | Theklalerche | Galerida theklae |
| triwar1 | Atlasgrasmücke | Curruca deserticola |
| tstlar1 | Turkestanlerche | Alaudala heinei |
| whicoc1 | Weißhaubenkakadu | Cacatua alba |
| whnrav1 | Geierrabe | Corvus albicollis |
| whssta2 | Mandarinstar | Sturnia sinensis |
| whwlar1 | Weißflügellerche | Alauda leucoptera |
| whwred2 | Riesenrotschwanz | Phoenicurus erythrogastrus |
| wilplo | Wilsonregenpfeifer | Anarhynchus wilsonia |
| wilpta | Moorschneehuhn | Lagopus lagopus |
| yebgre4 | Himalajagrünfink | Chloris spinoides |
| yeclov | Schwarzköpfchen | Agapornis personatus |
