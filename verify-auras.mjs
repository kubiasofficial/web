import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const qa = path.resolve(root,'../.qa'); mkdirSync(qa,{recursive:true});
const debugPort=9500+process.pid%1000;
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-allow-origins=*',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${qa}/chrome-${debugPort}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
chrome.stderr.on('data',chunk=>{if(String(chunk).includes('ERROR'))process.stderr.write(chunk);});
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let ws, nextId=0; const pending=new Map();
const keepAlive=setInterval(()=>{},1000);
try {
 let tabs;
 for(let i=0;i<60;i++){try{tabs=await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json();if(tabs.some(t=>t.type==='page'))break;}catch{}await sleep(250);}
 if(!tabs) throw Error('Browser debugging endpoint unavailable');
 ws = new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 ws.onmessage = event => {const msg=JSON.parse(event.data);if(msg.id){const task=pending.get(msg.id);pending.delete(msg.id);msg.error?task.reject(Error(JSON.stringify(msg.error))):task.resolve(msg.result);}};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;const timer=setTimeout(()=>{pending.delete(id);reject(Error('CDP timed out: '+method));},10000);pending.set(id,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
 const assert=(condition,message)=>{if(!condition)throw Error(message);console.log('PASS '+message);};
 await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:new URL('file:///'+root.replaceAll('\\','/')+'/dist/index.html').href});
 await sleep(1800);
 const {writeFileSync}=await import('node:fs');
 const screenshot=async name=>{if(await evaluate('!!document.querySelector(".poster-transition")'))await sleep(700);await evaluate('Promise.all(document.getAnimations().filter(a=>a.playState==="running" && a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})))');const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(qa,name+'.png'),Buffer.from(shot.data,'base64'));};
 await evaluate('Promise.all([...document.querySelectorAll(".medallion-art img,.server-logo")].map(i=>i.decode()))');
 for(const width of [1920,1440,1024,390]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:945,deviceScaleFactor:1,mobile:width<701});await sleep(150);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'No page overflow '+width);
 if(width>=1280)assert(await evaluate('getComputedStyle(document.querySelector(".medallion-cast")).overflowY==="visible"'),'Desktop glow unclipped '+width);
 for(const key of ['daniel','elijah','sophie']){
 await evaluate('document.querySelector(".cast-link.'+key+'").scrollIntoView({block:"nearest",inline:"center",behavior:"instant"})');await sleep(100);
 const point=await evaluate('(()=>{const r=document.querySelector(".cast-link.'+key+' .medallion-art").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await sleep(500);
 assert(await evaluate('getComputedStyle(document.querySelector(".cast-link.'+key+' .aura-ring")).opacity==="1"'),'Aura active '+key+' '+width);
 if(width<1280)assert(await evaluate('(()=>{const nav=document.querySelector(".medallion-cast").getBoundingClientRect(),art=document.querySelector(".cast-link.'+key+' .medallion-art").getBoundingClientRect();return art.top-nav.top>=80 && nav.bottom-art.bottom>=80})()'),'Vertical halo clearance '+key+' '+width);
 if(key==='elijah'&&(width===1920||width===390))await screenshot('aura-fixed-'+width);
 }
 }
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

