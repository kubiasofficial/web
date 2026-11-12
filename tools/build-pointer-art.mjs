import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Native SVG cursors keep a precise hotspot without a mouse-following render loop.
const themes={
 scarlett:{name:'Kočičí stopa',animal:'Kočka',color:'#6fa9ff',light:'#d9ecff',dark:'#13386e',shape:'cat'},
 nathaniel:{name:'Havraní podpis',animal:'Havran',color:'#d36b7c',light:'#e7d4bc',dark:'#4d1525',shape:'raven'},
 daniel:{name:'Jantarový panter',animal:'Panter',color:'#e7a052',light:'#ffe5b0',dark:'#5b3119',shape:'panther'},
 katie:{name:'Vlčí přísaha',animal:'Vlk',color:'#a2d6f5',light:'#e7f6ff',dark:'#315679',shape:'wolf'},
 vincent:{name:'Dračí dotek',animal:'Drak',color:'#6eafff',light:'#e2f1ff',dark:'#20487f',shape:'dragon'},
 elijah:{name:'Věrný strážce',animal:'Ovčák',color:'#d5a05c',light:'#ffe6bd',dark:'#664122',shape:'shepherd'}
};
const paw=(wide=false)=>`<path d="${wide?'M13 27C12 21 17 17 22 19C27 17 32 21 31 27C34 30 30 34 26 32L22 31L18 33C13 35 9 31 13 27Z':'M14 28C12 23 17 18 22 20C27 18 32 23 30 28C33 32 28 35 25 32L22 31L19 33C15 35 10 32 14 28Z'}"/><ellipse cx="9" cy="19" rx="4" ry="5.3" transform="rotate(-25 9 19)"/><ellipse cx="17" cy="11" rx="4" ry="5.5" transform="rotate(-9 17 11)"/><ellipse cx="27" cy="11" rx="4" ry="5.5" transform="rotate(9 27 11)"/><ellipse cx="35" cy="19" rx="4" ry="5.3" transform="rotate(25 35 19)"/>`;
const claws='<path d="M7 12 6 7 11 11ZM14 5 16 0 18 4ZM26 4 28 0 30 5ZM35 11 39 7 38 13Z"/>';
function stamp(t){
 let print,decoration='';
 if(t.shape==='raven'){
  print='<path d="M22 29 20 15 21 5 23 3 24 16 27 13 33 5 36 4 35 8 27 20 25 26 32 33 32 36 28 34 23 30 18 36 15 37 16 33 20 28 14 22 7 17 6 13 9 14 17 19Z"/>';
  decoration='<path class="print-feather" d="M35 31Q46 29 40 41Q38 37 35 36L31 38Q35 34 35 31Z" fill="url(#ink)"/><path d="m33 39 7-7" fill="none" stroke="'+t.light+'" stroke-width=".6"/>';
 }else if(t.shape==='dragon'){
  print='<path d="m22 33-7-7-5-1-4-7-3-9 5 4 6 9 5 2-1-10 2-9 3-5 1 11-1 14 5-3 7-10 6-4-2 9-7 10-5 1-5 8Z"/><path d="m17 27 5-3 5 3-1 5-4 5-4-5Z" fill="'+t.dark+'" stroke="'+t.light+'" stroke-width=".7"/>';
  decoration='<path class="print-flame" d="M32 39C45 33 36 28 42 25C39 34 48 35 37 42C43 36 38 36 32 39Z" fill="'+t.color+'"/>';
 }else{
  print=(t.shape==='panther'?paw(true):paw())+(['wolf','shepherd'].includes(t.shape)?claws:'');
  if(t.shape==='wolf')decoration='<g fill="none" stroke="'+t.light+'" stroke-width=".65" opacity=".8"><path d="m4 31 5 9m-5-4 7-3m-5-1-3 1m5 4 3 1M34 3l7 8m-6-2 6-4m-3 3 4 1"/></g>';
  if(t.shape==='panther')decoration='<g fill="'+t.light+'"><path d="m36 4 1-3 1 3 3 1-3 1-1 3-1-3-3-1Z"/><circle cx="3" cy="27" r=".8"/><circle cx="39" cy="31" r="1"/></g>';
  if(t.shape==='shepherd')decoration='<g fill="'+t.color+'" opacity=".45"><circle cx="6" cy="34" r="1"/><circle cx="36" cy="33" r="1.3"/><circle cx="31" cy="39" r=".7"/></g>';
 }
 return '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><defs><linearGradient id="ink" x2=".6" y2="1"><stop stop-color="'+t.light+'"/><stop offset=".6" stop-color="'+t.color+'"/><stop offset="1" stop-color="'+t.dark+'"/></linearGradient></defs><g fill="url(#ink)" stroke="'+t.color+'" stroke-width=".35" stroke-linejoin="round">'+print+'</g>'+decoration+'</svg>';
}
function cursor(t,link){
 let detail='';
 if(t.shape==='cat')detail='<path d="m27 29 1-8 5 4 6-3-1 9-6 3Z" fill="'+t.dark+'" stroke="'+t.light+'" stroke-width=".8"/><g fill="'+t.color+'" stroke="'+t.light+'" stroke-width=".4"><ellipse cx="31" cy="37" rx="2" ry="3"/><ellipse cx="31" cy="37" rx="2" ry="3" transform="rotate(72 33 35)"/><ellipse cx="31" cy="37" rx="2" ry="3" transform="rotate(144 33 35)"/><ellipse cx="31" cy="37" rx="2" ry="3" transform="rotate(216 33 35)"/><ellipse cx="31" cy="37" rx="2" ry="3" transform="rotate(288 33 35)"/><circle cx="33" cy="35" r="1.4" fill="'+t.light+'"/></g>';
 if(t.shape==='raven')detail='<path d="M20 23Q37 26 36 41Q23 40 22 31L20 23Z" fill="'+t.dark+'" stroke="'+t.color+'" stroke-width=".8"/><path d="m20 23 15 17m-11-11 6-1m-3 5 7-1m-10-1-1 5" fill="none" stroke="'+t.color+'" stroke-width=".8"/>';
 if(t.shape==='panther')detail='<g fill="'+t.color+'" stroke="'+t.light+'" stroke-width=".4"><path d="m24 24 12 9-5-1-8-5ZM23 29l12 11-6-2-8-7ZM21 34l8 9-5-2-5-6Z"/></g>';
 if(t.shape==='wolf')detail='<path d="m20 31 5-10 6 10 5-2 6 12-13-5-4 3-8-4Z" fill="'+t.dark+'" stroke="'+t.light+'" stroke-width=".8"/><path d="m21 29 4-8 4 7-3-2-2 3Z" fill="'+t.light+'"/>';
 if(t.shape==='dragon')detail='<g fill="'+t.color+'" stroke="'+t.light+'" stroke-width=".55"><path d="m22 21 5 2-1 6-4 1-2-5Zm8 5 5 2-1 6-4 1-2-5Zm-6 8 5 2-1 6-4 1-2-5Z"/></g>';
 if(t.shape==='shepherd')detail='<circle cx="31" cy="33" r="8" fill="'+t.dark+'" stroke="'+t.light+'" stroke-width=".8"/><g transform="translate(24 26) scale(.32)" fill="'+t.light+'">'+paw()+claws+'</g>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="44" viewBox="0 0 44 48"><defs><linearGradient id="arrow" x2="1" y2="1"><stop stop-color="'+t.color+'"/><stop offset="1" stop-color="'+t.dark+'"/></linearGradient></defs><path d="M2 1 2 33 11 25 18 40 25 37 18 23 31 23Z" fill="#080b10" stroke="#080b10" stroke-width="3" stroke-linejoin="round"/><path d="M2 1 2 31 11 23 19 38 23 36 16 21 29 21Z" fill="url(#arrow)" stroke="'+(link?t.color:t.light)+'" stroke-width="1.7" stroke-linejoin="round"/><path d="M5 7 5 24 11 19 21 19Z" fill="'+t.light+'" opacity="'+(link?'.28':'.12')+'"/>'+detail+(link?'<circle cx="36" cy="7" r="3.2" fill="'+t.light+'" stroke="'+t.dark+'" stroke-width="1"/>':'')+'</svg>';
}
export function buildPointerArt(web){
 const directory=path.join(web,'dist/assets/pointers');fs.mkdirSync(directory,{recursive:true});const result={};
 for(const[key,t]of Object.entries(themes)){
  const urls={};for(const[type,svg]of [['normal',cursor(t,false)],['link',cursor(t,true)],['stamp',stamp(t)]]){const hash=createHash('sha256').update(svg).digest('hex').slice(0,12),filename=key+'-'+type+'.'+hash+'.svg';fs.writeFileSync(path.join(directory,filename),svg);urls[type]='assets/pointers/'+filename;}
  result[key]={name:t.name,animal:t.animal,color:t.color,...urls};
 }
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildPointerArt(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
