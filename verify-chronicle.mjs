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
 const counts={nathaniel:11,daniel:11,scarlett:12,katie:8,sophie:9};
 for(const width of [1440,390,320,768]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<701});
 for(const key of Object.keys(counts)){
 await evaluate('location.hash="#'+key+'"');await sleep(120);
 assert(await evaluate('document.querySelector("#profile").classList.contains("chronicle-profile")'),'Chronicle '+key+' at '+width);
 await evaluate('Promise.all([...document.querySelectorAll(".hero-character,.chronicle-seal img,.sidebar-portrait img,.relation-medallion img")].map(i=>i.decode()))');
 assert(await evaluate('document.querySelector(".chronicle-seal img").src.endsWith("icon-'+key+'.png") && document.querySelector(".sidebar-portrait img").src.endsWith("icon-'+key+'.png")'),'Own medallions');
 assert(await evaluate('getComputedStyle(document.querySelector(".profile-hero"),"::before").backgroundImage.includes("'+key+'-scenes.png")'),'Own environment');
 assert(await evaluate('document.querySelectorAll(".chronicle-seal").length===1 && document.querySelectorAll(".chronicle-atmosphere").length===1'),'No duplicate decorations');
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Hero fits');
 if(width===1440||width===390)await screenshot('chronicle-'+key+'-'+(width===1440?'desktop':'mobile'));
 const source=await evaluate('people["'+key+'"].chapters.map(c=>blocks(c.text)).join("")');
 const actual=await evaluate('[...document.querySelectorAll("#story .chapter")].map(c=>[...c.children].filter(n=>["P","UL","OL"].includes(n.tagName)).map(n=>n.outerHTML).join("")).join("")');
 assert(source===actual,'Original lore text preserved');
 assert(await evaluate('document.querySelectorAll(".chapter").length==='+counts[key]+' && document.querySelectorAll(".scene-figure").length===3'),'All chapters and illustrations');
 await evaluate('document.querySelector(".profile-heading .story-button").click()');await sleep(150);
 assert(await evaluate('!document.querySelector(".reader-toolbar").hidden && document.documentElement.scrollWidth<=innerWidth'),'Reading and toolbar fit');
 if(width===1440||width===390)await screenshot('chronicle-'+key+'-reading-'+(width===1440?'desktop':'mobile'));
 await evaluate('document.querySelector("#chapter-nav a:nth-child(4)").click()');await sleep(120);
 assert(await evaluate('location.hash.endsWith("kapitola-4") && !document.querySelector("#profile").hidden'),'Chapter navigation');
 if(width===390){
 await send('Page.reload');await sleep(300);
 assert(await evaluate('document.querySelectorAll(".chapter").length==='+counts[key]+' && document.querySelector(".chronicle-seal img").src.endsWith("icon-'+key+'.png")'),'Chapter reload');
 }
 await evaluate('document.querySelector(".relation-medallion").click()');await sleep(80);
 assert(await evaluate('!document.querySelector("#profile").hidden'),'Family icon opens story');
 await evaluate('document.querySelector(".back").click()');await sleep(80);
 assert(await evaluate('!document.querySelector("#selection").hidden && document.activeElement.classList.contains("cast-link")'),'Return and focus');
 }
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await evaluate('location.hash="#sophie"');await sleep(100);
 assert(await evaluate('getComputedStyle(document.querySelector(".chronicle-fog")).animationName==="none" && getComputedStyle(document.querySelector(".chronicle-atmosphere i")).display==="none"'),'Reduced motion');
 assert(errors.length===0,'No browser exceptions');
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

