// Same resource budget for JSON input, expanded gzip input and regular export.
// Schema validation and explicit replacement still happen after decoding.
export const BACKUP_MAX_BYTES=128*1024*1024;
export const BACKUP_COMPRESS_BYTES=1024*1024;
const tooLarge=()=>Error('Die Sicherung ist zu groß (entpackt maximal 128 MiB).');
const invalidGzip=()=>Error('Die Gzip-Sicherung ist beschädigt oder kein gültiges Gzip.');
export async function encodeBackupFile(value,filename,{Compression=globalThis.CompressionStream,Decompression=globalThis.DecompressionStream}={}){
 const compact=JSON.stringify(value);
 let blob=new Blob([compact],{type:'application/json'});
 if(blob.size>BACKUP_MAX_BYTES)throw tooLarge();
 if(blob.size<BACKUP_COMPRESS_BYTES){
  const readable=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
  if(readable.size<BACKUP_COMPRESS_BYTES)blob=readable;
 }else if(typeof Compression==='function'&&typeof Decompression==='function'){
  try{
   const zipped=await new Response(blob.stream().pipeThrough(new Compression('gzip'))).blob();
   if(zipped.size<blob.size)return {blob:new Blob([zipped],{type:'application/gzip'}),filename:filename+'.gz',compressed:true};
  }catch{/* A plain JSON fallback remains importable within the same budget. */}
 }
 return {blob,filename,compressed:false};
}
export async function decodeBackupFile(file,{Decompression=globalThis.DecompressionStream,maxBytes=BACKUP_MAX_BYTES}={}){
 const limit=Math.min(maxBytes,BACKUP_MAX_BYTES);
 if(file.size>limit)throw tooLarge();
 const header=new Uint8Array(await file.slice(0,2).arrayBuffer());
 const gzip=header[0]===0x1f&&header[1]===0x8b;
 if(!gzip&&/\.gz$/i.test(file.name||''))throw invalidGzip();
 let stream=file.stream();
 if(gzip){
  if(typeof Decompression!=='function')throw Error('Dieser Browser kann Gzip nicht öffnen. Bitte die Datei zuerst entpacken und die JSON-Datei wählen.');
  stream=stream.pipeThrough(new Decompression('gzip'));
 }
 const reader=stream.getReader(),decoder=new TextDecoder('utf-8',{fatal:true});
 let size=0,text='';
 try{
  for(;;){
   let part;
   try{part=await reader.read();}catch(error){if(gzip)throw invalidGzip();throw error;}
   if(part.done)break;
   size+=part.value.byteLength;
   if(size>limit)throw tooLarge();
   text+=decoder.decode(part.value,{stream:true});
  }
  text+=decoder.decode();
 }finally{
  // Cancellation also stops a decompression stream after its expanded limit.
  try{await reader.cancel();}catch{}
  reader.releaseLock();
 }
 return JSON.parse(text);
}
