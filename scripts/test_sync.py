import json
from pathlib import Path
import re
import unittest
from urllib.parse import unquote, urlsplit
from bs4 import BeautifulSoup
from sync import ROOT, catalog, fields, render_content

class ContentTests(unittest.TestCase):
    def test_catalog_only_open_source_and_removed_disappear(self):
        entries=[dict(family='Font '+str(i),isOpenSource=True,fonts={'400':{},'700i':{}},category='Sans Serif',dateAdded='2020-01-01') for i in range(1950)]
        entries.append(dict(family='Private Font',isOpenSource=False))
        result=catalog({'familyMetadataList':entries},{},'commit')
        self.assertEqual(len(result),1950)
        self.assertNotIn('Inter',[f['n'] for f in result])
        self.assertEqual(result[0]['w'],[400,700])
        self.assertFalse(result[0]['noItal'])
    def test_incomplete_catalog_is_rejected(self):
        with self.assertRaises(ValueError):catalog({'familyMetadataList':[]},{},'commit')
    def test_protobuf_unicode_and_escaped_quotes(self):
        self.assertEqual(fields('authors: "Éva \\"Example\\""','authors'),['Éva "Example"'])
    def test_sanitize_and_rewrite(self):
        text='<script>alert(1)</script><img src="images/a.svg" onerror="alert(1)">\n\n[Term](/glossary/type) [Unsafe](javascript:alert(1))'
        out=render_content(text,Path('lesson'),{'/glossary/type':'glossary-type'},{'lesson/images/a.svg'})
        self.assertNotIn('<script',out);self.assertNotIn('onerror',out);self.assertNotIn('javascript:',out)
        self.assertIn('../glossary-type/',out);self.assertIn('../media/lesson/images/a.svg',out)
    def test_markdown_images_inside_figures(self):
        out=render_content('<figure>\n\n![Caption](images/a.svg)\n\n<figcaption>Credit</figcaption>\n</figure>',Path('lesson'),{}, {'lesson/images/a.svg'})
        self.assertIn('<img',out);self.assertIn('Credit',out);self.assertNotIn('![',out)
    def test_no_missing_local_article_assets_or_pages(self):
        pages=list((ROOT/'articles').glob('*/index.html'))
        self.assertGreaterEqual(len(pages),200)
        for p in pages:
            soup=BeautifulSoup(p.read_text(),'html.parser')
            self.assertIn('CC BY-SA 4.0',soup.get_text())
            self.assertIsNotNone(soup.find('a',href=re.compile('github.com/google/fonts/blob/')))
            self.assertIsNone(soup.find('script'))
            for el in soup.select('[src], a[href], link[href]'):
                v=el.get('src',el.get('href',''))
                if not v or v.startswith('#') or urlsplit(v).scheme:continue
                target=(p.parent/unquote(v.split('#')[0])).resolve()
                self.assertTrue(target.exists(),str(p)+': '+v)
    def test_unique_catalog_and_styles(self):
        data=json.loads((ROOT/'data/catalog.json').read_text());fonts=data['fonts']
        self.assertGreaterEqual(len(fonts),1900)
        self.assertEqual(len(fonts),len({f['n'] for f in fonts}))
        self.assertTrue(all(f['w'] and all(1<=w<=1000 for w in f['w']) for f in fonts))

if __name__=='__main__':unittest.main()
