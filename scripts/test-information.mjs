import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {informationFacts,renderInformation,SOURCE_TITLES_EN} from '../dist/info-page.js';
import {review} from '../dist/logic.js';
const {species:birds,meta}=JSON.parse(readFileSync('dist/species.json'));
const photos=JSON.parse(readFileSync('dist/photos.json')).photos;
const germanNamesMeta=JSON.parse(readFileSync('dist/german-names.json')).meta;
const stamp='2026-10-30T04:23:00Z',older='2026-10-29T04:23:00Z';
const list=updatedAt=>({ids:[],reportedTaxa:0,updatedAt});
const entries=[['DE','Deutschland','Germany',null],['DE-BE','Berlin','Berlin','DE'],['NL','Niederlande','Netherlands',null],['NL-DR','Drenthe','Drenthe','NL'],['GB','Vereinigtes Königreich','United Kingdom',null],['GB-ENG','England','England','GB'],['GB-ENG-CON','Cornwall','Cornwall','GB-ENG']].map(([code,nameDe,nameEn,parentCode])=>({code,nameDe,nameEn,parentCode,country:code.split('-')[0],all:list(stamp),recent:list(stamp)}));
entries[1].all=list(older);
const regions={regions:entries,countries:entries.filter(r=>!r.parentCode),recentDays:30};
const seasonal=JSON.parse(readFileSync('dist/seasonal-species.json'));
const args={birds,meta,photos,germanNamesMeta,regions,seasonal};
const f=informationFacts(args);
assert.equal(f.species,birds.length);const images=Object.values(photos).flatMap(p=>[p,...p.additional||[]]);assert.equal(f.photoCount,images.filter(p=>p.mediaType!=='illustration').length);assert.equal(f.illustrationCount,images.filter(p=>p.mediaType==='illustration').length);assert(f.photoComparisons>=112);assert(f.illustrationComparisons>=6);
assert.equal(f.regionCount,7);assert.equal(f.listCount,14);assert.equal(f.oldest,older);assert.equal(f.newest,stamp);
for(const source of meta.sources)assert(SOURCE_TITLES_EN[source.url],'Source needs an English label: '+source.title);
const en=renderInformation({...args,english:true}),de=renderInformation({...args,english:false});
const sectionIds=html=>[...html.matchAll(/<h2 id="(info-[a-z]+)"/g)].map(x=>x[1]);
assert.deepEqual(sectionIds(en),sectionIds(de));assert.equal(sectionIds(en).length,8);
assert(en.includes('id="info-project"')&&de.includes('id="info-project"'));
for(const html of [en,de]){
 assert(html.includes('href="https://github.com/dg1tal/birdnamesde"'));
 assert(html.includes('href="https://github.com/dg1tal/birdnamesde/blob/main/LICENSE"'));
}
assert(en.includes('does not cover species and taxonomy data'));
assert(de.includes('Diese Lizenz gilt nicht für die Arten- und Taxonomiedaten'));
for(const html of [en,de])for(const url of ['languages/nl.json','german-names.json','regions.json','photos.json','species.json','validation.json'])assert(html.includes('href="'+url+'"'));
const translated=en.replace(/<ul data-name-content>[\s\S]*?<\/ul>/,'');
assert(!/Namensmatrix|Taxonomie-Downloads|Brutvögel|Lernstand|Datenschutz|Oberflächensprache|Wiederholung|Bildnachweise/.test(translated));
assert(en.includes('Original source titles'));assert(en.includes('GitHub Actions secret'));assert(en.includes('not by your browser'));assert(en.includes('all supported answer languages'));assert(!en.includes('both learning directions'));assert(!en.includes('saves and pauses'));
assert(en.includes('1 local eBird region'));assert(en.includes('7 areas including country-wide lists; 14 available species lists.'));
assert(en.includes('29/10/2026')&&en.includes('5 November 2026'));
const missing=renderInformation({...args,english:true,regions:null});assert(missing.includes('Regional data is currently unavailable'));assert(!missing.includes('Invalid Date'));
const partial=informationFacts({...args,regions:{...regions,regions:[{...entries[0],all:null,recent:list(stamp)}]}});assert.equal(partial.listCount,1);
const changed=renderInformation({...args,english:true,birds:[birds[0]],photos:{},regions:null});assert(changed.includes('<strong>1 species</strong>'));assert(changed.includes('0 photographs and 0 historical'));
const escaped=renderInformation({...args,english:false,meta:{...meta,built:'<script>alert(1)</script>'}});assert(escaped.includes('&lt;script&gt;'));assert(!escaped.includes('<script>'));
let progress,now=1000;for(const days of [1,3,7,14,30,60,60]){progress=review(progress,true,now);assert.equal(progress.interval,days);now=progress.due;}
assert.equal(review(progress,false,now).due,now+600000);assert(review(progress,true,now,true).due<=now+86400000);
assert(!en.includes('info-lessons'));assert(!de.includes('Drei richtige Antworten ohne Hinweis in Folge'));assert(de.includes('href="#lernmethode"'));
assert(en.includes('Records are not merged'));assert(en.includes('Only the Replace button'));
assert(de.includes('Erst der Ersetzen-Button'));assert(de.includes('Wenn das Speichern fehlschlägt'));
console.log('PASS: bilingual information sections, actual species/media counts, per-list regional timestamps, unavailable/partial snapshots, translated source labels, exports/storage wording and review intervals.');

for(const html of [en,de]){
 assert(html.includes('eBird Basic Dataset'));
 assert(html.includes('September 2026'));
 for(const file of ['seasonal-species.json','seasonal-provenance.json','ebd-terms.txt'])assert(html.includes('href="'+file+'"'));
 assert(!html.includes('histogram downloads')&&!html.includes('eBird-Histogrammdaten'));
}
assert(en.includes('18 areas with historical samples'));
assert(en.includes('13 areas with historical samples'));
assert(en.includes('113 areas with historical samples'));
assert(renderInformation({...args,english:true,seasonal:null}).includes('Seasonal data is currently unavailable'));
const changedSeasonal=structuredClone(seasonal);changedSeasonal.regions=changedSeasonal.regions.filter(r=>r.code==='DE');
assert(renderInformation({...args,english:true,seasonal:changedSeasonal}).includes('1 area with historical samples'));
console.log('PASS: EBD release, data-derived seasonal coverage, downloadable source terms and unavailable historical data.');

for(const html of [en,de])assert(!/Species packages|Artenpakete|without a regional filter|Ohne Regionsfilter/.test(html));
assert(en.includes('source taxa that cannot be mapped to v2025 species'));assert(de.includes('nicht auf v2025-Arten abbildbare Quelltaxa'));
