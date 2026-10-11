(() => {
'use strict';
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let query='',kind='Lesson',topic='',limit=24;
function results(){
 const data=window.OPEN_SHELF_KNOWLEDGE; const box=document.querySelector('#knowledge-results');
 const list=data.articles.filter(a=>(!kind||a.kind===kind)&&(!topic||a.topic===topic)&&(!query||[a.title,a.excerpt,a.topic,...a.authors].join(' ').toLowerCase().includes(query.toLowerCase())));
 document.querySelector('#knowledge-count').textContent=`${list.length} ${kind==='Glossary'?'terms':'articles'} · ${data.articles.length} in the full library`;
 box.innerHTML=list.length?list.slice(0,limit).map(a=>`<article class="knowledge-card"><a href="${esc(a.url)}">${a.image?`<div class="knowledge-image"><img src="${esc(a.image)}" alt="" loading="lazy"></div>`:'<div class="knowledge-image type-placeholder" aria-hidden="true">Aa</div>'}<div class="knowledge-card-copy"><p class="eyebrow">${esc(a.topic)}</p><h2>${esc(a.title)}</h2><p>${esc(a.excerpt)}</p><p class="meta">${esc(a.authors.join(', '))} · CC BY-SA 4.0</p><span class="read-link">Read article →</span></div></a></article>`).join(''):'<div class="empty"><h2>No articles found</h2><p>Try another phrase or topic.</p></div>';
 document.querySelector('#knowledge-more').hidden=list.length<=limit;
}
function show(){
 document.title='Knowledge | Open Shelf';const data=window.OPEN_SHELF_KNOWLEDGE;
 document.querySelector('#view-knowledge').innerHTML=`<header class="page-head knowledge-head"><p class="eyebrow">Read, understand, put it into practice</p><h1>A little knowledge.<br>A better eye for type.</h1><p>Lessons and a glossary from Google Fonts Knowledge, by type designers and educators. Explore choosing type, pairing families, accessibility and more.</p><p class="meta">Republished under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, with original illustrations and credits. Layout and links adapted by Open Shelf. <a href="https://github.com/google/fonts/tree/main/cc-by-sa/knowledge">Source on GitHub</a> · Synced ${esc(data.updatedAt)}.</p></header><div class="knowledge-tools"><label class="searchwrap">Search articles<input id="knowledge-search" type="search" placeholder="Try pairing, spacing or accessibility" value="${esc(query)}"></label><label>Read<select id="knowledge-kind" class="sel"><option value="Lesson" ${kind==='Lesson'?'selected':''}>Lessons</option><option value="Glossary" ${kind==='Glossary'?'selected':''}>Glossary</option><option value="" ${!kind?'selected':''}>Everything</option></select></label><label>Topic<select id="knowledge-topic" class="sel"><option value="">All topics</option>${[...new Set(data.articles.map(a=>a.topic))].sort().map(t=>`<option ${topic===t?'selected':''}>${esc(t)}</option>`).join('')}</select></label></div><p id="knowledge-count" class="count"></p><div class="knowledge-grid" id="knowledge-results"></div><button class="btn load-more" id="knowledge-more">Load more articles</button>`;
 results();
 document.querySelector('#knowledge-search').addEventListener('input',e=>{query=e.target.value;limit=24;results();});
 document.querySelector('#knowledge-kind').addEventListener('change',e=>{kind=e.target.value;limit=24;results();});
 document.querySelector('#knowledge-topic').addEventListener('change',e=>{topic=e.target.value;limit=24;results();});
 document.querySelector('#knowledge-more').addEventListener('click',()=>{limit+=24;results();});
}
window.OpenShelfKnowledge={show};
})();
