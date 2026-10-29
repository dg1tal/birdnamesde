import {editorialEnglish} from './editorial-en.js?v=20261029-editorial1';
// UI translation is applied to text nodes and accessible labels before paint.
// Species names, source titles and attribution metadata retain their originals.
export const english=(()=>{try{return localStorage.getItem('birdnames-language')==='en';}catch{return false;}})();
const pairs=`Nachschlagen|Lookup
Lernen|Learn
Statistik|Statistics
Hauptnavigation|Main navigation
Daten & Datenschutz|Data & privacy
Artenbestand wird geladen …|Loading species …
Arten nachschlagen|Look up species
Art suchen|Search species
Deutsch, Englisch, wissenschaftlich oder Code|German, English, scientific name or code
Artengruppe|Species group
Alle Artengruppen|All species groups
Wortschatz|Vocabulary
Alle Lernstufen|All vocabulary levels
Grundwortschatz|Basic vocabulary
Erweitert|Intermediate
Spezialwortschatz|Advanced vocabulary
Artenbilder|Species pictures
Aktive Filter|Active filters
Alles zurücksetzen|Clear all
Nach deutschem Namen sortiert|Sorted by German name
Filter entfernen|Remove filter
Keine passende Art|No matching species
Aktive Filter schränken die Suche ein. Entferne einen Filter oder setze die Suche zurück.|Active filters limit your search. Remove a filter or clear your search.
Versuche einen kürzeren Namen oder einen anderen Code.|Try a shorter name or another code.
Suche und Filter zurücksetzen|Clear search and filters
Zur Suche|Back to search
Status & Varianten|Status & variants
Keine weiteren Namensvarianten hinterlegt.|No further name variants recorded.
Alternative deutsche Namen|Alternative German names
Historische deutsche Namen|Historical German names
Quellen zu deutschen Namen|Sources for German names
mehrdeutig|ambiguous
Lerneinheit|Study session
Pausierte Einheit|Paused session
Einheit fortsetzen →|Resume session →
Einheit abschließen|Finish session
Deine bisherigen Antworten sind gespeichert. Schließe diese Einheit ab, bevor du eine neue beginnst.|Your answers have been saved. Finish this session before starting a new one.
Neue Einheit zusammenstellen|Set up a new session
Lernziel|Learning target
Englische Namen|German names
Englischer Name|German name
Quick Find Codes|Quick Find Codes
Namen und Codes, abwechselnd|Names and codes, alternating
Antwortmethode|Answer method
Aktive Texteingabe|Type your answer
Karteikarten|Flashcards
Lernstand|Learning progress
Alle Arten|All species
Noch nicht beherrscht|Not yet mastered
Nur fällige Wiederholungen|Due reviews only
Zuletzt falsch beantwortet|Last answered incorrectly
Fragen pro Einheit|Questions per session
Alle passenden Arten|All matching species
Artengruppen|Species groups
Gruppen suchen|Search groups
Alle auswählen|Select all
Keine auswählen|Deselect all
Alle Gruppen ausgewählt|All groups selected
Keine Gruppe ausgewählt|No group selected
Gruppe entfernen|Remove group
Keine passende Gruppe.|No matching group.
Artenauswahl aufheben|Clear species selection
Artenbilder nach der Antwort anzeigen|Show species pictures after answering
Lerneinheit starten →|Start study session →
US- und GB-Namen sowie hinterlegte Alternativnamen werden akzeptiert. Namen und Codes haben getrennte Lernstände. Fehler werden zusätzlich wiederholt.|German main names and documented, unambiguous current alternatives are accepted. Names and codes have separate progress. Incorrect answers are repeated.
Keine passenden Arten. Erweitere Wortschatz, Gruppen oder Lernstand.|No matching species. Expand the vocabulary, groups or progress selection.
Einheit abgeschlossen|Session finished
Die Einheit wurde vorzeitig abgeschlossen. Bewertete Antworten bleiben im Lernstand gespeichert.|The session was finished early. Graded answers remain saved in your progress.
Neue Einheit|New session
Fortschritt ansehen|View progress
Pausieren|Pause
Abschließen|Finish
Ursprüngliche Fragen beantwortet|Original questions answered
Deutsch →|English →
Englischen Namen eingeben|Enter the German name
Vier Buchstaben|Four letters
Prüfen|Check
Hinweis|Hint
Beginnt mit|Starts with
Nicht gewusst|Didn't know
Gewusst|Knew it
Antwort aufdecken|Reveal answer
Antwort auswählen|Choose an answer
✓ Richtig.|✓ Correct.
Noch nicht richtig.|Not correct yet.
Deine Antwort:|Your answer:
Offizieller Quick Find Code|Official Quick Find Code
Akzeptierte Namen|Accepted names
Weitere akzeptierte englische Namen:|Other English names:
Weitere englische Namen:|Other English names:
Weitere akzeptierte Codes:|Other accepted codes:
Planmäßig wieder fällig in zehn Minuten.|Next scheduled review in ten minutes.
Zusätzlich in dieser Einheit.|Also repeated in this session.
Mit Hinweis beantwortet.|Answered with a hint.
Weiter →|Next →
Arten begonnen|Species started
Englische Namen beherrscht|German names mastered
Codes beherrscht|Codes mastered
Lernziele jetzt fällig|Learning targets due now
„Beherrscht“ bedeutet: dreimal hintereinander ohne Hinweis richtig beantwortet. Namen und Codes zählen getrennt.|“Mastered” means three consecutive correct answers without a hint. Names and codes are counted separately.
Jetzt weiterlernen|Continue learning
Fällige wiederholen|Review due items
Noch nicht beherrschte üben|Practise unmastered items
Pausierte Einheit fortsetzen|Resume paused session
Gerade ist keine Wiederholung fällig. Du kannst neue oder noch nicht beherrschte Arten üben.|No reviews are due. You can practise new or unmastered species.
Noch keine Antworten. Starte eine erste Lerneinheit.|No answers yet. Start your first study session.
Fortschritt nach Artengruppe|Progress by species group
Beherrschte Arten / Arten der Gruppe|Mastered species / species in group
Gruppe|Group
Namen|Names
Codes|Codes
Häufig falsch beantwortet|Frequently answered incorrectly
Art üben|Practise species
Lernstand sichern und verwalten|Back up and manage progress
Ein Import ersetzt nach Bestätigung den aktuellen Lernstand. Lade eine Sicherung herunter, bevor du ihn ersetzt oder zurücksetzt.|After confirmation, importing replaces your current progress. Download a backup before replacing or resetting it.
Lernstand als JSON sichern|Export progress as JSON
Sicherung importieren|Import backup
Lernstand zurücksetzen|Reset learning progress
Entfernt alle Lernwerte und die laufende Einheit aus diesem Browser.|Removes all progress and the current session from this browser.
Fortschritt zurücksetzen|Reset progress
Alle Lernwerte und die laufende Einheit in diesem Browser löschen?|Delete all progress and the current session in this browser?
Lernstand importiert.|Progress imported.
Import in dieser Ansicht geladen, aber nicht dauerhaft gespeichert. Bitte Sicherung behalten.|Import loaded, but could not be saved. Please keep your backup.
Import fehlgeschlagen:|Import failed:
Datei ist zu groß (maximal 5 MB).|File is too large (maximum 5 MB).
Der Browser kann den Lernstand gerade nicht dauerhaft speichern. Bitte exportiere ihn vor dem Schließen.|Your browser cannot save progress right now. Export it before closing.
Artenbild wird geladen|Loading species picture
Art auf eBird ↗|Species on eBird ↗
Bild derzeit nicht verfügbar.|Picture currently unavailable.
eBird-Fotogalerie öffnen ↗|Open eBird photo gallery ↗
Historische Illustration|Historical illustration
Bilder vergrößern|Enlarge pictures
Vergrößern|Enlarge
Bildnachweis|Image credit
für die Anzeige verkleinert, Inhalt unverändert|resized for display, content unchanged
Originallegende ↗|Original caption ↗
Urheber:|Creator:
Geschlechtervergleich noch unvollständig.|Sex comparison still incomplete.
Weitere Fotos auf eBird ↗|More pictures on eBird ↗
Schließen ×|Close ×
Fotos und Illustrationen sind nicht maßstabsgetreu. Bei historischen Abbildungen kann die Farbwiedergabe vom heutigen Foto abweichen.|Pictures and illustrations are not to scale. Historical illustrations may differ in colour from modern photographs.
Männchen|Male
Weibchen|Female
Brutkleid|Breeding plumage
Winterkleid|Winter plumage
Foto:|Photo:
Farbschema:|Theme:
Automatisch|Automatic
Hell|Light
Dunkel|Dark
Wechseln|Switch
Farbschema wechseln|Switch theme
Daten konnten nicht geladen werden.|Could not load data.
Bitte Seite erneut laden.|Please reload the page.`.split('\n').map(l=>l.split('|'));
let dictionary=new Map([...pairs,...Object.entries(editorialEnglish)]);dictionary.set('⤢ Vergrößern','⤢ Enlarge');for(const [de,en] of Object.entries({'Keine gültige BirdNames-DE-Sicherung.':'Not a valid BirdNames DE backup.','Ungültiger Lerneintrag.':'Invalid progress record.','Ungültige Lernwerte.':'Invalid learning values.','Ungültige getrennte Antwortzähler.':'Invalid separate answer counts.','Widersprüchliche Antwortzähler.':'Inconsistent answer counts.','Widersprüchliche Lernwerte.':'Inconsistent learning values.'}))dictionary.set(de,en);
for(const [de,en] of Object.entries({'Zum Beispiel Enten oder Spechte':'For example ducks or woodpeckers','Alle Gruppen':'All groups','Auswahl löschen':'Clear selection','Eine oder mehrere Gruppen':'One or more groups','Getrennte Zählung seit dem 21.10.2026; ältere Antworten sind nur in der Gesamtquote enthalten.':'Separate counts since 21 October 2026; older answers only contribute to the overall total.'}))dictionary.set(de,en);
for(const [de,en] of Object.entries({"Strauße": "Ostriches", "Kasuare und Emus": "Cassowaries and Emu", "Kiwis": "Kiwis", "Nandus": "Rheas", "Tinamus": "Tinamous", "Wehrvögel": "Screamers", "Entenvögel": "Waterfowl", "Großfußhühner": "Megapodes", "Hokkoverwandte": "Chachalacas, Guans, and Curassows", "Hühnervögel": "Grouse, Quail, and Allies", "Tauben": "Pigeons and Doves", "Stelzenrallen": "Mesites", "Flughühner": "Sandgrouse", "Trappen": "Bustards", "Turakos": "Turacos", "Kuckucke": "Cuckoos", "Nachtschwalben": "Nightjars", "Tagschläfer und Fettschwalme": "Potoos and Oilbird", "Eulenschwalme": "Frogmouths", "Höhlenschwalme": "Owlet-nightjars", "Segler": "Swifts", "Baumsegler": "Treeswifts", "Kolibris": "Hummingbirds", "Besenschwanzrallen": "Flufftails", "Rallen": "Rails, Gallinules, and Allies", "Binsenrallen": "Finfoots", "Rallenkraniche": "Limpkin", "Trompetervögel": "Trumpeters", "Kraniche": "Cranes", "Watvögel": "Shorebirds", "Raubmöwen": "Skuas and Jaegers", "Alke": "Alcids", "Möwenverwandte": "Gulls, Terns, and Skimmers", "Flamingos": "Flamingos", "Lappentaucher": "Grebes", "Hoatzine": "Hoatzin", "Kagus": "Kagu", "Sonnenrallen": "Sunbittern", "Tropikvögel": "Tropicbirds", "Seetaucher": "Loons", "Pinguine": "Penguins", "Albatrosse": "Albatrosses", "Wellenläufer": "Storm-Petrels", "Sturmvögel": "Petrels, Shearwaters, and Diving-Petrels", "Störche": "Storks", "Fregattvögel und Tölpel": "Frigatebirds, Boobies, and Gannets", "Scharben und Schlangenhalsvögel": "Cormorants and Anhingas", "Reiher und Ibisse": "Herons, Ibis, and Allies", "Schuhschnäbel und Hammerköpfe": "Shoebill and Hammerkop", "Pelikane": "Pelicans", "Greifvögel": "Vultures, Hawks, and Allies", "Eulen": "Owls", "Mausvögel": "Mousebirds", "Kuckucksroller": "Cuckoo-roller", "Trogone": "Trogons and Quetzals", "Wiedehopfe": "Hoopoes", "Baumhopfe": "Woodhoopoes and Scimitarbills", "Hornraben und Hornvögel": "Hornbills", "Spinte": "Bee-eaters", "Todis": "Todies", "Sägeracken": "Motmots", "Eisvögel": "Kingfishers", "Racken und Erdracken": "Rollers and Allies", "Faul- und Glanzvögel": "Puffbirds and Jacamars", "Bartvögel und Tukane": "Barbets and Toucans", "Honiganzeiger": "Honeyguides", "Spechte": "Woodpeckers", "Seriemas": "Seriemas", "Falken": "Falcons and Caracaras", "Eulenpapageien": "New Zealand Parrots", "Kakadus": "Cockatoos", "Papageien": "Parrots, Parakeets, and Allies", "Stummelschwänze": "New Zealand Wrens", "Pittabreitrachen": "African and Green Broadbills", "Breitrachen": "Asian and Grauer's Broadbills", "Tyrannenbreitrachen": "Sapayoa", "Jalas": "Asities", "Pittas": "Old World Pittas", "Ameisenvögel": "Antbirds", "Bandvögel": "Crescentchests", "Ameisenpittas und Mückenfresser": "Gnateaters and Antpittas", "Bürzelstelzer": "Tapaculos", "Ameisendrosseln": "Antthrushes", "Laubwender und Erdhacker": "Leaftossers and Miners", "Baumsteigerartige": "Woodcreepers", "Töpfervögelartige": "Ovenbirds", "Schnurrvögel": "Manakins", "Schmuckvögel": "Cotingas", "Bekarden": "Becards, Tityras, and Allies", "Flammenkopfbekarden, Kronenbekarden und Verwandte": "Sharpbill, Royal Flycatchers, and Allies", "Tyrannen: Olivtyrannen, Kleintyrannen und Verwandte": "Tyrant Flycatchers: Elaenias, Tyrannulets, and Allies", "Tyrannen: Schnäppertyrannen, Königstyrannen und Verwandte": "Tyrant Flycatchers: Pewees, Kingbirds, and Allies", "Leierschwänze": "Lyrebirds", "Dickicht- und Laubenvögel": "Scrub-birds and Bowerbirds", "Baumrutscher": "Australian Treecreepers", "Staffelschwänze": "Fairywrens", "Honigfresser": "Honeyeaters", "Borstenvögel": "Bristlebirds", "Panthervögel": "Pardalotes", "Südsee-Grasmücken": "Thornbills and Allies", "Australsäbler": "Pseudo-Babblers", "Stachelschwanzflöter": "Logrunners", "Drosselflöter": "Quail-thrushes and Jewel-babblers", "Raupenfänger": "Cuckooshrikes", "Maorigrasmücken": "Whiteheads", "Spiegelkleiber": "Sittellas", "Australflöter": "Whipbirds and Wedgebills", "Pflugschnäbel": "Ploughbill", "Haubendickköpfe": "Australo-Papuan Bellbirds", "Meisendickköpfe": "Shrike-tits", "Beerenfresser": "Tit Berrypecker and Crested Berrypecker", "Würgervireos und Haubenvireos": "Shrike-Babblers and Erpornis", "Vireos": "Vireos", "Dickköpfe": "Whistlers and Allies", "Pirole": "Old World Orioles", "Flachschnäbel": "Boatbills", "Schwalbenstarverwandte": "Woodswallows", "Krähenstareverwandte": "Bellmagpies and Allies", "Beerenjäger": "Mottled Berryhunter", "Afrikaschnäpper": "Wattle-eyes and Batises", "Vangas": "Vangas, Helmetshrikes, and Allies", "Warzenköpfe": "Bristlehead", "Ioras": "Ioras", "Buschwürger": "Bushshrikes and Allies", "Fächerschwänze": "Fantails", "Drongos": "Drongos", "Paradiesvögel": "Birds-of-Paradise", "Blaukappenflöter": "Ifrita", "Monarchenverwandte": "Monarch Flycatchers", "Töpferkrähen": "White-winged Chough and Apostlebird", "Neuguineaflöter": "Melampittas", "Haubenhäher": "Crested Jayshrike", "Würger": "Shrikes", "Krähenverwandte": "Jays, Magpies, Crows, and Ravens", "Samtvögel": "Satinbirds", "Beerenpicker": "Berrypeckers and Longbills", "Lappenvögel": "Wattlebirds", "Stichvögel": "Stitchbird", "Südseeschnäpper": "Australasian Robins", "Felsenhüpfer": "Rockfowl", "Felsenspringer": "Rockjumpers", "Rallenflöter": "Rail-babbler", "Hyliotas": "Hyliotas", "Elfenschnäpper": "Fairy Flycatchers", "Meisen": "Tits, Chickadees, and Titmice", "Beutelmeisen": "Penduline-Tits and Verdin", "Lerchen": "Larks", "Bartmeisen": "Bearded Reedling", "Tropfenvögel": "Nicators", "Bülbülgrasmücken": "Crombecs, Longbills, and Allies", "Halmsänger": "Cisticolas and Allies", "Rohrsängerverwandte": "Reed Warblers and Allies", "Schwirlverwandte": "Grassbirds and Allies", "Rohrspötter": "Donacobius", "Madagaskarsänger": "Malagasy Warblers", "Zwergpfeifer": "Cupwings", "Schwalben": "Martins and Swallows", "Bülbüls": "Bulbuls", "Laubsänger": "Leaf Warblers", "Seidensängerverwandte": "Bush Warblers and Allies", "Schwanzmeisen": "Long-tailed Tits and Bushtit", "Grasmückenverwandte": "Sylviid Warblers", "Papageimeisenverwandte": "Parrotbills, Wrentit, and Allies", "Brillenvögel": "White-eyes, Yuhinas, and Allies", "Timalien": "Tree-Babblers, Scimitar-Babblers, and Allies", "Drosslinge": "Ground Babblers and Allies", "Häherlinge": "Laughingthrushes and Allies", "Goldhähnchen": "Kinglets", "Mauerläufer": "Wallcreeper", "Kleiber": "Nuthatches", "Baumläufer": "Treecreepers", "Mückenfängerverwandte": "Gnatcatchers", "Zaunkönige": "Wrens", "Kurzschwänze": "Elachura", "Wasseramseln": "Dippers", "Madenhacker": "Oxpeckers", "Starenverwandte": "Starlings and Mynas", "Spottdrosseln": "Catbirds, Mockingbirds, and Thrashers", "Drosseln": "Thrushes", "Schnäpperverwandte": "Old World Flycatchers", "Seidenschwänze": "Waxwings", "Mohos": "Hawaiian Honeyeaters", "Seidenschnäpper": "Silky-flycatchers", "Palmenschwätzer": "Palmchat", "Waldpfeifer": "Hylocitrea", "Seidenwürger": "Hypocolius", "Honigvögel": "Sugarbirds", "Sopranisten": "Dapple-throats", "Mistelfresser": "Flowerpeckers", "Nektarvögel": "Sunbirds and Spiderhunters", "Feenvögel": "Fairy-bluebirds", "Blattvögel": "Leafbirds", "Trugwaldsänger": "Olive Warbler", "Rosenschwänze": "Przevalski's Pinktail", "Weber": "Weavers and Allies", "Prachtfinken": "Estrildids", "Witwen": "Whydahs and Indigobirds", "Braunellen": "Accentors", "Sperlinge": "Old World Sparrows", "Stelzenverwandte": "Wagtails and Pipits", "Finkenverwandte": "Finches, Euphonias, and Allies", "Tundraammern": "Longspurs and Snow Buntings", "Tangarenammern": "Thrush-Tanager", "Ammern": "Old World Buntings", "Neuweltammern": "New World Sparrows", "Schmätzertangaren und Palmtangaren": "Chat-Tanagers and Greater Antillean Tanagers", "Zaunkönigsänger": "Wrenthrush", "Kubasänger": "Cuban Warblers", "Flötenstärlinge": "Yellow-breasted Chat", "Stärlinge": "Blackbirds", "Waldsänger": "Wood-Warblers", "Stärlingstangaren": "Mitrospingid Tanagers", "Kardinäle": "Cardinals, Grosbeaks, and Allies", "Tangarenverwandte": "Tanagers and Allies", "Andere": "Others"}))dictionary.set(de,en);
const replacements=[...pairs].sort((a,b)=>b[0].length-a[0].length);
export function t(text){if(!english)return text;const leading=text.match(/^\s*/)[0],trailing=text.match(/\s*$/)[0],clean=text.trim();if(dictionary.has(clean))return leading+dictionary.get(clean)+trailing;
 let out=text;
 if(clean.includes(' · '))out=clean.split(' · ').map(part=>dictionary.get(part)||part).join(' · ');
 for(const [de,en] of pairs)if(clean.startsWith(de+':'))out=out.replace(de+':',en+':');
 if(clean==='Deutsch → Englischer Name')return 'English → German name';if(clean==='Deutsch → Quick Find Code')return 'English → Quick Find Code';
 for(const [de,en] of replacements)if(de.length>25)out=out.split(de).join(en);
 out=out.replace(/^Foto:/,'Photo:').replace(/^Farbschema: (Automatisch|Hell|Dunkel)(.*)$/,(_,v,suffix)=>'Theme: '+({Automatisch:'Automatic',Hell:'Light',Dunkel:'Dark'}[v])+(suffix?'. Switch':'' )).replace(/^Weitere offizielle Quick Codes:/,'Other official Quick Codes:').replace(/^Codequelle:.*Banding-Code.*$/,'Code source: official banding code; no separate common-name Quick Code is listed.').replace(/^Codequelle:.*com_quick_codes.*$/,'Code source: com_quick_codes from the official eBird table.').replace(/: Bilder vergrößern$/,': Enlarge pictures').replace(/^Beginnt mit /,'Starts with ').replace(/: Filter entfernen$/,': Remove filter').replace(/: Gruppe entfernen$/,': Remove group').replace(/^↑ Zur Suche$/,'↑ Back to search').replace(/^(\d+) von (\d+) Erstantworten richtig$/,'$1 of $2 first answers correct').replace(/^(\d+) von (\d+) ursprünglichen Fragen bearbeitet\.$/,'$1 of $2 original questions completed.').replace(/^(\d+) zusätzliche (Wiederholung|Wiederholungen) · (\d+) davon richtig\.$/,'$1 extra repeats · $3 correct.').replace(/^(\d+) Namen und (\d+) Codes sind fällig\.$/,'$1 names and $2 codes are due.').replace(/^(\d+) % richtig bei (\d+) Antworten einschließlich Wiederholungen\.$/,(_,percent,n)=>`${percent}% correct across ${n} ${n==='1'?'answer':'answers'} including repeats.`).replace(/^(\d+) % richtige Erstantworten \((\d+) von (\d+)\) · (\d+) zusätzliche (Wiederholung|Wiederholungen)\.$/,'$1% correct first answers ($2 of $3) · $4 extra repeats.').replace(/^(\d+) Fehler insgesamt$/,(_,n)=>`${n} ${n==='1'?'error':'errors'} in total`).replace(/^Diese (\d+) Arten üben$/,(_,n)=>n==='1'?'Practise this species':`Practise these ${n} species`).replace(/^(\d+) gezielt ausgewählte Arten? aus der Statistik\.$/,'$1 species selected from statistics.').replace(/^Männchen/,'Male').replace(/^Weibchen/,'Female').replace(/Brutkleid$/,'breeding plumage').replace(/Winterkleid$/,'winter plumage');
 return out.replace(/(\d+) von (\d+) Arten/g,'$1 of $2 species').replace(/(\d+) von (\d+) Fragen beantwortet/g,'$1 of $2 questions answered').replace(/(\d+) Fragen/g,'$1 questions').replace(/(\d+) Arten passen zur Auswahl\./g,'$1 species match your selection.').replace(/(\d+) Art passt zur Auswahl\./g,'$1 species matches your selection.').replace(/Wiederholungen/g,'repeats').replace(/Wiederholung/g,'repeat').replace(/ offen/g,' remaining').replace(/· alle/g,'· all').replace(/(\d+) ausgewählt/g,'$1 selected').replace(/Nächste planmäßige repeat in (\d+) Tag(?:e|en)?\./g,(_,n)=>`Next scheduled review in ${n} ${n==='1'?'day':'days'}.`).replace(/(\d+) Lernwerte importieren und den aktuellen Stand ersetzen\?/g,'Import $1 progress records and replace current progress?');}

