import {isCodeTarget,codeAnswers,normalizeCode} from './code-targets.js?v=20261124-ebd1';
import {validateRecords} from './progress-validation.js?v=20261124-ebd1';
import {reviewEvidence,secure} from './learning-model.js?v=20261124-ebd1';
import {acceptedNames,acceptsName,primaryName,NAME_LANGUAGES} from './name-languages.js?v=20261124-ebd1';
import {scientificNameAliases} from './scientific-name-aliases.js?v=20261124-ebd1';
export const normalize=s=>String(s??'').toLowerCase().replace(/ä/g,'a').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ß/g,'ss').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]/gu,'');
export function matches(s,q){return q.trim().split(/\s+/).every(t=>[s.de,s.en,s.enGB,s.sci,...scientificNameAliases(s).map(a=>a.name),...s.codes,s.dda?.code,s.dda?.name,...s.aliases.de,...(s.germanNames||[]).map(n=>n.name),...s.aliases.en,...NAME_LANGUAGES.flatMap(l=>acceptedNames(s,l.code))].some(v=>normalize(v).includes(normalize(t))||normalize(v).includes(normalize(t.replace(/ae/g,'ä').replace(/oe/g,'ö').replace(/ue/g,'ü')))));}
export function accepts(s,target,value){if(!isCodeTarget(target))return acceptsName(s,target,value);const answer=target==='dda'?normalizeCode(value):normalize(value);return !!answer&&codeAnswers(s,target).some(v=>(target==='dda'?normalizeCode(v):normalize(v))===answer);}
export function answerSpecies(birds,target,value,source){return birds.filter(s=>primaryName(s,source)&&accepts(s,target,value));}
export function review(old,correct,now=Date.now(),hint=false){return reviewEvidence(old,{correct,now,hint});}
export const mastered=secure;
export const due=(p,now=Date.now())=>!!p&&p.due<=now;
export function validProgress(x,ids){
 if(!x||x.app!=='BirdNames DE'||![1,2,3].includes(x.version))throw Error('Keine gültige BirdNames-DE-Sicherung.');
 return validateRecords(x.records,ids);
}
