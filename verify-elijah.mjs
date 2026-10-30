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
 const errors=[];await send('Runtime.enable');const handler=ws.onmessage;ws.onmessage=event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.text);handler(event);};
 assert(await evaluate('document.querySelectorAll(".medallion-card").length===7'),'Seven characters');
 await evaluate('Promise.all([...document.querySelectorAll(".medallion-art img")].map(i=>i.decode()))');
 for(const width of [1920,1440,1024,768,390,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:width===1920?1080:1000,deviceScaleFactor:1,mobile:width<701});
 await evaluate('location.hash="";document.querySelector(".medallion-cast").scrollLeft=0');await sleep(120);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Home fits '+width);
 assert(await evaluate('(()=>{const a=[...document.querySelectorAll(".medallion-card")].map(c=>c.getBoundingClientRect().top);return Math.max(...a)-Math.min(...a)<2})()'),'All seven on same row '+width);
 if(width>=1280)assert(await evaluate('document.querySelector(".medallion-cast").scrollWidth<=document.querySelector(".medallion-cast").clientWidth+2'),'Seven fit desktop');
 else{
 assert(await evaluate('!document.querySelector(".cast-gallery-controls").hidden'),'Scroll controls visible '+width);
 await evaluate('document.querySelector(".cast-gallery-next").click()');await sleep(500);
 assert(await evaluate('document.querySelector(".medallion-cast").scrollLeft>0'),'Gallery arrow scrolls');
 await evaluate('document.querySelector(".medallion-cast").scrollLeft=0');await sleep(100);
 }
 if([1920,1440,390].includes(width))await screenshot('seven-one-row-'+width);
 await evaluate('document.querySelector(".cast-link.elijah").scrollIntoView({block:"nearest",inline:"center",behavior:"instant"})');await sleep(100);
 if(width===390)await screenshot('seven-one-row-mobile-elijah');
 await evaluate('document.querySelector(".cast-link.elijah").click()');await sleep(100);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector(".archive-owner").textContent==="Elijah Cole Walker"'),'Elijah archive');
 await evaluate('document.querySelector("#archive-code").value="0000";document.querySelector(".archive-lock-form").requestSubmit()');
 assert(await evaluate('document.querySelector("#profile").hidden && document.querySelector(".archive-lock").open'),'Wrong code rejected');
 if(width===1440)await screenshot('elijah-archive');
 await evaluate('document.querySelector("#archive-code").value="1470";document.querySelector(".archive-lock-form").requestSubmit()');await sleep(850);
 assert(await evaluate('!document.querySelector("#profile").hidden && document.querySelector("#profile").classList.contains("elijah-profile")'),'1470 opens Elijah');
 await evaluate('Promise.all([...document.querySelectorAll(".hero-character,.chronicle-seal img,.scene-media img")].map(i=>{i.loading="eager";return i.decode()}))');
 assert(await evaluate('document.querySelectorAll(".chapter").length===11 && document.querySelectorAll(".scene-figure").length===3'),'All 8 chapters and 3 personal sections');
 assert(await evaluate('document.querySelector(".facts").textContent.includes("25 let") && document.querySelector(".stamp").textContent.includes("1872")'),'Correct birth and age');
 assert(await evaluate('document.querySelectorAll(".family-link").length===0 && document.querySelector(".family").textContent.includes("Hayes") && document.querySelector(".family").textContent.includes("Hargrove") && document.querySelector(".family").textContent.includes("Ash")'),'Independent character, accurate relationships');
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Profile fits '+width);
 if(width===1440||width===390)await screenshot('elijah-profile-'+width);
 const source=await evaluate('people.elijah.chapters.map(c=>blocks(c.text)).join("")');
 const actual=await evaluate('[...document.querySelectorAll("#story .chapter")].map(c=>[...c.children].filter(n=>["P","UL","OL"].includes(n.tagName)).map(n=>n.outerHTML).join("")).join("")');
 assert(source===actual,'All supplied chapter text rendered');
 await evaluate('document.querySelector("#chapter-nav a:nth-child(8)").click()');await sleep(200);
 assert(await evaluate('location.hash==="#elijah-kapitola-8" && !document.querySelector("#profile").hidden'),'Chapter link');
 if(width===1440)await screenshot('elijah-reading');
 if(width===390){
 await send('Page.reload');await sleep(400);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector("#profile").hidden'),'Reload chapter remains locked');
 await evaluate('document.querySelector("#archive-code").value="1470";document.querySelector(".archive-lock-form").requestSubmit()');await sleep(750);
 assert(await evaluate('document.querySelectorAll(".chapter").length===11'),'Chapter reload restores lore');
 }
 await evaluate('document.querySelector(".back").click()');await sleep(120);
 assert(await evaluate('document.activeElement.hash==="#elijah" && !document.querySelector("#selection").hidden'),'Return restores focus');
 }
 assert(errors.length===0,'No browser JavaScript exceptions');
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

