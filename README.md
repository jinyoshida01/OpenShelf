# Open Shelf

A public library of 1,950 open-source font families, a pairing workbench and a browser-local font collection. Published at https://jinyoshida01.github.io/open-shelf/.

- Preview text, weights and styles; search and filter the public catalog.
- List view or automatic / one-to-six-column grids (adapted for small screens).
- Pairing recommendations with linked design references, community discussions and clearly labelled award-inspired interpretations.
- Import TTF, OTF, WOFF and WOFF2 files into a private Local Fonts library. Edit names, descriptions, designers, foundries, categories, uses, feelings, tags and licence notes. Files persist in IndexedDB on the same browser and origin. Export collection saves all files and metadata in one JSON file. Import collection restores it in another browser or on another device; nothing is uploaded.
- Google Fonts Knowledge: a searchable directory of 85 lessons and 185 glossary entries, linking directly to Google Fonts. Cards include credited excerpts and thumbnails.

## Run locally

Serve this folder over HTTP, for example `python3 -m http.server 8765`, and open http://localhost:8765. The file importer needs a secure context (localhost or HTTPS). Public previews contact Google Fonts; imported fonts are loaded from browser storage.

## Refresh content

Run `python3 scripts/sync.py` with Python 3.9 or newer. No third-party Python packages are required.

The sync reads the current Google Fonts open-source metadata and pins the Google Fonts GitHub content to a single commit. It uses metadata and thumbnails from the explicitly licensed `cc-by-sa/knowledge` subtree to build an article directory. Full articles remain on Google Fonts. Every downloaded file is checked against its Git blob hash. An upstream licence change, incomplete catalog, missing asset or large catalog drop fails the refresh. Staging keeps the existing site unchanged if fetching or directory generation fails.

Removed fonts disappear on the next successful refresh. Preview failures hide a family from search, recommendations and selectors for that visit; Retry loading clears that temporary state. A failed requested style is retried using the regular style before excluding the family. Fonts are not permanently marked unavailable because of a visitor's network problem.

The `Publish Open Shelf` GitHub Actions workflow refreshes content weekly on Monday at 03:23 UTC and supports manual runs. It validates, commits the snapshot using `Content: Refresh fonts and Knowledge links`, and deploys the resulting artifact to GitHub Pages. Normal pushes deploy the checked-in snapshot. In repository Settings → Pages, set Source to **GitHub Actions**. The workflow uses only the repository's built-in token, with separate build and deployment permissions. Failed refreshes leave the last deployment live and show a failed Actions run. GitHub can disable scheduled workflows after 60 days without repository activity; re-enable from Actions if necessary. No external service or paid subscription is required.

## Licensing and attribution

Font software retains each project's own licence. The catalog links to its source; when a source folder cannot be resolved, it explicitly directs readers to the Google Fonts licence rather than guessing.

Google Fonts Knowledge excerpts and thumbnails are licensed under **Creative Commons Attribution-ShareAlike 4.0 International**, as declared in https://github.com/google/fonts/tree/main/cc-by-sa. The licence is reproduced in `knowledge-assets/LICENSE.txt`. Each card names its authors and links to the original Google Fonts article. The directory links to the licence and GitHub source. Original attribution metadata, including reviewers, is preserved in `knowledge-assets/credits/`; the contributor directory is at `knowledge-assets/contributors.textproto`.

Thumbnails are scaled for display; original asset files and excerpts are unchanged. Open Shelf's Knowledge directory layout and adaptations are also available under CC BY-SA 4.0. Article bodies are not copied. There is no Google endorsement or affiliation. Pairing notes are original editorial comments with references; they do not reproduce external articles or screenshots. Award-inspired pairings are suggestions, not assertions of the exact typefaces used by the award winner.

## Checks

```
python -m unittest discover -s scripts -p 'test_*.py'
node scripts/test-loading.cjs
node --check app.js
node --check local-fonts.js
node --check knowledge.js
```

The checks cover external article destinations, thumbnail availability and attribution files, catalog membership and font-load failure handling. Browser checks cover search, grid selection, pairing controls, imported file validation, metadata persistence and collection export/import.
