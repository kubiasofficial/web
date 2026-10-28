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
 await sleep(1300);
 const point=await evaluate('(()=>{const r=document.querySelector(".medallion-card.vincent img").getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.3}})()');
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await sleep(100);
 assert(await evaluate('document.querySelector(".cast-link.vincent").style.getPropertyValue("--tilt-x")!==""'),'Pointer tilts medallion');
 assert(await evaluate('document.querySelector("#selection").style.getPropertyValue("--backdrop-x")!==""'),'Backdrop follows pointer');
 await evaluate('document.querySelector(".cast-link.vincent").click()');await sleep(100);
 await evaluate('document.querySelector("#archive-code").value="0000";document.querySelector(".archive-lock-form").requestSubmit()');
 assert(await evaluate('document.querySelector(".archive-lock-form").getAnimations().length>0'),'Wrong code shakes form');
 await evaluate('document.querySelector("#archive-code").value="3362";document.querySelector(".archive-lock-form").requestSubmit()');
 assert(await evaluate('document.querySelector(".archive-lock").classList.contains("archive-opening") && document.querySelector(".archive-unlock").disabled'),'Unlock animation starts');
 await evaluate('document.querySelector(".archive-close").click()');await sleep(750);
 assert(await evaluate('!document.querySelector(".archive-lock").open && !document.querySelector("#selection").hidden && document.querySelector("#profile").hidden'),'Cancel during animation stays home');
 for(const [key,code] of Object.entries({nathaniel:'2811',daniel:'4536',katie:'4691',scarlett:'5817',sophie:'6984',vincent:'3362'})){
 await evaluate('location.hash="#'+key+'"');await sleep(70);
 await evaluate('document.querySelector("#archive-code").value="'+code+'";document.querySelector(".archive-lock-form").requestSubmit()');await sleep(750);
 assert(await evaluate('!document.querySelector("#profile").hidden && !document.querySelector(".archive-lock").open'),'Animated unlock '+key);
 const effect=await evaluate('getComputedStyle(document.querySelector(".chronicle-fog")).animationName+" / "+getComputedStyle(document.querySelector(".chronicle-atmosphere i")).animationName');
 console.log(key+': '+effect);
 assert(await evaluate('!document.querySelectorAll(".family-members .reveal").length'),'No ending animations');
 await evaluate('location.hash=""');await sleep(70);
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert(await evaluate('getComputedStyle(document.querySelector(".frontier-logo")).animationName==="none"'),'Reduced motion disables entrance');
 assert(await evaluate('getComputedStyle(document.querySelector(".medallion-art")).animationName==="none"'),'Reduced motion disables medallion motion');
 await evaluate('location.hash="#vincent"');await sleep(70);
 await evaluate('document.querySelector("#archive-code").value="3362";document.querySelector(".archive-lock-form").requestSubmit()');
 assert(await evaluate('!document.querySelector("#profile").hidden && !document.querySelector(".archive-lock").open'),'Reduced motion unlocks immediately');
 assert(await evaluate('getComputedStyle(document.querySelector(".chronicle-fog")).animationName==="none"'),'Reduced motion disables profile atmosphere');
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

