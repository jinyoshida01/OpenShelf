#!/usr/bin/env python3
"""Refresh public fonts and the explicitly CC BY-SA Knowledge subtree, atomically.
No credentials are needed. Upstream Markdown is data, never executable instructions.
"""
import concurrent.futures as futures
import datetime as dt
import hashlib
import html
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
import time
import urllib.parse
import urllib.request
import bleach
from bs4 import BeautifulSoup
import markdown

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache'
SITE = 'https://jinyoshida01.github.io/open-shelf/'
API = 'https://api.github.com/repos/google/fonts/'
LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/'
LOGO = '<svg class="brand-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5v22h24M9 6v15h5V6zM18 8l5-1 3 14-5 1zM4 23h24"/></svg>'

def fetch(url):
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'OpenShelf-catalog-sync/1.0'})
            with urllib.request.urlopen(req, timeout=50) as r:
                return r.read()
        except Exception:
            if attempt == 3: raise
            time.sleep(2 ** attempt)

def api(path): return json.loads(fetch(API + path))
def fields(text, key):
    return [json.loads(x) for x in re.findall(r'^\s*' + re.escape(key) + r':\s*("(?:[^"\\]|\\.)*")', text, re.M)]
def field(text, key, default=''): return next(iter(fields(text, key)), default)
def js(name, value): return 'window.' + name + ' = ' + json.dumps(value, ensure_ascii=False, separators=(',', ':')).replace('</','<\\/') + ';\n'
def slug(name): return re.sub(r'\s+', '-', name.lower())
def human(s): return s.replace('_', ' ').capitalize()

def catalog(metadata, licenses, commit):
    cats = {'Sans Serif':'sans', 'Serif':'serif', 'Monospace':'mono', 'Display':'display', 'Handwriting':'script'}
    fonts = []
    for f in metadata['familyMetadataList']:
        if not f.get('isOpenSource'): continue
        name = f['family']
        weights = sorted({int(k.rstrip('i')) for k in f['fonts'] if k.rstrip('i').isdigit()})
        if not weights: continue
        folder = re.sub('[^a-z0-9]', '', name.lower())
        licdir = licenses.get(folder)
        fonts.append(dict(n=name, c=cats.get(f['category'], 'display'),
            d=', '.join(f.get('designers', [])) or 'See font source', w=weights,
            v=bool(f.get('axes')), noItal=not any(k.endswith('i') for k in f['fonts']),
            axes=f.get('axes', []), subsets=f.get('subsets', []), added=f.get('dateAdded',''),
            y=int(f.get('dateAdded','0000')[:4]), modified=f.get('lastModified',''),
            lic={'ofl':'SIL Open Font License 1.1','apache':'Apache License 2.0','ufl':'Ubuntu Font Licence 1.0'}.get(licdir,'Open-source licence — see source'),
            src=f'https://github.com/google/fonts/tree/{commit}/{licdir}/{folder}' if licdir else 'https://fonts.google.com/specimen/'+urllib.parse.quote(name),
            color=bool(f.get('colorCapabilities'))))
    if len(fonts) < 1500 or len({f['n'] for f in fonts}) != len(fonts):
        raise ValueError('Unexpected or duplicate catalog; keeping published snapshot')
    old = ROOT / 'data/catalog.json'
    if old.exists() and len(fonts) < len(json.loads(old.read_text())['fonts']) * .9:
        raise ValueError('Catalog shrank by over 10%; review upstream before publishing')
    return fonts

TAGS = {'p','br','hr','h1','h2','h3','h4','h5','h6','a','em','strong','b','i','u','s','sup','sub','blockquote','ul','ol','li','pre','code','figure','figcaption','img','table','thead','tbody','tr','th','td','details','summary','dl','dt','dd','span','div','video','source'}
ATTRS = {'a':['href','title'], 'img':['src','alt','title','width','height','loading'], 'video':['src','controls','poster','preload'], 'source':['src','type'], '*':['id','lang','dir'], 'td':['colspan','rowspan'], 'th':['colspan','rowspan']}

