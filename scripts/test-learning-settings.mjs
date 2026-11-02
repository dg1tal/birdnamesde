import {readFileSync} from 'node:fs';
import {SPECIES_PACKAGES,speciesPackageControls} from '../dist/species-packages.js';
import assert from 'node:assert/strict';
import {loadSharedUI,restoreLessonState,selectionMessage} from '../dist/learning-settings.js';
const defaults={lookup:{query:''},learn:{region:'',sourceLanguage:'de',nameLanguage:'en'}};
const values=new Map([['birdnames-ui',JSON.stringify({learn:{region:'GB-ENG-CON',sourceLanguage:'de',nameLanguage:'nl'}})],['birdnames-ui-en',JSON.stringify({learn:{region:'NL'}})]]);
const storage={getItem:key=>values.get(key)};
const migrated=loadSharedUI(defaults,storage,false);assert.equal(migrated.learn.region,'GB-ENG-CON');
values.set('birdnames-ui-shared-v1',JSON.stringify(migrated));assert.deepEqual(loadSharedUI(defaults,storage,true),migrated);
values.set('birdnames-ui-shared-v1','broken');assert.equal(loadSharedUI(defaults,storage,true).learn.region,'NL');
const ids=new Set(['eurbla']);
const lesson={version:1,queue:[{id:'eurbla',t:'nl',retry:0}],index:0,method:'text',answered:0,correct:0,firstAnswered:0,firstCorrect:0,done:false,paused:false,hint:false,draft:'Mer',regionLabel:'Cornwall'};
const de={...lesson,sourceLanguage:'de'},en={...lesson,sourceLanguage:'en'};
const state=restoreLessonState(undefined,de,en,false,ids);assert.equal(state.session.sourceLanguage,'de');assert.equal(state.session.draft,'Mer');assert.equal(state.pending.length,1);assert.equal(state.pending[0].sourceLanguage,'en');
assert.deepEqual(restoreLessonState({version:1,...state},de,en,true,ids),state);
assert.deepEqual(restoreLessonState({version:1,session:null,pending:[]},de,en,true,ids),{session:null,pending:[]});
assert.equal(restoreLessonState(undefined,null,en,false,ids).session.sourceLanguage,'en');
assert(!selectionMessage({same:true,count:0},false).includes('Wortschatz'));
assert(selectionMessage({same:false,count:0,unavailable:true},true).includes('regional list'));
assert.equal(selectionMessage({count:1},false),'1 Art passt zur Auswahl.');

assert.match(selectionMessage({count:0,noLevels:true},false),/Kein Artenpaket/);
assert.match(selectionMessage({count:0,noGroups:true},true),/No species group/);
assert.match(selectionMessage({count:0,scope:'due'},false),/keine Wiederholungen fällig/);
assert.match(selectionMessage({count:0,scope:'wrong'},true),/last answered incorrectly/);
assert.equal(selectionMessage({count:3,scope:'due'},true),'3 species match your selection.');
assert.match(selectionMessage({count:0,unavailable:true,noLevels:true},false),/regionale Liste/);

console.log('PASS: shared interface-independent settings, both legacy lessons preserved, cleared lessons stay cleared, drafts/region retained and actionable selection messages.');

// Existing learning regions must not silently restrict the new lookup filter.
const regionDefaults={lookup:{query:'',region:'',regionMode:'all'},learn:{region:''}};
const oldPreferences={getItem:key=>key==='birdnames-ui-shared-v1'?JSON.stringify({lookup:{query:'Amsel',level:'1'},learn:{region:'GB-ENG-CON'}}):null};
const lookupMigration=loadSharedUI(regionDefaults,oldPreferences,false);
assert.equal(lookupMigration.lookup.query,'Amsel');
assert.equal(lookupMigration.lookup.region,'');
assert.equal(lookupMigration.lookup.regionMode,'all');
assert.equal(lookupMigration.learn.region,'GB-ENG-CON');
const separateRegions={getItem:()=>JSON.stringify({lookup:{region:'DE-BY',regionMode:'recent'},learn:{region:'NL'}})};
const restoredRegions=loadSharedUI(regionDefaults,separateRegions,true);
assert.equal(restoredRegions.lookup.region,'DE-BY');
assert.equal(restoredRegions.lookup.regionMode,'recent');
assert.equal(restoredRegions.learn.region,'NL');
console.log('PASS: lookup starts with all regions for legacy settings and restores its own region independently of learning.');

const catalogue=JSON.parse(readFileSync('dist/species.json')).species;
assert.deepEqual(SPECIES_PACKAGES.map(p=>p.id),[1,2,3]);
assert.deepEqual(SPECIES_PACKAGES.map(p=>catalogue.filter(s=>s.level===p.id).length),[106,103,104]);
for(const english of [false,true]){
 const markup=speciesPackageControls(catalogue,[1,3],english);
 assert.equal((markup.match(/<li>/g)||[]).length,catalogue.length);
 assert.equal((markup.match(/ checked/g)||[]).length,2);
 assert.equal((markup.match(/name="levels"/g)||[]).length,3);
 for(const bird of catalogue)assert(markup.includes(`<li>${bird[english?'en':'de'].replaceAll("'",'&#39;')}</li>`));
 assert(markup.includes(english?'do not include earlier packages':'enthalten die vorherigen Pakete nicht'));
 assert(markup.includes(english?'before those filters':'vor diesen Filtern'));
}
const unsafe=speciesPackageControls([{level:1,de:'<img src=x>',en:'<script>'}],[1],false);
assert(unsafe.includes('&lt;img src=x&gt;'));assert(!unsafe.includes('<img'));
console.log('PASS: complete bilingual package lists cover all species, preserve stable selections and escape names.');
