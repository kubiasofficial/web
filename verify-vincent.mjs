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
 assert(await evaluate('document.querySelectorAll(".medallion-card").length===6'),'Six characters on home');
 await evaluate('Promise.all([...document.querySelectorAll(".medallion-art img")].map(i=>i.decode()))');
 for(const width of [1440,1024,768,390,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<701});
 await evaluate('location.hash=""');await sleep(100);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Home fits '+width);
 if(width===1440||width===390)await screenshot('vincent-home-'+width);
 await evaluate('document.querySelector(".cast-link.vincent").click()');await sleep(100);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector(".archive-owner").textContent==="Vincent Elias Mercer"'),'Vincent lock');
 await evaluate('document.querySelector("#archive-code").value="3362";document.querySelector(".archive-lock-form").requestSubmit()');await sleep(750);
 assert(await evaluate('!document.querySelector("#profile").hidden && document.querySelector("#profile").classList.contains("vincent-profile")'),'Vincent opens');
 await evaluate('Promise.all([...document.querySelectorAll(".hero-character,.chronicle-seal img,.scene-media img")].map(i=>{i.loading="eager";return i.decode()}))');
 assert(await evaluate('document.querySelectorAll(".chapter").length===10 && document.querySelectorAll(".scene-figure").length===3'),'All lore sections and illustrations');
 assert(await evaluate('document.querySelector(".stamp").textContent.includes("1869") && document.querySelector(".facts").textContent.includes("28 let")'),'Approved character data');
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Vincent fits '+width);
 if(width===1440||width===390)await screenshot('vincent-profile-'+width);
 const source=await evaluate('people.vincent.chapters.map(c=>blocks(c.text)).join("")');
 const actual=await evaluate('[...document.querySelectorAll("#story .chapter")].map(c=>[...c.children].filter(n=>["P","UL","OL"].includes(n.tagName)).map(n=>n.outerHTML).join("")).join("")');
 assert(source===actual,'All supplied chapter text rendered');
 await evaluate('document.querySelector("#chapter-nav a:nth-child(8)").click()');await sleep(100);
 assert(await evaluate('location.hash==="#vincent-kapitola-8" && !document.querySelector("#profile").hidden'),'Vincent chapter navigation');
 await evaluate('document.querySelector(".relation-medallion").click()');await sleep(100);
 assert(await evaluate('document.querySelector(".archive-lock").open && document.querySelector(".archive-owner").textContent.includes("Nathaniel")'),'Friend opens Nathaniel lock');
 await evaluate('document.querySelector(".archive-return").click()');await sleep(60);
 }
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

