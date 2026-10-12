"""Build local WOFF2 interface fonts and an outlined wordmark from licensed sources.
Requires fonttools[woff]; source files and notices live in assets/ui-fonts.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
root=Path(__file__).resolve().parent.parent
for name in ['dm-sans','instrument-sans']:
    f=TTFont(root/f'assets/ui-fonts/{name}.ttf');f.flavor='woff2';f.save(root/f'assets/ui-fonts/{name}.woff2')
f=instantiateVariableFont(TTFont(root/'assets/ui-fonts/dm-sans.ttf'),{'wght':700,'opsz':24},inplace=True)
glyphs=f.getGlyphSet();cmap=f.getBestCmap();x=0;paths=[]
for c in 'Open Shelf':
    g=glyphs[cmap[ord(c)]];p=SVGPathPen(glyphs);g.draw(p)
    if p.getCommands():paths.append(f'<path transform="translate({x} 0)" d="{p.getCommands()}"/>')
    x+=g.width-22
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x} 1100" fill="currentColor" aria-hidden="true"><g transform="translate(0 850) scale(1 -1)">'+''.join(paths)+'</g></svg>'
(root/'assets/wordmark.svg').write_text(svg+'\n')
p=root/'index.html';s=p.read_text();start=s.index('  <a class="brand"');end=s.index('</a>',start)+4
s=s[:start]+'  <a class="brand" href="#/" aria-label="Open Shelf"><svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="27" r="12.8" fill="none" stroke="currentColor" stroke-width="7"/><rect x="12" y="46" width="40" height="6" rx="3" fill="currentColor"/></svg>'+svg.replace('<svg xmlns=', '<svg class="brand-wordmark" xmlns=')+'</a>'+s[end:]
import re
s=re.sub(r'<link[^>]+(?:fonts.googleapis.com|fonts.gstatic.com)[^>]*>\n?','',s);p.write_text(s)
