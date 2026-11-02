// Product rules shared by scheduling, UI and method documentation.
export const RULES=Object.freeze({round:10,newPerDay:3,confirmations:3,minGap:86400000,retryDelay:600000,maxRetries:2,intervals:[1,3,7,14,30,60]});
export const family=method=>method==='text'?'recall':method==='flash'?'self':'recognition';
export const contextKey=(source,method)=>source+':'+family(method);
export const localDay=(now=Date.now())=>{const d=new Date(now);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');};
export function migrateRecords(records){return Object.fromEntries(Object.entries(records).map(([key,p])=>[key,p.contexts?p:{...p,contexts:{},legacy:{...p},legacyClaimed:null}]));}
export function evidence(record,source,method){
 if(!record)return undefined;
 const p=record.contexts?.[contextKey(source,method)];
 if(p)return p;
 const old=record.legacy||(!record.contexts?record:null);
 return old&&!record.legacyClaimed?{attempts:0,correct:0,lapses:0,lastWrong:false,last:old.last,due:old.due,interval:0,confirmations:0,stage:0,streak:0,legacyPending:true}:undefined;
}
export const secure=p=>!!p&&p.confirmations>=RULES.confirmations;
export const isDue=(p,now=Date.now())=>!!p&&Number.isFinite(p.due)&&p.due<=now;
export function reviewEvidence(old,{correct,hint=false,retry=0,now=Date.now(),gradeId=''}){
 if(gradeId&&old?.gradeIds?.includes(gradeId))return old;
 const p={attempts:0,correct:0,lapses:0,confirmations:0,stage:0,interval:0,...old};
 const qualified=!!old&&old.initialSuccess&&!old.legacyPending&&!retry&&isDue(old,now)&&now-old.last>=RULES.minGap;
 p.attempts++;p.correct+=+correct;p.last=now;p.lastWrong=!correct;
 p.lessonFirstAttempts=(p.lessonFirstAttempts||0)+ +!retry;p.lessonFirstCorrect=(p.lessonFirstCorrect||0)+ +(!retry&&correct);p.lessonRepeatAttempts=(p.lessonRepeatAttempts||0)+ +!!retry;
 if(!correct){p.lapses++;p.confirmations=0;p.stage=Math.max(0,p.stage-1);p.interval=0;p.due=now+RULES.retryDelay;}
 else if(hint){p.due=Math.min(old?.due??Infinity,now+RULES.minGap);p.interval=Math.max(0,(p.due-now)/RULES.minGap);}
 else if(qualified){p.confirmations++;p.stage=Math.min(p.stage+1,RULES.intervals.length-1);p.interval=RULES.intervals[p.stage];p.due=now+p.interval*RULES.minGap;}
 else if(!retry){p.initialSuccess=true;if(!old||old.legacyPending||!old.attempts||old.due<=now){p.interval=1;p.due=old?.legacyPending&&old.due>now?Math.min(old.due,now+RULES.minGap):now+RULES.minGap;}}
 // Successful early practice and retries do not postpone a scheduled review.
 p.due??=now+RULES.retryDelay;
 p.streak=p.confirmations;delete p.legacyPending;
 p.gradeIds=[...(old?.gradeIds||[]),gradeId].filter(Boolean).slice(-20);
 return p;
}
export function gradeRecord(record,source,method,options){
 const r=migrateRecords({x:record||{attempts:0,correct:0,streak:0,lapses:0,interval:0,due:0,last:0,lastWrong:false}}).x;
 if(!record){delete r.legacy;r.legacyClaimed=null;}
 const key=contextKey(source,method),old=evidence(record,source,method);
 if(options.gradeId&&old?.gradeIds?.includes(options.gradeId))return record;
 const p=reviewEvidence(old,options);
 const next={...r,contexts:{...r.contexts,[key]:p},attempts:r.attempts+1,correct:r.correct+ +options.correct,last:options.now,lastWrong:!options.correct,lapses:(r.lapses||0)+ +!options.correct};
 for(const f of ['lessonFirstAttempts','lessonFirstCorrect','lessonRepeatAttempts'])next[f]=(r[f]||0)+(f==='lessonFirstAttempts'?+!options.retry:f==='lessonFirstCorrect'?+(!options.retry&&options.correct):+!!options.retry);
 if(old?.legacyPending)next.legacyClaimed=key;
 return next;
}
export function dailyLedger(value,now=Date.now()){
 const today=localDay(now);
 return value&&value.date===today?{date:today,introduced:[...new Set(value.introduced||[])]}:{date:today,introduced:[]};
}
export function introduce(ledger,key,now=Date.now()){
 const day=dailyLedger(ledger,now);if(!day.introduced.includes(key))day.introduced.push(key);return day;
}
export function pairKnown(record,source){return !!(record?.legacy||Object.keys(record?.contexts||{}).some(k=>k.startsWith(source+':')));}
export function beginIntroduction(record,source,method,now=Date.now()){
 const r=record||{attempts:0,correct:0,streak:0,lapses:0,interval:0,due:0,last:0,lastWrong:false,contexts:{}};
 const key=contextKey(source,method);
 if(r.contexts?.[key])return r;
 return {...r,contexts:{...r.contexts,[key]:{attempts:0,correct:0,streak:0,lapses:0,interval:0,due:now,last:now,lastWrong:false,confirmations:0,stage:0,introducedAt:now}}};
}
export function dailyQueue({units,records,source,method,ledger,now=Date.now()}){
 const day=dailyLedger(ledger,now),remaining=Math.max(0,RULES.newPerDay-day.introduced.length);
 const review=units.filter(u=>isDue(evidence(records[u.id+':'+u.t],source,method),now)).sort((a,b)=>evidence(records[a.id+':'+a.t],source,method).due-evidence(records[b.id+':'+b.t],source,method).due);
 const fresh=units.filter(u=>u.allowNew&&!pairKnown(records[u.id+':'+u.t],source)&&!day.introduced.includes(source+':'+u.id+':'+u.t));
 const waiting=units.filter(u=>u.allowNew&&!evidence(records[u.id+':'+u.t],source,method)&&(pairKnown(records[u.id+':'+u.t],source)||day.introduced.includes(source+':'+u.id+':'+u.t)));
 const queue=review.slice(0,RULES.round).map(u=>({...u,reason:evidence(records[u.id+':'+u.t],source,method)?.legacyPending?'legacy':'due'}));
 for(const u of waiting)if(queue.length<RULES.round)queue.push({...u,reason:'new'});
 for(const u of fresh.slice(0,Math.min(remaining,Math.max(0,RULES.round-queue.length))))queue.push({...u,reason:'new',introduce:true});
 return {queue,remaining,due:review.length,newCount:queue.filter(u=>u.introduce).length,practiceCount:queue.filter(u=>u.reason==='new'&&!u.introduce).length,more:Math.max(0,review.length-RULES.round)};
}
export function statusLabel(method,english=false){return ({recognition:english?'Securely recognised':'Sicher wiedererkannt',recall:english?'Securely recalled':'Sicher abgerufen',self:english?'Secure by self-assessment':'Nach eigener Einschätzung sicher'})[family(method)];}
export function evidenceText(p,method,english=false){
 if(p?.legacyPending)return english?'Earlier progress: confirm with spaced reviews.':'Früherer Lernstand: durch verteilte Wiederholungen bestätigen.';
 return (secure(p)?statusLabel(method,english):english?'Still learning':'Noch im Lernen')+(english?` · ${p?.confirmations||0} of ${RULES.confirmations} spaced confirmations.`:` · ${p?.confirmations||0} von ${RULES.confirmations} zeitversetzten Bestätigungen.`);
}
export function scheduleText(p,now=Date.now(),english=false){
 if(!p)return '';
 if(p.due<=now)return english?'Scheduled review is due.':'Die planmäßige Wiederholung ist fällig.';
 return (english?'Next scheduled review: ':'Nächste planmäßige Wiederholung: ')+new Date(p.due).toLocaleString(english?'en-GB':'de-DE',{dateStyle:'medium',timeStyle:'short'})+'.';
}
