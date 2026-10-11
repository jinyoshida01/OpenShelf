import json
import unittest
from urllib.parse import unquote, urlsplit
from sync import ROOT, catalog, fields

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

    def test_knowledge_links_to_google_with_licensed_thumbnails(self):
        raw=(ROOT/'data/knowledge.js').read_text()
        articles=json.loads(raw.split(' = ',1)[1].removesuffix(';\n'))['articles']
        self.assertGreaterEqual(len(articles),200)
        self.assertEqual(len(articles),len({a['url'] for a in articles}))
        for article in articles:
            url=urlsplit(article['url'])
            self.assertEqual(url.scheme,'https')
            self.assertEqual(url.netloc,'fonts.google.com')
            self.assertRegex(url.path,r'^/knowledge/(lesson|glossary)/[a-z0-9_]+$')
            self.assertEqual(article['url'],article['original'])
            self.assertTrue(article['authors'])
            if article['image']:
                self.assertTrue(article['image'].startswith('knowledge-assets/thumbnails/'))
                self.assertTrue((ROOT/unquote(article['image'])).is_file(),article['image'])
        self.assertTrue((ROOT/'knowledge-assets/LICENSE.txt').is_file())
        self.assertTrue((ROOT/'knowledge-assets/SOURCE-NOTICE.md').is_file())
        self.assertEqual(len(list((ROOT/'knowledge-assets/credits').rglob('*.textproto'))),len(articles))
        self.assertFalse((ROOT/'articles').exists(),'Article bodies should remain at their original source')

    def test_unique_catalog_and_styles(self):
        data=json.loads((ROOT/'data/catalog.json').read_text());fonts=data['fonts']
        self.assertGreaterEqual(len(fonts),1900)
        self.assertEqual(len(fonts),len({f['n'] for f in fonts}))
        self.assertTrue(all(f['w'] and all(1<=w<=1000 for w in f['w']) for f in fonts))

if __name__=='__main__':unittest.main()
