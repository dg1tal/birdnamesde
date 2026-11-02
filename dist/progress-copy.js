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
export function masteryText(streak,english=false){
 if(streak>=3)return english?'Mastered: at least 3 consecutive correct answers without a hint.':'Beherrscht: mindestens 3 Antworten in Folge ohne Hinweis richtig.';
 return english?`Not yet mastered: ${streak} of 3 consecutive correct answers without a hint.`:`Noch nicht beherrscht: ${streak} von 3 Antworten in Folge ohne Hinweis richtig.`;
}
export function progressDefinitions(english=false){
 return english?[
  ['Due','The scheduled time to practise again has arrived. New learning targets are not due yet. Mastered names and codes also become due again.'],
  ['Mastered','At least 3 consecutive correct answers without a hint. An error or a hint resets this streak. Each answer language and codes have separate progress.'],
  ['Round questions','The questions selected when the round starts. They may be new to you or already practised. The bar counts their first attempts, whether correct or incorrect.'],
  ['Extra attempts','After an error, that question returns later in this round, at most twice. These attempts are counted separately; the number of round questions stays the same.']
 ]:[
  ['Fällig','Der geplante Zeitpunkt zum erneuten Üben ist erreicht. Neue Lernziele sind noch nicht fällig. Auch beherrschte Namen und Codes werden wieder fällig.'],
  ['Beherrscht','Mindestens 3 Antworten in Folge ohne Hinweis richtig. Ein Fehler oder ein Hinweis setzt diese Serie zurück. Jede Antwortsprache und Codes haben eigene Lernstände.'],
  ['Rundenfragen','Die beim Start ausgewählten Fragen. Sie können für dich neu oder bereits geübt sein. Der Balken zählt ihre ersten Versuche, unabhängig davon, ob die Antwort richtig war.'],
  ['Zusatzversuche','Nach einem Fehler kommt die Frage später in dieser Runde erneut dran, höchstens zweimal. Diese Versuche zählen separat; die Zahl der Rundenfragen bleibt gleich.']
 ];
}

// Capture the reason before grading changes the learning record. Restored graded
// questions without this metadata use neutral wording rather than a guess.
export function questionReason({retry=0,progress,now=Date.now()}){
 if(retry)return 'retry';
 if(!progress?.attempts)return 'new';
 return Number.isFinite(progress.due)&&progress.due<=now?'due':'practice';
}
export function questionReasonText(item,english=false){
 if(item.retry||item.reason==='retry')return english?'You answered this question incorrectly earlier in this round, so it returns for another attempt. This extra attempt does not count as a new round question.':'Du hast diese Frage zuvor in dieser Runde falsch beantwortet. Deshalb kommt sie erneut dran. Dieser Zusatzversuch zählt nicht als neue Rundenfrage.';
 const code=item.t==='code';
 if(item.reason==='new')return english?`You had not practised this ${code?'code':'name'} before this question.`:`Diesen ${code?'Code':'Namen'} hattest du vor dieser Frage noch nicht geübt.`;
 if(item.reason==='due')return english?`The scheduled review of this ${code?'code':'name'} was due before this question.`:`Die geplante Wiederholung für diesen ${code?'Code':'Namen'} war vor dieser Frage fällig.`;
 if(item.reason==='practice')return english?`You are practising this ${code?'code':'name'} again as part of your chosen round. Its scheduled review was not yet due.`:`Du übst diesen ${code?'Code':'Namen'} im Rahmen deiner gewählten Runde erneut. Eine planmäßige Wiederholung war noch nicht fällig.`;
 return english?'This bird is part of your chosen round.':'Dieser Vogel gehört zu deiner gewählten Runde.';
}
