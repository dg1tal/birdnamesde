import {validateLesson} from '../dist/study-state.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {seasonAt,validateSeasonal,validCurrentRecords,hybridSelection,hybridQueue,frequencyGroups} from '../dist/hybrid-learning.js';
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
assert.deepEqual(hybridSelection(regions,seasonal,current,{...cfg,region:''},ids,now).ids,[...ids]);
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
assert.deepEqual(Object.fromEntries(Object.entries(ni.groups).map(([key,value])=>[key,value.length])),{frequent:57,medium:92,rare:118});
console.log('PASS: frequency boundaries, defaults, empty selection, automatic current union, category overlap rejection, saved group selection and regional counts.');
