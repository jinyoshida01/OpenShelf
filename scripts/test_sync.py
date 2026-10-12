import json
import unittest
from urllib.parse import unquote, urlsplit
from sync import ROOT, catalog, fields
from fontsource_catalog import verified_license, NAMES
from font_labels import parse_labels

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

    def test_additional_fonts_have_pinned_sources_and_verified_licences(self):
        google=json.loads((ROOT/'data/catalog.json').read_text())['fonts']
        extra=json.loads((ROOT/'data/fontsource.json').read_text())
        fonts=extra['fonts']
        self.assertGreater(len(fonts),50)
        self.assertEqual(len(google)+len(fonts),len({f['n'].casefold() for f in google+fonts}))
        for f in fonts:
            self.assertEqual(f['source'],'fontsource')
            self.assertIn(f['lic'],NAMES.values())
            self.assertRegex(f['fontsourceVersion'],r'^\d+\.\d+\.\d+$')
            self.assertIn('/'+extra['sourceCommit']+'/',f['licenseUrl'])
            self.assertTrue(f['licenseUrl'].endswith('/LICENSE'))
            self.assertTrue(f['w'])

    def test_family_labels_ignore_weight_specific_low_score_and_quality_tags(self):
        baseline = '\n'.join(f'Font {i},,/Sans/Geometric,100' for i in range(1000))
        rows = '\n'.join([
            'Example,,/Expressive/Calm,75',
            'Example,,/Purpose/Easy Reading,50',
            'Example,900,/Expressive/Loud,100',
            'Example,,/Expressive/Playful,49',
            'Example,,/Quality/Good,100',
            'Example,,/Theme/Unusual Style,80',
        ])
        labels = parse_labels(baseline+'\n'+rows)['Example']
        self.assertEqual(labels['t'], ['minimal'])
        self.assertEqual(labels['u'], ['body','longform'])
        self.assertIn('Theme Unusual Style', labels['keywords'])
        self.assertFalse(any('Quality' in k for k in labels['keywords']))
        with self.assertRaises(ValueError): parse_labels(rows)

    def test_unknown_licences_are_excluded(self):
        self.assertIsNone(verified_license('Free for personal use only'))
        self.assertIsNone(verified_license('All rights reserved'))
        self.assertEqual(verified_license('SIL OPEN FONT LICENSE Version 1.1'),'OFL-1.1')
        self.assertEqual(verified_license('Apache License Version 2.0'),'Apache-2.0')
        self.assertEqual(verified_license('Creative Commons CC0 1.0 Universal'),'CC0-1.0')

if __name__=='__main__':unittest.main()
