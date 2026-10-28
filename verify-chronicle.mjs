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
 const errors=[];await send('Runtime.enable');const previous=ws.onmessage;ws.onmessage=event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.text);previous(event);};
 await evaluate('location.hash="#nathaniel"');await sleep(500);
 assert(await evaluate('document.querySelector("#profile").classList.contains("nathaniel-profile")'),'Nathaniel theme');
 assert(await evaluate('document.querySelectorAll(".chronicle-seal").length===1 && document.querySelectorAll(".relation-medallion").length===2'),'Seal and family icons');
 const original=await evaluate('JSON.stringify([...document.querySelectorAll("#story .chapter")].map(c=>[...c.querySelectorAll("p,li")].map(p=>p.textContent)))');
 for(const width of [1440,390,320,768]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<701});
 await evaluate('location.hash="#nathaniel"');await sleep(200);
 await evaluate('Promise.all([...document.querySelectorAll(".hero-character,.chronicle-seal img,.sidebar-portrait img")].map(i=>i.decode()))');
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Hero fits '+width);
 if(width===1440)await screenshot('chronicle-nathaniel-desktop');
 if(width===390)await screenshot('chronicle-nathaniel-mobile');
 await evaluate('document.querySelector(".profile-heading .story-button").click()');await sleep(250);
 assert(await evaluate('location.hash==="#pribeh" && !document.querySelector(".reader-toolbar").hidden'),'Story entry '+width);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Reading fits '+width);
 if(width===1440)await screenshot('chronicle-nathaniel-reading');
 if(width===390)await screenshot('chronicle-nathaniel-reading-mobile');
 await evaluate('document.querySelector("#chapter-nav a:nth-child(4)").click()');await sleep(200);
 assert(await evaluate('location.hash==="#kapitola-4"'),'Chapter deep link '+width);
 }
 await send('Page.reload');await sleep(700);
 assert(await evaluate('document.querySelector("#profile").classList.contains("nathaniel-profile") && document.querySelectorAll(".chapter").length===11'),'Reload chapter');
 assert(await evaluate('JSON.stringify([...document.querySelectorAll("#story .chapter")].map(c=>[...c.querySelectorAll("p,li")].map(p=>p.textContent)))')===original,'Story text unchanged across reload');
 for(const key of ['daniel','scarlet','katie','sophie']){
 await evaluate('location.hash="#'+key+'"');await sleep(100);
 assert(await evaluate('!document.querySelector("#profile").classList.contains("nathaniel-profile") && !document.querySelector(".chronicle-seal") && !document.querySelector(".relation-medallion")'),'Other profile restored '+key);
 }
 await evaluate('location.hash="#nathaniel"');await sleep(100);
 await evaluate('document.querySelector(".relation-medallion").click()');await sleep(100);
 assert(await evaluate('location.hash==="#daniel"'),'Family medallion navigation');
 await evaluate('document.querySelector(".back").click()');await sleep(100);
 assert(await evaluate('!document.querySelector("#selection").hidden && document.activeElement.hash==="#daniel"'),'Return to home');
 assert(errors.length===0,'No browser JavaScript exceptions');
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