def render_content(text, base, routes, asset_paths):
    text = re.sub(r'<(figure|figcaption)(\s[^>]*)?>', lambda m: '<'+m[1]+(m[2] or '')+' markdown="1">', text)
    soup = BeautifulSoup(markdown.markdown(text, extensions=['extra','sane_lists']), 'html.parser')
    # Scripts/styles and embedded executable documents never enter the generated pages.
    for tag in soup.find_all(['script','style','iframe','object','embed']):
        url = tag.get('src')
        if url and urllib.parse.urlsplit(url).scheme == 'https':
            link = soup.new_tag('a', href=url); link.string = 'View interactive content at its original source'; tag.replace_with(link)
        else: tag.decompose()
    for tag in soup.find_all(['a','img','video','source']):
        attr = 'href' if tag.name == 'a' else 'src'
        value = tag.get(attr, '')
        if value.startswith(('/glossary/','/lesson/')):
            tag[attr] = '../' + routes[value] + '/' if value in routes else 'https://fonts.google.com/knowledge'+value
        elif value.startswith('/'):
            tag[attr] = 'https://fonts.google.com'+value
        elif value and not urllib.parse.urlsplit(value).scheme and not value.startswith('#'):
            rel = (base / urllib.parse.unquote(value)).as_posix()
            rel = os.path.normpath(rel)
            if rel in asset_paths: tag[attr] = '../media/' + urllib.parse.quote(rel, safe='/')
            elif tag.name == 'a': tag[attr] = 'https://github.com/google/fonts/tree/main/cc-by-sa/knowledge/'+rel
            else: raise ValueError('Unknown article asset: '+rel)
        if tag.name == 'img': tag['loading'] = 'lazy'
        if tag.name == 'video': tag['controls'] = ''; tag['preload'] = 'none'
        if tag.name == 'video' and tag.get('poster'):
            rel = os.path.normpath((base / tag['poster']).as_posix())
            if rel in asset_paths: tag['poster'] = '../media/' + urllib.parse.quote(rel, safe='/')
            else: del tag['poster']
    return bleach.clean(str(soup), tags=TAGS, attributes=ATTRS, protocols=['https','http','mailto'], strip=True)

