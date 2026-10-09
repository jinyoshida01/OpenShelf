# Open Shelf: Open Source Font Library

A browsable library of 300 free, open-source typefaces. Type anything to preview it in every font, filter by feeling, appearance, classification and use case, build and randomise font pairings, and save fonts and pairings into collections you can export, import and share.

**Live site:** https://jinyoshida01.github.io/open-shelf/

## Features

- Live preview text across the whole library, with global and per-font weight and italic controls
- Filters for feeling, appearance, serif, sans serif and calligraphy styles, use case and technology, with "match all" or "match any" per section
- Font pages with designer, publisher, licence, weights, sizes, characters, pairings and download links
- Pairing builder with randomiser, locks and adjustments for weight, italic, size, tracking, case and line height
- 34 recommended pairings, labelled by origin
- Collections of fonts and pairings, stored in the browser, with embed code, JSON export and import, and share links

## How it works

The whole site is a single static `index.html` with no build step and no backend. Font previews load from Google Fonts. Collections and settings are stored in the visitor's browser with `localStorage`.

To run it locally, open `index.html` in a browser, or serve the folder with any static server, for example `python3 -m http.server`.

## Fonts and licences

Open Shelf doesn't host or redistribute font files. Every font listed is free and open source: most use the SIL Open Font License 1.1, and a few use the Apache License 2.0 or the Ubuntu Font Licence. Each font page links to the font's source. Check the licence that ships with a font before redistributing it.

Font details, classifications and pairing notes were compiled from public sources and editorial judgement. They are a starting point, not an authority.

## Credits

Made by Jin Yoshida. [GitHub](https://github.com/jinyoshida01) and [portfolio](https://jinyoshida.me).

Thanks to the type designers and foundries who release their work openly, and to Google Fonts and Fontsource.
