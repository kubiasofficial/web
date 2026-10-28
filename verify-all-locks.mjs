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
 const screenshot=async name=>{if(await evaluate('!!document.querySelector(".poster-transition")'))await sleep(700);const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(qa,name+'.png'),Buffer.from(shot.data,'base64'));};
 const codes={nathaniel:'2811',sophie:'6984',daniel:'4536',katie:'4691',scarlett:'5817'};
 for(const [key,code] of Object.entries(codes)){
 await evaluate('location.hash=""');await sleep(60);
 await evaluate('document.querySelector(".cast-link.'+key+'").click()');await sleep(80);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector("#profile").hidden'),'Locked '+key);
 assert(await evaluate('document.querySelector(".archive-lock-seal img").src.endsWith("icon-'+key+'.png")'),'Correct identity '+key);
 await evaluate('document.querySelector("#archive-code").value="0000";document.querySelector(".archive-lock-form").requestSubmit()');
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector("#profile").hidden'),'Wrong code rejected '+key);
 await evaluate('document.querySelector("#archive-code").value="'+code+'";document.querySelector(".archive-lock-form").requestSubmit()');await sleep(100);
 assert(await evaluate('!document.querySelector(".archive-lock").open && !document.querySelector("#profile").hidden'),'Correct code '+key);
 await evaluate('document.querySelector("#chapter-nav a:nth-child(4)").click()');await sleep(60);
 assert(await evaluate('!document.querySelector(".archive-lock").open'),'Chapters unlocked '+key);
 await send('Page.reload');await sleep(300);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector("#profile").hidden'),'Reload locked '+key);
 if(key==='katie'||key==='scarlett'){
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await screenshot('archive-'+key+'-desktop');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await screenshot('archive-'+key+'-mobile');
 assert(await evaluate('document.querySelector(".archive-lock").getBoundingClientRect().width<=innerWidth'),'Mobile fits '+key);
 }
 await evaluate('document.querySelector(".archive-return").click()');await sleep(60);
 assert(await evaluate('!document.querySelector(".archive-lock").open && document.activeElement.hash==="#'+key+'"'),'Cancel restores focus '+key);
 }
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

