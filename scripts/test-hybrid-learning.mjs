import {validateLesson} from '../dist/study-state.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seasonAt,validateSeasonal,validCurrentRecords,hybridSelection,hybridQueue,frequencyGroups,regionalSnapshot,seasonalDatasetText} from '../dist/hybrid-learning.js';
const ids=new Set(['base','extra','old']);const now=new Date('2026-11-02T12:00:00Z');
const regions={regions:[{code:'DE-SH',all:{ids:['base','old']},recent:{ids:['extra']}}]};
const seasonal=validateSeasonal({version:1,regions:[{code:'DE-SH',seasons:{autumn:{ids:['base'],sample:1000,years:5},winter:{ids:[],sample:20,years:0}}}]},ids);
const record={id:'extra',observedOn:'2026-10-30',expiresOn:'2026-11-13'};
const current={regions:[{code:'DE-SH',updatedAt:'2026-11-02T06:00:00Z',records:[record]}]};
const cfg={region:'DE-SH',regionMode:'seasonal',includeCurrent:true};
const h=hybridSelection(regions,seasonal,current,cfg,ids,now);
assert.deepEqual(h.ids,['base','extra']);assert(h.seasonalReady);assert.equal(h.additions.length,1);
assert.deepEqual(hybridSelection(regions,seasonal,current,{...cfg,includeCurrent:false},ids,now).ids,['base','extra']); // Legacy opt-out no longer suppresses automatic reports.
assert.deepEqual(hybridSelection(regions,null,current,cfg,ids,now).ids,['base','old','extra']);
assert(!hybridSelection(regions,null,current,cfg,ids,now).seasonalReady);
assert.deepEqual(hybridSelection(regions,seasonal,current,{...cfg,region:''},ids,now).ids,[]);
assert.deepEqual(hybridSelection(regions,seasonal,current,cfg,ids,new Date('2026-12-01')).ids,['base','old']);
assert.deepEqual(validCurrentRecords(current.regions[0],ids,Date.parse('2026-11-13')),[]);
assert.deepEqual(validCurrentRecords({...current.regions[0],updatedAt:'2026-10-28'},ids,+now),[]);
assert.deepEqual(validCurrentRecords({...current.regions[0],updatedAt:'2026-11-04'},ids,+now),[]);
assert.deepEqual(validCurrentRecords({...current.regions[0],records:[{...record,expiresOn:'2027-01-01'}]},ids,+now),[]);
assert.equal(seasonAt(new Date('2026-03-01T12:00:00')), 'spring');assert.equal(seasonAt(new Date('2026-08-31T12:00:00')),'summer');
const pool=Array.from({length:30},(_,i)=>({id:String(i)})),extras=new Set(pool.slice(0,10).map(s=>s.id));
const queue=hybridQueue(pool,10,extras,()=>0,()=>0);
assert.equal(queue.length,10);assert.equal(queue.filter(s=>extras.has(s.id)).length,2);
assert.equal(new Set(queue.map(s=>s.id)).size,10);
assert.equal(hybridQueue(pool,30,extras,()=>0).length,30);
assert.equal(hybridQueue(pool.slice(0,10),10,extras,()=>0).length,10);
const saved=structuredClone(h);hybridSelection(regions,seasonal,{regions:[]},cfg,ids,now);assert.deepEqual(saved.additions,[record]);
const catalogue=JSON.parse(readFileSync('dist/species.json')).species;
const published=validateSeasonal(JSON.parse(readFileSync('dist/seasonal-species.json')),new Set(catalogue.map(s=>s.id)));
assert(published.regions.find(r=>r.code==='DE-SH').seasons.summer.ids.includes(catalogue.find(s=>s.de==='Basstölpel').id));
assert(published.regions.find(r=>r.code==='DE-BY-GAP').seasons.summer.ids.includes(catalogue.find(s=>s.de==='Alpendohle').id));
console.log('PASS: seasonal membership, honest fallback, union with current additions, automatic reports, expiry, stale/future data, stable snapshots and bounded question share.');

const lesson={version:1,queue:[{id:'extra',t:'en',retry:0}],index:0,answered:0,correct:0,firstAnswered:0,firstCorrect:0,method:'text',done:false,paused:true,hint:false,regionIds:h.ids,regionalContext:{season:h.season,seasonalReady:h.seasonalReady,seasonalRequested:true,additions:h.additions}};
assert(validateLesson(lesson,ids));
assert.equal(validateLesson({...lesson,regionalContext:{...lesson.regionalContext,additions:[{...record,expiresOn:'2027-01-01'}]}},ids),null);
assert.deepEqual(validCurrentRecords({...current.regions[0],records:[null]},ids,+now),[]);

