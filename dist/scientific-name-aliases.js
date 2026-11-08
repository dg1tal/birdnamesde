// Reviewed against the full official 2025/2026 workbooks, including unchanged
// Avibase concept IDs. Never infer equivalence from an eBird ID or code alone.
// See docs/catalog-identity-review-20261108.md for provenance and exclusions.
export const SCIENTIFIC_NAME_ALIASES=Object.freeze([
 ['rehbun1','Emberiza bruniceps','Melophus bruniceps'],
 ['yebbun1','Emberiza chrysophrys','Schoeniclus chrysophrys'],
 ['blhbun1','Emberiza melanocephala','Melophus melanocephalus'],
 ['bkfbun1','Emberiza spodocephala','Schoeniclus spodocephalus'],
 ['palbun','Emberiza pallasi','Schoeniclus pallasi'],
 ['reebun','Emberiza schoeniclus','Schoeniclus schoeniclus'],
 ['chebun1','Emberiza rutila','Schoeniclus rutilus'],
 ['rusbun','Emberiza rustica','Schoeniclus rusticus'],
 ['yebbun','Emberiza aureola','Schoeniclus aureolus'],
 ['winwre4','Troglodytes troglodytes','Nannus troglodytes'],
 ['litbun','Emberiza pusilla','Schoeniclus pusillus']
].map(row=>Object.freeze(row)));
export function scientificNameAliases(species){
 const row=SCIENTIFIC_NAME_ALIASES.find(([id,name])=>id===species.id&&name===species.sci);
 return row&&row[2]===species.scientificCodeName?[{name:row[2],source:'eBird/Clements 2026'}]:[];
}
