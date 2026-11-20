import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync('dist/standalone-page.js','utf8');
for(const [saved,system,expected]of [['dark',false,true],['light',true,false],['system',true,true],['invalid',false,false],[null,true,true],['blocked',true,true]]){
 let preference=saved,dark,schemeChange,storageChange;
 const scheme={matches:system,addEventListener(event,fn){assert.equal(event,'change');schemeChange=fn;}};
 const context={matchMedia:()=>scheme,localStorage:{getItem(){if(preference==='blocked')throw Error('Storage blocked');return preference;}},document:{body:{classList:{toggle(name,value){assert.equal(name,'dark');dark=value;}}}},window:{addEventListener(event,fn){assert.equal(event,'storage');storageChange=fn;}}};
 vm.runInNewContext(source,context);assert.equal(dark,expected);
 preference='system';scheme.matches=!system;schemeChange();assert.equal(dark,!system);
 preference='light';storageChange({key:'birdnames-theme'});assert.equal(dark,false);
 preference='dark';storageChange({key:'unrelated'});assert.equal(dark,false);
 storageChange({key:'birdnames-theme'});assert.equal(dark,true);
 preference=null;storageChange({key:null});assert.equal(dark,!system);
}
console.log('PASS: companion-page appearance follows saved/system choices, system changes, cleared storage and blocked-storage fallback.');
