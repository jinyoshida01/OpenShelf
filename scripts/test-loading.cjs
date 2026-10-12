const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const loader=app.slice(app.indexOf('const loaded = new Set(), unavailable'),app.indexOf("const io = 'IntersectionObserver'"));
async function scenario(failures, binaryFails=false, extra={}){
 let requests=0; const urls=[];
 const context={desktop:{enabled:false,offline:false},console,encodeURIComponent,Promise,Set,Error,setTimeout:(fn,ms)=>ms===20000?setTimeout(fn,ms):0,clearTimeout,
 pvWeight:f=>f.w[0],document:{createElement:()=>({remove(){}}),head:{appendChild(l){requests++;urls.push(l.href);queueMicrotask(()=>requests<=failures?l.onerror():l.onload());}},fonts:{load:async()=>{if(binaryFails)throw Error('Missing binary');return [{}];}}}};
 vm.createContext(context);vm.runInContext(loader+'\nthis.load=loadFont;this.isAvailable=available;',context);
 const font={n:'Test Font',slug:'test-font',w:[400,700],...extra};
 await context.load(font,[700],false);
 return {available:context.isAvailable(font),requests,...(extra.source?{urls}:{})};
}
(async()=>{
 assert.deepEqual(await scenario(0),{available:true,requests:1});
 assert.deepEqual(await scenario(1),{available:true,requests:2});
 assert.deepEqual(await scenario(2),{available:false,requests:2});
 assert.deepEqual(await scenario(0,true),{available:false,requests:2});
 const extra={source:'fontsource',fontsourceId:'test-font',fontsourceVersion:'5.2.1'};
 assert.deepEqual(await scenario(1,false,extra),{available:true,requests:2,urls:[
  'https://cdn.jsdelivr.net/npm/@fontsource/test-font@5.2.1/700.css',
  'https://cdn.jsdelivr.net/npm/@fontsource/test-font@5.2.1/400.css']});
 assert.deepEqual(await scenario(2,false,extra),{available:false,requests:2,urls:[
  'https://cdn.jsdelivr.net/npm/@fontsource/test-font@5.2.1/700.css',
  'https://cdn.jsdelivr.net/npm/@fontsource/test-font@5.2.1/400.css']});
 const italic=await scenario(1,false,{...extra,regularStyle:'italic'});
 assert.equal(italic.available,true);
 assert.ok(italic.urls.every(url=>url.endsWith('-italic.css')));
 console.log('Font loading: Google and Fontsource success, fallback, missing assets and italic-only families passed.');
})().catch(e=>{console.error(e);process.exit(1);});
