import {hasLanguagePair} from './name-languages.js?v=20261112-finnish1';
import {RULES,dailyQueue,evidence,isDue,pairKnown} from './learning-model.js?v=20261105-recovery1';

// One-click continuation uses shared selection settings, not hidden custom filters.
export function continuationSettings(settings){return {...settings,scope:'all',count:String(RULES.round)};}
export function practiceQueue({units,records,source,method,count=RULES.round,now=Date.now(),random=Math.random}){
 const ranked=units.map(unit=>{const p=evidence(records[unit.id+':'+unit.t],source,method);return {unit,p,rank:isDue(p,now)?0:!p?1:2,random:random()};}).sort((a,b)=>a.rank-b.rank||a.random-b.random);
 const limit=count==='all'?ranked.length:Math.max(0,Number(count)||0);
 return ranked.slice(0,limit).map(({unit,p})=>({...unit,retry:0,reason:p?.legacyPending?'legacy':!p?.attempts?'new':isDue(p,now)?'due':'practice',introduce:!pairKnown(records[unit.id+':'+unit.t],source)}));
}

// Daily setup and the completion summary use the same candidate ordering.
export function dailyLearningPlan({birds,settings,selection,records,ledger,order=new Map(),now=Date.now(),random=Math.random}){
 const newIds=new Set(selection.pool.map(s=>s.id));
 const targets=settings.target==='mixed'?[settings.nameLanguage,'code']:[settings.target];
 let units=birds.flatMap(s=>targets.filter(t=>hasLanguagePair(s,settings.sourceLanguage,t)&&t!==settings.sourceLanguage).map(t=>({id:s.id,t,allowNew:newIds.has(s.id)})));
 const additions=new Set(selection.hybrid.additions.map(r=>r.id));
 units=units.map(u=>{const key=u.id+':'+u.t;if(!order.has(key))order.set(key,random());return {...u,random:order.get(key)};}).sort((a,b)=>+additions.has(b.id)-+additions.has(a.id)||a.random-b.random);
 return dailyQueue({units,records,source:settings.sourceLanguage,method:settings.method,ledger,now});
}
