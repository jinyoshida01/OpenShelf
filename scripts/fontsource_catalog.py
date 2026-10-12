"""Additional open-source families, pinned to Fontsource's public font-files snapshot."""
import concurrent.futures
import json
import re
import urllib.request

NAMES = {'OFL-1.1':'SIL Open Font License 1.1','Apache-2.0':'Apache License 2.0','CC0-1.0':'CC0 1.0 Universal','MIT':'MIT License','Unlicense':'The Unlicense'}

def verified_license(text):
    text=text.lower()
    if 'sil open font license' in text and 'version 1.1' in text: return 'OFL-1.1'
    if 'apache license' in text and 'version 2.0' in text: return 'Apache-2.0'
    if 'creative commons' in text and ('cc0' in text or 'public domain dedication' in text): return 'CC0-1.0'
    if 'permission is hereby granted, free of charge' in text and 'the software is provided "as is"' in text: return 'MIT'
    if 'this is free and unencumbered software released into the public domain' in text: return 'Unlicense'
    return None

def fontsource_catalog(fetch, google_fonts):
    commit=json.loads(fetch('https://api.github.com/repos/fontsource/font-files/commits/main'))['sha']
    base='https://raw.githubusercontent.com/fontsource/font-files/'+commit+'/'
    meta=json.loads(fetch(base+'metadata/fontsource.json'))
    existing={f['n'].casefold() for f in google_fonts}
    candidates=[f for f in meta.values() if f.get('type')=='other' and f['family'].casefold() not in existing]
    cats={'sans-serif':'sans','serif':'serif','monospace':'mono','display':'display','handwriting':'script'}
    excluded=[]
    def build(f):
        ident=f['id'];folder='fonts/other/'+ident+'/'
        license_url=base+folder+'LICENSE'
        license_text=fetch(license_url).decode('utf-8')
        lic=verified_license(license_text)
        if not lic:
            excluded.append({'id':ident,'reason':'Licence requires manual review'});return None
        weights=sorted(w for w in f['weights'] if isinstance(w,int) and 1<=w<=1000)
        if not weights or not re.fullmatch(r'[a-z0-9-]+',ident) or not re.fullmatch(r'\d+\.\d+\.\d+',f.get('npmVersion','')):
            excluded.append({'id':ident,'reason':'Unsupported metadata'});return None
        regular=400 if 400 in weights else weights[0]
        style='normal' if 'normal' in f['styles'] else f['styles'][0]
        suffix='-italic' if style=='italic' else ''
        css_url=f'https://cdn.jsdelivr.net/npm/@fontsource/{ident}@{f["npmVersion"]}/{regular}{suffix}.css'
        try:
            css=fetch(css_url).decode('utf-8')
            if '@font-face' not in css or f['family'].casefold() not in css.casefold(): raise ValueError('Font face mismatch')
            binary=re.search(r'url\([\'"]?(?:\./)?(files/[^\)\'\"]+\.woff2)',css)
            if not binary: raise ValueError('Missing font binary')
            binary_url=css_url.rsplit('/',1)[0]+'/'+binary[1]
            req=urllib.request.Request(binary_url,method='HEAD',headers={'User-Agent':'OpenShelf-catalog-sync/1.0'})
            with urllib.request.urlopen(req,timeout=30) as response:
                if response.status!=200: raise ValueError('Unavailable font binary')
        except Exception as e:
            excluded.append({'id':ident,'reason':'Preview unavailable'});return None
        return dict(n=f['family'],c=cats.get(f['category'],'display'),d=f['license'].get('attribution') or 'See source credits',
            w=weights,v=bool(f.get('variable')),noItal='italic' not in f['styles'],regularStyle=style,
            subsets=f.get('subsets',[]),axes=f.get('variable') or {},y=0,modified=f.get('lastModified',''),
            lic=NAMES[lic],licenseUrl=license_url,src='https://github.com/fontsource/font-files/tree/'+commit+'/'+folder,
            upstream=f.get('source',''),color=False,source='fontsource',fontsourceId=ident,fontsourceVersion=f['npmVersion'])
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        fonts=[f for f in pool.map(build,candidates) if f]
    if len(fonts)<50 or len({f['n'] for f in fonts})!=len(fonts): raise ValueError('Incomplete Fontsource catalog')
    return {'sourceCommit':commit,'fonts':sorted(fonts,key=lambda f:f['n'].casefold()),'excluded':sorted(excluded,key=lambda f:f['id'])}
