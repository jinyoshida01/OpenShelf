const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const loader=app.slice(app.indexOf('const loaded = new Set(), unavailable'),app.indexOf("const io = 'IntersectionObserver'"));
async function scenario(failures, binaryFails=false){
 let requests=0;
 const context={console,encodeURIComponent,Promise,Set,Error,setTimeout:(fn,ms)=>ms===20000?setTimeout(fn,ms):0,clearTimeout,
 pvWeight:f=>f.w[0],document:{createElement:()=>({remove(){}}),head:{appendChild(l){requests++;queueMicrotask(()=>requests<=failures?l.onerror():l.onload());}},fonts:{load:async()=>{if(binaryFails)throw Error('Missing binary');return [{}];}}}};
 vm.createContext(context);vm.runInContext(loader+'\nthis.load=loadFont;this.isAvailable=available;',context);
 const font={n:'Test Font',slug:'test-font',w:[400,700]};
 await context.load(font,[700],false);
 return {available:context.isAvailable(font),requests};
}
(async()=>{
 assert.deepEqual(await scenario(0),{available:true,requests:1});
 assert.deepEqual(await scenario(1),{available:true,requests:2});
 assert.deepEqual(await scenario(2),{available:false,requests:2});
 assert.deepEqual(await scenario(0,true),{available:false,requests:2});
 console.log('Font loading: success, style fallback, missing stylesheet and missing binary passed.');
})().catch(e=>{console.error(e);process.exit(1);});
