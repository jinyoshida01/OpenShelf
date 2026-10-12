"""Conservative mappings of scored Google Fonts tags to OpenShelf filters."""
import csv, io
FEEL={'Business':'corporate','Calm':'minimal','Fancy':'luxury','Sophisticated':'elegant','Vintage':'retro','Loud':'bold','Playful':'playful','Cute':'friendly','Happy':'friendly','Futuristic':'technical','Innovative':'modern','Awkward':'quirky'}
STRUCT={'Sans/Geometric':'sans:geometric','Sans/Grotesque':'sans:grotesque','Sans/Neo Grotesque':'sans:neo','Sans/Humanist':'sans:humanist','Sans/Rounded':'sans:rounded','Sans/Superellipse':'sans:square','Serif/Didone':'serif:didone','Serif/Fat Face':'serif:fatface','Serif/Humanist Venetian':'serif:humanist','Serif/Old Style Garalde':'serif:oldstyle','Serif/Transitional':'serif:transitional','Slab/Clarendon':'serif:clarendon','Script/Formal':'calli:formal','Script/Handwritten':'calli:handwritten','Script/Informal':'calli:informal','Theme/Brush':'calli:brush'}
APPEAR={'Monospace/Monospace':'mono','Sans/Rounded':'rounded','Theme/Art Deco':'deco','Theme/Blackletter':'blackletter','Theme/Inline':'inline','Theme/Pixel':'pixel','Theme/Shaded':'shaded','Theme/Stencil':'stencil','Theme/Techno':'techno'}
def parse_labels(content):
    result={}
    for row in csv.reader(io.StringIO(content)):
        if len(row)!=4: raise ValueError('Unexpected font tag row')
        name,instance,tag,score=row
        # A weight-specific extreme is not a family-wide classification.
        if instance or float(score)<50 or tag.startswith('/Quality/'): continue
        tag=tag.lstrip('/');r=result.setdefault(name,{'t':set(),'s':set(),'a':set(),'u':set(),'keywords':set()})
        r['keywords'].add(tag.replace('/',' '))
        if tag.startswith('Expressive/') and tag.split('/')[1] in FEEL:r['t'].add(FEEL[tag.split('/')[1]])
        if tag in STRUCT:r['s'].add(STRUCT[tag])
        if tag in APPEAR:r['a'].add(APPEAR[tag])
        if tag.startswith('Slab/'):r['s'].add('serif:slab')
        if tag=='Purpose/Easy Reading':r['u'].update(['body','longform'])
        if tag=='Monospace/Monospace':r['u'].update(['code','data'])
    if len(result)<1000:raise ValueError('Incomplete font label snapshot')
    return {n:{k:sorted(v) for k,v in r.items()} for n,r in result.items()}
