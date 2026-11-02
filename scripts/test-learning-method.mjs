import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderLearningMethod,METHOD_SOURCES} from '../dist/learning-method.js';
import {RULES} from '../dist/learning-model.js';
const app=readFileSync('dist/app.js','utf8'),shell=readFileSync('dist/index.html','utf8');
assert(shell.includes('id="lernmethode"'));assert(shell.includes('href="#lernmethode"'));assert(app.includes('lernmethode:learningMethod'));
for(const en of [false,true]){
 const html=renderLearningMethod(en);assert(html.includes(en?'<h1>Learning method</h1>':'<h1>Lernmethode</h1>'));
 for(const [,title,url]of METHOD_SOURCES){assert(html.includes(url));assert(html.includes(title.replaceAll('&','&amp;').replaceAll("'",'&#39;')));}
 assert(html.includes(String(RULES.round)));assert(html.includes('href="#lernen"'));
 assert(html.includes(en?'not a scientifically established optimum':'kein wissenschaftlich ermitteltes Optimum'));
 assert(html.includes(en?'no difference in measured short-term learning gains':'keinen Unterschied im gemessenen kurzfristigen Lernzuwachs'));
 assert(!html.includes('href="#method-source-'));
}
assert.equal(METHOD_SOURCES.length,7);
console.log('PASS: independent bilingual learning-method route, all primary references, qualified research claims and product-rule distinction.');
