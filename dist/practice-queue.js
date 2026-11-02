import {RULES,evidence,isDue,pairKnown} from './learning-model.js?v=20261102-learning2';

// One-click continuation uses shared selection settings, not hidden custom filters.
export function continuationSettings(settings){return {...settings,scope:'all',count:String(RULES.round)};}
export function practiceQueue({units,records,source,method,count=RULES.round,now=Date.now(),random=Math.random}){
 const ranked=units.map(unit=>{const p=evidence(records[unit.id+':'+unit.t],source,method);return {unit,p,rank:isDue(p,now)?0:!p?1:2,random:random()};}).sort((a,b)=>a.rank-b.rank||a.random-b.random);
 const limit=count==='all'?ranked.length:Math.max(0,Number(count)||0);
 return ranked.slice(0,limit).map(({unit,p})=>({...unit,retry:0,reason:p?.legacyPending?'legacy':!p?.attempts?'new':isDue(p,now)?'due':'practice',introduce:!pairKnown(records[unit.id+':'+unit.t],source)}));
}
