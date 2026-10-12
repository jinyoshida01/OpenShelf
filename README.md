# OpenShelf

A public library of 2,065 open-source font families (1,950 from Google Fonts and 115 additional families from Fontsource), a pairing workbench, private local font collections and a desktop font manager for macOS and Windows (preview). Published at https://jinyoshida01.github.io/OpenShelf/.

- Preview text, weights and styles; search and filter the public catalog, including by source.
- Manage saved fonts and pairings on the Collections page or in the side panel; both share the same browser-local data, import/export, sharing and embed controls.
- Collection specimens can use font names, shared page text or custom text saved per collection. Preview settings persist locally and travel with collection exports.
- Menus, panels and page changes use short transitions; likes and saves provide animated feedback. Reduced-motion device preferences are respected.
- On phones, a labelled Menu button shows all six pages in a two-column layout, with the current page highlighted.
- List view or automatic / one-to-six-column grids (adapted for small screens).
- Pairing recommendations with linked design references, community discussions and clearly labelled award-inspired interpretations.
- Import TTF, OTF, WOFF and WOFF2 files into a private Local Fonts library. Edit names, descriptions, designers, foundries, categories, uses, feelings, tags and licence notes. Files persist in IndexedDB on the same browser and origin. Export collection saves all files and metadata in one JSON file. Import collection restores it in another browser or on another device; nothing is uploaded.
- Google Fonts Knowledge: a searchable directory of 85 lessons and 185 glossary entries, linking directly to Google Fonts. Cards include credited excerpts and thumbnails.

## Run locally

Serve this folder over HTTP, for example `python3 -m http.server 8765`, and open http://localhost:8765. The file importer needs a secure context (localhost or HTTPS). Public previews contact Google Fonts or versioned Fontsource files on jsDelivr; imported fonts are loaded from browser storage.

## Refresh content

Run `python3 scripts/sync.py` with Python 3.9 or newer. No third-party Python packages are required.

The sync reads the current Google Fonts open-source metadata and pins the Google Fonts GitHub content to a single commit. It uses metadata and thumbnails from the explicitly licensed `cc-by-sa/knowledge` subtree to build an article directory. Full articles remain on Google Fonts. Every downloaded file is checked against its Git blob hash. An upstream licence change, incomplete catalog, missing asset or large catalog drop fails the refresh. Staging keeps the existing site unchanged if fetching or directory generation fails.

Additional Fontsource families are taken from the `other` catalog in `fontsource/font-files`, pinned to one repository commit. The sync checks each actual licence file, a version-pinned stylesheet and a font binary before including it. Unknown licences are left out for review. Google Fonts families are not reintroduced from Fontsource if Google has removed them. Additional catalog drops above 10% also stop the refresh.

Removed fonts disappear on the next successful refresh. Confirmed missing stylesheet responses hide a family from search, recommendations and selectors for that visit; Retry loading clears that state. Preview requests are limited to four families at once and deduplicated. Timeouts, network errors and server failures keep catalog entries visible and can be retried. A failed requested style is retried using the regular style before excluding the family. Fonts are not permanently marked unavailable because of a visitor's network problem.

The `Publish OpenShelf` GitHub Actions workflow refreshes content weekly on Monday at 03:23 UTC and supports manual runs. It validates, commits the snapshot using `Content: Refresh fonts and Knowledge links`, and deploys the resulting artifact to GitHub Pages. Normal pushes deploy the checked-in snapshot. In repository Settings → Pages, set Source to **GitHub Actions**. The workflow uses only the repository's built-in token, with separate build and deployment permissions. Failed refreshes leave the last deployment live and show a failed Actions run. GitHub can disable scheduled workflows after 60 days without repository activity; re-enable from Actions if necessary. No external service or paid subscription is required.

## Licensing and attribution

Font software retains each project's own licence. The catalog links to its source; when a source folder cannot be resolved, it explicitly directs readers to the Google Fonts licence rather than guessing.

Google Fonts Knowledge excerpts and thumbnails are licensed under **Creative Commons Attribution-ShareAlike 4.0 International**, as declared in https://github.com/google/fonts/tree/main/cc-by-sa. The licence is reproduced in `knowledge-assets/LICENSE.txt`. Each card names its authors and links to the original Google Fonts article. The directory links to the licence and GitHub source. Original attribution metadata, including reviewers, is preserved in `knowledge-assets/credits/`; the contributor directory is at `knowledge-assets/contributors.textproto`.

Thumbnails are scaled for display; original asset files and excerpts are unchanged. OpenShelf's Knowledge directory layout and adaptations are also available under CC BY-SA 4.0. Article bodies are not copied. There is no Google endorsement or affiliation. Pairing notes are original editorial comments with references; they do not reproduce external articles or screenshots. Award-inspired pairings are suggestions, not assertions of the exact typefaces used by the award winner.

## Checks

```
python -m unittest discover -s scripts -p 'test_*.py'
node scripts/test-loading.cjs
node --check app.js
node --check local-fonts.js
node --check knowledge.js
```

The checks cover external article destinations, thumbnail availability and attribution files, catalog membership, additional-source licence checks, version-pinned asset links and font-load failure handling. Browser checks cover search, grid selection, pairing controls, imported file validation, metadata persistence and collection export/import.


## Desktop preview: macOS and Windows

The website stays on GitHub Pages. The Tauri application bundles the same interface and catalog, using the system web engine instead of shipping a separate browser. GitHub Releases hosts installers, signed update packages and `latest.json`; GitHub Pages alone cannot activate system fonts or install application updates.

