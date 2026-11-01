import assert from 'node:assert/strict';
import {createAnnouncer,setTextIfChanged,focusElement,contentLanguage,queueFocus,activateView} from '../dist/accessibility.js';

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

// Route targets stay real while stale forms/headings are removed from inactive views.
const views=['nachschlagen','lernen','statistik','info'].map(id=>({id,hidden:false,content:id,replaceChildren(){this.content='';}}));
const main={querySelectorAll:()=>views};
assert.equal(activateView(main,'lernen'),views[1]);
assert.equal(views[1].content,'lernen');
assert(views.filter(view=>view.hidden).every(view=>view.content===''));
views[1].content='answer form';views[2].content='statistics';
assert.equal(activateView(main,'statistik'),views[2]);
assert.equal(views[1].content,'');assert.equal(views[2].content,'statistics');
assert.equal(views.filter(view=>!view.hidden).length,1);
assert.throws(()=>activateView(main,'missing'));
const {readFileSync}=await import('node:fs');
const shell=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const ids=[...shell.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(ids.length,new Set(ids).size);
for(const [,fragment]of shell.matchAll(/href="#([^"]+)"/g))assert(ids.includes(fragment),'Missing initial fragment target: '+fragment);
assert.match(shell,/<h1>[^<]+<\/h1>/);
assert.match(shell,/<noscript>/);
for(const id of ['nachschlagen','lernen','statistik','info'])assert.match(shell,new RegExp('<section[^>]+id="'+id+'"[^>]*>[\\s\\S]*?<h[12]>'));
console.log('PASS: coalesced/repeatable status announcements, cancellation on navigation, unchanged statuses stay silent, safe focus and native tab order.');
console.log('PASS: meaningful initial heading/noscript help, valid static route targets and one active view without stale form content.');
