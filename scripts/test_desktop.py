import json, unittest
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parent.parent
class DesktopTests(unittest.TestCase):
    def test_download_index_is_pinned_and_has_licences(self):
        data=json.loads((ROOT/'data/desktop-fonts.json').read_text())
        self.assertGreater(len(data),1800)
        for f in data.values():
            self.assertTrue(f['licences'])
            self.assertTrue(f['files'])
            for a in f['licences']+f['files']:
                u=urlsplit(a['url'])
                self.assertEqual(u.scheme,'https')
                self.assertIn(u.netloc,('raw.githubusercontent.com','cdn.jsdelivr.net'))
                self.assertNotIn('..',a['name'])
                self.assertNotIn('/',a['name'])
                if u.netloc=='raw.githubusercontent.com':self.assertRegex(u.path.split('/')[3],r'^[a-f0-9]{40}$')
                else:self.assertRegex(a['url'],r'@\d+\.\d+\.\d+/')
    def test_desktop_has_local_assets_and_scoped_font_access(self):
        c=json.loads((ROOT/'src-tauri/tauri.conf.json').read_text())
        self.assertEqual(c['app']['security']['assetProtocol']['scope'],['$APPLOCALDATA/fonts/**'])
        self.assertTrue(c['plugins']['updater']['requireSignedVersion'])
        self.assertNotIn('devUrl',c['build'])
        html=(ROOT/'index.html').read_text()
        self.assertLess(html.index('desktop.js'),html.index('app.js'))
if __name__=='__main__':unittest.main()
