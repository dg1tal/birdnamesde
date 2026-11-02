import assert from 'node:assert/strict';
import {studyPhotoHeight} from '../dist/study-photo-layout.js';
// A short explanation can use a large photo; an ordinary viewport fits to its bar.
assert.equal(studyPhotoHeight({photoTop:300,viewportBottom:900,actionsTop:820}),360);
assert.equal(studyPhotoHeight({photoTop:430,viewportBottom:800,actionsTop:730}),288);
// Text-heavy feedback and landscape phones keep an identifiable picture and scroll.
assert.equal(studyPhotoHeight({photoTop:650,viewportBottom:800,actionsTop:730}),220);
assert.equal(studyPhotoHeight({photoTop:400,viewportBottom:390,actionsTop:320}),220);
// A reduced visual viewport takes precedence over the layout viewport's bar.
assert.equal(studyPhotoHeight({photoTop:240,viewportBottom:510,actionsTop:700}),258);
assert.equal(studyPhotoHeight({photoTop:NaN,viewportBottom:800,actionsTop:730}),360);
for(let photoTop=0;photoTop<1000;photoTop+=17){
  const height=studyPhotoHeight({photoTop,viewportBottom:844,actionsTop:770});
  assert(height>=220&&height<=360);
  if(770-photoTop-12>=220)assert(photoTop+height<=770-12);
}
console.log('PASS: adaptive photo height fits above actions, respects visual viewport, and preserves minimum size for long feedback.');

const {introductionPhotoHeight}=await import('../dist/study-photo-layout.js');
assert.equal(introductionPhotoHeight({photoTop:240,viewportBottom:900,actionsTop:820,overhead:80}),340);
assert.equal(introductionPhotoHeight({photoTop:380,viewportBottom:800,actionsTop:730,overhead:95}),243);
assert.equal(introductionPhotoHeight({photoTop:240,viewportBottom:800,actionsTop:730,overhead:100,rows:2}),189);
assert.equal(introductionPhotoHeight({photoTop:400,viewportBottom:420,actionsTop:340,overhead:180,rows:2}),160);
assert.equal(introductionPhotoHeight({photoTop:180,viewportBottom:500,actionsTop:700,overhead:100}),208);
assert.equal(introductionPhotoHeight({photoTop:180,viewportBottom:500,actionsTop:450,rows:0}),340);
for(const rows of [1,2])for(const overhead of [50,100,180])for(let photoTop=20;photoTop<650;photoTop+=23){
 const height=introductionPhotoHeight({photoTop,viewportBottom:844,actionsTop:770,overhead,rows});
 assert(height>=160&&height<=340);
 if(770-photoTop-overhead-12>=160*rows)assert(photoTop+rows*height+overhead<=770-12);
}
console.log('PASS: introduction image rows budget for captions and padding, responsive viewport limits, readable floors and invalid geometry.');
