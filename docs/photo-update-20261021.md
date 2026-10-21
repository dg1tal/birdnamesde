# Species links and sex comparison photos

The learning feedback now includes the same eBird species destination as lookup cards, including when photos are disabled. Photo records support a primary photo and optional additional photos; each has an independent caption, author and license. Both photos are prepared for current/upcoming questions and displayed only after grading.

All 313 species retain photos. The 409 image files cover both adult sexes for 112 species, either in a documented pair/composite or in separate photographs. Seasonal plumage and visible subspecies differences are included in captions where relevant. The taxonomy, learning logic and progress storage were preserved.

Seven comparisons remain incomplete: Beutelmeise, Dunkelwasserläufer, Schneesperling, Sperbergrasmücke, Wachtelkönig, Zippammer and Zitronenzeisig. Available photos lacked a defensible species/age/sex assignment for both sexes after Commons and multilingual species-article review. These cards explicitly say the comparison is incomplete and link to the eBird gallery. Twelve further review candidates have substantially overlapping differences and are documented separately in `data/photo-sex-review.json`; photos are not to scale and cannot teach size-only differences.

Validation:

- All 313 species search/accepted-answer/repetition/statistics data checks passed.
- All 409 images passed provenance, author, license, taxon, sex coverage, dimensions and SHA-256 checks.
- Cache tests passed, including two independent sex photos reused together without additional requests/decodes.
- Browser: Eisvogel photos absent before grading, both loaded after grading; a repeated question reused the exact same two blob URLs. eBird species link remained available with photos disabled. Lookup displayed both labeled photographs inside the card. An incomplete comparison displayed its gallery notice.
- Desktop layout visually checked in `birdnames-sex-photos-20261021.jpg`. No physical iOS-device test performed.
