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
 assert(await evaluate('document.querySelectorAll(".medallion-card").length===5'),'Five medallions');
 assert(await evaluate('Promise.all([...document.querySelectorAll(".medallion-art img")].map(i=>i.decode().then(()=>true).catch(()=>false))).then(a=>a.every(Boolean))'),'All supplied icons load');
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Desktop no overflow');
 const point=await evaluate('(()=>{const r=document.querySelector(".medallion-card.nathaniel img").getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()');
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});await sleep(600);
 assert(await evaluate('getComputedStyle(document.querySelector(".nathaniel .aura-ring")).opacity==="1"'),'Hover activates aura');
 await screenshot('medallions-desktop');
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(500);
 assert(await evaluate('location.hash==="#nathaniel" && !document.querySelector("#profile").hidden'),'Real icon click opens lore');
 for(const width of [1440,390,700,320]){
 await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<701});
 for(const key of ['daniel','katie','nathaniel','scarlett','sophie']){
 await evaluate('location.hash=""');await sleep(60);
 assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),'Selection fits '+width);
 await evaluate('document.querySelector(".cast-link.'+key+'").click()');await sleep(100);
 assert(await evaluate('location.hash==="#'+key+'" && !document.querySelector("#profile").hidden && document.querySelectorAll(".chapter").length>=8 && document.querySelectorAll(".scene-figure").length===3'),'Lore and illustrations '+key+' at '+width);
 await evaluate('document.querySelector("#chapter-nav a:nth-child(2)").click()');await sleep(60);
 assert(await evaluate('!document.querySelector("#profile").hidden'),'Chapter navigation');
 await evaluate('document.querySelector(".back").click()');await sleep(80);
 assert(await evaluate('document.activeElement.hash==="#'+key+'" && !document.querySelector("#selection").hidden'),'Return restores icon focus');
 }
 if(width===390)await screenshot('medallions-mobile');
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert(await evaluate('getComputedStyle(document.querySelector(".frontier-mist")).animationName==="none"'),'Reduced motion disables atmosphere');
 await evaluate('document.querySelector(".cast-link.sophie").click()');await sleep(100);
 await send('Page.reload');await sleep(700);
 assert(await evaluate('document.title.includes("Sophie") && !document.querySelector("#profile").hidden'),'Direct lore link survives reload');
 await send('Browser.close');
}finally{clearInterval(keepAlive);ws?.close();chrome.kill();}

