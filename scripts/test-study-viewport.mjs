import assert from 'node:assert/strict';
import {studyViewportMetrics,studyScrollDelta} from '../dist/study-viewport.js';

// No keyboard, Android-style resized layout, and iOS-style visual-only resize.
assert.deepEqual(studyViewportMetrics({layoutHeight:844,actionsHeight:74}),{top:0,bottom:844,inset:0,padding:86});
assert.deepEqual(studyViewportMetrics({layoutHeight:420,viewportHeight:420,actionsHeight:74}),{top:0,bottom:420,inset:0,padding:86});
assert.deepEqual(studyViewportMetrics({layoutHeight:844,viewportHeight:420,actionsHeight:74}),{top:0,bottom:420,inset:424,padding:510});
// Safari may pan the visual viewport while keeping layout coordinates unchanged.
assert.deepEqual(studyViewportMetrics({layoutHeight:844,viewportHeight:360,offsetTop:80,actionsHeight:90}),{top:80,bottom:440,inset:404,padding:506});
assert.equal(studyViewportMetrics({layoutHeight:400,viewportHeight:430,offsetTop:-4}).inset,0);
// Reproduced at 390×320: input bottom 251 overlapped bar starting at 246.5.
assert.equal(studyScrollDelta({top:197,bottom:251,visibleTop:0,visibleBottom:246.5}),16.5);
assert.equal(studyScrollDelta({top:80,bottom:180,visibleTop:0,visibleBottom:300}),0);
assert.equal(studyScrollDelta({top:50,bottom:130,visibleTop:80,visibleBottom:360}),-42);
// Long feedback starts with the result; it can still be scrolled manually.
assert.equal(studyScrollDelta({top:150,bottom:650,visibleTop:0,visibleBottom:300}),138);
assert.equal(studyScrollDelta({top:12,bottom:650,visibleTop:0,visibleBottom:300}),0);
assert.equal(studyScrollDelta({top:5,bottom:45,visibleTop:0,visibleBottom:20}),0);
// Geometry stays within the clear area across keyboard sizes and panning offsets.
for(const layoutHeight of [390,740,800,844])for(const viewportHeight of [240,320,390])for(const offsetTop of [0,40,80]){
 const metrics=studyViewportMetrics({layoutHeight,viewportHeight,offsetTop,actionsHeight:74});
 const actionsTop=metrics.bottom-74;
 assert.equal(layoutHeight-metrics.inset,metrics.bottom);
 assert(metrics.padding>=86);
 for(const top of [0,80,170,300,700]){
  const delta=studyScrollDelta({top,bottom:top+54,visibleTop:metrics.top,visibleBottom:actionsTop});
  assert(top-delta>=metrics.top+12);
  assert(top+54-delta<=actionsTop-12);
 }
}
console.log('PASS: resized and panned keyboard viewports, measured action-bar spacing, answer clearance and readable long feedback.');
