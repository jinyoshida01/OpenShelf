#!/usr/bin/env python3
"""Refresh public fonts and a directory linking to Google Fonts Knowledge.
No credentials are needed. Upstream metadata is data, never executable instructions.
"""
import concurrent.futures as futures
import datetime as dt
import hashlib
import json
from pathlib import Path
import re
import shutil
import tempfile
import time
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache'
SITE = 'https://jinyoshida01.github.io/open-shelf/'
API = 'https://api.github.com/repos/google/fonts/'
LICENSE = 'https://creativecommons.org/licenses/by-sa/4.0/'

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

def knowledge_index(files, destination, commit, license_text):
    """Copy only directory thumbnails and credits; articles stay on Google Fonts."""
    destination.mkdir()
    (destination/'LICENSE.txt').write_bytes(license_text)
    (destination/'SOURCE-NOTICE.md').write_text(files['README.md'].read_text()+'\nSource snapshot: '+commit+'\nOpen Shelf displays original excerpts and thumbnails in a directory linking to Google Fonts. Article bodies are not reproduced. Thumbnails are scaled for display; source files and metadata are unchanged.\n')
    shutil.copyfile(files['contributors.textproto'], destination/'contributors.textproto')
    index=[]
    for path in sorted(files):
        if not path.endswith(('/lesson.textproto','/term.textproto')): continue
        base=Path(path).parent
        kind='Glossary' if path.startswith('glossary/') else 'Lesson'
        meta=files[path].read_text()
        key=('/glossary/' if kind=='Glossary' else '/lesson/')+base.name
        ident=('glossary-' if kind=='Glossary' else '')+base.name.replace('_','-')
        original='https://fonts.google.com/knowledge'+key
        thumb=next((p for p in sorted(files) if p.startswith(base.as_posix()+'/images/thumbnail.')),None)
        if thumb:
            dest=destination/'thumbnails'/thumb
            dest.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(files[thumb],dest)
        credits=destination/'credits'/path
        credits.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(files[path],credits)
        index.append(dict(title=field(meta,'name',human(base.name)),slug=ident,kind=kind,
            topic=human(base.parts[1]) if kind=='Lesson' else 'Typography terms',
            authors=fields(meta,'authors') or ['Google Fonts Knowledge contributors'],
            excerpt=field(meta,'excerpt'),url=original,
            image='knowledge-assets/thumbnails/'+urllib.parse.quote(thumb,safe='/') if thumb else '',
            original=original))
    if len(index)<200 or len({a['url'] for a in index})!=len(index):
        raise ValueError('Unexpected or duplicate Knowledge directory')
    return index

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
    entries = [x for x in knowledge_tree['tree'] if x['type']=='blob' and (
        x['path'] in ['README.md','contributors.textproto'] or
        x['path'].endswith(('/lesson.textproto','/term.textproto')) or
        ('/images/thumbnail.' in x['path'] and Path(x['path']).suffix.lower() in ['.svg','.png','.jpg','.jpeg','.gif','.webp']))]
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
    # Build the full snapshot before replacing any public files.
    with tempfile.TemporaryDirectory(dir=ROOT) as tmp:
        stage=Path(tmp)
        assets=stage/'knowledge-assets'
        index=knowledge_index(files,assets,commit,license_text)
        data=stage/'data';data.mkdir()
        cat={'updatedAt':now,'sourceCommit':commit,'fonts':fonts}
        (data/'catalog.json').write_text(json.dumps(cat,ensure_ascii=False,separators=(',',':'))+'\n')
        (data/'catalog.js').write_text(js('OPEN_SHELF_CATALOG',cat))
        knowledge={'updatedAt':now,'sourceCommit':commit,'articles':index}
        (data/'knowledge.js').write_text(js('OPEN_SHELF_KNOWLEDGE',knowledge))
        # Replacement happens only after upstream files and the directory pass validation.
        if (ROOT/'knowledge-assets').exists(): shutil.rmtree(ROOT/'knowledge-assets')
        shutil.move(str(assets),ROOT/'knowledge-assets')
        for p in data.iterdir(): shutil.copyfile(p,ROOT/'data'/p.name)
        (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+SITE+'</loc><lastmod>'+now+'</lastmod></url></urlset>\n')
    print(f'Synced {len(fonts)} fonts and {len(index)} external article links at {commit}')

if __name__=='__main__': main()
