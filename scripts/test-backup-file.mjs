import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {encodeBackupFile,decodeBackupFile,BACKUP_MAX_BYTES,BACKUP_COMPRESS_BYTES} from '../dist/backup-file.js';
import {inspectBackup,backupFilename} from '../dist/backup.js';
import {gradeRecord} from '../dist/learning-model.js';

const stamp='2026-11-08T12:00:00Z',filename=backupFilename(stamp);
const birds=JSON.parse(readFileSync('dist/species.json')).species;
const ids=new Set(birds.map(b=>b.id)),records={};
for(const bird of birds.filter(b=>b.en).slice(0,939)){
 let p;
 for(const [source,method] of [['de','text'],['de','flash'],['de','think'],['nl','text']]){
  for(let i=0;i<20;i++)p=gradeRecord(p,source,method,{correct:true,now:1700000000000+i*86400000,gradeId:`backup-regression:${bird.id}:${source}:${method}:${i}`});
 }
 records[bird.id+':en']=p;
}
const value={app:'BirdNames DE',version:2,exported:stamp,records,daily:{date:'2026-11-08',introduced:[]}};
assert(new Blob([JSON.stringify(value,null,2)]).size>5000000,'Reproduce the old rejected own export');
assert.equal(inspectBackup(value,ids).count,939);
const output=await encodeBackupFile(value,filename);
assert(output.compressed);assert.equal(output.filename,filename+'.gz');
assert.equal(output.blob.type,'application/gzip');
const file=new File([output.blob],output.filename);
const decoded=await decodeBackupFile(file);
assert.deepEqual(decoded,value);
const restored=inspectBackup(decoded,ids);
const key=Object.keys(restored.records)[0];
restored.records[key]=gradeRecord(restored.records[key],'de','text',{correct:false,now:1800000000000,gradeId:'after-restore'});
assert.equal(restored.records[key].attempts,81);
const again=await encodeBackupFile({...value,records:restored.records},filename);
assert.equal(inspectBackup(await decodeBackupFile(new File([again.blob],again.filename)),ids).records[key].attempts,81);
for(const version of [1,2]){
 const small={app:'BirdNames DE',version,records:{}};
 const output=await encodeBackupFile(small,filename);
 assert(!output.compressed);assert.equal(output.filename,filename);
 assert.equal(inspectBackup(await decodeBackupFile(new File([output.blob],filename)),ids).count,0);
}
const plain=await encodeBackupFile(value,filename,{Compression:null});
assert(!plain.compressed);assert.deepEqual(await decodeBackupFile(new File([plain.blob],filename)),value);
const failed=await encodeBackupFile(value,filename,{Compression:class{constructor(){throw Error('unsupported');}}});
assert(!failed.compressed);assert.deepEqual(await decodeBackupFile(new File([failed.blob],filename)),value);
const legacyLarge=new File([JSON.stringify(value,null,2)],'old-large.json');
assert.deepEqual(await decodeBackupFile(legacyLarge),value,'Already exported JSON above 5 MB remains importable');
await assert.rejects(decodeBackupFile(file,{Decompression:null}),/Browser kann Gzip/);
await assert.rejects(decodeBackupFile(new File(['{}'],'false.json.gz')),/Gzip/);
await assert.rejects(decodeBackupFile(new File([output.blob.slice(0,-5)],'truncated.gz')),/Gzip/);
const damaged=new Uint8Array(await output.blob.arrayBuffer());damaged[damaged.length-8]^=1;
await assert.rejects(decodeBackupFile(new File([damaged],'damaged.gz')),/Gzip/);
await assert.rejects(decodeBackupFile(new File(['{"bad"'],'bad.json')),SyntaxError);
await assert.rejects(decodeBackupFile({size:BACKUP_MAX_BYTES+1,slice(){throw Error('must not read');}}),/128 MiB/);
// Exercise the actual streaming decompression limit with a small test budget.
const bomb=await new Response(new Blob([' '.repeat(16384)]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
assert(bomb.size<1024);
await assert.rejects(decodeBackupFile(new File([bomb],'expansion.gz'),{maxBytes:1024}),/128 MiB/);
const boundary=new File(['{}'],'boundary.json');
assert.deepEqual(await decodeBackupFile(boundary,{maxBytes:2}),{});
await assert.rejects(decodeBackupFile(boundary,{maxBytes:1}),/128 MiB/);
const rescue=await encodeBackupFile({app:'BirdNames DE rescue',version:1,state:{}},filename);
assert.throws(()=>inspectBackup({app:'BirdNames DE rescue',version:1,state:{}},ids));
assert.throws(()=>inspectBackup(decoded.records,ids));
assert(BACKUP_COMPRESS_BYTES<plain.blob.size&&plain.blob.size<BACKUP_MAX_BYTES);
console.log(`PASS: 939 targets / 75,120 answers: ${legacyLarge.size} B old JSON → ${output.blob.size} B gzip; preview validation, further grading, re-export, JSON fallback, corrupt gzip and bounded expansion.`);
