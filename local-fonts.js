/* Font files and personal metadata never leave this browser. */
(() => {
'use strict';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cats = {sans:'Sans serif',serif:'Serif',slab:'Slab serif',mono:'Monospace',display:'Display',script:'Script'};
const useOptions = ['Body text','Headlines','Interfaces & apps','Long-form reading','Editorial & magazines','Branding & logos','Posters & signage','Code & terminals','Data & dashboards','Accessibility','Invitations & cards','Packaging & labels'];
const feelOptions = ['Business','Calm','Modern','Classic','Sophisticated','Fancy','Friendly','Playful','Vintage','Loud','Technical','Quirky'];
let dbPromise, records=[], faces=new Map(), query=localStorage.getItem('openshelf:localQuery')||'', category=localStorage.getItem('openshelf:localCategory')||'', editing=null, notice='', failed=new Set(), booted=false, change=()=>{};
const container = () => document.querySelector('#view-local');
function db() {
  if (!dbPromise) dbPromise = new Promise((resolve,reject) => {
    const r=indexedDB.open('openshelf-local-fonts',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('fonts',{keyPath:'id'});
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
    r.onblocked=()=>reject(new Error('Close other OpenShelf tabs and try again.'));
  }).catch(e=>{dbPromise=null;throw e;});
  return dbPromise;
}
async function transaction(mode, action) {
  const database=await db();
  return new Promise((resolve,reject)=>{
    const tx=database.transaction('fonts',mode), req=action(tx.objectStore('fonts'));
    tx.oncomplete=()=>resolve(req.result); tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}
async function install(record) {
  if(faces.has(record.id))return;
  const face=new FontFace('local_'+record.id, record.bytes, {weight:String(record.weight||400),style:record.style||'normal'});
  await face.load();
  const previous=faces.get(record.id);if(previous)document.fonts.delete(previous);
  document.fonts.add(face);faces.set(record.id,face);failed.delete(record.id);
}
async function ready() {
  if(booted)return;
  records=await transaction('readonly',s=>s.getAll());

  booted=true;
}
function previewText(){return document.querySelector('#proof-input').value || 'Sphinx of black quartz, judge my vow.';}
function checks(label,options,current){return `<fieldset class="local-checks"><legend>${label}</legend>${options.map(v=>`<label><input type="checkbox" name="${label.toLowerCase()}" value="${esc(v)}" ${(current||[]).includes(v)?'checked':''}>${v}</label>`).join('')}</fieldset>`;}
function editor(r){return `<form id="local-editor" class="local-editor"><h2>Edit ${esc(r.name)}</h2><div class="form-grid">
<label>Name<input name="name" required maxlength="120" value="${esc(r.name)}"></label>
<label>Category<select name="category">${Object.entries(cats).map(([k,v])=>`<option value="${k}" ${r.category===k?'selected':''}>${v}</option>`).join('')}</select></label>
<label>Designer<input name="designer" maxlength="200" value="${esc(r.designer)}"></label>
<label>Foundry / publisher<input name="publisher" maxlength="200" value="${esc(r.publisher)}"></label>
<label>Release year<input name="year" type="number" min="1000" max="2100" value="${esc(r.year)}"></label>
<label>Licence / usage notes<input name="license" maxlength="300" value="${esc(r.license)}"></label>
<label>Weight for this file<select name="weight">${[100,200,300,400,500,600,700,800,900].map(w=>`<option ${r.weight===w?'selected':''}>${w}</option>`).join('')}</select></label>
<label>Style for this file<select name="style"><option value="normal">Regular</option><option value="italic" ${r.style==='italic'?'selected':''}>Italic</option><option value="oblique" ${r.style==='oblique'?'selected':''}>Oblique</option></select></label>
<label class="span-two">Description<textarea name="description" rows="4" maxlength="3000">${esc(r.description)}</textarea></label>
<label class="span-two">Appearance / custom tags (comma separated)<input name="tags" maxlength="500" value="${esc(r.tags)}" placeholder="Rounded, geometric, project name"></label></div>
${checks('Uses',useOptions,r.uses)}${checks('Feelings',feelOptions,r.feelings)}
<p class="meta">Weight and style describe this imported file; they do not add styles to it.</p>
<div class="actions"><button class="btn primary" type="submit">Save details</button><button class="btn" type="button" data-local-action="cancel">Cancel</button></div></form>`;}
function card(r){return `<article class="local-card"><div class="font-head"><h2>${esc(r.name)}</h2><span class="manual-badge">External import · licence unverified</span><span class="meta">${cats[r.category]||'Uncategorised'} · ${r.weight||400} ${esc(r.style||'normal')}</span></div><p class="local-preview" data-local-preview style="font-family:local_${r.id};font-weight:${r.weight||400};font-style:${r.style||'normal'}">${esc(previewText())}</p><p>${esc(r.description||'Add a description to make this font easier to find.')}</p><dl class="local-details">${[['Designer',r.designer],['Publisher',r.publisher],['Year',r.year],['Licence',r.license],['Uses',(r.uses||[]).join(', ')],['Feeling',(r.feelings||[]).join(', ')],['Tags',r.tags]].filter(x=>x[1]).map(([k,v])=>`<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl><p class="meta">${esc(r.filename)} · ${(r.bytes.byteLength/1024).toFixed(0)} KB</p><div class="actions"><button class="btn sm" data-action="save" data-kind="font" data-slug="local-${r.id}">Save to collection</button><button class="btn sm" data-local-action="edit" data-id="${r.id}">Edit details</button><button class="ib download-button" data-local-action="download" data-id="${r.id}" aria-label="Download ${esc(r.name)} file" title="Download file"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/></svg></button><button class="btn sm quiet" data-local-action="delete" data-id="${r.id}">Remove</button></div></article>`;}
function list(){queueMicrotask(observeLocal);
  const q=query.toLowerCase().trim();const visible=records.filter(r=>!failed.has(r.id)&&(!category||r.category===category)&&(!q||[r.name,r.designer,r.publisher,r.description,r.tags,'manually added licence unverified',...(r.uses||[]),...(r.feelings||[])].join(' ').toLowerCase().includes(q)));
  container().querySelector('#local-count').textContent=`${visible.length} of ${records.length-failed.size} local fonts`;
  container().querySelector('#local-results').innerHTML=visible.length?visible.sort((a,b)=>a.name.localeCompare(b.name)).map(card).join(''):`<div class="empty"><h2>${records.length?'No matching fonts':'No local fonts yet'}</h2><p>${records.length?'Try a different search or category.':'Import font files to preview them and add descriptions, categories and notes.'}</p></div>`;
}
const localObserver='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const r=records.find(r=>e.target.style.fontFamily.includes(r.id));if(r)install(r).catch(()=>{failed.add(r.id);e.target.textContent='Preview unavailable';});localObserver.unobserve(e.target);}}),{rootMargin:'300px'}):null;
function observeLocal(){document.querySelectorAll('[data-local-preview]').forEach(el=>localObserver?.observe(el));}
function localLayout(){return localStorage.getItem('openshelf:localLayout')||'grid';}
function localColumns(){const v=localStorage.getItem('openshelf:localColumns')||'2';return /^(auto|[1-6])$/.test(v)?v:'2';}
function localColumnControl(){return `<label class="grid-control local-columns" ${localLayout()==='grid'?'':'hidden'}>Columns<select class="sel" aria-label="Local font columns" data-local-columns>${['auto','1','2','3','4','5','6'].map(v=>`<option value="${v}" ${localColumns()===v?'selected':''}>${v==='auto'?'Auto':v}</option>`).join('')}</select></label>`;}
function localControls(){return `<div class="local-layout-options">${localColumnControl()}<div class="seg local-layout" role="group" aria-label="Local font layout">${['list','grid'].map(v=>`<button data-local-action="layout" data-layout-value="${v}" aria-label="${v==='list'?'List':'Grid'} view" aria-pressed="${localLayout()===v}">${document.querySelector(`[data-layout="${v}"]`).innerHTML}</button>`).join('')}</div></div>`;}
function render(){change();
  const box=container();
  box.innerHTML=`<header class="page-head"><h1>Local Fonts</h1><p><span class="copy-line">Import TTF, OTF, WOFF or WOFF2 files.</span> <span class="copy-line">Your fonts and notes stay in this browser on this device.</span> <span class="copy-line">Clearing site data removes them; keep your original files.</span></p></header><div class="local-import"><label class="btn primary" for="local-files">Import fonts</label><input class="sr" id="local-files" type="file" multiple accept=".ttf,.otf,.woff,.woff2"><span class="meta">Up to 20 MB per file. Manually added fonts may not be open-source. Verify their licence and usage rights yourself before using or sharing them.</span><button class="btn sm" data-local-action="backup" ${records.length?'':'disabled'} aria-describedby="local-export-help">Export collection</button><label class="btn sm" for="local-backup">Import collection</label><input id="local-backup" class="sr" type="file" accept=".json,application/json"></div><p class="meta" id="local-export-help"><span class="copy-line">Export collection saves every font file and its details in one JSON file.</span> <span class="copy-line">Use Import collection to restore it in another browser or on another device.</span></p><p id="local-notice" role="status">${esc(notice)}</p>${failed.size?`<div class="status-note">${failed.size} stored font file(s) could not load and are hidden from search. <button class="linkbtn" data-local-action="retry">Retry loading</button></div>`:''}${editing?editor(records.find(r=>r.id===editing)):`<div class="knowledge-tools"><label class="searchwrap">Search local fonts<input id="local-search" type="search" placeholder="Name, designer, description or tags" value="${esc(query)}"></label><label>Category<select id="local-category" class="sel"><option value="">All categories</option>${Object.entries(cats).map(([k,v])=>`<option value="${k}" ${category===k?'selected':''}>${v}</option>`).join('')}</select></label></div>${localControls()}<p class="count" id="local-count"></p><div id="local-results" class="local-grid" data-layout="${localLayout()}" style="--local-cols:${localColumns()}"></div>`}`;
  if(!editing)list();
}
async function show(){document.title='Local Fonts | OpenShelf';try{await ready();render();}catch(e){container().innerHTML='<header class="page-head"><h1>Local Fonts</h1><p>Browser storage is unavailable. Enable site storage or leave private browsing, then reload to import fonts.</p></header>';}}
async function importOne(file,meta={}){
  if(file.size>20*1024*1024)throw new Error('File exceeds 20 MB');
  if(!/\.(ttf|otf|woff2?)$/i.test(file.name))throw new Error('Use a TTF, OTF, WOFF or WOFF2 file');
  const bytes=await file.arrayBuffer();const hash=await crypto.subtle.digest('SHA-256',bytes);const id=Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
  if(records.some(r=>r.id===id))return false;
  const clean=s=>String(s||'').slice(0,3000);
  const r={id,bytes,filename:file.name,name:clean(meta.name)||file.name.replace(/\.(ttf|otf|woff2?)$/i,'').replace(/[-_]/g,' '),category:cats[meta.category]?meta.category:'sans',weight:[100,200,300,400,500,600,700,800,900].includes(+meta.weight)?+meta.weight:400,style:['normal','italic','oblique'].includes(meta.style)?meta.style:'normal',designer:clean(meta.designer),publisher:clean(meta.publisher),year:clean(meta.year),license:clean(meta.license),description:clean(meta.description),tags:clean(meta.tags),uses:(meta.uses||[]).filter(x=>useOptions.includes(x)),feelings:(meta.feelings||[]).filter(x=>feelOptions.includes(x))};
  await install(r);
  try{await transaction('readwrite',s=>s.put(r));}catch(e){document.fonts.delete(faces.get(id));faces.delete(id);throw new Error('Could not save to browser storage. It may be full.');}
  records.push(r);return true;
}
function download(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('change',async e=>{
  if(e.target.id==='local-category'){category=e.target.value;localStorage.setItem('openshelf:localCategory',category);list();return;}
  if(!['local-files','local-backup'].includes(e.target.id))return;
  const files=Array.from(e.target.files);const status=container().querySelector('#local-notice');status.textContent='Importing…';e.target.disabled=true;
  let added=0,duplicates=0,errors=[];
  try{
    if(e.target.id==='local-backup'){
      const f=files[0];if(!f)return;if(f.size>150*1024*1024)throw new Error('Backup is too large');
      const data=JSON.parse(await f.text());if(data.format!=='openshelf-local-v1'||!Array.isArray(data.fonts))throw new Error('Choose an exported OpenShelf collection');
      for(const r of data.fonts){try{const bin=Uint8Array.from(atob(r.data),c=>c.charCodeAt(0));const ok=await importOne(new File([bin],String(r.filename)),r);ok?added++:duplicates++;}catch(err){errors.push(String(r.filename)+': '+err.message);}}
    }else for(const f of files){try{const ok=await importOne(f);ok?added++:duplicates++;}catch(err){errors.push(f.name+': '+err.message);}}
    notice=`Imported ${added} font${added===1?'':'s'}.${duplicates?' '+duplicates+' duplicate(s) skipped.':''}${errors.length?' '+errors.join(' · '):''}`;
  }catch(err){notice=err.message;}
  render();
});
document.addEventListener('change',e=>{if(e.target.matches('[data-local-columns]')){localStorage.setItem('openshelf:localColumns',e.target.value);document.querySelector('#local-results')?.style.setProperty('--local-cols',localColumns());}});
document.addEventListener('input',e=>{if(e.target.id==='local-search'){query=e.target.value;localStorage.setItem('openshelf:localQuery',query);list();}if(e.target.id==='proof-input')document.querySelectorAll('[data-local-preview]').forEach(x=>x.textContent=previewText());});
document.addEventListener('submit',async e=>{
  if(e.target.id!=='local-editor')return;e.preventDefault();const r=records.find(x=>x.id===editing);const data=new FormData(e.target);const next={...r};for(const k of ['name','category','designer','publisher','year','license','style','description','tags'])next[k]=String(data.get(k)||'').trim();next.weight=+data.get('weight');next.uses=data.getAll('uses');next.feelings=data.getAll('feelings');
  try{await transaction('readwrite',s=>s.put(next));document.fonts.delete(faces.get(next.id));faces.delete(next.id);await install(next);records[records.indexOf(r)]=next;editing=null;notice='Details saved.';render();}catch(err){container().querySelector('#local-notice').textContent='Could not save details: '+err.message;}
});
document.addEventListener('click',async e=>{if(e.target.closest('[data-local-action="layout"]')){localStorage.setItem('openshelf:localLayout',e.target.closest('[data-local-action]').dataset.layoutValue);render();return;}
  const b=e.target.closest('[data-local-action]');if(!b)return;const action=b.dataset.localAction;const r=records.find(x=>x.id===b.dataset.id);
  try{
    if(action==='edit'){editing=r.id;render();container().querySelector('[name=name]').focus();}
    if(action==='cancel'){editing=null;render();}
    if(action==='delete'){if(b.dataset.confirm!=='yes'){b.dataset.confirm='yes';b.textContent='Confirm removal';return;}await transaction('readwrite',s=>s.delete(r.id));document.fonts.delete(faces.get(r.id));faces.delete(r.id);records=records.filter(x=>x.id!==r.id);notice='Font removed from this browser.';render();}
    if(action==='download')download(new Blob([r.bytes]),r.filename);
    if(action==='retry'){booted=false, change=()=>{};await show();}
    if(action==='backup'){
      const fonts=records.map(r=>{let binary='';for(const v of new Uint8Array(r.bytes))binary+=String.fromCharCode(v);const {bytes,...meta}=r;return {...meta,data:btoa(binary)};});download(new Blob([JSON.stringify({format:'openshelf-local-v1',fonts})],{type:'application/json'}),'open-shelf-local-fonts.json');
    }
  }catch(err){notice='Could not complete that action: '+err.message;render();}
});
window.OpenShelfLocal={catalog:async()=>{await ready();return records;},records:()=>records,connect:fn=>{change=fn;},load:async f=>{const r=records.find(r=>'local-'+r.id===f.slug);if(!r)throw Error('Local font missing');await install(r);},show,updatePreview:()=>document.querySelectorAll('[data-local-preview]').forEach(x=>x.textContent=previewText())};
})();