const grouped=validateSeasonal({version:1,regions:[{code:'DE-SH',seasons:{autumn:{sample:1000,years:5,ids:['base','old'],groups:{frequent:['base'],medium:['old'],rare:['extra']}}}}]},ids);
assert.deepEqual(frequencyGroups(undefined),['frequent','medium']);
assert.deepEqual(frequencyGroups([]),[]);
assert.deepEqual(frequencyGroups(['rare','rare','unknown']),['rare']);
assert.deepEqual(hybridSelection(regions,grouped,{regions:[]},cfg,ids,now).baseIds,['base','old']);
const rare=hybridSelection(regions,grouped,current,{...cfg,frequencyGroups:['rare']},ids,now);
assert.deepEqual(rare.ids,['extra']);assert.deepEqual(rare.additions,[]); // No duplicates or change of historical category.
assert.deepEqual(hybridSelection(regions,grouped,current,{...cfg,frequencyGroups:[]},ids,now).ids,['extra']);
assert.deepEqual(hybridSelection(regions,grouped,current,{...cfg,frequencyGroups:[]},ids,now,false).ids,[]); // Preview excludes current layer.
assert.deepEqual(hybridSelection(regions,grouped,current,{...cfg,regionMode:'all',frequencyGroups:[]},ids,now).baseIds,['base','old']);
const bad=structuredClone(grouped);bad.regions[0].seasons.autumn.groups.rare.push('base');assert.throws(()=>validateSeasonal(bad,ids));
assert(validateLesson({...lesson,regionalContext:{...lesson.regionalContext,selectedGroups:['rare']}},ids));
assert.equal(validateLesson({...lesson,regionalContext:{...lesson.regionalContext,selectedGroups:['unknown']}},ids),null);
const ni=published.regions.find(r=>r.code==='DE-NI').seasons.autumn;
assert.deepEqual(Object.fromEntries(Object.entries(ni.groups).map(([key,value])=>[key,value.length])),{frequent:55,medium:95,rare:105});
console.log('PASS: frequency boundaries, defaults, empty selection, automatic current union, category overlap rejection, saved group selection and regional counts.');

// Real EBD country/state/local selection must keep its sample gate and API layer.
const realIds=new Set(catalogue.map(s=>s.id));
const realRegions={regions:['DE','NL','GB','DE-SL','NL-DR','GB-ENG-HAL'].map(code=>({code,all:{ids:[catalogue[0].id]},recent:{ids:[catalogue[1].id]}}))};
for(const region of ['DE','NL','GB']){
 const selected=hybridSelection(realRegions,published,{regions:[]},{region,regionMode:'seasonal'},realIds,now);
 assert(selected.seasonalReady);
 assert.deepEqual(new Set(selected.baseIds),new Set(published.regions.find(r=>r.code===region).seasons.autumn.ids));
 assert.equal(selected.seasonalDataset.id,'ebd-relSep-2026-2021-2025-v1');
 assert.deepEqual(hybridSelection(realRegions,published,{regions:[]},{region,regionMode:'recent'},realIds,now).baseIds,[catalogue[1].id]);
}
for(const region of ['DE-SL','NL-DR','GB-ENG-HAL']){
 const selected=hybridSelection(realRegions,published,{regions:[]},{region,regionMode:'seasonal'},realIds,now);
 assert(!selected.seasonalReady);assert.deepEqual(selected.baseIds,[catalogue[0].id]);
}
assert(hybridSelection(realRegions,published,{regions:[]},{region:'NL-DR',regionMode:'seasonal'},realIds,new Date('2026-07-01')).seasonalReady);
const example=published.regions.find(r=>r.code==='NL').seasons.autumn;
const extraId=example.groups.rare[0];assert(extraId);
const live={regions:[{code:'NL',updatedAt:now.toISOString(),records:[{...record,id:extraId}]}]};
const selected=hybridSelection(realRegions,published,live,{region:'NL',regionMode:'seasonal'},realIds,now);
assert.equal(selected.additions[0].id,extraId);
assert.equal(selected.ids.filter(id=>id===extraId).length,1);
const snapshot=regionalSnapshot(selected),frozen=structuredClone(snapshot);
assert(validateLesson({...lesson,regionalContext:snapshot,regionIds:undefined,queue:[{id:extraId,t:'en',retry:0}]},realIds));
selected.additions.length=0;selected.seasonalDataset.id='changed';
assert.deepEqual(snapshot,frozen);
const legacy=validateLesson(lesson,ids);
assert.equal(legacy.regionalContext.seasonalDataset,undefined);
assert(seasonalDatasetText(undefined,true).includes('not stored'));
assert(seasonalDatasetText(frozen.seasonalDataset).includes('September 2026'));
assert.equal(validateLesson({...lesson,regionalContext:{...lesson.regionalContext,seasonalDataset:{id:'bad'}}},ids),null);
assert.throws(()=>validateSeasonal({...published,dataset:{id:'bad'}},realIds));
console.log('PASS: EBD selection in all countries, exact regional fallbacks, independent 30-day lists, notable additions and immutable/legacy dataset snapshots.');

for(const region of ['', 'UNKNOWN', 'DE-MISSING']){
 const selection=hybridSelection(null,null,null,{region,regionMode:'all'},ids,now);
 assert.deepEqual(selection.ids,[]);assert.equal(selection.available,false);
}
// A missing API snapshot can still use a validated seasonal dataset; it never expands to the catalogue.
const seasonalOnly=hybridSelection(null,seasonal,null,cfg,ids,now);
assert.deepEqual(seasonalOnly.ids,['base']);assert.equal(seasonalOnly.available,true);
assert.equal(hybridSelection(null,seasonal,null,{...cfg,regionMode:'recent'},ids,now).available,false);
console.log('PASS: missing geography or regional data never falls back to the unrestricted catalogue.');