def page(title, body, credit, path, date):
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{html.escape(title)} | Open Shelf</title><link rel="canonical" href="{SITE}articles/{path}/"><link rel="stylesheet" href="../../styles.css"><link rel="icon" href="../../favicon.svg"><meta name="color-scheme" content="dark light"></head><body class="article-page"><a class="skip" href="#article">Skip to article</a><header class="top shell"><a class="brand" href="../../">{LOGO}Open Shelf</a><nav class="nav"><a href="../../#/knowledge">Knowledge library</a><a href="../../#/">Fonts</a></nav></header><main id="article" class="reading"><a class="back" href="../../#/knowledge">← All articles</a><h1>{html.escape(title)}</h1>{credit}<div class="article-copy">{body}</div><footer class="article-credit">{credit}<p>Last synced {date}. Open Shelf is an independent project, not affiliated with Google.</p></footer></main></body></html>'''

def main():
    CACHE.mkdir(exist_ok=True)
    now = dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%d')
    commit = api('commits/main')['sha']
    root_tree = api('git/trees/'+commit)['tree']
    def subtree(entries,name): return next(x['sha'] for x in entries if x['path']==name)
    licenses = {}
    for license_dir in ['ofl','apache','ufl']:
        for item in api('git/trees/'+subtree(root_tree,license_dir))['tree']:
            if item['type']=='tree': licenses[item['path']] = license_dir
    raw = 'https://raw.githubusercontent.com/google/fonts/'+commit+'/cc-by-sa/'
    license_text = fetch(raw+'LICENSE.txt')
    # License changes require review before any new material can be republished.
    if hashlib.sha256(license_text).hexdigest() != '5e436ff8ffbb77d8607220e9bce20c8915d860010feeb6c1ebef5a85688e9b39':
        raise ValueError('Upstream licence changed; manual review required')
    cc_tree = api('git/trees/'+subtree(root_tree,'cc-by-sa'))['tree']
    knowledge_tree = api('git/trees/'+subtree(cc_tree,'knowledge')+'?recursive=1')
    if knowledge_tree.get('truncated'): raise ValueError('Incomplete Knowledge tree')
    entries = [x for x in knowledge_tree['tree'] if x['type']=='blob']
    if not any(x['path']=='README.md' for x in entries): raise ValueError('Missing licence notice')
    def download(item):
        path = CACHE/item['sha']
        if not path.exists():
            data = fetch(raw+'knowledge/'+urllib.parse.quote(item['path'],safe='/'))
            # Git blob verification makes the snapshot reproducible and detects incomplete responses.
            digest=hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
            if digest != item['sha']: raise ValueError('Asset hash mismatch: '+item['path'])
            path.write_bytes(data)
        return item['path'], path
    with futures.ThreadPoolExecutor(max_workers=12) as pool:
        files = dict(pool.map(download, entries))
    metadata_bytes = fetch('https://fonts.google.com/metadata/fonts')
    metadata = json.loads(metadata_bytes[metadata_bytes.index(b'{'):])
    fonts = catalog(metadata, licenses, commit)
    routes, records = {}, []
    for path in sorted(files):
        if not path.endswith('/content.md'): continue
        base = Path(path).parent
        kind = 'Glossary' if path.startswith('glossary/') else 'Lesson'
        meta_path = (base/('term.textproto' if kind=='Glossary' else 'lesson.textproto')).as_posix()
        if meta_path not in files: raise ValueError('Missing article metadata: '+path)
        meta = files[meta_path].read_text()
        url_key = ('/glossary/' if kind=='Glossary' else '/lesson/')+base.name
        ident = ('glossary-' if kind=='Glossary' else '')+base.name.replace('_','-')
        routes[url_key] = ident
        records.append((path,base,kind,meta,url_key,ident))
    if len(records)<200: raise ValueError('Unexpectedly small Knowledge snapshot')
    asset_paths = {p for p in files if Path(p).suffix.lower() in ['.svg','.png','.jpg','.jpeg','.gif','.webp','.mp4','.webm']}
    # Generate everything in a staging directory. Failed refreshes leave the site untouched.
    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        stage=Path(tmp); articles=stage/'articles'; articles.mkdir()
        for p in asset_paths:
            dest=articles/'media'/p; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(files[p],dest)
        (articles/'LICENSE.txt').write_bytes(license_text)
        (articles/'SOURCE-NOTICE.md').write_text(files['README.md'].read_text()+'\nSource snapshot: '+commit+'\nRendered and restyled by Open Shelf; links and media paths adapted. Article text, captions and credits retained.\n')
        shutil.copyfile(files['contributors.textproto'],articles/'contributors.textproto')
        index=[]
        for path,base,kind,meta,key,ident in records:
            title=field(meta,'name',human(base.name))
            authors=fields(meta,'authors') or ['Google Fonts Knowledge contributors']
            reviewers=fields(meta,'reviewers')
            original='https://fonts.google.com/knowledge'+key
            source=f'https://github.com/google/fonts/blob/{commit}/cc-by-sa/knowledge/{path}'
            credit=f'<div class="article-credit"><p>By {html.escape(", ".join(authors))} · Google Fonts Knowledge.</p>'
            if reviewers: credit+='<p>Reviewed by '+html.escape(', '.join(reviewers))+'.</p>'
            credit+=f'<p><a href="{original}">Original article</a> · <a href="{source}">Source on GitHub</a> · <a href="{LICENSE}" rel="license">CC BY-SA 4.0</a>. Text, illustrations and existing credits reproduced from the licensed Knowledge repository. Open Shelf adapted the layout and links; these adaptations are also CC BY-SA 4.0. No endorsement implied.</p></div>'
            content=render_content(files[path].read_text(),base,routes,asset_paths)
            related=fields(meta,'related_content_urls')
            if related: content+='<h2>Related content from the original article</h2><ul>'+''.join(f'<li><a href="{html.escape(u,quote=True)}">{html.escape(u)}</a></li>' for u in related if u.startswith('https://'))+'</ul>'
            dest=articles/ident; dest.mkdir();(dest/'index.html').write_text(page(title,content,credit,ident,now))
            # Preserve the licensed original text and metadata, including attribution fields.
            (dest/'source.md').write_bytes(files[path].read_bytes());(dest/'credits.textproto').write_text(meta)
            thumb=next((p for p in asset_paths if p.startswith(base.as_posix()+'/images/thumbnail.')),None)
            index.append(dict(title=title,slug=ident,kind=kind,topic=human(base.parts[1]) if kind=='Lesson' else 'Typography terms',authors=authors,excerpt=field(meta,'excerpt'),url='articles/'+ident+'/',image='articles/media/'+urllib.parse.quote(thumb,safe='/') if thumb else '',original=original))
        data=stage/'data';data.mkdir()
        cat={'updatedAt':now,'sourceCommit':commit,'fonts':fonts}
        (data/'catalog.json').write_text(json.dumps(cat,ensure_ascii=False,separators=(',',':'))+'\n')
        (data/'catalog.js').write_text(js('OPEN_SHELF_CATALOG',cat))
        knowledge={'updatedAt':now,'sourceCommit':commit,'articles':index}
        (data/'knowledge.js').write_text(js('OPEN_SHELF_KNOWLEDGE',knowledge))
        # Replacement happens only after all upstream files and generated pages pass validation.
        if (ROOT/'articles').exists(): shutil.rmtree(ROOT/'articles')
        shutil.move(str(articles),ROOT/'articles')
        for p in data.iterdir(): shutil.copyfile(p,ROOT/'data'/p.name)
        (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+SITE+'</loc><lastmod>'+now+'</lastmod></url>'+''.join('<url><loc>'+SITE+a['url']+'</loc><lastmod>'+now+'</lastmod></url>' for a in index)+'</urlset>\n')
    print(f'Synced {len(fonts)} fonts, {len(index)} articles, {len(asset_paths)} media files at {commit}')

if __name__=='__main__': main()
