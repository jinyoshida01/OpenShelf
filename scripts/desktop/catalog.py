"""Build a pinned index of installable font files; downloads happen only in the app."""
import json, sys
from pathlib import Path
from urllib.parse import quote
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from sync import ROOT, fetch

def build():
    cat=json.loads((ROOT/'data/catalog.json').read_text())
    extra=json.loads((ROOT/'data/fontsource.json').read_text())
    sha=cat['sourceCommit']
    root=json.loads(fetch(f'https://api.github.com/repos/google/fonts/git/trees/{sha}'))
    files=[]
    for branch in root['tree']:
        if branch['path'] not in ('ofl','apache','ufl'):continue
        cache=ROOT/'.cache'/('desktop-tree-'+branch['sha']+'.json')
        if not cache.exists():cache.write_bytes(fetch('https://api.github.com/repos/google/fonts/git/trees/'+branch['sha']+'?recursive=1'))
        tree=json.loads(cache.read_text())
        if tree.get('truncated'):raise ValueError('Incomplete font tree')
        files.extend(dict(x,path=branch['path']+'/'+x['path']) for x in tree['tree'] if x['type']=='blob')
    groups={}
    for f in files:groups.setdefault(f['path'].rsplit('/',1)[0],[]).append(f)
    out={}
    for f in cat['fonts']:
        prefix='https://github.com/google/fonts/tree/'+sha+'/'
        if not f['src'].startswith(prefix):continue
        folder=f['src'][len(prefix):];entries=groups.get(folder,[])
        fonts=[x for x in entries if x['path'].lower().endswith(('.ttf','.otf'))]
        licences=[x for x in entries if x['path'].rsplit('/',1)[-1].lower() in ('ofl.txt','license.txt','license','ufl.txt')]
        if not fonts or not licences:continue
        def asset(x):return dict(name=x['path'].rsplit('/',1)[-1],url='https://raw.githubusercontent.com/google/fonts/'+sha+'/'+quote(x['path']),hash=x['sha'])
        out[f['n'].lower().replace(' ','-')]=dict(family=f['n'],source='Google Fonts',coverage='Original font files',files=[asset(x) for x in fonts],licences=[asset(x) for x in licences])
    for f in extra['fonts']:
        subset='latin' if 'latin' in f['subsets'] else next(iter(f['subsets']),None)
        if not subset:continue
        ident=f['fontsourceId'];version=f['fontsourceVersion']
        styles=['normal'] if f['regularStyle']=='normal' else ['italic']
        if not f['noItal'] and 'italic' not in styles:styles.append('italic')
        entries=[dict(name=f'{ident}-{w}-{s}.ttf',url=f'https://cdn.jsdelivr.net/fontsource/fonts/{ident}@{version}/{subset}-{w}-{s}.ttf',hash='') for w in f['w'] for s in styles]
        out[f['n'].lower().replace(' ','-')]=dict(family=f['n'],source='Fontsource',coverage=subset+' character set',files=entries,licences=[dict(name='LICENSE.txt',url=f['licenseUrl'],hash='')])
    if len(out)<1800:raise ValueError('Incomplete desktop download index')
    (ROOT/'data/desktop-fonts.json').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':'))+'\n')
    print('Indexed',len(out),'families with installable files and licence notices.')
if __name__=='__main__':build()
