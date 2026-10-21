// Keep a small decoded working set; persist compressed photos independently of HTTP cache headers.
export function createPhotoCache({baseURL,fetchPhoto=globalThis.fetch,storage=globalThis.caches,makeImage=()=>new Image(),objectURL=URL.createObjectURL.bind(URL),revokeURL=URL.revokeObjectURL.bind(URL),limit=12}={}){
 const entries=new Map();
 const disk=Promise.resolve().then(()=>storage?.open('birdnames-photos-v1')).catch(()=>null);
 const key=p=>{const u=new URL(p.local,baseURL);u.searchParams.set('v',p.localSha256);return u.href;};
 function trim(){for(const [id,e] of entries){if(entries.size<=limit)break;if(e.image&&!e.image.isConnected){entries.delete(id);if(e.url)revokeURL(e.url);}}}
 function get(p){
  const id=key(p);let entry=entries.get(id);
  if(entry){entries.delete(id);entries.set(id,entry);return entry.promise;}
  entry={};entries.set(id,entry);
  entry.promise=(async()=>{
   const cache=await disk;let response;
   try{response=await cache?.match(id);}catch{}
   if(!response){
    response=await fetchPhoto(id,{cache:'force-cache'});
    if(!response.ok||!response.headers.get('content-type')?.startsWith('image/'))throw Error('Photo unavailable');
    try{
     await cache?.put(id,response.clone());
     // Drop older versions of this same photo, without touching learning records.
     if(cache)for(const old of await cache.keys())if(old.url!==id&&new URL(old.url).pathname===new URL(id).pathname)await cache.delete(old);
    }catch{} // Quota or private-mode restrictions must not prevent photo display.
   }
   const url=objectURL(await response.blob());entry.url=url;
   const image=makeImage();image.loading='eager';image.decoding='async';image.src=url;
   try{await image.decode();}catch{
    // Some hosting policies disallow blob images; retain eager preparation with a normal URL.
    revokeURL(url);entry.url=null;image.src=id;
    try{await image.decode();}catch(error){try{await cache?.delete(id);}catch{}throw error;}
   }
   entry.image=image;trim();return image;
  })().catch(error=>{if(entries.get(id)===entry)entries.delete(id);throw error;});
  return entry.promise;
 }
 return {get,warm:photos=>{for(const p of photos)get(p).catch(()=>{});}};
}
