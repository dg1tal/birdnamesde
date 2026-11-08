import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// Exercise the initial and mutation-driven localization contract without a browser dependency.
function element(tagName,attributes={},childNodes=[]){
 const node={nodeType:1,tagName,attributes:{...attributes},childNodes,
  hasAttribute(name){return Object.hasOwn(this.attributes,name);},
  getAttribute(name){return this.attributes[name];},
  setAttribute(name,value){this.attributes[name]=value;},
  closest(){return this.hasAttribute('data-name-content')?this:this.parentElement?.closest()||null;}};
 for(const child of childNodes)child.parentElement=node;
 return node;
}
const text=value=>({nodeType:3,textContent:value});
const shell=readFileSync('dist/index.html','utf8');
const description=shell.match(/<meta name="description" content="([^"]+)"/)[1];
for(const locale of ['de','en']){
 globalThis.localStorage={getItem:()=>locale};
 const {localize,t}=await import('../dist/i18n.js?interface-test-'+locale);
 const picker=element('DIV'),meta=element('META',{content:description});
 const buttons=['de','en'].map(code=>Object.assign(element('BUTTON'),{dataset:{uiLanguage:code}}));
 const heading=text('So funktioniert das Lernen');
 const original=text('Männchen');
 const image=element('IMG',{alt:'Artenbild wird geladen',title:'Bildnachweis'});
 const name=element('SPAN',{'data-name-content':''},[original]);
 const body=element('BODY',{},[element('H2',{},[heading]),name,image]);
 let observer;
 globalThis.MutationObserver=class{constructor(callback){this.callback=callback;observer=this;}observe(target,options){this.options=options;}};
 globalThis.document={documentElement:{},body,querySelector:selector=>selector==='#language-picker'?picker:meta,querySelectorAll:()=>buttons};
 localize();
 assert.equal(document.documentElement.lang,locale);
 assert.equal(meta.getAttribute('content'),locale==='en'?'Look up and learn German, English and scientific bird names and official eBird Quick Find Codes.':description);
 assert.equal(picker.getAttribute('aria-label'),locale==='en'?'Interface language':'Oberflächensprache');
 for(const button of buttons){assert.equal(button.getAttribute('aria-pressed'),String(button.dataset.uiLanguage===locale));assert(button.getAttribute('aria-label'));}
 assert.equal(heading.textContent,locale==='en'?'How learning works':'So funktioniert das Lernen');
 assert.equal(original.textContent,'Männchen','Original names/source titles must retain their language');
 assert.equal(image.getAttribute('alt'),locale==='en'?'Loading species picture':'Artenbild wird geladen');
 if(locale==='en'){
  const added=element('BUTTON',{'aria-label':'Bilder vergrößern'},[text('Weiter →')]);
  observer.callback([{type:'childList',addedNodes:[added]}]);
  assert.equal(added.childNodes[0].textContent,'Next →');
  assert.equal(added.getAttribute('aria-label'),'Enlarge pictures');
  image.setAttribute('alt','Bild derzeit nicht verfügbar.');
  observer.callback([{type:'attributes',target:image}]);
  assert.equal(image.getAttribute('alt'),'Picture currently unavailable.');
  assert(observer.options.attributeFilter.includes('alt'));
 }
 for(const [,value]of shell.matchAll(/<h[12]>([^<]+)<\/h[12]>/g))if(locale==='en')assert.notEqual(t(value),value,'Missing initial heading: '+value);
}
console.log('PASS: DE/EN document language, metadata, selected interface buttons, initial headings, dynamic accessible text and protected original names/titles.');
