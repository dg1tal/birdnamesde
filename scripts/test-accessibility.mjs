import assert from 'node:assert/strict';
import {createAnnouncer,setTextIfChanged,focusElement,contentLanguage,queueFocus} from '../dist/accessibility.js';

let tasks=new Map(),serial=0;
const region={textContent:''};
const announce=createAnnouncer(region,{schedule:fn=>{tasks.set(++serial,fn);return serial;},cancel:id=>tasks.delete(id)});
announce('1 match');announce('2 matches');assert.equal(tasks.size,1);assert.equal(region.textContent,'');
for(const fn of tasks.values())fn();tasks.clear();assert.equal(region.textContent,'2 matches');
announce('2 matches');assert.equal(region.textContent,'');
for(const fn of tasks.values())fn();tasks.clear();assert.equal(region.textContent,'2 matches');
announce('old route');announce.clear();assert.equal(tasks.size,0);assert.equal(region.textContent,'');
let writes=0,value='unchanged';
const status={get textContent(){return value;},set textContent(next){value=next;writes++;}};
setTextIfChanged(status,'unchanged');assert.equal(writes,0);
setTextIfChanged(status,'changed');assert.equal(writes,1);
setTextIfChanged(status,'changed');assert.equal(writes,1);
assert.equal(focusElement(null),false);
assert.equal(focusElement({isConnected:false,focus(){throw Error('detached');}}),false);
const heading={isConnected:true,matches:()=>false,focus(options){this.options=options;}};
assert(focusElement(heading));assert.equal(heading.tabIndex,-1);assert.deepEqual(heading.options,{preventScroll:false});
const button={isConnected:true,matches:()=>true,focus(options){this.options=options;}};
assert(focusElement(button,{preventScroll:true}));assert.equal(button.tabIndex,undefined);assert.deepEqual(button.options,{preventScroll:true});

for(const [code,expected]of [['sci','la'],['code','en'],['de','de'],['en','en'],['nl','nl']]){
 assert.equal(contentLanguage(code),expected);
 assert.equal(Intl.getCanonicalLocales(contentLanguage(code))[0],expected);
}

let queued;const body={},doc={body,activeElement:body};let focused=0;
const target={isConnected:true,matches:()=>false,focus(){focused++;}};
queueFocus(target,{document:doc,frame:fn=>{queued=fn;}});doc.activeElement={};queued();assert.equal(focused,0);
doc.activeElement=body;queueFocus(target,{document:doc,frame:fn=>{queued=fn;}});queued();assert.equal(focused,1);
doc.activeElement={};queueFocus(target,{document:doc,frame:fn=>{queued=fn;}});target.isConnected=false;queued();assert.equal(focused,1);

target.isConnected=true;doc.activeElement={};queueFocus(target,{document:doc,frame:fn=>{queued=fn;}});queued();assert.equal(focused,2);
console.log('PASS: coalesced/repeatable status announcements, cancellation on navigation, unchanged statuses stay silent, safe focus and native tab order.');
