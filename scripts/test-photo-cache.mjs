import assert from 'node:assert/strict';
import {createPhotoCache} from '../dist/photo-cache.js';
const files=new Map();let requests=0,decodes=0,objects=0,revoked=[];
const disk={match:async key=>files.get(key)?.clone(),put:async(key,r)=>files.set(key,r.clone()),keys:async()=>[...files.keys()].map(url=>({url})),delete:async key=>files.delete(typeof key==='string'?key:key.url)};
const storage={open:async()=>disk};
const photo=(id,version='a')=>({local:`images/${id}.jpg`,localSha256:version});
const options={baseURL:'https://birds.example/',storage,fetchPhoto:async()=>{requests++;return new Response('photo bytes',{headers:{'content-type':'image/jpeg'}})},makeImage:()=>({isConnected:false,decode:async()=>{decodes++}}),objectURL:()=>`blob:${++objects}`,revokeURL:url=>revoked.push(url)};
const cache=createPhotoCache(options);
const [first,second]=await Promise.all([cache.get(photo('a')),cache.get(photo('a'))]);
assert.equal(first,second);assert.equal(requests,1);assert.equal(decodes,1);
assert.equal(await cache.get(photo('a')),first);assert.equal(requests,1);assert.equal(decodes,1);
// Both sex photos use independent entries and are reused together on a repeated question.
const pair=[photo('pair-male'),photo('pair-female')];
cache.warm(pair);
const pairImages=await Promise.all(pair.map(p=>cache.get(p)));
const pairRequests=requests,pairDecodes=decodes;
assert.notEqual(pairImages[0],pairImages[1]);
assert.deepEqual(await Promise.all(pair.map(p=>cache.get(p))),pairImages);
assert.equal(requests,pairRequests);assert.equal(decodes,pairDecodes);
// Isolate the following original single-photo cache assertions.
for(const key of [...files.keys()])if(key.includes('/pair-'))files.delete(key);
// A fresh page instance retrieves persisted bytes even when the network is unavailable.
const offline=createPhotoCache({...options,fetchPhoto:async()=>{throw Error('offline')}});
assert.ok(await offline.get(photo('a')));assert.equal(requests,pairRequests);
// Content hashes invalidate just the changed asset, never retain its old persistent version.
await cache.get(photo('a','b'));assert.equal(requests,pairRequests+1);assert.equal(files.size,1);assert.ok([...files.keys()][0].endsWith('?v=b'));
// Limit decoded images, retaining compressed files on disk for longer lessons.
const bounded=createPhotoCache({...options,limit:2});
await bounded.get(photo('b'));await bounded.get(photo('c'));await bounded.get(photo('d'));
assert.ok(revoked.length);const before=requests;await bounded.get(photo('b'));assert.equal(requests,before);
// Cache storage restrictions do not prevent display or same-page reuse.
const privateCache=createPhotoCache({...options,storage:{open:async()=>{throw Error('restricted')}}});
const local=await privateCache.get(photo('e'));assert.equal(await privateCache.get(photo('e')),local);
const quotaCache=createPhotoCache({...options,storage:{open:async()=>({...disk,put:async()=>{throw Error('quota')}})}});
assert.ok(await quotaCache.get(photo('f')));
// Failed requests are not cached as images; retries can recover.
let attempts=0;
const recovering=createPhotoCache({...options,storage:undefined,fetchPhoto:async()=>++attempts===1?new Response('missing',{status:404}):new Response('ok',{headers:{'content-type':'image/jpeg'}})});
await assert.rejects(recovering.get(photo('g')));assert.ok(await recovering.get(photo('g')));assert.equal(attempts,2);
let bad=true;
const decoding=createPhotoCache({...options,makeImage:()=>({decode:async()=>{if(bad)throw Error('corrupt')}})});
await assert.rejects(decoding.get(photo('h')));assert.ok(![...files.keys()].some(x=>x.includes('/h.jpg')));bad=false;assert.ok(await decoding.get(photo('h')));
console.log('PASS: request deduplication, decoded image reuse, persistent offline hits, version invalidation, bounded memory, restricted storage, quota and failed-image recovery.');