// Compose variable feedback explicitly so every fragment follows the interface locale.
export function reviewMessage({correct,hint,days,retry}){
 if(english){
  const schedule=correct&&!hint?`Next scheduled review in ${days} ${days===1?'day':'days'}.`:'Next scheduled review in ten minutes.';
  return schedule+(!correct&&retry<2?' Also repeated in this session.':'')+(hint?' Answered with a hint.':'');
 }
 return (correct&&!hint?'Nächste planmäßige Wiederholung in '+days+(days===1?' Tag.':' Tagen.'):'Planmäßig wieder fällig in zehn Minuten.')+(!correct&&retry<2?' Zusätzlich in dieser Einheit.':'')+(hint?' Mit Hinweis beantwortet.':'');
}
export function importErrorMessage(error){
 const message=error instanceof SyntaxError?(english?'The file does not contain valid JSON.':'Die Datei enthält kein gültiges JSON.'):t(String(error?.message||''));
 const known=error instanceof SyntaxError||dictionary.has(String(error?.message||''));
 const reason=known?message:(english?'The backup could not be read. Please check the file and try again.':'Die Sicherung konnte nicht gelesen werden. Bitte prüfe die Datei und versuche es erneut.');
 return (english?'Import failed: ':'Import fehlgeschlagen: ')+reason;
}

