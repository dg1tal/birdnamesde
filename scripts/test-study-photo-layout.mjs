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
