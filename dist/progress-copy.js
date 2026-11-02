import {RULES} from './learning-model.js?v=20261102-learning2';
// A round's first attempts are distinct from never-before-practised learning
// targets and from scheduled reviews. Keep these labels consistent everywhere.
export function lessonProgressText({total,completed,repeats},english=false){
 const remaining=total-completed;
 return {
  primary:english?`Round questions: ${completed} of ${total} answered`:`Rundenfragen: ${completed} von ${total} beantwortet`,
  pending:english?`Remaining: ${remaining} round ${remaining===1?'question':'questions'} · ${repeats} extra ${repeats===1?'attempt':'attempts'}`:`Noch offen: ${remaining} ${remaining===1?'Rundenfrage':'Rundenfragen'} · ${repeats} ${repeats===1?'Zusatzversuch':'Zusatzversuche'}`,
  barLabel:english?'Round questions answered on their first attempt':'Rundenfragen im ersten Versuch beantwortet'
 };
}
export function attemptText(retry,english=false){
 return retry?(english?`Extra attempt ${retry} of at most 2 after an error`:`Zusatzversuch ${retry} von höchstens 2 nach einem Fehler`):(english?'First attempt in this round':'Erster Versuch in dieser Runde');
}
export function masteryText(streak,english=false){return english?`${streak} spaced confirmations.`:`${streak} zeitversetzte Bestätigungen.`;}
export function progressDefinitions(english=false){return english?[
 ['Due','The scheduled practice time has arrived. Region and season do not remove started targets from review.'],
 ['Secure',`${RULES.confirmations} consecutive due reviews without a hint, each at least ${RULES.minGap/3600000} hours after the previous graded attempt. Recognition, recall and self-assessment have separate evidence.`],
 ['Round questions','Selected learning targets; introductions and extra attempts do not increase this total.'],
 ['Extra attempts','Errors and hinted answers may return after other questions, at most twice. They do not confirm long-term retention.']
 ]:[
 ['Fällig','Der geplante Übungszeitpunkt ist erreicht. Region und Saison entfernen begonnene Ziele nicht aus der Wiederholung.'],
 ['Sicher',`${RULES.confirmations} richtige fällige Wiederholungen ohne Hinweis, jeweils mindestens ${RULES.minGap/3600000} Stunden nach dem letzten bewerteten Versuch. Wiedererkennen, Abruf und Selbsteinschätzung haben getrennte Nachweise.`],
 ['Rundenfragen','Ausgewählte Lernziele; Vorstellungen und Zusatzversuche erhöhen diese Zahl nicht.'],
 ['Zusatzversuche','Fehler und Hinweisantworten können nach anderen Fragen wiederkehren, höchstens zweimal. Sie bestätigen kein langfristiges Erinnern.']
 ];}

// Capture the reason before grading changes the learning record. Restored graded
// questions without this metadata use neutral wording rather than a guess.
export function questionReason({retry=0,progress,now=Date.now()}){
 if(retry)return 'retry';
 if(progress?.legacyPending)return 'legacy';
 if(!progress?.attempts)return 'new';
 return Number.isFinite(progress.due)&&progress.due<=now?'due':'practice';
}
export function questionReasonText(item,english=false){
 if(item.retry||item.reason==='retry')return english?'This question returns after an error or a hinted answer earlier in this round. This extra attempt does not count as a new round question.':'Diese Frage kommt nach einem Fehler oder einer Antwort mit Hinweis in dieser Runde erneut dran. Dieser Zusatzversuch zählt nicht als neue Rundenfrage.';
 if(item.reason==='legacy')return english?'This target is due to confirm earlier progress under the new rules.':'Dieses Lernziel ist fällig, um früheren Lernstand mit den neuen Regeln zu bestätigen.';
 const code=item.t==='code';
 if(item.reason==='new')return english?`You had not practised this ${code?'code':'name'} in this learning direction and method before this question.`:`Diesen ${code?'Code':'Namen'} hattest du in dieser Lernrichtung und Methode vor dieser Frage noch nicht geübt.`;
 if(item.reason==='due')return english?`The scheduled review of this ${code?'code':'name'} was due in this learning direction and method before this question.`:`Die geplante Wiederholung für diesen ${code?'Code':'Namen'} war vor dieser Frage fällig.`;
 if(item.reason==='practice')return english?`You are practising this ${code?'code':'name'} again as part of your chosen round. Its scheduled review was not yet due.`:`Du übst diesen ${code?'Code':'Namen'} im Rahmen deiner gewählten Runde erneut. Eine planmäßige Wiederholung war noch nicht fällig.`;
 return english?'This bird is part of your chosen round.':'Dieser Vogel gehört zu deiner gewählten Runde.';
}
