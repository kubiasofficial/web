import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const web=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=data=>createHash('sha256').update(data).digest('hex');
export function syncMusic(source=path.resolve(web,'../pisnicky-gramofon'),dist=path.join(web,'dist')){
 // A Vercel checkout may contain only web/. Keep its already prepared library.
 if(!fs.existsSync(source)){console.log('Music source is absent; keeping the prepared library.');return null;}
 const out=path.resolve(dist,'music');fs.mkdirSync(out,{recursive:true});
 const manifest=path.join(dist,'music-library.json');let previous=null;
 if(fs.existsSync(manifest))previous=JSON.parse(fs.readFileSync(manifest,'utf8'));
 const known=new Map((previous?.tracks||[]).map(t=>[t.id,t])),addedAt=new Date().toISOString();
 const tracks=[];const types={'.mp3':'audio/mpeg','.wav':'audio/wav','.m4a':'audio/mp4','.ogg':'audio/ogg'};
 for(const entry of fs.readdirSync(source,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'cs'))){
  const ext=path.extname(entry.name).toLowerCase();if(!entry.isFile()||!types[ext])continue;
  const original=path.join(source,entry.name),before=fs.statSync(original),bytes=fs.readFileSync(original),after=fs.statSync(original);
  if(before.size!==after.size||before.mtimeMs!==after.mtimeMs)throw Error('Soubor se ještě kopíruje: '+entry.name);
  if(!bytes.length)throw Error('Prázdný zvukový soubor: '+entry.name);
  const id=digest(entry.name.normalize('NFC')).slice(0,20),hash=digest(bytes).slice(0,16),filename=id+'.'+hash+ext;
  const title=path.basename(entry.name,path.extname(entry.name)).replace(/\s*-\s*usesuno\.com$/i,'').trim()||entry.name;
  if(!fs.existsSync(path.join(out,filename))){fs.writeFileSync(path.join(out,filename+'.part'),bytes);fs.renameSync(path.join(out,filename+'.part'),path.join(out,filename));}
  // Adopt the old collection without marking every historical track as new.
  const old=known.get(id),firstAdded=old?(old.addedAt||null):addedAt;
  tracks.push({id,title,artist:'New Horizon RP',url:'/music/'+filename,type:types[ext],bytes:bytes.length,addedAt:firstAdded});
 }
 const result={version:2,tracks},json=JSON.stringify(result,null,2)+'\n';
 if(!fs.existsSync(manifest)||fs.readFileSync(manifest,'utf8')!==json){fs.writeFileSync(manifest+'.part',json);fs.renameSync(manifest+'.part',manifest);}
 // Delete only our own obsolete content-addressed copies inside this output folder.
 const current=new Set(tracks.map(t=>path.basename(t.url)));
 for(const file of fs.readdirSync(out))if(/^[a-f0-9]{20}\.[a-f0-9]{16}\.(mp3|wav|m4a|ogg)$/.test(file)&&!current.has(file))fs.unlinkSync(path.join(out,file));
 console.log('Gramophone: '+tracks.length+' local tracks prepared ('+(tracks.reduce((n,t)=>n+t.bytes,0)/1048576).toFixed(1)+' MiB).');return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 syncMusic();
 if(process.argv.includes('--watch')){let timer;console.log('Watching pisnicky-gramofon. Push web/ to publish changes.');fs.watch(path.resolve(web,'../pisnicky-gramofon'),()=>{clearTimeout(timer);timer=setTimeout(()=>{try{syncMusic();}catch(error){console.error(error.message);}},1200);});}
}
