const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const app=fs.readFileSync('app.js','utf8');
const loader=app.slice(app.indexOf('const loaded = new Set(), unavailable'),app.indexOf("const io = 'IntersectionObserver'"));
function harness({failures=0,binaryFails=false,status=404,offline=false}={}){
 let requests=0,inflight=0,maxInflight=0;const urls=[];
 const context={desktop:{enabled:false,offline:false},navigator:{onLine:!offline},window:{addEventListener(){}},AbortSignal,fetch:async()=>({status}),console,encodeURIComponent,Promise,Set,Map,Error,setTimeout:(fn,ms)=>ms===20000?setTimeout(fn,ms):0,clearTimeout,
 pvWeight:f=>f.w[0],document:{createElement:()=>({remove(){}}),head:{appendChild(l){requests++;inflight++;maxInflight=Math.max(maxInflight,inflight);urls.push(l.href);const fail=requests<=failures;setTimeout(()=>{inflight--;fail?l.onerror():l.onload();},2);}},fonts:{load:async()=>{if(binaryFails)throw Error('Network failure');return [{}];}}}};
 vm.createContext(context);vm.runInContext(loader+'\nthis.load=loadFont;this.isAvailable=available;',context);
 return {context,stats:()=>({requests,maxInflight,urls})};
}
const font={n:'Test Font',slug:'test-font',w:[400,700]};
(async()=>{
 for(const [options,available,requests] of [[{},true,1],[{failures:1},true,2],[{failures:2},false,2],[{failures:2,status:503},true,2],[{binaryFails:true},true,2],[{offline:true},true,0]]){
  const h=harness(options);await h.context.load(font,[700],false);assert.equal(h.context.isAvailable(font),available);assert.equal(h.stats().requests,requests);
 }
 const h=harness({failures:1}),extra={...font,source:'fontsource',fontsourceId:'test-font',fontsourceVersion:'5.2.1',regularStyle:'italic'};await h.context.load(extra,[700],false);assert.ok(h.stats().urls.every(u=>u.endsWith('-italic.css')));
 const burst=harness();await Promise.all(Array.from({length:20},(_,i)=>burst.context.load({...font,n:'Font '+i,slug:'font-'+i},[400])));assert.ok(burst.stats().maxInflight<=4);assert.equal(burst.stats().requests,20);
 const duplicate=harness();await Promise.all([duplicate.context.load(font,[400]),duplicate.context.load(font,[400])]);assert.equal(duplicate.stats().requests,1);
 const retry=harness({failures:2,status:503});await retry.context.load(font,[400]);await retry.context.load(font,[400]);assert.equal(retry.stats().requests,3);
 console.log('Font loading: missing assets, transient failures, offline, retry, italic fallback, deduplication and four-job concurrency passed.');
})().catch(e=>{console.error(e);process.exit(1);});