export function localize(){
 const languagePicker=document.querySelector('#language-picker');languagePicker.setAttribute('aria-label',english?'Interface language':'Oberflächensprache');
 document.querySelectorAll('[data-ui-language]').forEach(button=>{const selected=button.dataset.uiLanguage===(english?'en':'de');button.setAttribute('aria-pressed',String(selected));button.setAttribute('aria-label',english?'Interface language: '+(button.dataset.uiLanguage==='en'?'English':'German'):'Oberflächensprache: '+(button.dataset.uiLanguage==='en'?'Englisch':'Deutsch'));});
 document.documentElement.lang=english?'en':'de';
 if(!english)return;
 const originals=new WeakMap();
 function scan(root){if(root.nodeType===3){if(root.parentElement?.closest('[data-name-content]'))return;const previous=originals.get(root);if(previous===root.textContent)return;const value=t(root.textContent);if(value!==root.textContent)root.textContent=value;originals.set(root,value);return;}if(root.nodeType===1&&root.closest('[data-name-content]'))return;if(root.nodeType!==1||['SCRIPT','STYLE','TEXTAREA'].includes(root.tagName))return;for(const a of ['aria-label','placeholder','title'])if(root.hasAttribute(a)){const v=t(root.getAttribute(a));if(v!==root.getAttribute(a))root.setAttribute(a,v);}for(const child of root.childNodes)scan(child);}
 scan(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='childList')for(const n of m.addedNodes)scan(n);else scan(m.target);}}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title']});
}
