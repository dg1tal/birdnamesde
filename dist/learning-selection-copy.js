// Describe what will be learned, rather than exposing abstract learning targets.
export function newNamesText(count,language='en',english=false){
 const de={de:['deutscher Vogelname','deutsche Vogelnamen'],en:['englischer Vogelname','englische Vogelnamen'],nl:['niederländischer Vogelname','niederländische Vogelnamen'],fi:['finnischer Vogelname','finnische Vogelnamen'],sci:['wissenschaftlicher Vogelname','wissenschaftliche Vogelnamen']};
 const en={de:'German bird',en:'English bird',nl:'Dutch bird',fi:'Finnish bird',sci:'scientific'};
 return english?`${count} new ${en[language]||'bird'} ${count===1?'name':'names'}`:`${count} ${count===1?'neuer':'neue'} ${(de[language]||['Vogelname','Vogelnamen'])[+(count!==1)]}`;
}
export function dailyNewNamesText(items,language='en',english=false){
 const codes=items.filter(i=>i.t==='code').length,names=items.length-codes,parts=[];
 if(names)parts.push(newNamesText(names,language,english));
 if(codes)parts.push(english?`${codes} new ${codes===1?'code':'codes'}`:`${codes} ${codes===1?'neuer Code':'neue Codes'}`);
 if(!parts.length)return '';
 return parts.join(english?' and ':' und ')+(english?' from your species selection':' aus deiner Artenauswahl');
}
export const selectionExplanation=english=>english?'Your species selection determines which names and codes are introduced. Previously learned names and codes are reviewed when scheduled, regardless of your current species selection.':'Deine Artenauswahl bestimmt, welche Namen und Codes neu hinzukommen. Bereits gelernte Namen und Codes werden zum geplanten Zeitpunkt wiederholt – unabhängig von deiner aktuellen Artenauswahl.';
