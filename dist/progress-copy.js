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
