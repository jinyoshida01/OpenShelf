# Open Shelf

A public library of 1,950 open-source font families, a pairing workbench and a browser-local font collection. Published at https://jinyoshida01.github.io/open-shelf/.

- Preview text, weights and styles; search and filter the public catalog.
- List view or automatic / one-to-six-column grids (adapted for small screens).
- Pairing recommendations with linked design references, community discussions and clearly labelled award-inspired interpretations.
- Import TTF, OTF, WOFF and WOFF2 files into a private Local Fonts library. Edit names, descriptions, designers, foundries, categories, uses, feelings, tags and licence notes. Files persist in IndexedDB on the same browser and origin. Backups include files and metadata; nothing is uploaded.
- Google Fonts Knowledge: 85 lessons and 185 glossary entries, with original illustrations, captions, author/reviewer credits and source links.

## Run locally

Serve this folder over HTTP, for example `python3 -m http.server 8765`, and open http://localhost:8765. The file importer needs a secure context (localhost or HTTPS). Public previews contact Google Fonts; imported fonts are loaded from browser storage.

## Refresh content

Install Python dependencies with `pip install -r scripts/requirements.txt`, then run `python scripts/sync.py`.

The sync reads the current Google Fonts open-source metadata and pins the Google Fonts GitHub content to a single commit. It only reproduces the explicitly licensed `cc-by-sa/knowledge` subtree. Every downloaded file is checked against its Git blob hash. An upstream licence change, incomplete catalog, missing asset or large catalog drop fails the refresh. Staging keeps the existing site unchanged if fetching or rendering fails.

Removed fonts disappear on the next successful refresh. Preview failures hide a family from search, recommendations and selectors for that visit; Retry loading clears that temporary state. A failed requested style is retried using the regular style before excluding the family. Fonts are not permanently marked unavailable because of a visitor's network problem.

The `Publish Open Shelf` GitHub Actions workflow refreshes content weekly on Monday at 03:23 UTC and supports manual runs. It validates, commits the snapshot using `Content: Refresh fonts and Knowledge articles`, and deploys the resulting artifact to GitHub Pages. Normal pushes deploy the checked-in snapshot. In repository Settings → Pages, set Source to **GitHub Actions**. The workflow uses only the repository's built-in token, with separate build and deployment permissions. Failed refreshes leave the last deployment live and show a failed Actions run. GitHub can disable scheduled workflows after 60 days without repository activity; re-enable from Actions if necessary. No external service or paid subscription is required.

## Licensing and attribution

Font software retains each project's own licence. The catalog links to its source; when a source folder cannot be resolved, it explicitly directs readers to the Google Fonts licence rather than guessing.

Google Fonts Knowledge text and illustrations are licensed under **Creative Commons Attribution-ShareAlike 4.0 International**, as declared in https://github.com/google/fonts/tree/main/cc-by-sa. The licence is reproduced in `articles/LICENSE.txt`. Article pages retain authors, reviewers, captions, image credits and original source links. Original Markdown and metadata accompany each page. The contributor directory is at `articles/contributors.textproto`.

Open Shelf's Knowledge layout, rendering and link adaptations are also made available under CC BY-SA 4.0. Adaptations are identified on every article. Original third-party credits and links are retained; external interactive material is linked, not copied. There is no Google endorsement or affiliation. Pairing notes outside the Knowledge articles are original editorial comments with references; they do not reproduce external articles or screenshots. Award-inspired pairings are suggestions, not assertions of the exact typefaces used by the award winner.

## Checks

```
python -m unittest discover -s scripts -p 'test_*.py'
node scripts/test-loading.cjs
node --check app.js
node --check local-fonts.js
node --check knowledge.js
```

The checks cover content sanitization, Markdown figures, local article links/assets, catalog membership and font-load failure handling. Browser checks cover search, grid selection, pairing controls, imported file validation, metadata persistence and article rendering.
