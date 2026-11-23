import {seasonLabel} from './hybrid-learning.js?v=20261108-quality1';

export const SELECTION_REASONS=['saved','selected','current','frequent','medium','rare','seasonal','seasonal-fallback','recent','regional'];

// Freeze the species-specific reason while the selection data is available.
export function introductionSelectionReason(id,settings,hybrid){
 if(settings.savedRound)return 'saved';
 if(settings.ids?.includes(id))return 'selected';
 if(hybrid.additions.some(r=>r.id===id))return 'current';
 if(hybrid.seasonalReady)return ['frequent','medium','rare'].find(g=>hybrid.frequencyGroups?.[g]?.includes(id))||'seasonal';
 if(hybrid.seasonalRequested)return 'seasonal-fallback';
 return settings.regionMode==='recent'?'recent':'regional';
}

export function introductionReasonText(item,round,area='',english=false){
 const h=round.regionalContext,extra=h?.additions.find(r=>r.id===item.id);
 // Older rounds did not store a per-species reason. Only use known context.
 const reason=item.selectionReason||(round.savedRound?'saved':extra?'current':h?.seasonalReady?'seasonal':h?.seasonalRequested?'seasonal-fallback':area?'regional':null);
 const region=area||(english?'your selected region':'deiner gewählten Region');
 const season=h?seasonLabel(h.season,english):'';
 const frequency={frequent:['häufig','frequently'],medium:['mittelhäufig','moderately often'],rare:['selten','rarely']}[reason];
 if(frequency)return english?`Selected because this species is reported ${frequency[1]} in ${region} in ${season}.`:`Dabei, weil diese Art in ${region} im ${season} ${frequency[0]} gemeldet wird.`;
 if(reason==='saved')return english?'Selected because you saved this species and started a saved-species round.':'Dabei, weil du diese Art gemerkt und eine Merklistenrunde gestartet hast.';
 if(reason==='selected')return english?'Selected because you specifically chose this species for practice.':'Dabei, weil du diese Art gezielt zum Üben ausgewählt hast.';
 if(reason==='current')return english?`Selected as a current addition for ${region}${extra?' (reported '+extra.observedOn+')':''} when this round started.`:`Dabei als aktuelle Ergänzung für ${region}${extra?' (gemeldet am '+extra.observedOn+')':''} beim Start dieser Runde.`;
 if(reason==='seasonal')return english?`Selected from your seasonal species selection for ${region} · ${season}.`:`Aus deiner saisonalen Artenauswahl für ${region} · ${season}.`;
 if(reason==='seasonal-fallback')return english?`Selected from the regional records for ${region}, because there was insufficient seasonal data when this round started.`:`Dabei aus den regionalen Nachweisen für ${region}, weil beim Rundenstart nicht genügend Saisondaten vorlagen.`;
 if(reason==='recent')return english?`Selected because this species was reported in ${region} in the 30 days before this round started.`:`Dabei, weil diese Art in ${region} in den 30 Tagen vor dem Rundenstart gemeldet wurde.`;
 if(reason==='regional')return english?`Selected because this species is on the regional record list for ${region}.`:`Dabei, weil diese Art auf der regionalen Nachweisliste für ${region} steht.`;
 return english?'This species is part of your selection for this round.':'Diese Art gehört zu deiner Auswahl für diese Runde.';
}