- Download original TTF/OTF families inside the app, including their licence notices. The current desktop index contains 2,053 downloadable families. Families without suitable files have no download button.
- Enable or disable downloaded families and saved collections. A font remains enabled while any enabled collection or individual toggle needs it. Fonts are available to other applications while OpenShelf is running, are unregistered on normal exit, and restore on next launch. Existing applications may need to reopen their font picker.
- Browse offline with only downloaded or OS-installed catalog fonts. Local Fonts also lists other installed fonts. Imported/downloaded previews work without system activation. Offline mode persists across launches and disables downloads, external links and update checks.
- Import TTF/OTF files and edit description, category, designer and tags. Export writes the files, licence notices and metadata to a chosen folder. Native exported metadata restoration is not implemented yet; individual exported font files can be imported. Browser Local Fonts retains its existing JSON backup/restore.
- Fonts installed outside OpenShelf are read-only. The app never removes or changes system fonts. Downloaded/imported files and activation settings stay in the app's local data directory. Browser collections and local font files are separate from desktop storage; use the website's collection export/import to transfer saved public families.
- Previews load when visible, files download sequentially, local results are paged, and there is no background catalog polling. The bundled catalog refreshes with an app release. Fontsource downloads use the stated subset; Google Fonts downloads use original upstream files.

Build prerequisites: Node.js, Rust, the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) for the platform, and WebView2 on Windows. Run:

```sh
npm ci
npm run desktop:build
```

For development, run `npm run desktop:prepare` then `npm run desktop:dev`. To refresh the desktop download index after a catalog refresh, run `python3 scripts/desktop/catalog.py`. Build configuration lives in `src-tauri/`. `cargo test --locked --manifest-path src-tauri/Cargo.toml` checks native library rules. The desktop build workflow builds and tests on both macOS and Windows and saves preview installers as workflow artifacts. Windows runtime behavior still needs testing on a Windows machine.

### Signed releases and in-app updates

The local preview is not connected to releases. The Check for updates button explains this until a release public key is included in a build. No release has been published by adding these files.

1. Generate a Tauri updater signing key following the [official updater instructions](https://v2.tauri.app/plugin/updater/). Keep the private key outside the repository. Configure `TAURI_SIGNING_PRIVATE_KEY` and `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` as GitHub environment secrets, and `OPEN_SHELF_UPDATER_PUBLIC_KEY` as an environment variable in `desktop-release`.
2. Configure the Apple Developer ID certificate, password, signing identity and notarization credentials using the `APPLE_*` secrets named in the release workflow. Public macOS distribution needs signing and notarization. The local preview is not notarized.
3. Configure Windows code signing before public distribution if a trusted publisher installation experience is required. The current Windows preview workflow does not configure Authenticode; updater signatures are a separate requirement and do not remove Windows installation warnings.
4. Increment the version in `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` and `package.json`, update lockfiles, then run **Prepare signed desktop release**. It creates a draft release for Apple silicon, Intel Mac and Windows x64, including signed updater packages and a combined `latest.json`.
5. Test installers and an upgrade from the previous version on both platforms, then review and publish the draft. The app checks the repository's latest release only when requested. Download update & restart verifies its signature before installation.

The end-to-end updater remains unverified until signed releases exist. The first public installer must contain the same public key that verifies subsequent releases. Do not rotate or lose that key without an explicit migration plan.


## Browsing and collection refinements

The public library contains 2,065 open-source families. Google Fonts family-wide tags scoring at least 50 now supplement editorial classifications for 1,907 families; style-specific extremes and quality scores are excluded. The weekly sync refreshes these labels with the pinned catalog. Search matches multiple words across names, designers, classifications, scripts and tags. See the [Google Fonts tagging guide](https://googlefonts.github.io/gf-guide/tags.html).

Collections support list/grid specimens, desktop column counts, per-collection icons and colour markers, plus shared or custom preview text. Settings persist and travel in collection exports. Manually imported fonts appear in search and can be saved to collections; their unverified licence status is labelled. Fonts are never made open-source by importing them. Exported collection references do not upload or embed private font files, and web embed snippets omit them.

UI fonts are bundled WOFF2 assets using private CSS family names, with original licence notices. The outlined SVG wordmark cannot change when specimen fonts load or system fonts are disabled. Font preview failures are hidden without rebuilding the page, preserving the current reading position. Mobile hides desktop column controls and collapses the menu without a final spacing jump. The native status bar appears above navigation and uses an accessible offline switch.

## Collection controls and desktop status

The list/grid switch and column setting apply to every collection, with matching controls on the page and in the side panel. Colour swatches and icon choices are available from each collection header even while collapsed. A floating Collections button appears when navigation scrolls out of view. Desktop collections offer batch downloads and an animated enable switch, with separate green downloaded and enabled indicators. Fonts required by another enabled collection or an individual toggle remain enabled. Online/offline changes keep the switch mounted and animate the library transition.

Branding is OpenShelf. The application identifier and browser storage keys are unchanged so existing local data is retained. The repository and Pages address use `OpenShelf`.

Collection folders and shared preview settings start collapsed. New grid preferences default to two columns; existing explicit preferences are retained. Local Fonts supports list and grid layouts. The desktop All local fonts switch controls downloaded and imported files only; disabling all also releases enabled collection groups. Activation refreshes controls in place without rerouting or animating the page. Download buttons use labelled icons and occupy the same position as their replacement activation switches. Offline mode is automatic when the operating system reports no connection, and explicit offline mode remains available.
