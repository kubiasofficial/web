import fs from 'node:fs';
import path from 'node:path';
// Short original procedural Foley; no music, samples or remote audio dependency.
export function buildStableSounds(web){
 const dir=path.join(web,'dist/sounds/stable');fs.mkdirSync(dir,{recursive:true});const rate=22050;
 for(const [name,duration]of Object.entries({dice:.7,coins:.5,paper:.36,wood:.18,turn:.32})){
  const count=Math.ceil(rate*duration),buffer=Buffer.alloc(44+count*2);buffer.write('RIFF');buffer.writeUInt32LE(36+count*2,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(count*2,40);
  let seed=312941,low=0;const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
  for(let i=0;i<count;i++){
   const t=i/rate,n=noise();low=.82*low+.18*n;let v=0;
   if(name==='dice')for(const [at,f]of [[0,330],[.08,470],[.17,310],[.29,520],[.43,290],[.59,410]]){const a=t-at;if(a>=0&&a<.1)v+=(.6*low+.4*Math.sin(2*Math.PI*f*a))*Math.exp(-a*65)*.38;}
   if(name==='coins')for(const at of[0,.09,.18]){const a=t-at;if(a>=0)v+=(Math.sin(a*2*Math.PI*1540)+.4*Math.sin(a*2*Math.PI*2310))*Math.exp(-a*19)*.13;}
   if(name==='paper')v=low*Math.sin(Math.PI*t/duration)*.42;
   if(name==='wood')v=(.65*low+.35*Math.sin(t*2*Math.PI*220))*Math.exp(-t*42)*.45;
   if(name==='turn'){const a=t<.14?t:t-.14;v=Math.sin(2*Math.PI*(t<.14?523.25:659.25)*a)*Math.sin(Math.min(1,a/.02)*Math.PI/2)*Math.exp(-a*16)*.13;}
   const envelope=Math.min(1,t/.003,(duration-t)/.01);buffer.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v*envelope))*32767),44+i*2);
  }fs.writeFileSync(path.join(dir,name+'.wav'),buffer);
 }
}
