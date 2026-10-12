
(async () => {
'use strict';
const desktop=window.OpenShelfDesktop;
if (desktop.enabled) { try { await desktop.ready; } catch(e) { document.querySelector('main').textContent='Could not open the desktop library. '+e; return; } }
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const range = (a, b) => { const o = []; for (let w = a; w <= b; w += 100) o.push(w); return o; };
const GH = 'https://github.com/';
const SOURCES = {google:'Google Fonts',fontsource:'Fontsource',local:'External imports'};
const OFL = 'SIL Open Font License 1.1';

/* ---------- vocabularies ---------- */
const CLS = { sans:'Sans serif', serif:'Serif', slab:'Slab serif', mono:'Monospace', display:'Display', script:'Script' };
const USES = { body:'Body text', headlines:'Headlines', ui:'Interfaces & apps', longform:'Long-form reading', editorial:'Editorial & magazines', branding:'Branding & logos', posters:'Posters & signage', code:'Code & terminals', data:'Data & dashboards', accessibility:'Accessibility', invitations:'Invitations & cards', packaging:'Packaging & labels' };
const THEMES = { corporate:'Business', minimal:'Calm', modern:'Modern', classic:'Classic', elegant:'Sophisticated', luxury:'Fancy', friendly:'Friendly', playful:'Playful', retro:'Vintage', bold:'Loud', technical:'Technical', quirky:'Quirky', geometric:'Geometric', humanist:'Humanist', handmade:'Handmade' };
const FEEL = ['corporate','minimal','modern','classic','elegant','luxury','friendly','playful','retro','bold','technical','quirky'];
const APPEAR = { condensed:'Condensed', wide:'Wide', rounded:'Rounded', 'high-contrast':'High contrast', mono:'Monospace', display:'Display', techno:'Techno', deco:'Art Deco', stencil:'Stencil', pixel:'Pixel', blackletter:'Blackletter', typewriter:'Typewriter', inline:'Inline', shaded:'Shaded' };
const SUBS = {
  'serif:*':'All serifs', 'serif:oldstyle':'Old style', 'serif:transitional':'Transitional', 'serif:didone':'Didone', 'serif:humanist':'Humanist', 'serif:slab':'Slab', 'serif:fatface':'Fat face', 'serif:glyphic':'Glyphic', 'serif:clarendon':'Clarendon',
  'sans:*':'All sans serifs', 'sans:geometric':'Geometric', 'sans:grotesque':'Grotesque', 'sans:neo':'Neo-grotesque', 'sans:humanist':'Humanist', 'sans:rounded':'Rounded', 'sans:square':'Squared',
  'calli:*':'All calligraphy', 'calli:handwritten':'Handwritten', 'calli:informal':'Informal script', 'calli:formal':'Formal script', 'calli:brush':'Brush script'
};
const pick = pre => Object.fromEntries(Object.entries(SUBS).filter(([k]) => k.startsWith(pre)));
const SECTIONS = [
  {id:'source', set:'source', title:'Source', opts:SOURCES},
  {id:'feel', set:'feel', title:'Feeling', opts:Object.fromEntries(FEEL.map(k => [k, THEMES[k]]))},
  {id:'app', set:'app', title:'Appearance', opts:APPEAR},
  {id:'serif', set:'serif', title:'Serif', opts:pick('serif:')},
  {id:'sans', set:'sans', title:'Sans serif', opts:pick('sans:')},
  {id:'calli', set:'calli', title:'Calligraphy', opts:pick('calli:')},
  {id:'use', set:'use', title:'Use case', opts:USES},
  {id:'tech', set:'tech', title:'Technology', opts:{variable:'Variable', color:'Colour font'}}
];
const WNAME = {100:'Thin',200:'ExtraLight',300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold',900:'Black',1000:'ExtraBlack'};
const FALLBACK = { sans:'system-ui, sans-serif', serif:'Georgia, serif', slab:'Georgia, serif', mono:'ui-monospace, Menlo, monospace', display:'system-ui, sans-serif', script:'cursive' };

/* ---------- fonts ----------
   n name, c class, d designer, p publisher, y year, w weights, v variable, u uses, t themes, src source, b description */
const F = [
  {n:'Inter',c:'sans',d:'Rasmus Andersson',p:'Rasmus Andersson (independent)',y:2017,w:range(100,900),v:1,u:['ui','body','data','headlines'],t:['modern','minimal','technical','corporate'],src:GH+'rsms/inter',b:'Built for computer screens, with a tall x-height and OpenType features like tabular figures and contextual alternates. A dependable default for product interfaces.'},
  {n:'Work Sans',c:'sans',d:'Wei Huang',p:'Wei Huang (independent)',y:2015,w:range(100,900),v:1,u:['ui','headlines','body','branding'],t:['modern','friendly','minimal'],src:GH+'weiweihuanghuang/Work-Sans',b:'Loosely based on early grotesques. The middle weights are tuned for screen text, while the extremes come alive at display sizes.'},
  {n:'IBM Plex Sans',c:'sans',d:'Mike Abbink with Bold Monday',p:'IBM',y:2017,w:range(100,700),v:0,u:['ui','body','data','branding'],t:['corporate','technical','modern'],src:GH+'IBM/plex',b:'IBM\u2019s corporate typeface, balancing an engineered, mechanical character with human warmth. Part of a superfamily with serif and mono cuts.'},
  {n:'Source Sans 3',c:'sans',d:'Paul D. Hunt',p:'Adobe',y:2012,w:range(200,900),v:1,u:['ui','body','longform','data'],t:['humanist','minimal','corporate'],src:GH+'adobe-fonts/source-sans',b:'Adobe\u2019s first open-source family: a clear humanist sans drawing on the American gothic tradition.'},
  {n:'Manrope',c:'sans',d:'Mikhail Sharanda',p:'Mikhail Sharanda (independent)',y:2018,w:range(200,800),v:1,u:['ui','branding','headlines'],t:['modern','geometric','technical'],src:GH+'sharanda/manrope',b:'A semi-condensed, semi-geometric sans mixing grotesque structure with rounded details.'},
  {n:'DM Sans',c:'sans',d:'Colophon Foundry',p:'Google (Colophon Foundry)',y:2019,w:range(100,900),v:1,u:['ui','body','branding'],t:['geometric','modern','friendly','minimal'],src:GH+'googlefonts/dm-fonts',b:'A low-contrast geometric sans derived from Poppins and adjusted for smaller text sizes. The wordmark and headings on this site are set in it.'},
  {n:'Space Grotesk',c:'sans',d:'Florian Karsten',p:'Florian Karsten (independent)',y:2018,w:range(300,700),v:1,u:['headlines','branding','ui'],t:['technical','quirky','modern'],src:GH+'floriankarsten/space-grotesk',b:'A proportional version of Colophon\u2019s Space Mono that keeps its idiosyncratic details.'},
  {n:'Poppins',c:'sans',d:'Ninad Kale, Jonny Pinhorn',p:'Indian Type Foundry',y:2014,w:range(100,900),v:0,u:['headlines','ui','branding'],t:['geometric','friendly','modern'],src:null,b:'A geometric sans supporting Latin and Devanagari, with near-monolinear strokes and circular bowls.'},
  {n:'Montserrat',c:'sans',d:'Julieta Ulanovsky',p:'Julieta Ulanovsky (independent)',y:2011,w:range(100,900),v:1,u:['headlines','branding','posters'],t:['geometric','bold','modern'],src:GH+'JulietaUla/Montserrat',b:'Inspired by the old posters and signs of the Montserrat neighbourhood in Buenos Aires. Wide, confident and urban.'},
  {n:'Lato',c:'sans',d:'\u0141ukasz Dziedzic',p:'tyPoland',y:2010,w:[100,300,400,700,900],v:0,u:['body','ui','headlines'],t:['friendly','humanist','corporate'],src:'https://www.latofonts.com',b:'Semi-rounded details give it warmth at body sizes, while its classical structure keeps it stable in headlines.'},
  {n:'Open Sans',c:'sans',d:'Steve Matteson',p:'Ascender / Google',y:2011,w:range(300,800),v:1,u:['body','ui','longform'],t:['humanist','minimal','friendly'],src:GH+'googlefonts/opensans',b:'A neutral humanist sans with open forms, optimised for legibility across print, web and mobile.'},
  {n:'Atkinson Hyperlegible',c:'sans',d:'Applied Design Works',p:'Braille Institute',y:2019,w:[400,700],v:0,u:['accessibility','body','ui'],t:['friendly','humanist'],src:'https://www.brailleinstitute.org/freefont',b:'Designed for readers with low vision. Easily confused letterforms are deliberately exaggerated to stay distinct.'},
  {n:'Nunito',c:'sans',d:'Vernon Adams, Jacques Le Bailly',p:'Cyreal',y:2014,w:range(200,900),v:1,u:['ui','body','branding'],t:['friendly','playful'],src:GH+'googlefonts/nunito',b:'A well-balanced sans with fully rounded terminals. Soft at every size.'},
  {n:'Archivo',c:'sans',d:'H\u00e9ctor Gatti and the Omnibus-Type team',p:'Omnibus-Type',y:2016,w:range(100,900),v:1,u:['headlines','data','posters'],t:['bold','technical','corporate'],src:GH+'Omnibus-Type/Archivo',b:'A grotesque for high-performance typography in print and on screen, with a width axis from condensed to expanded.'},
  {n:'Public Sans',c:'sans',d:'Dan O. Williams and the USWDS team',p:'U.S. Web Design System',y:2019,w:range(100,900),v:1,u:['ui','body','data','accessibility'],t:['minimal','corporate'],src:GH+'uswds/public-sans',b:'A strong, neutral typeface for government interfaces, based on Libre Franklin.'},
  {n:'Outfit',c:'sans',d:'Rodrigo Fuenzalida',p:'Outfit.io',y:2021,w:range(100,900),v:1,u:['branding','headlines','ui'],t:['geometric','modern','minimal'],src:GH+'Outfitio/Outfit-Fonts',b:'A clean geometric sans drawn for a brand-automation platform. Simple shapes that suit logotypes.'},
  {n:'Plus Jakarta Sans',c:'sans',d:'Gumpita Rahayu',p:'Tokotype',y:2020,w:range(200,800),v:1,u:['ui','branding','headlines'],t:['modern','geometric','friendly'],src:GH+'tokotype/PlusJakartaSans',b:'Originally commissioned for Jakarta\u2019s city identity. Modern, slightly condensed, at home in product design.'},
  {n:'Figtree',c:'sans',d:'Erik Kennedy',p:'Erik Kennedy (independent)',y:2022,w:range(300,900),v:1,u:['ui','body','branding'],t:['friendly','geometric','minimal'],src:GH+'erikdkennedy/figtree',b:'A clean, friendly geometric sans made with interfaces in mind.'},
  {n:'Instrument Sans',c:'sans',d:'Rodrigo Fuenzalida, Jordan Egstad',p:'Instrument',y:2023,w:range(400,700),v:1,u:['ui','branding','editorial'],t:['modern','minimal'],src:GH+'Instrument/instrument-sans',b:'A precise neo-grotesque with a width axis, from the Portland studio Instrument. This site\u2019s interface is set in it.'},
  {n:'Barlow',c:'sans',d:'Jeremy Tribby',p:'Jeremy Tribby (independent)',y:2017,w:range(100,900),v:0,u:['ui','posters','data'],t:['technical','minimal'],src:GH+'jpt/barlow',b:'A slightly rounded, low-contrast grotesk inspired by California highway signs and rail typography.'},
  {n:'Karla',c:'sans',d:'Jonny Pinhorn',p:'Jonny Pinhorn (independent)',y:2012,w:range(200,800),v:1,u:['body','ui','editorial'],t:['quirky','friendly'],src:GH+'googlefonts/karla',b:'A grotesque with quirky details that give running text a slightly hand-made feel.'},
  {n:'Rubik',c:'sans',d:'Philipp Hubert, Sebastian Fischer',p:'Hubert & Fischer',y:2015,w:range(300,900),v:1,u:['ui','headlines','branding'],t:['friendly','playful','geometric'],src:null,b:'Slightly rounded corners and a solid stance. Originally drawn for Google\u2019s Chrome Cube Lab project.'},
  {n:'Bricolage Grotesque',c:'sans',d:'Mathieu Triay',p:'Atelier Triay',y:2023,w:range(200,800),v:1,u:['headlines','branding','editorial'],t:['quirky','modern','bold'],src:GH+'ateliertriay/bricolage',b:'A grotesque with French and British flavour and an optical size axis: the larger it gets, the quirkier it becomes.'},
  {n:'Chakra Petch',c:'sans',d:'Cadson Demak',p:'Cadson Demak',y:2018,w:range(300,700),v:0,u:['headlines','branding','ui'],t:['technical','modern'],src:null,b:'A square-shouldered Thai and Latin sans with tapered corners. Suited to tech, gaming and sci-fi.'},
  {n:'Raleway',c:'sans',d:'Matt McInerney, Pablo Impallari, Rodrigo Fuenzalida',p:'Impallari Type',y:2010,w:range(100,900),v:1,u:['headlines','branding','ui'],t:['elegant','geometric','modern'],src:GH+'impallari/Raleway',b:'An elegant display sans, started by Matt McInerney as a single thin weight and expanded into a full family.'},
  {n:'Oswald',c:'sans',d:'Vernon Adams',p:'Vernon Adams (independent)',y:2011,w:range(200,700),v:1,u:['headlines','posters','data'],t:['bold','technical'],src:GH+'googlefonts/OswaldFont',b:'A reworking of the classic \u201cAlternate Gothic\u201d style, re-drawn to fit pixel grids. Condensed and assertive.'},
  {n:'Libre Franklin',c:'sans',d:'Pablo Impallari, Rodrigo Fuenzalida',p:'Impallari Type',y:2015,w:range(100,900),v:1,u:['body','headlines','editorial'],t:['classic','corporate','minimal'],src:GH+'impallari/Libre-Franklin',b:'An interpretation of Morris Fuller Benton\u2019s Franklin Gothic, the American workhorse grotesque.'},
  {n:'Fira Sans',c:'sans',d:'Erik Spiekermann, Ralph du Carrois',p:'Mozilla',y:2013,w:range(100,900),v:0,u:['ui','body','data'],t:['humanist','technical'],src:GH+'mozilla/Fira',b:'Commissioned by Mozilla for Firefox OS. A humanist sans with the clarity of Spiekermann\u2019s signage work.'},
  {n:'Merriweather Sans',c:'sans',d:'Eben Sorkin',p:'Sorkin Type',y:2013,w:range(300,800),v:1,u:['body','ui','longform'],t:['humanist','friendly'],src:GH+'SorkinType/Merriweather',b:'The sans companion to Merriweather, sharing its proportions and sturdy screen-friendly forms.'},
  {n:'PT Sans',c:'sans',d:'Alexandra Korolkova, Olga Umpeleva, Vladimir Yefimov',p:'ParaType',y:2009,w:[400,700],v:0,u:['body','ui','longform'],t:['humanist','corporate'],src:null,b:'Made for the Public Types of Russia project, a humanist sans with Latin and Cyrillic support.'},
  {n:'Alegreya Sans',c:'sans',d:'Juan Pablo del Peral',p:'Huerta Tipogr\u00e1fica',y:2013,w:[100,300,400,500,700,800,900],v:0,u:['body','longform','editorial'],t:['humanist','elegant'],src:null,b:'A humanist sans with calligraphic roots, designed as the companion to Alegreya.'},
  {n:'Proza Libre',c:'sans',d:'Jasper de Waard',p:'Bureau Roffa',y:2015,w:[400,500,600,700,800],v:0,u:['body','ui','editorial'],t:['humanist','friendly'],src:null,b:'A humanist sans adapted for screens from the Proza family, with a gentle calligraphic flavour.'},

  {n:'Playfair Display',c:'serif',d:'Claus Eggers S\u00f8rensen',p:'Claus Eggers S\u00f8rensen (independent)',y:2011,w:range(400,900),v:1,u:['headlines','editorial','invitations'],t:['elegant','classic','luxury'],src:GH+'clauseggers/Playfair',b:'A high-contrast transitional display serif in the spirit of late-18th-century European types. Made for large sizes.'},
  {n:'Lora',c:'serif',d:'Olga Karpushina',p:'Cyreal',y:2011,w:range(400,700),v:1,u:['body','longform','editorial'],t:['classic','elegant'],src:GH+'cyrealtype/Lora-Cyrillic',b:'A contemporary serif with roots in calligraphy, balanced for body text on screen and in print.'},
  {n:'Merriweather',c:'serif',d:'Eben Sorkin',p:'Sorkin Type',y:2010,w:[300,400,700,900],v:0,u:['longform','body','editorial'],t:['classic','humanist'],src:GH+'SorkinType/Merriweather',b:'Designed for comfortable reading on screens, with a large x-height, slightly condensed letters and sturdy serifs.'},
  {n:'EB Garamond',c:'serif',d:'Georg Duffner, Octavio Pardo',p:'Georg Duffner (independent)',y:2011,w:range(400,800),v:1,u:['longform','editorial','invitations'],t:['classic','elegant'],src:GH+'octaviopardo/EBGaramond12',b:'A revival of Claude Garamont\u2019s types based on the 1592 Egenolff-Berner specimen. Bookish and graceful.'},
  {n:'Libre Baskerville',c:'serif',d:'Pablo Impallari, Rodrigo Fuenzalida',p:'Impallari Type',y:2012,w:[400,700],v:0,u:['body','editorial','longform'],t:['classic','elegant'],src:null,b:'A Baskerville optimised for body text on screen, with a taller x-height and wider counters than the original.'},
  {n:'Crimson Pro',c:'serif',d:'Jacques Le Bailly',p:'Jacques Le Bailly (independent)',y:2018,w:range(200,900),v:1,u:['longform','body','editorial'],t:['classic','elegant'],src:GH+'Fonthausen/CrimsonPro',b:'A refresh of Sebastian Kosch\u2019s Crimson Text, inspired by old-style book faces.'},
  {n:'Source Serif 4',c:'serif',d:'Frank Grie\u00dfhammer',p:'Adobe',y:2014,w:range(200,900),v:1,u:['longform','body','editorial'],t:['classic','corporate'],src:GH+'adobe-fonts/source-serif',b:'A transitional serif in the Fournier tradition, designed to pair with Source Sans. Includes optical sizes.'},
  {n:'Fraunces',c:'serif',d:'Phaedra Charles, Flavia Zimbardi',p:'Undercase Type',y:2020,w:range(100,900),v:1,u:['headlines','branding','editorial'],t:['retro','quirky','playful'],src:GH+'undercasetype/Fraunces',b:'A soft, chunky \u201cOld Style\u201d display face inspired by early-20th-century types, with variable axes for softness and \u201cwonk\u201d.'},
  {n:'Cormorant Garamond',c:'serif',d:'Christian Thalmann',p:'Catharsis Fonts',y:2015,w:range(300,700),v:1,u:['headlines','invitations','branding'],t:['elegant','luxury','classic'],src:GH+'CatharsisFonts/Cormorant',b:'A display Garamond with small counters and sharp, delicate serifs. At its best set large.'},
  {n:'Newsreader',c:'serif',d:'Production Type',p:'Production Type',y:2020,w:range(200,800),v:1,u:['editorial','longform','body'],t:['classic','modern'],src:GH+'productiontype/Newsreader',b:'Designed for on-screen news reading, with an optical size axis that adapts from captions to headlines.'},
  {n:'Spectral',c:'serif',d:'Production Type',p:'Production Type',y:2017,w:range(200,800),v:0,u:['longform','body','editorial'],t:['elegant','modern'],src:GH+'productiontype/Spectral',b:'A screen-first serif commissioned by Google for text-rich documents. Light, efficient and refined.'},
  {n:'IBM Plex Serif',c:'serif',d:'Mike Abbink with Bold Monday',p:'IBM',y:2017,w:range(100,700),v:0,u:['body','editorial','longform'],t:['corporate','technical'],src:GH+'IBM/plex',b:'The serif member of the IBM Plex superfamily, built to sit alongside Plex Sans and Plex Mono.'},
  {n:'DM Serif Display',c:'serif',d:'Colophon Foundry',p:'Google (Colophon Foundry)',y:2019,w:[400],v:0,u:['headlines','editorial','branding'],t:['elegant','bold'],src:GH+'googlefonts/dm-fonts',b:'A high-contrast transitional display face developed from Source Serif, made to partner DM Sans.'},
  {n:'Young Serif',c:'serif',d:'Bastien Sozeau',p:'Noir Blanc Rouge',y:2023,w:[400],v:0,u:['headlines','branding'],t:['retro','friendly'],src:GH+'noirblancrouge/YoungSerif',b:'A sturdy, heavy old-style serif with soft details. Warm and confident in headlines.'},
  {n:'Instrument Serif',c:'serif',d:'Rodrigo Fuenzalida, Jordan Egstad',p:'Instrument',y:2023,w:[400],v:0,u:['headlines','editorial','branding'],t:['elegant','modern','luxury'],src:GH+'Instrument/instrument-serif',b:'A condensed display serif and the companion to Instrument Sans.'},
  {n:'Literata',c:'serif',d:'Veronika Burian, Jos\u00e9 Scaglione',p:'TypeTogether',y:2015,w:range(200,900),v:1,u:['longform','body'],t:['classic','humanist'],src:GH+'googlefonts/literata',b:'Commissioned as the default typeface of Google Play Books and made for immersive reading on screens.'},
  {n:'Alegreya',c:'serif',d:'Juan Pablo del Peral',p:'Huerta Tipogr\u00e1fica',y:2011,w:range(400,900),v:1,u:['longform','body','editorial'],t:['classic','elegant','humanist'],src:null,b:'A calligraphic serif made for literature, with a dynamic rhythm that keeps long texts lively.'},
  {n:'PT Serif',c:'serif',d:'Alexandra Korolkova, Olga Umpeleva, Vladimir Yefimov',p:'ParaType',y:2010,w:[400,700],v:0,u:['body','longform','editorial'],t:['classic','corporate'],src:null,b:'The transitional serif companion to PT Sans, from the Public Types of Russia project.'},
  {n:'Old Standard TT',c:'serif',d:'Alexey Kryukov',p:'Alexey Kryukov (independent)',y:2008,w:[400,700],v:0,u:['editorial','longform','invitations'],t:['classic','retro','elegant'],src:null,b:'Reproduces the \u201cModern\u201d serif style common in late-19th and early-20th-century books and journals.'},
  {n:'Bitter',c:'slab',d:'Sol Matas',p:'Huerta Tipogr\u00e1fica',y:2011,w:range(100,900),v:1,u:['body','longform','editorial'],t:['humanist','friendly'],src:GH+'solmatas/BitterPro',b:'A contemporary slab serif designed for comfortable reading on screens.'},
  {n:'Zilla Slab',c:'slab',d:'Typotheque (Peter Bi\u013eak, Nikola Djurek)',p:'Mozilla',y:2017,w:range(300,700),v:0,u:['headlines','branding','body'],t:['bold','quirky','technical'],src:GH+'mozilla/zilla-slab',b:'Mozilla\u2019s identity typeface: a contemporary slab with a punchy, journalistic tone.'},

  {n:'JetBrains Mono',c:'mono',d:'Philipp Nurullin, Konstantin Bulenkov',p:'JetBrains',y:2020,w:range(100,800),v:1,u:['code','data'],t:['technical','modern'],src:GH+'JetBrains/JetBrainsMono',b:'Made for developers, with an increased x-height and code ligatures to reduce eye strain.'},
  {n:'IBM Plex Mono',c:'mono',d:'Mike Abbink with Bold Monday',p:'IBM',y:2017,w:range(100,700),v:0,u:['code','data','branding'],t:['technical','corporate'],src:GH+'IBM/plex',b:'The monospaced member of IBM Plex. Comfortable for code and tabular data, characterful enough for branding.'},
  {n:'Fira Code',c:'mono',d:'Nikita Prokopov',p:'Nikita Prokopov (independent)',y:2014,w:range(300,700),v:1,u:['code'],t:['technical'],src:GH+'tonsky/FiraCode',b:'Extends Fira Mono with ligatures for common multi-character programming operators.'},
  {n:'Space Mono',c:'mono',d:'Colophon Foundry',p:'Google Design',y:2016,w:[400,700],v:0,u:['code','headlines','branding'],t:['retro','technical','quirky'],src:GH+'googlefonts/spacemono',b:'A monospaced display family with geometric forms and a mid-century editorial flavour.'},
  {n:'Source Code Pro',c:'mono',d:'Paul D. Hunt',p:'Adobe',y:2012,w:range(200,900),v:1,u:['code','data'],t:['technical','minimal'],src:GH+'adobe-fonts/source-code-pro',b:'A monospaced companion to Source Sans, designed for coding environments.'},
  {n:'DM Mono',c:'mono',d:'Colophon Foundry',p:'Google (Colophon Foundry)',y:2020,w:[300,400,500],v:0,u:['code','data','ui'],t:['minimal','technical'],src:GH+'googlefonts/dm-mono',b:'A three-weight monospace designed to accompany DM Sans.'},

  {n:'Bebas Neue',c:'display',d:'Ryoichi Tsunekawa',p:'Dharma Type',y:2010,w:[400],v:0,u:['headlines','posters','branding'],t:['bold','modern'],src:null,b:'An all-caps condensed sans that has become a staple of posters, headlines and signage.'},
  {n:'Abril Fatface',c:'display',d:'Veronika Burian, Jos\u00e9 Scaglione',p:'TypeTogether',y:2011,w:[400],v:0,u:['headlines','posters','editorial'],t:['bold','elegant','retro'],src:null,b:'A heavy Didone display face inspired by 19th-century British and French advertising types.'},
  {n:'Syne',c:'display',d:'Lucas Descroix',p:'Bonjour Monde',y:2017,w:range(400,800),v:1,u:['headlines','branding','posters'],t:['quirky','modern','bold'],src:null,b:'Made for the Parisian art centre Synesth\u00e9sies. The heavier the weight, the wider and stranger it gets.'},
  {n:'Righteous',c:'display',d:'Brian J. Bonislawsky',p:'Astigmatic',y:2011,w:[400],v:0,u:['headlines','branding','posters'],t:['retro','geometric'],src:null,b:'A geometric display face inspired by Art Deco poster lettering.'},
  {n:'Anton',c:'display',d:'Vernon Adams',p:'Vernon Adams (independent)',y:2011,w:[400],v:0,u:['headlines','posters'],t:['bold','technical'],src:GH+'googlefonts/AntonFont',b:'A reworking of a traditional advertising sans serif: tall, condensed and loud.'},
  {n:'Archivo Black',c:'display',d:'H\u00e9ctor Gatti and the Omnibus-Type team',p:'Omnibus-Type',y:2012,w:[400],v:0,u:['headlines','posters','branding'],t:['bold'],src:null,b:'The heaviest cut of the Archivo grotesque, made as a single weight for headlines.'},
  {n:'Lobster',c:'display',d:'Pablo Impallari',p:'Impallari Type',y:2010,w:[400],v:0,u:['branding','headlines','packaging'],t:['retro','playful'],src:null,b:'A bold connected script with many ligatures and alternates, reminiscent of mid-century sign painting.'},
  {n:'Major Mono Display',c:'display',d:'Emre Parlak',p:'Emre Parlak (independent)',y:2018,w:[400],v:0,u:['headlines','posters','branding'],t:['quirky','geometric','technical'],src:null,b:'An experimental monospaced display face that mixes uppercase and lowercase forms.'},

  {n:'Caveat',c:'script',d:'Pablo Impallari',p:'Impallari Type',y:2015,w:range(400,700),v:1,u:['invitations','branding','packaging'],t:['handmade','playful','friendly'],src:GH+'googlefonts/caveat',b:'A natural handwriting script with contextual alternates and good legibility even at small sizes.'},
  {n:'Pacifico',c:'script',d:'Vernon Adams',p:'Vernon Adams (independent)',y:2011,w:[400],v:0,u:['branding','invitations','posters'],t:['retro','playful'],src:null,b:'A surf-culture brush script inspired by 1950s American pop culture.'},
  {n:'Dancing Script',c:'script',d:'Pablo Impallari',p:'Impallari Type',y:2010,w:range(400,700),v:1,u:['invitations','branding'],t:['elegant','playful','handmade'],src:null,b:'A lively casual script where letters bounce and change size.'},
  {n:'Kalam',c:'script',d:'Indian Type Foundry',p:'Indian Type Foundry',y:2014,w:[300,400,700],v:0,u:['invitations','posters','packaging'],t:['handmade','friendly'],src:null,b:'Handwriting for Devanagari and Latin that looks like quick notes jotted in a margin.'},
  {n:'Shadows Into Light',c:'script',d:'Kimberly Geswein',p:'Kimberly Geswein (independent)',y:2011,w:[400],v:0,u:['invitations','packaging'],t:['handmade','playful'],src:null,b:'Neat handwriting with clean, rounded forms.'},
  {n:'Great Vibes',c:'script',d:'Robert Leuschke',p:'TypeSETit',y:2012,w:[400],v:0,u:['invitations','branding'],t:['elegant','luxury'],src:null,b:'A flowing, formal connecting script with elegant capitals.'}
];
const EXTRA = `Roboto|sans|Christian Robertson|Google|2011|v100-900|ui body data|modern corporate minimal|sans:neo||
Roboto Condensed|sans|Christian Robertson|Google|2012|v100-900|headlines data ui|modern technical corporate|sans:neo|condensed|
Roboto Flex|sans|Font Bureau (David Berlow and team)|Google|2022|v100-900|ui headlines branding|modern technical|sans:neo||
Noto Sans|sans|Google Noto team|Google|2012|v100-900|body ui longform|minimal corporate|sans:humanist||
Ubuntu|sans|Dalton Maag|Canonical|2010|300,400,500,700|ui branding body|friendly modern technical|sans:humanist||
Mulish|sans|Vernon Adams, Jacques Le Bailly|Cyreal|2011|v200-900|ui body|minimal modern|sans:geometric||
Nunito Sans|sans|Vernon Adams, Jacques Le Bailly, Manvel Shmavonyan, Alexei Vanyashin|Cyreal|2016|v200-900|ui body|friendly minimal modern|sans:geometric||
Quicksand|sans|Andrew Paglinawan|Andrew Paglinawan (independent)|2008|v300-700|branding ui headlines|friendly minimal playful|sans:rounded|rounded|
Josefin Sans|sans|Santiago Orozco|Typemade|2010|v100-700|headlines branding|elegant retro modern|sans:geometric||
Cabin|sans|Pablo Impallari, Rodrigo Fuenzalida|Impallari Type|2011|v400-700|body ui|friendly classic|sans:humanist||
Exo 2|sans|Natanael Gama|Ndiscovered|2013|v100-900|headlines branding ui|technical modern|sans:geometric|techno|
Exo|sans|Natanael Gama|Ndiscovered|2012|v100-900|headlines branding|technical modern|sans:geometric|techno|
Titillium Web|sans|Accademia di Belle Arti di Urbino|Accademia di Belle Arti di Urbino|2012|200,300,400,600,700,900|ui headlines data|technical modern|sans:grotesque||
Heebo|sans|Oded Ezer|Oded Ezer (independent)|2015|v100-900|ui body|modern minimal|sans:neo||
Hind|sans|Indian Type Foundry|Indian Type Foundry|2014|300,400,500,600,700|ui body|minimal corporate|sans:humanist||
Mukta|sans|Ek Type|Ek Type|2016|200,300,400,500,600,700,800|ui body|friendly minimal|sans:humanist||
Kanit|sans|Cadson Demak|Cadson Demak|2015|s100-900|headlines branding|modern bold technical|sans:square||
Prompt|sans|Cadson Demak|Cadson Demak|2016|s100-900|ui headlines branding|modern friendly|sans:geometric||
Red Hat Display|sans|Jeremy Mickel (MCKL)|Red Hat|2019|v300-900|headlines branding|modern corporate|sans:geometric||
Red Hat Text|sans|Jeremy Mickel (MCKL)|Red Hat|2019|v300-700|body ui|modern corporate|sans:geometric||
Lexend|sans|Bonnie Shaver-Troup, Thomas Jockin|Lexend|2019|v100-900|accessibility body ui|friendly modern|sans:geometric||
Jost|sans|Owen Earl|indestructible type*|2019|v100-900|headlines branding ui|modern elegant minimal|sans:geometric||
Urbanist|sans|Corey Hu|Corey Hu (independent)|2021|v100-900|ui branding headlines|modern minimal|sans:geometric||
Sora|sans|Jonathan Barnbrook, Julián Moncada|Barnbrook|2020|v100-800|ui branding headlines|modern technical|sans:geometric||
Albert Sans|sans|Andreas Rasmussen|Andreas Rasmussen (independent)|2022|v100-900|ui branding|modern minimal|sans:geometric||
Be Vietnam Pro|sans|Lâm Bảo, Tony Le, ViệtAnh Nguyễn|Be Vietnam|2021|s100-900|ui body branding|modern friendly|sans:neo||
Kumbh Sans|sans|Saurabh Sharma|Saurabh Sharma (independent)|2020|v100-900|ui branding|modern friendly|sans:geometric||
Hanken Grotesk|sans|Alfredo Marco Pradil|Hanken Design Co.|2021|v100-900|ui body branding|modern minimal|sans:grotesque||
Schibsted Grotesk|sans|Bakken & Bæck|Schibsted|2023|v400-900|editorial headlines ui|modern corporate|sans:grotesque||
Wix Madefor Display|sans|Dalton Maag|Wix|2023|v400-800|headlines branding ui|modern friendly|sans:neo||
Inclusive Sans|sans|Olivia King|Olivia King (independent)|2023|400|accessibility body ui|friendly minimal|sans:humanist||
Encode Sans|sans|Impallari Type, Andres Torresi, Jacques Le Bailly|Impallari Type|2016|v100-900|ui data headlines|technical modern|sans:grotesque||
Saira|sans|Héctor Gatti and the Omnibus-Type team|Omnibus-Type|2017|v100-900|headlines ui data|technical modern|sans:square|techno|
Signika|sans|Anna Giedryś|Anna Giedryś (independent)|2011|v300-700|ui body packaging|friendly minimal|sans:humanist||
Asap|sans|Omnibus-Type|Omnibus-Type|2012|v100-900|ui body|friendly modern|sans:humanist||
Overpass|sans|Delve Withrington, Dave Bailey, Thomas Jockin|Red Hat|2016|v100-900|ui posters body|technical minimal|sans:grotesque||
Catamaran|sans|Pria Ravichandran|Pria Ravichandran (independent)|2015|v100-900|ui headlines|modern minimal|sans:humanist||
Maven Pro|sans|Joe Prince|Joe Prince (independent)|2011|v400-900|ui branding|modern friendly|sans:rounded||
Questrial|sans|Joe Prince|Joe Prince (independent)|2011|400|ui headlines|minimal modern|sans:geometric||
Varela Round|sans|Joe Prince|Joe Prince (independent)|2011|400|ui branding|friendly playful|sans:rounded|rounded|
Comfortaa|sans|Johan Aakerlund|Johan Aakerlund (independent)|2011|v300-700|branding headlines|friendly playful modern|sans:rounded|rounded|
M PLUS Rounded 1c|sans|Coji Morishita|M+ Fonts Project||100,300,400,500,700,800,900|ui branding|friendly playful|sans:rounded|rounded|
Didact Gothic|sans|Daniel Johnson|Cyreal|2011|400|body ui|minimal friendly|sans:geometric||
League Spartan|sans|Micah Rich, Caroline Hadilaksono, Tyler Finck|The League of Moveable Type|2014|v100-900|headlines branding posters|bold modern|sans:geometric||
League Gothic|sans|Caroline Hadilaksono, Micah Rich, Tyler Finck|The League of Moveable Type|2011|400|headlines posters|bold retro|sans:grotesque|condensed|
Antonio|sans|Vernon Adams|Vernon Adams (independent)|2012|v100-700|headlines posters data|bold modern|sans:grotesque|condensed|
Fjalla One|sans|Irina Smirnova|Sorkin Type|2011|400|headlines posters|bold modern|sans:grotesque|condensed|
Teko|sans|Indian Type Foundry|Indian Type Foundry|2014|v300-700|headlines posters data|technical bold|sans:square|condensed|
Barlow Condensed|sans|Jeremy Tribby|Jeremy Tribby (independent)|2017|s100-900|headlines posters data|technical bold|sans:grotesque|condensed|
IBM Plex Sans Condensed|sans|Mike Abbink with Bold Monday|IBM|2017|s100-700|data ui headlines|corporate technical|sans:grotesque|condensed|
PT Sans Narrow|sans|Alexandra Korolkova, Olga Umpeleva, Vladimir Yefimov|ParaType|2009|400,700|data headlines|corporate classic|sans:humanist|condensed|
Yanone Kaffeesatz|sans|Jan Gerner|Yanone|2004|v200-700|headlines posters packaging|retro friendly|sans:grotesque|condensed|
Abel|sans|Matt Desmond|MADType|2011|400|headlines ui|minimal modern|sans:geometric|condensed|
Archivo Narrow|sans|Omnibus-Type|Omnibus-Type|2012|v400-700|data headlines|corporate technical|sans:grotesque|condensed|
Sofia Sans|sans|Botio Nikoltchev, Ani Petrova|Lettersoup|2022|v100-900|ui body branding|modern friendly|sans:humanist||
Commissioner|sans|Kostas Bartsokas|Kostas Bartsokas (independent)|2020|v100-900|ui branding headlines|modern corporate|sans:humanist||
Epilogue|sans|Tyler Finck|Etcetera Type Co|2020|v100-900|headlines editorial branding|modern bold|sans:grotesque||
Familjen Grotesk|sans|Familjen STHLM|Familjen STHLM|2022|v400-700|headlines branding|quirky modern|sans:grotesque||
Darker Grotesque|sans|Gabriel Lam|Gabriel Lam (independent)|2018|v300-900|headlines editorial|modern elegant|sans:grotesque||
Bai Jamjuree|sans|Cadson Demak|Cadson Demak|2018|200,300,400,500,600,700|ui headlines|technical modern|sans:square||
Chivo|sans|Héctor Gatti and the Omnibus-Type team|Omnibus-Type|2012|v100-900|headlines editorial|bold modern|sans:grotesque||
Spline Sans|sans|Eben Sorkin, Mirko Velimirović|Sorkin Type|2021|v300-700|ui body|modern minimal|sans:grotesque||
Unbounded|sans|NaN|NaN|2022|v200-900|headlines branding posters|bold modern quirky|sans:geometric|wide|
Inter Tight|sans|Rasmus Andersson|Rasmus Andersson (independent)|2022|v100-900|headlines branding|modern minimal|sans:neo||
Montserrat Alternates|sans|Julieta Ulanovsky|Julieta Ulanovsky (independent)|2012|s100-900|branding headlines|retro quirky|sans:geometric|wide|
Belleza|sans|Eduardo Tunni|Eduardo Tunni (independent)|2012|400|headlines branding|elegant luxury|sans:humanist||
Tenor Sans|sans|Denis Masharov|Denis Masharov (independent)|2011|400|headlines branding|elegant classic|sans:humanist||
Philosopher|sans|Jovanny Lemonad|Jovanny Lemonad (independent)|2011|400,700|headlines branding|elegant quirky|sans:humanist||
Julius Sans One|sans|Luciano Vergara|Luciano Vergara (independent)|2012|400|headlines branding|elegant minimal luxury|sans:geometric|wide|
Quattrocento Sans|sans|Pablo Impallari|Impallari Type|2011|400,700|body ui|classic elegant|sans:humanist||
Assistant|sans|Ben Nathan|Ben Nathan (independent)|2016|v200-800|ui body|minimal corporate|sans:neo||
Rajdhani|sans|Indian Type Foundry|Indian Type Foundry|2014|300,400,500,600,700|ui headlines data|technical modern|sans:square|techno|
Oxanium|sans|Severin Meyer|Severin Meyer (independent)|2019|v200-800|headlines ui|technical modern|sans:square|techno|
Tomorrow|sans|Tony de Marco, Monica Rizzolli|Tony de Marco (independent)|2019|s100-900|headlines ui|technical modern|sans:square|techno|
Comic Neue|sans|Craig Rozynski, Hrant Papazian|Craig Rozynski (independent)|2014|300,400,700|packaging posters|playful friendly|||
Roboto Serif|serif|Greg Gazdowicz|Commercial Type for Google|2022|v100-900|body longform ui|modern corporate|serif:transitional||
Noto Serif|serif|Google Noto team|Google|2012|v100-900|body longform|classic minimal|serif:transitional||
Libre Caslon Text|serif|Pablo Impallari, Rodrigo Fuenzalida|Impallari Type|2012|400,700|body longform editorial|classic elegant|serif:oldstyle||
Libre Caslon Display|serif|Pablo Impallari, Rodrigo Fuenzalida|Impallari Type|2014|400|headlines editorial|classic elegant|serif:oldstyle|high-contrast|
Libre Bodoni|serif|Pablo Impallari, Rodrigo Fuenzalida|Impallari Type|2014|v400-700|headlines editorial body|elegant classic|serif:didone|high-contrast|
Bodoni Moda|serif|Owen Earl|indestructible type*|2020|v400-900|headlines editorial branding|luxury elegant|serif:didone|high-contrast|
Gilda Display|serif|Eduardo Tunni|Eduardo Tunni (independent)|2012|400|headlines editorial invitations|elegant luxury|serif:didone|high-contrast|
Prata|serif|Ilya Yudin|Cyreal|2011|400|headlines editorial|elegant luxury|serif:didone|high-contrast|
Rozha One|serif|Indian Type Foundry|Indian Type Foundry|2014|400|headlines posters|bold elegant|serif:didone|high-contrast|
Yeseva One|serif|Jovanny Lemonad|Jovanny Lemonad (independent)|2011|400|headlines branding|elegant bold|serif:didone|high-contrast|
Cardo|serif|David Perry|David Perry (independent)|2010|400,700|longform body|classic|serif:oldstyle||
Sorts Mill Goudy|serif|Barry Schwartz|The League of Moveable Type|2010|400|longform body|classic retro|serif:oldstyle||
Goudy Bookletter 1911|serif|Barry Schwartz|The League of Moveable Type|2010|400|longform editorial|classic retro|serif:oldstyle||
IM Fell English|serif|Igino Marini|Igino Marini (independent)|2010|400|editorial invitations|retro classic|serif:oldstyle||
Gelasio|serif|Eben Sorkin|Sorkin Type|2019|v400-700|body longform|classic|serif:transitional||
Gentium Book Plus|serif|Victor Gaultney|SIL International|2021|400,700|longform body|classic|serif:oldstyle||
Vollkorn|serif|Friedrich Althausen|Friedrich Althausen (independent)|2010|v400-900|longform body editorial|classic friendly|serif:oldstyle||
Domine|serif|Pablo Impallari, Rodrigo Fuenzalida|Impallari Type|2012|v400-700|body editorial|classic|serif:transitional||
Noticia Text|serif|JM Solé|JM Solé (independent)|2012|400,700|body editorial|classic|serif:transitional||
Unna|serif|Jorge de Buen|Omnibus-Type|2012|400,700|body editorial|elegant classic|serif:transitional||
Ovo|serif|Nicole Fally|Nicole Fally (independent)|2011|400|headlines editorial|elegant classic|serif:oldstyle||
Rufina|serif|Martin Sommaruga|Martin Sommaruga (independent)|2012|400,700|headlines editorial|elegant|serif:transitional||
Trirong|serif|Cadson Demak|Cadson Demak|2016|s100-900|body editorial|classic elegant|serif:transitional||
Taviraj|serif|Cadson Demak|Cadson Demak|2016|s100-900|body editorial|classic elegant|serif:transitional||
Frank Ruhl Libre|serif|Yanek Iontef|Yanek Iontef (independent)|2016|v300-900|body editorial longform|classic|serif:transitional||
Martel|serif|Dan Reynolds, Mathieu Réguer|Dan Reynolds (independent)|2014|200,300,400,600,700,800,900|body longform|classic|serif:transitional||
Amiri|serif|Khaled Hosny|Khaled Hosny (independent)|2011|400,700|longform body|classic elegant|serif:transitional||
Abhaya Libre|serif|Pathum Egodawatta|Mooniak|2016|400,500,600,700,800|body editorial|classic|serif:transitional||
Brygada 1918|serif|Mateusz Machalski, Borys Kosmynka|Capitalics|2020|v400-700|body editorial|classic retro|serif:transitional||
Petrona|serif|Ringo R. Seeber|Ringo R. Seeber (independent)|2012|v100-900|body editorial|modern classic|serif:transitional||
Besley|serif|Owen Earl|indestructible type*|2020|v400-900|headlines editorial|retro bold|serif:clarendon||
Piazzolla|serif|Juan Pablo del Peral|Huerta Tipográfica|2020|v100-900|body longform editorial|modern classic|serif:humanist||
Radley|serif|Vernon Adams|Vernon Adams (independent)|2012|400|editorial headlines|classic elegant|serif:oldstyle||
Halant|serif|Indian Type Foundry|Indian Type Foundry|2014|300,400,500,600,700|body editorial|classic|serif:transitional||
DM Serif Text|serif|Colophon Foundry|Google (Colophon Foundry)|2019|400|body editorial|elegant classic|serif:transitional||
Gloock|serif|Duarte Pinheiro|Duarte Pinheiro (independent)|2023|400|headlines editorial branding|elegant bold|serif:didone|high-contrast|
Ibarra Real Nova|serif|José María Ribagorda, Octavio Pardo|Octavio Pardo (independent)|2017|v400-700|longform editorial|classic|serif:transitional||
Lusitana|serif|Ana Paula Megda|Ana Paula Megda (independent)|2011|400,700|body editorial|classic|serif:oldstyle||
Average|serif|Eduardo Tunni|Eduardo Tunni (independent)|2012|400|body editorial|classic minimal|serif:transitional||
Quattrocento|serif|Pablo Impallari|Impallari Type|2011|400,700|headlines editorial|classic elegant|serif:transitional||
Marcellus|serif|Brian J. Bonislawsky|Astigmatic|2012|400|headlines branding|elegant classic|serif:glyphic||
Cinzel|serif|Natanael Gama|Ndiscovered|2012|v400-900|headlines branding invitations|elegant classic luxury|serif:glyphic||
Cinzel Decorative|display|Natanael Gama|Ndiscovered|2012|400,700,900|headlines invitations|luxury elegant|serif:glyphic||
Forum|serif|Denis Masharov|Denis Masharov (independent)|2011|400|headlines branding|classic elegant|serif:glyphic||
Italiana|serif|Santiago Orozco|Typemade|2012|400|headlines branding|elegant luxury minimal|serif:didone|high-contrast|
Bellefair|serif|Nick Shinn, Liron Lavi Turkenich|Nick Shinn (independent)|2017|400|headlines editorial|elegant luxury|serif:transitional||
Coustard|serif|Vernon Adams|Vernon Adams (independent)|2011|400,900|headlines|bold retro|serif:clarendon||
Bree Serif|slab|Veronika Burian, José Scaglione|TypeTogether|2012|400|headlines branding|friendly modern|serif:slab||
Roboto Slab|slab|Christian Robertson|Google|2013|v100-900|headlines body ui|modern friendly|serif:slab||
Arvo|slab|Anton Koovit|Anton Koovit (independent)|2010|400,700|headlines body|modern friendly|serif:slab||
Josefin Slab|slab|Santiago Orozco|Typemade|2010|v100-700|editorial headlines|retro elegant|serif:slab||
Crete Round|slab|Veronika Burian, José Scaglione|TypeTogether|2012|400|headlines body|friendly classic|serif:slab||
Rokkitt|slab|Vernon Adams|Vernon Adams (independent)|2011|v100-900|headlines body|retro friendly|serif:slab||
Patua One|slab|LatinoType|LatinoType|2012|400|headlines branding|friendly bold|serif:slab||
Kreon|slab|Julia Petretta|Julia Petretta (independent)|2011|v300-700|body headlines|friendly|serif:slab||
Slabo 27px|slab|John Hudson|Tiro Typeworks|2014|400|body headlines|classic minimal|serif:slab||
Podkova|slab|Ilya Yudin|Cyreal|2011|v400-800|headlines|retro technical|serif:slab||
Aleo|slab|Alessio Laiso|Alessio Laiso (independent)|2013|v100-900|body headlines|friendly modern|serif:slab||
Alfa Slab One|slab|JM Solé|JM Solé (independent)|2011|400|headlines posters|bold retro|serif:slab||
Ultra|slab|Brian J. Bonislawsky|Astigmatic|2011|400|headlines posters|bold retro|serif:slab|high-contrast|
Courier Prime|mono|Alan Dague-Greene|Quote-Unquote Apps|2013|400,700|code editorial|retro classic||typewriter|
Anonymous Pro|mono|Mark Simonson|Mark Simonson Studio|2009|400,700|code|technical retro|||
Inconsolata|mono|Raph Levien|Raph Levien (independent)|2006|v200-900|code data|technical minimal|||
Ubuntu Mono|mono|Dalton Maag|Canonical|2011|400,700|code|technical friendly|||
Roboto Mono|mono|Christian Robertson|Google|2015|v100-700|code data ui|technical modern|||
Red Hat Mono|mono|Jeremy Mickel (MCKL)|Red Hat|2021|v300-700|code data|technical corporate|||
Martian Mono|mono|Roman Shamin and the Evil Martians team|Evil Martians|2022|v100-800|code data branding|technical modern|||
Azeret Mono|mono|Martin Vácha|Displaay|2021|v100-900|code data branding|technical modern|||
Spline Sans Mono|mono|Eben Sorkin, Mirko Velimirović|Sorkin Type|2021|v300-700|code data|technical modern|||
Overpass Mono|mono|Delve Withrington, Dave Bailey, Thomas Jockin|Red Hat|2016|v300-700|code data|technical minimal|||
Victor Mono|mono|Rune Bjørnerås|Rune Bjørnerås (independent)|2018|v100-700|code|technical quirky|||
Fragment Mono|mono|Wei Huang|Wei Huang (independent)|2022|400|code data|technical minimal|||
Syne Mono|mono|Lucas Descroix|Bonjour Monde|2017|400|code headlines|quirky technical|||
Share Tech Mono|mono|Carrois Type Design|Carrois Type Design|2012|400|code data|technical||techno|
VT323|mono|Peter Hull|Peter Hull (independent)|2011|400|code posters|retro technical||pixel|
Special Elite|display|Brian J. Bonislawsky|Astigmatic|2011|400|posters packaging|retro quirky||typewriter|
Bangers|display|Vernon Adams|Vernon Adams (independent)|2010|400|posters packaging headlines|playful bold|||
Titan One|display|Rodrigo Fuenzalida|Rodrigo Fuenzalida (independent)|2012|400|branding packaging|playful bold|sans:rounded|rounded|
Black Ops One|display|James Grieshaber, Eben Sorkin|Sorkin Type|2011|400|posters headlines|bold technical||stencil|
Saira Stencil One|display|Héctor Gatti and the Omnibus-Type team|Omnibus-Type|2018|400|posters packaging|bold technical||stencil|
Shrikhand|display|Jonny Pinhorn|Jonny Pinhorn (independent)|2016|400|branding packaging headlines|retro bold playful|||
Passion One|display|Fontstage|Fontstage|2011|400,700,900|headlines posters|bold playful|||
Paytone One|display|Vernon Adams|Vernon Adams (independent)|2011|400|headlines branding|bold friendly|sans:rounded||
Lilita One|display|Juan Montoreano|Juan Montoreano (independent)|2011|400|headlines branding packaging|bold playful|||
Sigmar One|display|Vernon Adams|Vernon Adams (independent)|2011|400|headlines posters|bold playful|||
Bungee|display|David Jonathan Ross|David Jonathan Ross (independent)|2016|400|posters headlines branding|bold modern|||
Bungee Shade|display|David Jonathan Ross|David Jonathan Ross (independent)|2016|400|posters|bold retro||shaded|
Bungee Inline|display|David Jonathan Ross|David Jonathan Ross (independent)|2016|400|posters|bold retro||inline|
Rubik Mono One|display|Philipp Hubert, Sebastian Fischer|Hubert & Fischer|2015|400|headlines posters|bold quirky|||
Gravitas One|display|Riccardo De Franceschi|Riccardo De Franceschi (independent)|2011|400|headlines posters|bold elegant|serif:fatface|high-contrast|
Staatliches|display|Brian LaRossa, Erica Carras|Brian LaRossa (independent)|2017|400|headlines posters branding|bold modern|sans:grotesque|condensed|
Londrina Solid|display|Marcelo Magalhães|Marcelo Magalhães (independent)|2012|100,300,400,900|posters packaging|playful quirky|||
Monoton|display|Vernon Adams|Vernon Adams (independent)|2011|400|headlines posters|retro||inline deco|
Limelight|display|Nicole Fally|Sorkin Type|2011|400|headlines posters|retro elegant||deco|
Poiret One|display|Denis Masharov|Denis Masharov (independent)|2011|400|headlines branding|elegant retro minimal|sans:geometric|deco|
Krona One|display|Yvonne Schüttler|Yvonne Schüttler (independent)|2012|400|headlines branding|bold modern|sans:geometric|wide|
Michroma|display|Vernon Adams|Vernon Adams (independent)|2011|400|headlines branding|technical modern|sans:square|wide techno|
Orbitron|display|Matt McInerney|The League of Moveable Type|2009|v400-900|headlines branding|technical|sans:square|techno wide|
Audiowide|display|Brian J. Bonislawsky|Astigmatic|2012|400|headlines branding|technical retro|sans:square|techno wide|
Russo One|display|Jovanny Lemonad|Jovanny Lemonad (independent)|2011|400|headlines branding|technical bold|sans:square|techno|
Press Start 2P|display|CodeMan38|CodeMan38 (independent)|2011|400|posters headlines|retro playful technical||pixel|
Silkscreen|display|Jason Kottke|Jason Kottke (independent)|2001|400,700|ui posters|retro technical||pixel|
Pixelify Sans|display|Stefie Justprince|Stefie Justprince (independent)|2023|v400-700|headlines branding|retro playful||pixel|
DotGothic16|display|Fontworks|Fontworks|2020|400|headlines posters|retro technical||pixel|
Tilt Warp|display|Andy Clymer|Andy Clymer (independent)|2022|400|headlines posters|quirky bold|||
Nabla|display|Arthur Reinders Folmer, Just van Rossum|Typearture|2022|400|headlines posters|playful quirky||color|
UnifrakturMaguntia|display|J. "Mach" Wust|J. "Mach" Wust (independent)|2010|400|headlines branding packaging|classic retro||blackletter|
Pirata One|display|Rodrigo Fuenzalida, Nicolás Massi|Rodrigo Fuenzalida (independent)|2012|400|headlines branding packaging|retro quirky||blackletter|
Grenze Gotisch|display|Omnibus-Type|Omnibus-Type|2019|v100-900|headlines branding posters|bold retro||blackletter|
Sniglet|display|Haley Fiege|The League of Moveable Type|2011|400,800|branding packaging headlines|playful friendly|sans:rounded|rounded|
Fredoka|display|Milena Brandão|Milena Brandão (independent)|2016|v300-700|branding packaging headlines|playful friendly|sans:rounded|rounded|
Baloo 2|display|Ek Type|Ek Type|2016|v400-800|branding packaging headlines|playful friendly|sans:rounded|rounded|
Grandstander|display|Tyler Finck|Etcetera Type Co|2020|v100-900|branding packaging posters|playful bold|sans:rounded||
Fondamento|script|Brian J. Bonislawsky|Astigmatic|2011|400|invitations packaging|classic elegant|calli:formal||
Sacramento|script|Brian J. Bonislawsky|Astigmatic|2012|400|invitations branding|elegant friendly|calli:informal||
Allura|script|Robert Leuschke|TypeSETit|2012|400|invitations branding|elegant luxury|calli:formal||
Alex Brush|script|Robert Leuschke|TypeSETit|2012|400|invitations branding|elegant luxury|calli:formal||
Parisienne|script|Brian J. Bonislawsky|Astigmatic|2012|400|invitations branding|elegant|calli:formal||
Pinyon Script|script|Nicole Fally|Nicole Fally (independent)|2012|400|invitations|elegant luxury classic|calli:formal||
Tangerine|script|Toshi Omagari|Toshi Omagari (independent)|2010|400,700|invitations|elegant classic|calli:formal||
Mr Dafoe|script|Alejandro Paul|Sudtipos|2011|400|branding packaging posters|bold retro|calli:brush||
Kaushan Script|script|Pablo Impallari|Impallari Type|2012|400|branding packaging|playful bold|calli:brush||
Marck Script|script|Denis Masharov|Denis Masharov (independent)|2011|400|invitations packaging|friendly|calli:handwritten||
Courgette|script|Karolina Lach|Karolina Lach (independent)|2012|400|branding packaging|friendly elegant|calli:informal||
Cookie|script|Ania Kruk|Ania Kruk (independent)|2012|400|branding packaging|retro playful|calli:informal||
Damion|script|Vernon Adams|Vernon Adams (independent)|2011|400|branding packaging|retro playful|calli:informal||
Norican|script|Vernon Adams|Vernon Adams (independent)|2012|400|branding packaging|retro friendly|calli:informal||
Merienda|script|Eduardo Tunni|Eduardo Tunni (independent)|2012|v300-900|branding packaging|friendly playful|calli:informal||
Indie Flower|script|Kimberly Geswein|Kimberly Geswein (independent)|2011|400|packaging invitations|playful friendly|calli:handwritten||
Amatic SC|script|Vernon Adams, Ben Nathan|Vernon Adams (independent)|2011|400,700|posters packaging|playful quirky|calli:handwritten|condensed|
Patrick Hand|script|Patrick Wagesreiter|Patrick Wagesreiter (independent)|2012|400|packaging posters|friendly playful|calli:handwritten||
Gloria Hallelujah|script|Kimberly Geswein|Kimberly Geswein (independent)|2011|400|packaging posters|playful quirky|calli:handwritten||
Architects Daughter|script|Kimberly Geswein|Kimberly Geswein (independent)|2010|400|posters packaging|friendly technical|calli:handwritten||
Handlee|script|Joe Prince|Joe Prince (independent)|2012|400|packaging invitations|friendly playful|calli:handwritten||
Nanum Pen Script|script|Sandoll|Naver||400|packaging invitations|friendly playful|calli:handwritten||
Zeyada|script|Kimberly Geswein|Kimberly Geswein (independent)|2011|400|invitations|elegant playful|calli:handwritten||
Nothing You Could Do|script|Kimberly Geswein|Kimberly Geswein (independent)|2011|400|invitations packaging|friendly elegant|calli:handwritten||
Delius|script|Natalia Raices|Natalia Raices (independent)|2011|400|packaging posters|friendly playful|calli:handwritten||
Mali|script|Cadson Demak|Cadson Demak|2018|200,300,400,500,600,700|packaging posters ui|playful friendly|calli:handwritten||
Itim|script|Cadson Demak|Cadson Demak|2015|400|packaging posters|friendly playful|calli:handwritten||
Playpen Sans|script|TypeTogether|TypeTogether|2023|v100-800|packaging posters ui|playful friendly|calli:handwritten||
Gaegu|script|JIKJISOFT|JIKJISOFT|2018|300,400,700|packaging posters|playful friendly|calli:handwritten||
Bad Script|script|Gaslight|Gaslight|2011|400|invitations packaging|friendly elegant|calli:handwritten||
Herr Von Muellerhoff|script|Alejandro Paul|Sudtipos|2011|400|invitations|elegant luxury|calli:formal||
Monsieur La Doulaise|script|Alejandro Paul|Sudtipos|2011|400|invitations|luxury elegant|calli:formal||
Mrs Saint Delafield|script|Alejandro Paul|Sudtipos|2011|400|invitations|elegant luxury|calli:formal||
Petit Formal Script|script|Pablo Impallari|Impallari Type|2012|400|invitations|elegant classic|calli:formal||
Lobster Two|script|Pablo Impallari|Impallari Type|2011|400,700|branding packaging|retro playful|calli:informal||
Leckerli One|script|Gesine Todt|Gesine Todt (independent)|2011|400|branding packaging|playful bold|calli:informal||
Oleo Script|script|soytutype|soytutype|2012|400,700|branding packaging|retro playful bold|calli:informal||
Playball|script|Robert Leuschke|TypeSETit|2011|400|branding packaging|retro classic|calli:formal||
Caveat Brush|script|Pablo Impallari|Impallari Type|2015|400|packaging posters|playful friendly|calli:brush||`;
const LIC = { 'Ubuntu':'Ubuntu Font Licence 1.0', 'Ubuntu Mono':'Ubuntu Font Licence 1.0', 'Special Elite':'Apache License 2.0', 'Roboto':'Apache License 2.0 or OFL 1.1 (varies by release)', 'Roboto Condensed':'Apache License 2.0 or OFL 1.1 (varies by release)', 'Roboto Mono':'Apache License 2.0 or OFL 1.1 (varies by release)', 'Roboto Slab':'Apache License 2.0 or OFL 1.1 (varies by release)' };
const words = x => (x || '').trim().split(/\s+/).filter(Boolean);
EXTRA.split('\n').forEach(line => {
  const [n, c, d, p, y, w, u, t, sub, a, src] = line.split('|');
  let ws, v = 0;
  if (/^[vs]\d/.test(w)) { const [lo, hi] = w.slice(1).split('-').map(Number); ws = range(lo, hi); v = w[0] === 'v' ? 1 : 0; }
  else ws = w.split(',').map(Number);
  F.push({n, c, d, p:p || d, y:+y || 0, w:ws, v, u:words(u), t:words(t), s:words(sub), a:words(a), src:src || null, lic:LIC[n]});
});
// Current open-source metadata determines membership; editorial annotations enrich it.
const catalog = window.OPEN_SHELF_CATALOG;
const editorial = new Map(F.map(f => [f.n, f]));
F.splice(0, F.length, ...[...catalog.fonts, ...(window.OPEN_SHELF_FONTSOURCE?.fonts || [])].map(raw => {
  const prior = editorial.get(raw.n) || {};
  const f = {...prior, ...raw};
  f.source = raw.source || 'google';
  f.c = prior.c || raw.c;
  f.p = prior.p || raw.d;
  f.u = prior.u || ({sans:['body','ui','headlines'],serif:['body','editorial'],mono:['code','data'],display:['headlines','posters'],script:['branding','invitations']}[f.c] || ['headlines']);
  f.t = [...new Set([...(prior.t || []), ...(raw.labels?.t || [])])];
  f.a = [...new Set([...(prior.a || []), ...(raw.labels?.a || []), ...(raw.color ? ['color'] : [])])];
  f.u = [...new Set([...f.u, ...(raw.labels?.u || [])])];
  f.s = [...new Set([...(prior.s || []), ...(raw.labels?.s || [])])];
  f.b = prior.b || (f.source === 'fontsource' ? `${raw.n} is available from Fontsource under ${raw.lic}. Attribution: ${raw.d}. Preview it here, or visit the original source for project details and licence terms.` : `${raw.n} by ${raw.d}. Listed in the Google Fonts open-source catalog. Added to Google Fonts in ${raw.y}; this is not necessarily its original release year. Suggested uses are editorial starting points; test the characters and sizes your project needs.`);
  return f;
}));
F.forEach(f => {
  f.slug = f.n.toLowerCase().replace(/\s+/g, '-');
  f.fs = 'https://fontsource.org/fonts/' + (f.fontsourceId || f.slug);
  f.gf = f.source === 'fontsource' ? f.fs : 'https://fonts.google.com/specimen/' + f.n.replace(/ /g, '+');
  f.lic = f.lic || OFL;
});
const localRecords=desktop.enabled?desktop.localFonts():await window.OpenShelfLocal.catalog().catch(()=>[]);
function localFont(r){return {slug:r.id.startsWith('local-')?r.id:'local-'+r.id,n:r.name,c:CLS[r.category]?r.category:'sans',source:'local',manual:true,previewFamily:r.previewFamily||'local_'+r.id,d:r.designer||'Not specified',p:r.publisher||'',b:r.description||'Manually added font. Verify its licence and usage rights; it may not be open-source.',lic:r.license||'Unverified — check your licence',w:[r.weight||400],v:false,noItal:r.style!=='italic',regularStyle:r.style||'normal',u:(r.uses||[]).map(label=>Object.keys(USES).find(k=>USES[k]===label)).filter(Boolean),t:(r.feelings||[]).map(label=>Object.keys(THEMES).find(k=>THEMES[k]===label)).filter(Boolean),s:[],a:[],tags:r.tags||'',subsets:[]};}
F.push(...localRecords.map(localFont));
const BY = Object.fromEntries(F.map(f => [f.slug, f]));
const BYNAME = Object.fromEntries(F.map(f => [f.n.toLowerCase(), f.slug]));
const SUB = {
  'inter':['sans:neo'],'work-sans':['sans:grotesque'],'ibm-plex-sans':['sans:grotesque'],'source-sans-3':['sans:humanist'],'manrope':['sans:geometric'],'dm-sans':['sans:geometric'],'space-grotesk':['sans:grotesque'],'poppins':['sans:geometric'],'montserrat':['sans:geometric'],'lato':['sans:humanist'],'open-sans':['sans:humanist'],'atkinson-hyperlegible':['sans:grotesque'],'nunito':['sans:rounded'],'archivo':['sans:grotesque'],'public-sans':['sans:neo'],'outfit':['sans:geometric'],'plus-jakarta-sans':['sans:geometric'],'figtree':['sans:geometric'],'instrument-sans':['sans:neo'],'barlow':['sans:grotesque'],'karla':['sans:grotesque'],'rubik':['sans:rounded'],'bricolage-grotesque':['sans:grotesque'],'chakra-petch':['sans:square'],'raleway':['sans:geometric'],'oswald':['sans:grotesque'],'libre-franklin':['sans:grotesque'],'fira-sans':['sans:humanist'],'merriweather-sans':['sans:humanist'],'pt-sans':['sans:humanist'],'alegreya-sans':['sans:humanist'],'proza-libre':['sans:humanist'],
  'playfair-display':['serif:transitional'],'lora':['serif:oldstyle'],'merriweather':['serif:transitional'],'eb-garamond':['serif:oldstyle'],'libre-baskerville':['serif:transitional'],'crimson-pro':['serif:oldstyle'],'source-serif-4':['serif:transitional'],'fraunces':['serif:oldstyle'],'cormorant-garamond':['serif:oldstyle'],'newsreader':['serif:transitional'],'spectral':['serif:transitional'],'ibm-plex-serif':['serif:transitional'],'dm-serif-display':['serif:transitional'],'young-serif':['serif:oldstyle'],'instrument-serif':['serif:transitional'],'literata':['serif:oldstyle'],'alegreya':['serif:humanist'],'pt-serif':['serif:transitional'],'old-standard-tt':['serif:didone'],'bitter':['serif:slab'],'zilla-slab':['serif:slab'],
  'bebas-neue':['sans:grotesque'],'abril-fatface':['serif:didone','serif:fatface'],'righteous':['sans:geometric'],'anton':['sans:grotesque'],'archivo-black':['sans:grotesque'],'lobster':['calli:informal'],
  'caveat':['calli:handwritten'],'pacifico':['calli:brush'],'dancing-script':['calli:informal'],'kalam':['calli:handwritten'],'shadows-into-light':['calli:handwritten'],'great-vibes':['calli:formal']
};
const APP = {
  'montserrat':['wide'],'nunito':['rounded'],'rubik':['rounded'],'chakra-petch':['techno'],'oswald':['condensed'],'playfair-display':['high-contrast'],'cormorant-garamond':['high-contrast'],'dm-serif-display':['high-contrast'],'instrument-serif':['condensed'],'old-standard-tt':['high-contrast'],
  'bebas-neue':['condensed'],'abril-fatface':['high-contrast'],'syne':['wide'],'righteous':['deco'],'anton':['condensed'],'major-mono-display':['mono','techno']
};
F.forEach(f => { f.s = [...new Set([...(f.s || []), ...(SUB[f.slug] || [])])]; f.a = [...new Set([...(f.a || []), ...(APP[f.slug] || [])])];
  if (/\b(condensed|narrow|compressed)\b/i.test(f.n)) f.a.push('condensed');
  if (/\b(expanded|wide|extended)\b/i.test(f.n)) f.a.push('wide');
  if (/\bmono\b/i.test(f.n)) { f.a.push('mono'); f.u.push('code','data'); }
  if (/\bslab\b/i.test(f.n)) f.s.push('serif:slab');
  if (/\brounded\b/i.test(f.n)) { f.a.push('rounded'); f.t.push('friendly'); }
});
const kindLabel = f => {
  if (f.c === 'mono') return 'Monospace';
  if (f.c === 'display') return 'Display';
  const k = f.s[0]; if (!k) return CLS[f.c];
  if (k === 'serif:slab') return 'Slab serif';
  if (k.startsWith('serif:')) return SUBS[k] + ' serif';
  if (k.startsWith('sans:')) return SUBS[k] + ' sans';
  return SUBS[k];
};
function matches(f, set, k) {
  if (set === 'source') return f.source === k;
  if (set === 'feel') return f.t.includes(k);
  if (set === 'use') return f.u.includes(k);
  if (set === 'tech') return k === 'variable' ? !!f.v : f.a.includes(k);
  if (set === 'app') return k === 'mono' ? (f.c === 'mono' || f.a.includes('mono')) : k === 'display' ? f.c === 'display' : f.a.includes(k);
  if (k === 'serif:*') return f.c === 'serif' || f.c === 'slab' || f.s.some(x => x.startsWith('serif:'));
  if (k === 'sans:*') return f.c === 'sans' || f.s.some(x => x.startsWith('sans:'));
  if (k === 'calli:*') return f.c === 'script' || f.s.some(x => x.startsWith('calli:'));
  return f.s.includes(k);
}
const autoBlurb = f => {
  const k = kindLabel(f).toLowerCase(); const art = /^[aeiou]/.test(k) ? 'An' : 'A';
  const by = f.d ? ` designed by ${f.d}` : '';
  const pub = f.p && f.p !== f.d && !f.p.startsWith(f.d) ? `, published by ${f.p}` : '';
  const uses = f.u.slice(0, 2).map(u => USES[u].toLowerCase());
  return `${art} ${k} typeface${by}${pub}.${uses.length ? ` Suited to ${uses.join(' and ')}.` : ''}`;
};
F.forEach(f => { if (!f.b) f.b = autoBlurb(f); f.hay = [f.n, f.d, f.p, f.b, ...(f.subsets || []), ...(f.labels?.keywords || []),f.tags||'',f.manual?'external imported manually added licence unverified local':'', CLS[f.c], kindLabel(f), ...f.s.map(x => SUBS[x]), ...f.a.map(x => APPEAR[x] || x), ...f.u.map(x => USES[x]), ...f.t.map(x => THEMES[x])].join(' ').toLowerCase(); });
function syncLocalRegistry(){
 const records=desktop.enabled?desktop.localFonts():window.OpenShelfLocal.records();
 F.filter(f=>f.manual).forEach(f=>{delete BY[f.slug];});
 for(let i=F.length-1;i>=0;i--)if(F[i].manual)F.splice(i,1);
 records.map(localFont).forEach(f=>{f.hay=[f.n,f.d,f.b,f.tags,CLS[f.c],'external imported manually added licence unverified local'].join(' ').toLowerCase();F.push(f);BY[f.slug]=f;});
 normaliseCols();saveCols();
}
const filterLabel = (set, k) => set === 'source' ? SOURCES[k] : set === 'feel' ? THEMES[k] : set === 'use' ? USES[k] : set === 'app' ? APPEAR[k] : set === 'tech' ? (k === 'color' ? 'Colour font' : 'Variable') : SUBS[k];

/* ---------- pairings ----------
   prov: family = designed together, classic = long-standing web classic, modern = contemporary favourite */
const PROV = { family:'Designed together', principle:'Type principle', classic:'Web classic', modern:'Editorial pick', award:'Award inspiration', forum:'Community discussion', reference:'Published reference' };
const MOODS = { editorial:'Editorial', elegant:'Sophisticated', modern:'Modern', friendly:'Friendly', technical:'Technical', bold:'Loud', classic:'Classic', corporate:'Business', luxury:'Fancy' };
const PAIRS = [
  {h:'source-serif-4',b:'source-sans-3',hw:600,prov:'family',m:['editorial','corporate','classic'],title:'The Source system',note:'Drawn by Adobe to share proportions and vertical metrics, so the two sit on the same line without fighting.'},
  {h:'ibm-plex-serif',b:'ibm-plex-sans',hw:500,prov:'family',m:['corporate','technical'],title:'IBM Plex',note:'One superfamily for reports, product UI and documentation. The serif carries headings with the same skeleton as the sans.'},
  {h:'alegreya',b:'alegreya-sans',hw:700,prov:'family',m:['editorial','classic','elegant'],title:'Alegreya and its sans',note:'A calligraphic serif and its humanist companion, built on the same pen rhythm. A favourite for literary sites.'},
  {h:'pt-serif',b:'pt-sans',hw:700,prov:'family',m:['classic','corporate'],title:'ParaType public types',note:'Designed as one system with matching metrics and wide language support. Quietly reliable.'},
  {h:'merriweather',b:'merriweather-sans',hw:700,prov:'family',m:['friendly','editorial'],title:'Merriweather pair',note:'Both share Sorkin Type\u2019s large x-height and screen-first proportions, so text blocks keep an even colour.'},
  {h:'dm-serif-display',b:'dm-sans',prov:'family',m:['elegant','modern'],title:'DM type system',note:'Commissioned together; the high-contrast display face sits naturally on DM Sans text.'},
  {h:'instrument-serif',b:'instrument-sans',prov:'family',m:['modern','elegant','luxury'],title:'Instrument',note:'Condensed serif headlines over a precise grotesque from the same studio.'},
  {h:'libre-caslon-display',b:'libre-caslon-text',prov:'family',m:['classic','editorial','elegant'],title:'Libre Caslon',note:'Display and text optical sizes of one Caslon revival: finer details at the top, sturdier forms for reading.'},
  {h:'quattrocento',b:'quattrocento-sans',hw:700,prov:'family',m:['classic','elegant'],title:'Quattrocento',note:'A classical serif and its humanist sans, both by Pablo Impallari, with shared proportions.'},
  {h:'roboto-slab',b:'roboto',hw:700,prov:'family',m:['modern','friendly'],title:'Roboto Slab and Roboto',note:'The same skeleton with and without slabs. Safe and readable for apps and documentation.'},
  {h:'noto-serif',b:'noto-sans',hw:700,prov:'family',m:['classic','corporate'],title:'Noto',note:'Built to cover a vast range of scripts, so this pair holds up on multilingual sites.'},
  {h:'red-hat-display',b:'red-hat-text',hw:700,prov:'family',m:['modern','corporate'],title:'Red Hat',note:'Display and text cuts for one brand: tight and punchy at the top, open and steady below.'},
  {h:'inter-tight',b:'inter',hw:600,prov:'family',m:['modern','technical'],title:'Inter Tight and Inter',note:'The tighter-spaced cut is meant for large headings, the regular one for text. Same designer, same metrics.'},
  {h:'barlow-condensed',b:'barlow',hw:600,prov:'family',m:['technical','bold'],title:'Barlow widths',note:'Contrast through width rather than style: condensed headlines over the normal width keeps a single voice.'},
  {h:'archivo',b:'source-serif-4',hw:700,prov:'principle',m:['editorial','classic'],title:'Grotesque over transitional',note:'The long-standing newspaper formula: a sturdy grotesque for headlines, a transitional serif for reading.'},
  {h:'source-sans-3',b:'crimson-pro',hw:600,prov:'principle',m:['editorial','classic'],title:'Humanist sans with old-style serif',note:'Both grow from the broad-nib pen, so their rhythm agrees while serif and sans give clear contrast. Set the body a little larger.'},
  {h:'bodoni-moda',b:'jost',hw:600,prov:'principle',m:['luxury','elegant','modern'],title:'Didone with geometric sans',note:'Two rationalist styles built on compass and ruler, here from the same designer, Owen Earl. The fashion-magazine look.'},
  {h:'zilla-slab',b:'fira-sans',hw:600,prov:'principle',m:['friendly','technical'],title:'Zilla Slab and Fira Sans',note:'Both were made for Mozilla\u2019s identity, so they were chosen to work side by side.'},
  {h:'libre-baskerville',b:'libre-franklin',hw:700,prov:'principle',m:['classic','editorial'],title:'Baskerville and Franklin',note:'Two American staples revived by the same foundry. Classic contrast of transitional serif and grotesque.'},
  {h:'merriweather',b:'public-sans',hw:700,prov:'principle',m:['corporate','friendly'],title:'Merriweather and Public Sans',note:'Both are offered in the U.S. Web Design System\u2019s font set: a sturdy screen serif with a neutral, accessible sans.'},
  {h:'playfair-display',b:'source-sans-3',hw:700,prov:'classic',m:['editorial','elegant','classic'],title:'Playfair and Source Sans',note:'A widely recommended pairing: high-contrast display serif, neutral humanist text.'},
  {h:'playfair-display',b:'lato',hw:700,prov:'classic',m:['elegant','classic'],title:'Playfair and Lato',note:'Lato\u2019s rounded warmth softens Playfair\u2019s sharp contrast.'},
  {h:'montserrat',b:'merriweather',hw:700,prov:'classic',m:['editorial','friendly'],title:'Montserrat and Merriweather',note:'Wide geometric headings over a screen-tuned serif. Modern but very readable.'},
  {h:'raleway',b:'merriweather',hw:600,prov:'classic',m:['elegant','editorial'],title:'Raleway and Merriweather',note:'Raleway\u2019s refined capitals bring polish; Merriweather does the work in the body.'},
  {h:'oswald',b:'quattrocento',hw:500,prov:'classic',m:['editorial','bold'],title:'Oswald and Quattrocento',note:'Condensed gothic headings over a classical serif; contrast in width and structure.'},
  {h:'abril-fatface',b:'lato',prov:'classic',m:['bold','editorial'],title:'Abril Fatface and Lato',note:'A fat Didone needs a calm partner. Lato keeps everything below the headline easy to read.'},
  {h:'cormorant-garamond',b:'proza-libre',hw:600,prov:'classic',m:['elegant','luxury'],title:'Cormorant and Proza Libre',note:'A delicate display Garamond with a gentle humanist sans. Graceful without being fussy.'},
  {h:'cormorant-garamond',b:'montserrat',hw:600,prov:'classic',m:['luxury','elegant'],title:'Cormorant and Montserrat',note:'Fine serif display with a crisp geometric sans; popular for boutique, fashion and wedding sites.'},
  {h:'poppins',b:'lora',hw:600,prov:'classic',m:['friendly','modern'],title:'Poppins and Lora',note:'Clean geometric headings with a warm, calligraphic text serif.'},
  {h:'arvo',b:'lato',hw:700,prov:'classic',m:['friendly','modern'],title:'Arvo and Lato',note:'A geometric slab for headings with Lato\u2019s warmth underneath. Sturdy and approachable.'},
  {h:'instrument-serif',b:'inter',prov:'modern',m:['modern','elegant','luxury'],title:'Instrument Serif and Inter',note:'A defining landing-page look of recent years: soft condensed serif headlines over a neutral UI sans.'},
  {h:'fraunces',b:'inter',hw:600,prov:'modern',m:['friendly','modern'],title:'Fraunces and Inter',note:'Fraunces brings warmth and personality while Inter stays neatly out of the way.'},
  {h:'newsreader',b:'inter',hw:500,prov:'modern',m:['editorial','modern'],title:'Newsreader and Inter',note:'A screen-first editorial serif with a UI sans. Good for newsletters and content-heavy products.'},
  {h:'inter',b:'jetbrains-mono',hw:600,prov:'modern',m:['technical','modern'],title:'Inter with JetBrains Mono for code',note:'For developer docs: Inter for headings and prose, JetBrains Mono for code blocks and inline code.'}
];
for (const p of window.OPEN_SHELF_PAIRINGS || []) {
  const existing = PAIRS.findIndex(x => x.h === p.h && x.b === p.b);
  if (existing >= 0) PAIRS[existing] = p; else PAIRS.push(p);
}
for (let i = PAIRS.length - 1; i >= 0; i--) if (!BY[PAIRS[i].h] || !BY[PAIRS[i].b]) PAIRS.splice(i, 1);
const pkey = p => p.h + '|' + p.b;

const SAMPLES = [
  {label:'Pangram', text:'Sphinx of black quartz, judge my vow.'},
  {label:'Alphabet', text:'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz'},
  {label:'Numbers', text:'0123456789 \u00a3$\u20ac% (&@#?!) 1/2 3:45'},
  {label:'Headline', text:'Quiet confidence, beautifully set'},
  {label:'Paragraph', text:'Typography is the craft of giving language a durable visual form. Good type disappears into the reading; great type sets the mood before a single word lands.'}
];
const DEFAULT_TEXT = SAMPLES[0].text;
const BODY_SAMPLE = 'Type sets the tone before anyone reads a word. A good pairing usually contrasts in one way, such as structure, weight or width, and agrees in another, like x-height or the overall texture of the text on the page. Type your own words in the bar above to see how these two hold up.';
const SHORT_BODY = 'Good pairings contrast in one way and agree in another, so the page feels deliberate without fighting itself.';

/* ---------- storage ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem('openshelf:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('openshelf:' + k, JSON.stringify(v)); } catch (e) {} }
};

/* ---------- state ---------- */
const DEFAULT_RAND = { hCls:['serif','sans','display','slab'], bCls:['sans','serif'], theme:'', textOnly:true, contrast:true, varOnly:false, from:'' };
const savedUI=store.get('uiPreferences',{});
const ENABLED_ID='openshelf-enabled';
const enabledCollection={id:ENABLED_ID,name:'Enabled',fonts:[],pairs:[],fixed:true,smart:true,preview:cleanCollectionPreview(store.get('enabledPreview',null)),marker:{color:'green',icon:'circle'}};
function allCollections(){if(!desktop.enabled)return state.cols;enabledCollection.fonts=F.filter(f=>desktop.isEnabled(f)).map(f=>f.slug);return [...state.cols,enabledCollection];}
const state = {
  text: store.get('text', ''), size: store.get('size', 48), layout: store.get('layout', 'list'),
  collectionLayout:store.get('collectionLayout','list'), collectionCols:store.get('collectionCols','2'), collectionProofOpen:store.get('collectionProofOpen',false), markerMenu:null,
  gridCols:store.get('gridCols', '2'), limit:48, enabledOnly:desktop.enabled&&!!savedUI.enabledOnly, sort:savedUI.sort||'az', q:savedUI.q||'', f:{source:new Set(), feel:new Set(), app:new Set(), serif:new Set(), sans:new Set(), calli:new Set(), use:new Set(), tech:new Set()}, fmode: store.get('fmode', {}), col:savedUI.col||null,
  prov:savedUI.prov||'', mood:savedUI.mood||'',
  pair: store.get('pair', {h:'instrument-serif', b:'inter'}),
  locks:{h:false, b:false}, history:[],
  rand: Object.assign({}, DEFAULT_RAND, store.get('rand', {})),
  cols: store.get('cols', null), collectionText: String(store.get('collectionText', '')).slice(0,500),
  weight: store.get('gw', 0), ital: store.get('gi', false), card:savedUI.card||{}, exactW:!!savedUI.exactW,
  open: new Set(store.get('openCollections',[])), renaming:null, importOpen:false, shuffle:{}
};
function cleanCollectionPreview(p) {
  return {mode:['name','page','custom'].includes(p?.mode) ? p.mode : 'name',text:String(p?.text || '').slice(0,500)};
}
const COL_COLORS={none:'No colour',red:'Red',orange:'Orange',gold:'Gold',green:'Green',blue:'Blue',purple:'Purple',pink:'Pink'};
const COL_ICONS={none:'No icon',star:'★',heart:'♥',book:'▤',folder:'<svg class="i folder-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5h7l2 2h9v13H3z"/></svg>' ,circle:'●',diamond:'◆',flag:'⚑'};
const cleanMarker=m=>({color:Object.hasOwn(COL_COLORS,m?.color)?m.color:'none',icon:Object.hasOwn(COL_ICONS,m?.icon)?m.icon:'none'});
function normaliseCols() {
  if (!Array.isArray(state.cols)) state.cols = [];
  state.cols = state.cols.filter(c => c && c.id && c.name);
  if (!state.cols.find(c => c.id === 'favs')) state.cols.unshift({id:'favs', name:'Favourites', fonts:[], pairs:[], fixed:true});
  state.cols.forEach(c => {
    c.preview = cleanCollectionPreview(c.preview);c.marker=cleanMarker(c.marker);
    c.fonts = [...new Set((c.fonts || []).filter(s => BY[s]))];
    c.pairs = (c.pairs || []).filter(p => p && BY[p.h] && BY[p.b]);
  });
}
normaliseCols();
if(state.col!==ENABLED_ID&&state.col&&!state.cols.some(c=>c.id===state.col))state.col=null;
for(const [key,values] of Object.entries(savedUI.filters||{}))if(state.f[key]&&Array.isArray(values))state.f[key]=new Set(values);
function persistUI(){store.set('uiPreferences',{enabledOnly:state.enabledOnly,sort:state.sort,q:state.q,col:state.col,prov:state.prov,mood:state.mood,card:state.card,exactW:state.exactW,filters:Object.fromEntries(Object.entries(state.f).map(([k,v])=>[k,[...v]]))});store.set('openCollections',[...state.open]);store.set('collectionProofOpen',state.collectionProofOpen);}
window.addEventListener('pagehide',persistUI);document.addEventListener('visibilitychange',()=>{if(document.hidden)persistUI();});
let preferenceTimer;for(const event of ['click','input','change'])document.addEventListener(event,()=>{clearTimeout(preferenceTimer);preferenceTimer=setTimeout(persistUI,250);});
state.collectionLayout=state.collectionLayout==='grid'?'grid':'list';
if(!/^(auto|[1-6])$/.test(state.collectionCols))state.collectionCols='2';
state.fmode.source = 'any';
if (![0,100,200,300,400,500,600,700,800,900].includes(state.weight)) state.weight = 0;
if (!BY[state.pair.h] || !BY[state.pair.b]) state.pair = {h:'instrument-serif', b:'inter'};
const HS_DEF = {w:0, i:false, size:72, ls:0, up:false}, BS_DEF = {w:0, i:false, size:18, lh:1.7};
function cleanStyle(o, def) { const r = {}; if (o && typeof o === 'object') for (const k in def) if (typeof o[k] === typeof def[k]) r[k] = o[k]; return r; }
function normPS(pr) { return {h:pr.h, b:pr.b, hs:Object.assign({}, HS_DEF, cleanStyle(pr.hs, HS_DEF)), bs:Object.assign({}, BS_DEF, cleanStyle(pr.bs, BS_DEF))}; }
const clonePair = pr => JSON.parse(JSON.stringify(normPS(pr)));
const isDefaultStyle = pr => JSON.stringify(normPS(pr).hs) === JSON.stringify(HS_DEF) && JSON.stringify(normPS(pr).bs) === JSON.stringify(BS_DEF);
state.pair = normPS(state.pair);
const saveCols = () => { store.set('enabledPreview',enabledCollection.preview);store.set('cols', state.cols); updateColCount(); };
const getCol = id => id===ENABLED_ID?allCollections().find(c=>c.id===id):state.cols.find(c=>c.id===id);
const isFav = slug => getCol('favs').fonts.includes(slug);

/* ---------- motion ---------- */
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
function enterMotion(el) {
  if (!el || reducedMotion() || !el.animate) return;
  el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:280,easing:'cubic-bezier(.16,1,.3,1)'});
}
function pulse(el) {
  if (!el || reducedMotion() || !el.animate) return;
  el.animate([{transform:'scale(1)'},{transform:'scale(1.18)',offset:.35},{transform:'scale(1)'}],{duration:380,easing:'cubic-bezier(.22,1,.36,1)'});
}
function savedFeedback() { $$('[data-action="drawer"] .i, #col-count').forEach(pulse); }

/* ---------- helpers ---------- */
const proof = () => state.text || DEFAULT_TEXT;
const nearestW = (f, w) => f.w.reduce((best, x) => { const d = Math.abs(x - w), bd = Math.abs(best - w); return (d < bd || (d === bd && w >= 500 && x > best)) ? x : best; }, f.w[0]);
const libW = f => { const c = state.card[f.slug]; if (c && c.w && f.w.includes(c.w)) return c.w; return state.weight ? nearestW(f, state.weight) : pvWeight(f); };
const libI = f => { const c = state.card[f.slug]; return c && typeof c.i === 'boolean' ? c.i : !!state.ital; };
const familyCSS = f => `${JSON.stringify(desktop.enabled?desktop.fontFamily(f):(f.previewFamily||f.n))}, ${FALLBACK[f.c]}`;
const fam = f => esc(familyCSS(f));
const pvWeight = f => f.w.includes(400) ? 400 : f.w[0];
const headWeight = f => (f.c === 'display' || f.c === 'script') ? pvWeight(f) : (f.w.includes(600) ? 600 : f.w.includes(700) ? 700 : pvWeight(f));
const pairHW = p => { const h = BY[p.h]; return (p.hw && h.w.includes(p.hw)) ? p.hw : headWeight(h); };
const styles = f => f.v ? `Variable ${f.w[0]}\u2013${f.w[f.w.length - 1]}` : `${f.w.length} ${f.w.length === 1 ? 'weight' : 'weights'}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const colSummary = c => { const parts = []; if (c.fonts.length) parts.push(plural(c.fonts.length, 'font')); if (c.pairs.length) parts.push(plural(c.pairs.length, 'pair')); return parts.join(', ') || 'Empty'; };
const findPair = (h, b) => PAIRS.find(p => p.h === h && p.b === b) || {h, b};
const svg = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON = {
  heart:'<svg class="i heart" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.4A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4z"/></svg>',
  save:svg('<path d="M6 3.5h9M6 3.5v17l6-4 6 4V11M19 2.5v6M16 5.5h6"/>'),
  get:svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>'),
  swap:svg('<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>'),
  x:svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  chev:svg('<path d="M9 5l7 7-7 7"/>'),
  down:svg('<path d="M6 9l6 6 6-6"/>'),
  back:svg('<path d="M15 5l-7 7 7 7"/>'),
  dice:svg('<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><circle cx="8.5" cy="8.5" r=".9" style="fill:currentColor"/><circle cx="15.5" cy="15.5" r=".9" style="fill:currentColor"/><circle cx="12" cy="12" r=".9" style="fill:currentColor"/><circle cx="15.5" cy="8.5" r=".9" style="fill:currentColor"/><circle cx="8.5" cy="15.5" r=".9" style="fill:currentColor"/>'),
  undo:svg('<path d="M9 7 4 12l5 5M4 12h11a5 5 0 0 1 0 10h-2"/>'),
  lock:svg('<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  unlock:svg('<rect x="5" y="11" width="14" height="9.5" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.7-1.5"/>'),
  link:svg('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>')
};

/* ---------- font loading ---------- */
const loaded = new Set(), unavailable = new Set();
const fontJobs=new Map(),fontQueue=[];let activeFontJobs=0;
function loadFont(f,weights,ital){if(!f)return Promise.resolve();const id=f.slug+JSON.stringify([weights,ital]);if(fontJobs.has(id))return fontJobs.get(id);const job=new Promise(resolve=>{fontQueue.push(async()=>{try{await performFontLoad(f,weights,ital);}finally{resolve();fontJobs.delete(id);}});});fontJobs.set(id,job);drainFontQueue();return job;}
function drainFontQueue(){while(activeFontJobs<4&&fontQueue.length){activeFontJobs++;fontQueue.shift()().finally(()=>{activeFontJobs--;drainFontQueue();});}}
const available = f => f && !unavailable.has(f.slug) && (!desktop.offline || desktop.has(f));
let availabilityTimer;
function hideUnavailable(f) {
  unavailable.add(f.slug);
  clearTimeout(availabilityTimer);
  availabilityTimer = setTimeout(() => {
    const status = $('#font-status');
    status.hidden = false;
    status.innerHTML = `${unavailable.size} font${unavailable.size === 1 ? '' : 's'} could not load and ${unavailable.size === 1 ? 'is' : 'are'} hidden for this visit. Check your connection or <button class="linkbtn" id="retry-fonts">retry loading</button>.`;
    $('#retry-fonts').onclick = () => { unavailable.clear(); loaded.clear(); status.hidden = true; route(); };
    if (!available(BY[state.pair.h]) || !available(BY[state.pair.b])) {
      const pool = F.filter(available); if (pool.length) state.pair = normPS({h:pool[0].slug,b:(pool[1] || pool[0]).slug});
    }
    if (!$('#view-library').hidden) {
      $$('#results .font').filter(el=>unavailable.has(el.dataset.slug)).forEach(el=>{el.classList.add('font-unavailable');el.setAttribute('aria-hidden','true');el.inert=true;});
      const list=filtered();syncPanel(list);renderCatalogCount(list.length,true);
    }
  }, 180);
}
function addSheet(q, url) {
  return new Promise((resolve,reject) => {
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = url || `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
    const timeout = setTimeout(() => { l.remove(); reject(new Error('Font request timed out')); }, 20000);
    l.onload = () => { clearTimeout(timeout); resolve(); };
    l.onerror = async () => { clearTimeout(timeout); l.remove();const error=new Error('Font stylesheet unavailable');try{const response=await fetch(l.href,{signal:AbortSignal.timeout(8000)});error.missing=[400,404,410].includes(response.status);}catch{}reject(error); };
    document.head.appendChild(l);
  });
}
async function performFontLoad(f, weights, ital) {
  if (!available(f) || (navigator.onLine===false&&!desktop.enabled&&!f.manual)) return;
  if (f.manual && !desktop.enabled) {try{await window.OpenShelfLocal.load(f);}catch(e){hideUnavailable(f);}return;}
  if (desktop.enabled) { try { if(await desktop.load(f))return; } catch(e) { if(desktop.offline){hideUnavailable(f);return;} } if(desktop.offline)return; }
  let ws = (weights || [pvWeight(f)]).filter(w => f.w.includes(w));
  if (!ws.length) ws = [pvWeight(f)];
  ws = [...new Set(ws)].sort((a,b) => a-b);
  ital = f.regularStyle === 'italic' || (!!ital && !f.noItal);
  const key = f.n + ':' + ws.join(',') + (ital ? ':i' : '');
  if (loaded.has(key)) return;
  loaded.add(key);
  const family = encodeURIComponent(f.n).replace(/%20/g,'+');
  async function verify() {
    const result = await document.fonts.load(`${ital ? 'italic ' : ''}${ws[0]} 20px "${f.n}"`, ' ');
    if (!result.length) {
      const faces = [...document.fonts].filter(x => x.family.replace(/["']/g,'') === f.n);
      if (!faces.length) throw new Error('No font face returned');
      await faces[0].load();
    }
  }
  const request = () => f.source === 'fontsource'
    ? Promise.all(ws.map(w => addSheet('', `https://cdn.jsdelivr.net/npm/@fontsource/${f.fontsourceId}@${f.fontsourceVersion}/${w}${ital ? '-italic' : ''}.css`)))
    : addSheet(family + (ital ? ':ital,wght@' + ws.map(w => '1,' + w).join(';') : ':wght@' + ws.join(';')));
  try { await request(); await verify(); }
  catch (e) {
    // Retry the actual regular style before hiding an entire family.
    try { ital = f.regularStyle === 'italic'; ws = [pvWeight(f)]; await request(); await verify(); }
    catch (err) { loaded.delete(key);if(err.missing&&!desktop.offline&&navigator.onLine!==false)hideUnavailable(f);else transientFontFailure(); }
  }
}
let transientNoticeTimer;
function transientFontFailure(){if(navigator.onLine===false||desktop.offline)return;clearTimeout(transientNoticeTimer);transientNoticeTimer=setTimeout(()=>{const status=$('#font-status');if(unavailable.size)return;status.hidden=false;status.innerHTML='Some previews are temporarily unavailable. <button class="linkbtn" id="retry-fonts">Retry previews</button>';$('#retry-fonts').onclick=()=>{status.hidden=true;$$('[data-slug]').forEach(el=>{const f=BY[el.dataset.slug];if(f)loadFont(f,[libW(f)],libI(f));});};},1000);}
window.addEventListener('online',()=>{if(desktop.enabled)return;const status=$('#font-status');status.hidden=true;$$('#results .font').forEach(el=>{const f=BY[el.dataset.slug];if(f)loadFont(f,[libW(f)],libI(f));});});
const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { const f = BY[e.target.dataset.slug]; if (f) loadFont(f, [libW(f)], libI(f)); io.unobserve(e.target); } }), {rootMargin:'600px 0px'})
  : null;

/* ---------- toast ---------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400); }

/* ---------- proof bar ---------- */
function updatePreviews() { window.OpenShelfLocal.updatePreview(); const t = proof(); $$('[data-pv]').forEach(el => { el.textContent = t; }); $$('#presets button').forEach(b => b.setAttribute('aria-pressed', String(proof() === b.dataset.text))); }
function setupProof() {
  const inp = $('#proof-input');
  inp.value = state.text;
  const syncField = () => { const has = !!state.text; $('#proof-clear').hidden = !has; $('#proof-hint').hidden = !has; };
  inp.addEventListener('input', () => { state.text = inp.value; store.set('text', state.text); updatePreviews(); syncField(); });
  $('#proof-field').addEventListener('click', e => { if (!e.target.closest('button')) inp.focus(); });
  $('#proof-clear').addEventListener('click', () => { state.text = ''; inp.value = ''; store.set('text', ''); updatePreviews(); syncField(); inp.focus(); });
  syncField();
  const sum = () => { $('#style-sum').textContent = (state.weight ? `${state.weight} ${WNAME[state.weight]}` : 'Font default') + (state.ital ? ', italic' : ''); $('#ital-btn').setAttribute('aria-pressed', String(state.ital)); const ex = $('#exact-w'); ex.disabled = !state.weight; if (!state.weight) { ex.checked = false; state.exactW = false; } };
  const renderW = () => { $('#wsel').innerHTML = '<span class="wlab">Weight</span>' + [0,100,200,300,400,500,600,700,800,900].map(w => `<button data-w="${w}" aria-pressed="${w === state.weight}" title="${w ? w + ' ' + WNAME[w] : 'Each font\u2019s regular weight'}">${w || 'Default'}</button>`).join(''); };
  renderW(); sum();
  const st = $('#style-toggle'), ps = $('#proof-style');
  const setOpen = o => { ps.hidden = !o; st.setAttribute('aria-expanded', String(o)); store.set('styleOpen', o); };
  setOpen(!!store.get('styleOpen', false));
  st.addEventListener('click', () => setOpen(ps.hidden));
  $('#wsel').addEventListener('click', e => { const b = e.target.closest('button[data-w]'); if (!b) return; state.weight = +b.dataset.w; state.card = {}; store.set('gw', state.weight); renderW(); sum(); renderLibrary(); });
  $('#ital-btn').addEventListener('click', () => { state.ital = !state.ital; state.card = {}; store.set('gi', state.ital); sum(); renderLibrary(); });
  $('#exact-w').addEventListener('change', e => { state.exactW = e.target.checked; refilter(); });
  $('#presets').innerHTML = SAMPLES.map(s => `<button data-text="${esc(s.text)}" aria-pressed="false">${s.label}</button>`).join('');
  $('#presets').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; state.text = b.dataset.text; inp.value = state.text; store.set('text', state.text); updatePreviews(); syncField(); });
  const sz = $('#size');
  const apply = () => { document.documentElement.style.setProperty('--pv-size', state.size + 'px'); $('#size-out').textContent = state.size + 'px'; };
  sz.value = state.size; apply();
  const mh = () => document.documentElement.style.setProperty('--proof-h', $('#proof').offsetHeight + 'px');
  mh(); window.addEventListener('resize', mh); if ('ResizeObserver' in window) new ResizeObserver(mh).observe($('#proof'));
  sz.addEventListener('input', () => { state.size = +sz.value; apply(); store.set('size', state.size); });
}

/* ---------- library ---------- */
const REP = {
  corporate:'ibm-plex-sans', minimal:'quicksand', modern:'space-grotesk', classic:'eb-garamond', elegant:'cormorant-garamond', luxury:'bodoni-moda', friendly:'nunito', playful:'fredoka', retro:'shrikhand', bold:'anton', technical:'orbitron', quirky:'bricolage-grotesque',
  condensed:'oswald', wide:'krona-one', rounded:'varela-round', 'high-contrast':'playfair-display', mono:'jetbrains-mono', display:'bebas-neue', techno:'audiowide', deco:'poiret-one', stencil:'black-ops-one', pixel:'silkscreen', blackletter:'unifrakturmaguntia', typewriter:'special-elite', inline:'monoton', shaded:'bungee-shade',
  'serif:*':'source-serif-4', 'serif:oldstyle':'eb-garamond', 'serif:transitional':'libre-baskerville', 'serif:didone':'bodoni-moda', 'serif:humanist':'alegreya', 'serif:slab':'roboto-slab', 'serif:fatface':'abril-fatface', 'serif:glyphic':'cinzel', 'serif:clarendon':'besley',
  'sans:*':'inter', 'sans:geometric':'jost', 'sans:grotesque':'work-sans', 'sans:neo':'public-sans', 'sans:humanist':'fira-sans', 'sans:rounded':'nunito', 'sans:square':'chakra-petch',
  'calli:*':'dancing-script', 'calli:handwritten':'caveat', 'calli:informal':'courgette', 'calli:formal':'great-vibes', 'calli:brush':'kaushan-script',
  body:'source-serif-4', headlines:'montserrat', ui:'inter', longform:'literata', editorial:'newsreader', branding:'outfit', posters:'bebas-neue', code:'jetbrains-mono', data:'ibm-plex-mono', accessibility:'atkinson-hyperlegible', invitations:'great-vibes', packaging:'lobster',
  variable:'roboto-flex', color:'nabla'
};
function buildPanel() {
  const closed = new Set(store.get('fclosed', []));
  $('#fpanel').innerHTML = `
    <div class="fp-head"><h2>Filters</h2><button class="linkbtn" data-action="clear">Reset</button><button class="ib fp-hide" data-action="fpanel-hide" aria-label="Hide filters" title="Hide filters"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M9.5 4.5v15M15.5 10l-2 2 2 2"/></svg></button><button class="ib fp-close" data-action="fpanel-close" aria-label="Close filters">${ICON.x}</button></div>
    ${SECTIONS.map(sec => `<details class="fsec" data-sec="${sec.id}" ${closed.has(sec.id) ? '' : 'open'}>
      <summary><span>${sec.title}</span><span class="fsel" style="visibility:hidden">0</span>${ICON.chev}</summary>
      ${sec.set === 'source' ? '' : `<div class="fmode" role="group" aria-label="How picks in ${sec.title} combine"><button data-action="fmode" data-set="${sec.set}" data-mode="all" title="Show fonts that have every pick">Match all</button><button data-action="fmode" data-set="${sec.set}" data-mode="any" title="Show fonts that have at least one pick">Match any</button></div>`}
      <div class="fchips">${Object.entries(sec.opts).map(([k, l]) => {
        if (sec.set!=='source' && !F.some(f => matches(f, sec.set, k))) return '';
        const r = BY[REP[k]];
        const ag = r ? `<span class="fag" aria-hidden="true" style="font-family:${fam(r)};font-weight:${pvWeight(r)}">${k === 'code' ? '{ }' : 'Ag'}</span>` : '';
        return `<button class="fchip" data-action="fchip" data-set="${sec.set}" data-val="${k}" aria-pressed="false">${ag}${esc(l)}<span class="c"></span></button>`;
      }).join('')}</div>
    </details>`).join('')}
    <p class="fhint">Fonts must match every pick within a section. Switch a section to \u201cMatch any\u201d to see fonts with at least one of its picks.</p>
    <div class="fp-foot"><button class="btn primary" data-action="fpanel-close" id="fp-show">Show fonts</button></div>`;
  [...new Set(Object.values(REP))].forEach(sl => { if (BY[sl] && !desktop.enabled) loadFont(BY[sl]); });
}
function filterCtx() { return { q: state.q.trim().toLowerCase(), col: state.col ? getCol(state.col) : null }; }
function passes(f, ctx, extra) {
  if (!available(f)||(state.enabledOnly&&!desktop.isEnabled(f))) return false;
  for (const set in state.f) {
    let sel = state.f[set];
    if (extra && extra.set === set) { sel = new Set(extra.only ? [] : sel); sel.add(extra.k); }
    if (!sel.size) continue;
    const arr = [...sel];
    const ok = state.fmode[set] === 'any' ? arr.some(k => matches(f, set, k)) : arr.every(k => matches(f, set, k));
    if (!ok) return false;
  }
  if (state.exactW && state.weight && !f.w.includes(state.weight)) return false;
  if (ctx.col && !ctx.col.fonts.includes(f.slug)) return false;
  if (ctx.q && !ctx.q.split(/\s+/).every(word=>f.hay.includes(word))) return false;
  return true;
}
function syncPanel(list) {
  const ctx = filterCtx();
  $$('#fpanel .fchip').forEach(b => {
    const set = b.dataset.set, k = b.dataset.val, on = state.f[set].has(k);
    b.setAttribute('aria-pressed', String(on));
    const n = set === 'source' ? F.filter(f => passes(f, ctx, {set, k, only:true})).length : on ? list.filter(f => matches(f, set, k)).length : F.filter(f => passes(f, ctx, {set, k})).length;
    $('.c', b).textContent = n; b.classList.toggle('zero', !n && !on);
  });
  $$('#fpanel .fmode button').forEach(b => b.setAttribute('aria-pressed', String((state.fmode[b.dataset.set] || 'all') === b.dataset.mode)));
  $$('#fpanel .fsec').forEach(d => {
    const sec = SECTIONS.find(x => x.id === d.dataset.sec);
    const c = state.f[sec.set].size;
    const b = $('.fsel', d); b.textContent = c || 0; b.style.visibility = c ? 'visible' : 'hidden';
  });
  const total = Object.values(state.f).reduce((a, x) => a + x.size, 0) + (state.exactW ? 1 : 0) + (state.col ? 1 : 0);
  const fc = $('#fcount'); fc.textContent = total; fc.hidden = !total;
  $('#fp-show').textContent = list.length === 1 ? 'Show 1 font' : `Show ${list.length} fonts`;
}
function filtered() {
  const ctx = filterCtx();
  const list = F.filter(f => passes(f, ctx));
  const by = { az:(a, b) => a.n.localeCompare(b.n), za:(a, b) => b.n.localeCompare(a.n), new:(a, b) => (b.y || 0) - (a.y || 0) || a.n.localeCompare(b.n), old:(a, b) => (a.y || 9999) - (b.y || 9999) || a.n.localeCompare(b.n), weights:(a, b) => b.w.length - a.w.length || a.n.localeCompare(b.n), random:(a, b) => (state.shuffle[a.slug] || 0) - (state.shuffle[b.slug] || 0) }[state.sort];
  return list.sort(by);
}
function fontCard(f) {
  const el = document.createElement('article');
  el.className = 'font'; el.dataset.slug = f.slug;
  el.innerHTML = `
    <div class="font-head">
      <a class="font-name" href="#/font/${f.slug}">${esc(f.n)}</a>
      ${f.manual?'<span class="manual-badge spaced-meta"><span>External import</span><span>Licence unverified</span></span>':''}<span class="meta m1">${esc(f.d)}</span><span class="meta">${kindLabel(f)}</span><span class="meta">${styles(f)}</span>${f.y ? `<span class="meta">${f.y}</span>` : ''}${state.weight && !(state.card[f.slug] && state.card[f.slug].w) && libW(f) !== state.weight ? `<span class="meta" title="${esc(f.n)} doesn't come in ${state.weight}">Shown at ${libW(f)}</span>` : ''}<span class="meta" data-noital="${f.slug}" ${f.noItal && libI(f) ? '' : 'hidden'}>No true italic</span>
      <div class="font-acts"><div class="font-style-controls">
        <select class="mini" data-card="w" data-slug="${f.slug}" aria-label="Weight for ${esc(f.n)}" ${f.w.length === 1 ? 'disabled' : ''}>${f.w.map(w => `<option value="${w}" ${w === libW(f) ? 'selected' : ''}>${w} ${WNAME[w] || ""}</option>`).join('')}</select>
        <button class="ib ibt" data-action="cardi" data-slug="${f.slug}" aria-pressed="${libI(f)}" aria-label="Italic for ${esc(f.n)}" title="Italic"><i>I</i></button></div><div class="font-save-controls">
        <button class="ib" data-action="fav" data-slug="${f.slug}" aria-pressed="${isFav(f.slug)}" aria-label="Favourite ${esc(f.n)}" title="Favourite">${ICON.heart}</button>
        <button class="ib" data-action="save" data-kind="font" data-slug="${f.slug}" aria-label="Save ${esc(f.n)} to a collection" title="Save to collection">${ICON.save}</button>
        </div><div class="font-device-controls" data-device-font="${esc(f.slug)}" data-device-name="${esc(f.n)}">${desktop.enabled ? desktop.buttons(f,true) : f.manual?`<a class="btn sm" href="#/local">Local details</a>` : `<a class="ib" href="${f.gf}" target="_blank" rel="noopener" aria-label="Download ${esc(f.n)} from ${SOURCES[f.source]}" title="Download">${ICON.get}</a>`}</div>
      </div>
    </div>
    <a class="pv" href="#/font/${f.slug}" data-pv tabindex="-1" style="font-family:${fam(f)};font-weight:${libW(f)};font-style:${libI(f) ? 'italic' : 'normal'}"></a>`;
  $('.pv', el).textContent = proof();
  return el;
}
function replaceCard(slug, focusSel) {
  const old = $(`#results .font[data-slug="${slug}"]`); const f = BY[slug]; if (!old || !f) return;
  const n = fontCard(f); old.replaceWith(n); loadFont(f, [libW(f)], libI(f));
  if (focusSel) { const t = $(focusSel, n); if (t) t.focus(); }
}
function renderToolbarState() {
  $('#sort').value = state.sort;
  $('#exact-w').checked = state.exactW;
  if ($('#q').value !== state.q) $('#q').value = state.q;
  $$('.seg button[data-layout]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.layout === state.layout)));
}
function renderActive() {
  const chips = [];
  for (const set of Object.keys(state.f)) state.f[set].forEach(v => chips.push([set, v, filterLabel(set, v)]));
  if (state.col && getCol(state.col)) chips.push(['col', state.col, 'In \u201c' + getCol(state.col).name + '\u201d']);
  if (state.exactW) chips.push(['exactw', '', `Comes in ${state.weight} ${WNAME[state.weight]}`]);
  $('#active').innerHTML = chips.map(([g, v, l]) => `<button class="pill" data-action="unfilter" data-group="${g}" data-val="${esc(v)}" aria-label="Remove filter ${esc(l)}">${esc(l)}${ICON.x}</button>`).join('') +
    (chips.length || state.q ? '<button class="linkbtn" data-action="clear">Reset</button>' : '');
}
function renderCatalogCount(total,failed=false) {
  $('#count').innerHTML=[`${total.toLocaleString()} fonts`,`Showing ${Math.min(state.limit,total)}`,`Catalog synced ${esc(catalog.updatedAt)}`,...(failed?['Unavailable previews hidden']:[])].map(t=>`<span>${t}</span>`).join('');
}
function renderLibrary() {
  const savedY=window.scrollY;
  renderToolbarState(); renderActive();
  const list = filtered();
  syncPanel(list);
  renderCatalogCount(list.length);
  $('#load-more').hidden = state.limit >= list.length;
  const box = $('#results');
  box.className = 'results ' + state.layout + (state.gridCols === 'auto' ? ' auto-cols' : '');
  box.dataset.columns = state.gridCols;
  box.style.setProperty('--grid-cols', /^[1-6]$/.test(state.gridCols) ? state.gridCols : '3');
  $('.grid-control').hidden = state.layout !== 'grid';
  $('#grid-columns').value = state.gridCols;
  if (io) io.disconnect();
  box.innerHTML = '';
  if (!list.length) {
    const c = state.col && getCol(state.col);
    box.className = 'results';
    box.innerHTML = c && !c.fonts.length
      ? `<div class="empty"><h2>No fonts in this collection</h2><p>Use the save button on any font to add it here.</p><button class="btn" data-action="clear">Show all fonts</button></div>`
      : `<div class="empty"><h2>Nothing matches</h2><p>Remove a filter or two, or search by designer or foundry instead.</p><button class="btn" data-action="clear">Reset filters</button></div>`;
    return;
  }
  const frag = document.createDocumentFragment();
  list.slice(0,state.limit).forEach(f => { const c = fontCard(f); frag.appendChild(c); io ? io.observe(c) : loadFont(f, [libW(f)], libI(f)); });
  box.appendChild(frag);
  window.scrollTo({top:savedY,behavior:'instant'});
}
function anchorLib() {
  const lib = $('#view-library'); if (lib.hidden) return;
  const pad = parseFloat(getComputedStyle(lib).paddingTop) || 0;
  const target = Math.max(0, lib.getBoundingClientRect().top + scrollY + pad - $('#proof').offsetHeight - 18);
  if (scrollY > target) window.scrollTo(0, target);
}
function refilter() { state.limit = 48; renderLibrary(); anchorLib(); }
function clearFilters() { state.enabledOnly=false;$('.enabled-only')?.setAttribute('aria-pressed','false');Object.values(state.f).forEach(x => x.clear()); state.col = null; state.q = ''; state.exactW = false; }
function reshuffle() { F.forEach(f => { state.shuffle[f.slug] = Math.random(); }); }

/* ---------- popover ---------- */
const pop = () => $('#pop');
function placePop(anchor) {
  const p = pop(); p.hidden = false;
  const r = anchor.getBoundingClientRect(); const w = p.offsetWidth; const h = p.offsetHeight;
  let top = r.bottom + 8; if (top + h > innerHeight - 10 && r.top - h - 8 > 10) top = r.top - h - 8;
  p.style.top = (top + scrollY) + 'px';
  p.style.left = (Math.max(12, Math.min(r.left, innerWidth - w - 12)) + scrollX) + 'px';
  p._anchor = anchor;
}
function closePop(refocus) { const p = pop(); if (p.hidden) return; p.hidden = true; p.className = 'pop'; if (refocus && p._anchor && document.contains(p._anchor)) p._anchor.focus(); }
function openSaveMenu(btn, item) {
  const p = pop(); p.className = 'pop'; p.dataset.kind = 'save'; p._item = item;
  const label = item.kind === 'font' ? BY[item.slug].n : `${BY[item.h].n} + ${BY[item.b].n}`;
  const has = c => item.kind === 'font' ? c.fonts.includes(item.slug) : c.pairs.some(x => pkey(x) === pkey(item));
  p.innerHTML = `<h4>Save ${esc(label)}</h4>
    <form class="inline-new" data-form="pop-new"><input type="text" placeholder="New collection" aria-label="New collection name" maxlength="60"><button class="btn sm primary" type="submit">Create</button></form>
    <div class="opts">${state.cols.map(c => `<label><input type="checkbox" data-col="${c.id}" ${has(c) ? 'checked' : ''}> ${esc(c.name)}<span class="c">${colSummary(c) === 'Empty' ? '' : colSummary(c)}</span></label>`).join('')}</div>`;
  placePop(btn); enterMotion(p);
  if (matchMedia('(pointer:fine)').matches) $('input[type=text]', p).focus(); else $('input', p).focus();
}

/* ---------- collections model ---------- */
function newCollection(name, fonts, pairs) {
  name = (name || '').trim(); if (!name) return null;
  const c = {id:'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, fonts:[...new Set(fonts || [])], pairs:pairs || [], preview:cleanCollectionPreview(),marker:cleanMarker()};
  state.cols.push(c); saveCols(); savedFeedback(); return c;
}
function setFont(colId, slug, on) {
  const c = getCol(colId); if (!c) return; const has = c.fonts.includes(slug); if (on === undefined) on = !has;
  if (on && !has) c.fonts.push(slug); if (!on && has) c.fonts = c.fonts.filter(s => s !== slug); saveCols(); if (on && !has) savedFeedback();
}
function setPair(colId, pr, on) {
  const c = getCol(colId); if (!c) return; const has = c.pairs.some(x => pkey(x) === pkey(pr)); if (on === undefined) on = !has;
  if (on && !has) c.pairs.push(pr.hs && !isDefaultStyle(pr) ? {h:pr.h, b:pr.b, hs:normPS(pr).hs, bs:normPS(pr).bs} : {h:pr.h, b:pr.b}); if (!on && has) c.pairs = c.pairs.filter(x => pkey(x) !== pkey(pr)); saveCols(); if (on && !has) savedFeedback();
}
function updateColCount() {
  const n = state.cols.reduce((a, c) => a + c.fonts.length + c.pairs.length, 0);
  $$('#col-count,[data-collection-count]').forEach(b=>{b.textContent=n;b.hidden=!n;});
}
function refreshFav(slug) { $$(`[data-action="fav"][data-slug="${slug}"]`).forEach(b => b.setAttribute('aria-pressed', String(isFav(slug)))); }
function afterColChange() { if(desktop.enabled)desktop.syncCollections(state.cols); if (drawerOpen() || !$('#view-collections').hidden) renderDrawer(); if (!$('#view-library').hidden && state.col) renderLibrary(); else if (!$('#view-library').hidden) renderActive(); }

/* ---------- export / import ---------- */
function exportObj(cols) {
  const fontRef = slug => BY[slug].manual ? {id:slug,name:BY[slug].n,source:'local'} : BY[slug].n;
  return { app:'open-shelf', version:1, exported:new Date().toISOString(),
    collections: cols.map(c => ({ name:c.name, marker:c.marker, preview:{...c.preview, ...(c.preview.mode === 'page' ? {pageText:state.collectionText} : {})}, fonts:c.fonts.map(fontRef), pairs:c.pairs.map(p => Object.assign({heading:fontRef(p.h), body:fontRef(p.b)}, p.hs ? {headingStyle:p.hs, bodyStyle:p.bs} : {})) })) };
}
const fileName = s => (s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'collection') + '.json';
let dlCap;
const getDownloads = () => {
  if (dlCap === undefined) dlCap = (window.claude && typeof window.claude.use === 'function') ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
  return dlCap;
};
async function download(name, text) {
  const dl = await getDownloads();
  if (dl) {
    try { await dl.save({filename:name, data:text}); toast(`Exported ${name}`); }
    catch (e) {
      const code = e && e.code;
      if (code === 'declined') return;
      if (code === 'rate_limited') { toast('A save prompt is already open'); return; }
      copyText(text, 'Download unavailable here, so the JSON was copied instead');
    }
    return;
  }
  try {
    const url = URL.createObjectURL(new Blob([text], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
    toast(`Exported ${name}`);
  } catch (e) { copyText(text, 'Download blocked here, so the JSON was copied instead'); }
}
const resolve = v => { if (!v) return null;if(typeof v==='object')return v.source==='local'&&BY[v.id]?.manual?v.id:null; const s = String(v).trim().toLowerCase(); return BY[s] ? s : (BYNAME[s] || BY[s.replace(/\s+/g, '-')] && s.replace(/\s+/g, '-') || null); };
function importFrom(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data && data.collections) ? data.collections : (data && data.name ? [data] : null);
  if (!list) throw new Error('shape');
  let made = 0, merged = 0, skipped = 0;
  list.forEach(raw => {
    if (!raw || typeof raw !== 'object') return;
    const fonts = (raw.fonts || []).map(x => { const s = resolve(x); if (!s) skipped++; return s; }).filter(Boolean);
    const pairs = (raw.pairs || []).map(p => { const h = resolve(p && (p.heading || p.h)), b = resolve(p && (p.body || p.b)); if (!h || !b) { skipped++; return null; } const o = {h, b}; if (p.headingStyle || p.bodyStyle) { const n = normPS({h, b, hs:p.headingStyle, bs:p.bodyStyle}); o.hs = n.hs; o.bs = n.bs; } return o; }).filter(Boolean);
    const name = String(raw.name || 'Imported collection').slice(0, 60).trim() || 'Imported collection';
    if (name.toLowerCase() === 'favourites' || name.toLowerCase() === 'favorites') {
      const f = getCol('favs'); fonts.forEach(s => { if (!f.fonts.includes(s)) f.fonts.push(s); }); pairs.forEach(p => { if (!f.pairs.some(x => pkey(x) === pkey(p))) f.pairs.push(p); }); merged++;
    } else {
      let n = name; let i = 2; while (state.cols.some(c => c.name.toLowerCase() === n.toLowerCase())) n = `${name} (${i++})`;
      const added = newCollection(n, fonts, pairs); added.marker=cleanMarker(raw.marker);added.preview = cleanCollectionPreview(raw.preview); if (added.preview.mode === 'page' && typeof raw.preview.pageText === 'string') added.preview = {...added.preview,mode:'custom',text:raw.preview.pageText.slice(0,500)}; made++;
    }
  });
  saveCols();
  return {made, merged, skipped};
}
function importText(txt) {
  let data;
  try { data = JSON.parse(txt); } catch (e) { toast('That isn\u2019t valid JSON. Paste an OpenShelf export file.'); return false; }
  try {
    const r = importFrom(data);
    const parts = []; if (r.made) parts.push(`Imported ${plural(r.made, 'collection')}`); if (r.merged) parts.push('merged into Favourites'); if (r.skipped) parts.push(`${r.skipped} unknown ${r.skipped === 1 ? 'item' : 'items'} skipped`);
    toast(parts.join(', ') || 'Nothing to import');
    return true;
  } catch (e) { toast('No collections found in that file.'); return false; }
}
const b64e = s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));
function shareLink(c) { return location.href.split('#')[0] + '#/import/' + b64e(JSON.stringify(exportObj([c]))); }
async function copyText(text, msg) {
  try { await navigator.clipboard.writeText(text); toast(msg || 'Copied to clipboard'); }
  catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (err) {}
    ta.remove(); toast(ok ? (msg || 'Copied to clipboard') : 'Copy was blocked. Try the export button instead.');
  }
}
function embedCode(c) {
  const slugs = [...new Set([...c.fonts, ...c.pairs.flatMap(p => [p.h, p.b])])];
  if (!slugs.length) return '';
  const fonts = slugs.map(s => BY[s]).filter(f=>!f.manual);
  const fams = fonts.filter(f => f.source !== 'fontsource').map(f => { let ws = [400, 700].filter(w => f.w.includes(w)); if (!ws.length) ws = [pvWeight(f)]; return 'family=' + encodeURIComponent(f.n).replace(/%20/g,'+') + (f.w.length === 1 ? '' : ':wght@' + ws.join(';')); }).join('&');
  const links = fams ? [`<link href="https://fonts.googleapis.com/css2?${fams}&display=swap" rel="stylesheet">`] : [];
  fonts.filter(f => f.source === 'fontsource').forEach(f => links.push(`<link href="https://cdn.jsdelivr.net/npm/@fontsource/${f.fontsourceId}@${f.fontsourceVersion}/index.css" rel="stylesheet">`));
  return (slugs.some(s=>BY[s].manual)?'<!-- Manually added fonts omitted: verify licences and supply your own licensed files. -->\n':'') + links.join('\n') + '\n\n' + fonts.map(f => `/* ${f.n} */ font-family: ${JSON.stringify(f.n)}, ${FALLBACK[f.c]};`).join('\n');
}

/* ---------- mobile navigation ---------- */
let navAnimation;
function setNavOpen(open) {
  const nav=$('#main-nav'), button=$('#nav-toggle');
  const mobile=matchMedia('(max-width:700px)').matches;
  const clear=()=>{nav.style.height='';nav.style.opacity='';nav.style.marginTop='';};
  if (!mobile) { navAnimation?.cancel();navAnimation=null;clear();nav.classList.remove('is-open');nav.inert=false;button.setAttribute('aria-expanded','false');return; }
  if ((button.getAttribute('aria-expanded')==='true')===open) return;
  const wasOpen=nav.classList.contains('is-open'),from=wasOpen?nav.getBoundingClientRect().height:0;
  const opacity=wasOpen?getComputedStyle(nav).opacity:0,margin=wasOpen?getComputedStyle(nav).marginTop:'0px';
  navAnimation?.cancel();navAnimation=null;clear();
  button.setAttribute('aria-expanded',String(open));nav.inert=!open;
  if(reducedMotion()||!nav.animate){nav.classList.toggle('is-open',open);return;}
  nav.classList.add('is-open');const to=open?nav.scrollHeight:0;
  const animation=nav.animate([{height:from+'px',opacity,marginTop:margin},{height:to+'px',opacity:open?1:0,marginTop:open?'12px':'0px'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
  navAnimation=animation;
  animation.onfinish=()=>{if(navAnimation!==animation)return;nav.classList.toggle('is-open',open);animation.cancel();navAnimation=null;clear();};
}

$('#nav-toggle').addEventListener('click', () => setNavOpen($('#nav-toggle').getAttribute('aria-expanded') !== 'true'));
$('#main-nav').addEventListener('click', e => {
  if (!e.target.closest('a')) return;
  const wasOpen = $('#nav-toggle').getAttribute('aria-expanded') === 'true';
  setNavOpen(false);
  if (wasOpen) requestAnimationFrame(() => $('#main').focus({preventScroll:true}));
});
document.addEventListener('click', e => {
  if (!e.target.closest('.top')) setNavOpen(false);
  if (e.target.closest('#drawer a[href^="#"]')) closeDrawer();
});
window.matchMedia('(max-width:700px)').addEventListener('change', () => setNavOpen(false));

/* ---------- drawer ---------- */
const drawerOpen = () => $('#drawer').classList.contains('on');
let drawerOpener = null, drawerCloseTimer;
function openDrawer(focusNew) {
  setNavOpen(false);
  clearTimeout(drawerCloseTimer); $('#drawer').inert=false;
  drawerOpener = document.activeElement;
  renderDrawer();
  const s = $('#scrim'); s.hidden = false; requestAnimationFrame(() => s.classList.add('on'));
  $('#drawer').classList.add('on');
  $$('[data-action="drawer"]').forEach(b => b.setAttribute('aria-expanded', 'true'));
  setTimeout(() => { const t = focusNew ? $('#drawer [data-form="dr-new"] input') : $('#drawer .dr-head .ib'); if (t) t.focus(); }, 60);
}
function closeDrawer() {
  if (!drawerOpen()) return;
  $('#drawer').classList.remove('on'); const s = $('#scrim'); s.classList.remove('on'); $('#drawer').inert=true; drawerCloseTimer=setTimeout(() => { s.hidden = true; }, reducedMotion()?0:360);
  $$('[data-action="drawer"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
  state.importOpen = false; state.renaming = null;
  if (!$('#view-collections').hidden) { renderCollectionsPage(); updateCollectionPreviews(); }
  if (drawerOpener && document.contains(drawerOpener)) drawerOpener.focus({preventScroll:true});
  else $('[data-action="drawer"]', $('.top'))?.focus({preventScroll:true});
}
function collectionPreviewText(c, f) {
  return (c.preview.mode === 'custom' ? c.preview.text : c.preview.mode === 'page' ? state.collectionText : '') || f.n;
}
function updateCollectionPreviews() {
  $$('[data-col-preview]').forEach(el => { const c=getCol(el.dataset.col), f=BY[el.dataset.font]; if(c && f) el.textContent=collectionPreviewText(c,f); });
  $$('[data-preview-label]').forEach(el => { const c=getCol(el.dataset.previewLabel); el.hidden = c.preview.mode === 'name' || !(c.preview.mode === 'page' ? state.collectionText : c.preview.text); });
}
function collectionPreviewControls(c) {
  return `<div class="collection-preview-controls"><label>Preview text<select class="sel" data-preview-mode="${c.id}"><option value="name" ${c.preview.mode==='name'?'selected':''}>Font names</option><option value="page" ${c.preview.mode==='page'?'selected':''}>Page text</option><option value="custom" ${c.preview.mode==='custom'?'selected':''}>Custom text</option></select></label>${c.preview.mode==='custom'?`<label class="collection-custom">Text for ${esc(c.name)}<input class="field" data-preview-custom="${c.id}" maxlength="500" value="${esc(c.preview.text)}" placeholder="Type a preview for this collection"></label>`:''}</div>`;
}
function collectionLayoutControls() {
  return `<div class="collection-layout-toolbar"><span class="meta">All collections</span><label class="grid-control" ${state.collectionLayout==='grid'?'':'hidden'}>Columns<select class="sel" data-collection-columns>${['auto','1','2','3','4','5','6'].map(v=>`<option value="${v}" ${state.collectionCols===v?'selected':''}>${v==='auto'?'Auto':v}</option>`).join('')}</select></label><div class="seg" role="group" aria-label="Collection layout">${['list','grid'].map(v=>`<button data-action="collection-layout" data-layout-value="${v}" aria-label="${v==='list'?'List':'Grid'} view" title="${v==='list'?'List':'Grid'}" aria-pressed="${state.collectionLayout===v}">${$(`[data-layout="${v}"]`).innerHTML}</button>`).join('')}</div></div>`;
}
function markerPicker(c) {
  return `<div class="marker-picker" role="group" aria-label="Label ${esc(c.name)}"><div class="marker-picker-heading"><span>Collection label</span><button class="ib" data-action="marker-close" aria-label="Close label options">${ICON.x}</button></div><div class="marker-options" role="group" aria-label="Colour">${Object.entries(COL_COLORS).map(([v,n])=>`<button class="marker-swatch" data-marker-color="${v}" data-action="marker-set" data-marker-kind="color" data-value="${v}" data-id="${c.id}" aria-label="${n}" title="${n}" aria-pressed="${c.marker.color===v}"><span></span></button>`).join('')}</div><div class="marker-options" role="group" aria-label="Icon">${Object.entries(COL_ICONS).map(([v,n])=>`<button class="marker-icon-option" data-action="marker-set" data-marker-kind="icon" data-value="${v}" data-id="${c.id}" aria-label="${v==='none'?'No icon':v+' icon'}" title="${v==='none'?'No icon':v}" aria-pressed="${c.marker.icon===v}">${v==='none'?'∅':n}</button>`).join('')}</div></div>`;
}
document.addEventListener('toggle',e=>{if(e.target.matches('.collection-proof'))state.collectionProofOpen=e.target.open;},true);
function collectionContent(scope) {
  return collectionLayoutControls()+`<details class="collection-proof" ${state.collectionProofOpen?'open':''}><summary>Page preview text</summary><div class="collection-preview-global"><label><span>Page preview text</span><input class="field" data-preview-page maxlength="500" value="${esc(state.collectionText)}" placeholder="Type a shared preview for your collections"></label><button class="btn sm" data-action="preview-all">Use for all collections</button><p class="meta">Leave text blank to preview each font’s name. Choose custom text within a collection to override it.</p></div></details>` + `      <form class="dr-new" data-form="dr-new"><input class="field" type="text" placeholder="Name a new collection" aria-label="New collection name" maxlength="60"><button class="btn primary" type="submit">Create</button></form>
      <div class="dr-tools">
        <button class="btn sm" data-action="import-toggle" aria-expanded="${state.importOpen}">Import</button>
        <button class="btn sm" data-action="export-all">Export all</button>
        <button class="btn sm quiet" data-action="copy-all">Copy all as JSON</button>
      </div>
      ${state.importOpen ? `<div class="dr-import">
        <p>Choose an OpenShelf .json export, or paste its contents below. Imported collections are added alongside yours.</p>
        <textarea id="${scope}-import-text" data-collection-import placeholder='{"collections":[{"name":"Brand refresh","fonts":["Inter"],"pairs":[{"heading":"Fraunces","body":"Inter"}]}]}' aria-label="Paste collection JSON"></textarea>
        <div class="row"><button class="btn sm primary" data-action="import-paste">Import pasted JSON</button><button class="btn sm" data-action="import-file">Choose file</button><button class="btn sm quiet" data-action="import-toggle">Cancel</button></div>
      </div>` : ''}
      <div class="dr-list" data-folder-layout="${state.collectionLayout}" style="--folder-cols:${state.collectionCols}">${allCollections().map(drawerItem).join('')}</div>`;
}
function renderCollectionsPage() {
  $('#view-collections').innerHTML = `<header class="page-head"><h1>Collections</h1><p><span class="copy-line">Organise saved fonts and pairings for your projects.</span> <span class="copy-line">These are the same collections as the side panel, saved in this browser.</span></p></header><div class="collections-heading"><p class="count">${plural(allCollections().length, 'collection')} · ${plural(state.cols.reduce((n,c)=>n+c.fonts.length+c.pairs.length,0), 'saved item')}</p></div><div class="collection-manager collections-workspace">${collectionContent('page')}</div>`;
}
const collectionObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){loadFont(BY[e.target.dataset.font],[Number(e.target.style.fontWeight)||400]);collectionObserver.unobserve(e.target);}},{rootMargin:'180px'}):null;
function setDrawerWidth(value){const max=Math.min(800,innerWidth-32),min=Math.min(360,max);const width=Math.max(min,Math.min(max,Number(value)||470));document.documentElement.style.setProperty('--drawer-width',width+'px');const handle=$('.drawer-resize');if(handle){handle.setAttribute('aria-valuenow',Math.round(width));handle.setAttribute('aria-valuemax',max);}return width;}
function setupDrawerResize(){const r=$('.drawer-resize');setDrawerWidth(store.get('drawerWidth',470));let startX=0,startWidth=0,frame=0,next=0;
 r.addEventListener('pointerdown',e=>{startX=e.clientX;startWidth=$('#drawer').getBoundingClientRect().width;next=startWidth;r.setPointerCapture(e.pointerId);r.classList.add('drag');document.body.classList.add('resizing');e.preventDefault();});
 r.addEventListener('pointermove',e=>{if(!r.classList.contains('drag'))return;next=startWidth+startX-e.clientX;if(!frame)frame=requestAnimationFrame(()=>{setDrawerWidth(next);frame=0;});});
 const end=()=>{if(!r.classList.contains('drag'))return;cancelAnimationFrame(frame);frame=0;store.set('drawerWidth',setDrawerWidth(next||startWidth));r.classList.remove('drag');document.body.classList.remove('resizing');};r.addEventListener('pointerup',end);r.addEventListener('pointercancel',end);
 r.addEventListener('keydown',e=>{let v=$('#drawer').getBoundingClientRect().width;if(e.key==='ArrowLeft')v+=20;else if(e.key==='ArrowRight')v-=20;else if(e.key==='Home')v=360;else if(e.key==='End')v=800;else return;e.preventDefault();store.set('drawerWidth',setDrawerWidth(v));});r.addEventListener('dblclick',()=>store.set('drawerWidth',setDrawerWidth(470)));}
window.addEventListener('resize',()=>setDrawerWidth(store.get('drawerWidth',470)));
function observeCollectionFonts(){collectionObserver?.disconnect();$$('.collection-specimen').filter(el=>el.offsetParent).forEach(el=>collectionObserver?collectionObserver.observe(el):loadFont(BY[el.dataset.font]));}
function toggleCollection(id){
 const opening=!state.open.has(id);opening?state.open.add(id):state.open.delete(id);
 $$(`[data-col-card="${CSS.escape(id)}"]`).forEach(card=>{
  let body=$('.ci-body',card),from=body?.getBoundingClientRect().height||0;
  body?.getAnimations().forEach(a=>a.cancel());
  const focused=card.contains(document.activeElement);
  if(opening&&!body){const box=document.createElement('div');box.innerHTML=drawerItem(getCol(id));const next=box.firstElementChild;card.replaceWith(next);card=next;body=$('.ci-body',card);if(focused)$('.ci-head',card).focus({preventScroll:true});}
  $('.ci-head',card).setAttribute('aria-expanded',String(opening));
  if(!body)return;body.inert=!opening;
  if(opening)updateCollectionPreviews();
  if(reducedMotion()){if(!opening)body.remove();return;}
  const to=opening?body.scrollHeight:0;
  const padding=getComputedStyle(body).paddingBottom;
  const animation=body.animate([{height:from+'px',paddingBottom:opening&&from===0?'0px':padding,opacity:opening?.2:1},{height:to+'px',paddingBottom:opening?padding:'0px',opacity:opening?1:0}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
  animation.finished.then(()=>{if(!opening&&!state.open.has(id))body.remove();animation.cancel();}).catch(()=>{});
 });
 updateCollectionPreviews();observeCollectionFonts();
}
function renderDrawer() {
  const active=document.activeElement, scope=active?.closest('#drawer')?'#drawer':'#view-collections';
  let focusSelector='';
  if(active?.matches('[data-action="collection-layout"],[data-action="ci-toggle"],[data-action="marker-open"],[data-action="marker-set"]'))focusSelector=['data-action','data-id','data-layout-value','data-marker-kind','data-value'].filter(k=>active.hasAttribute(k)).map(k=>`[${k}="${CSS.escape(active.getAttribute(k))}"]`).join('');
  if(active?.matches('[data-collection-columns]'))focusSelector='[data-collection-columns]';
  const d = $('#drawer');
  const pageActive = !drawerOpen() && !$('#view-collections').hidden;
  const scroll = $('.dr-body', d) ? $('.dr-body', d).scrollTop : 0;
  d.innerHTML = `<div class="drawer-resize" role="separator" tabindex="0" aria-label="Resize collections panel" aria-orientation="vertical" aria-valuemin="360" aria-valuemax="800"></div><div class="dr-head"><h2>Collections</h2><button class="ib" data-action="drawer-close" aria-label="Close collections">${ICON.x}</button></div><div class="dr-body collection-manager"><a class="drawer-page-link" href="#/collections">View all collections →</a>${collectionContent('drawer')}</div>`;
  if (!$('#view-collections').hidden) renderCollectionsPage();
  observeCollectionFonts();
  setupDrawerResize();
  updateCollectionPreviews();
  $('.dr-body', d).scrollTop = scroll;
  if(focusSelector)$(scope+' '+focusSelector)?.focus({preventScroll:true});
  if (state.renaming) { const i = $('[data-form="rename"] input', pageActive ? $('#view-collections') : d); if (i) { i.focus(); i.select(); } }
}
function drawerItem(c) {
  const open = state.open.has(c.id);
  return `<section class="ci" data-col-card="${c.id}" data-collection-layout="${state.collectionLayout}" data-marker-color="${c.marker.color}" style="--collection-cols:${state.collectionCols==='auto'?'auto':state.collectionCols}">
    <div class="ci-heading"><button class="collection-label-button" ${c.smart?'disabled':''} data-action="marker-open" data-id="${c.id}" aria-label="Label ${esc(c.name)}" aria-expanded="${state.markerMenu===c.id}" title="Change colour and icon"><span class="collection-label-icon" aria-hidden="true">${COL_ICONS.folder}${!['none','folder'].includes(c.marker.icon)?`<span class="folder-symbol">${COL_ICONS[c.marker.icon]}</span>`:''}</span><span class="collection-label-dot" aria-hidden="true"></span></button><button class="ci-head" data-action="ci-toggle" data-id="${c.id}" aria-expanded="${open}"><span class="ci-name">${esc(c.name)}</span><span class="ci-count">${colSummary(c)}</span>${ICON.chev}</button></div>
    ${state.markerMenu===c.id?markerPicker(c):''}${desktop.collectionButtons(c)}
    ${open ? `<div class="ci-body">${collectionPreviewControls(c)}
      ${state.renaming === c.id ? `<form class="inline-new" data-form="rename" data-id="${c.id}"><input type="text" value="${esc(c.name)}" aria-label="Collection name" maxlength="60"><button class="btn sm primary" type="submit">Save</button></form>` : ''}
      ${c.fonts.length ? `<p class="ci-sub">Fonts</p><div class="collection-items">${c.fonts.map(s => { const f = BY[s]; return `<div class="ci-row"><a class="collection-font-link" href="#/font/${s}"><span class="collection-font-label" data-preview-label="${c.id}">${esc(f.n)}</span>${f.manual?'<span class="manual-badge spaced-meta"><span>External import</span><span>Licence unverified</span></span>':''}<span class="collection-specimen" data-col-preview data-col="${c.id}" data-font="${s}" style="font-family:${fam(f)};font-weight:${pvWeight(f)}">${esc(collectionPreviewText(c,f))}</span></a><div class="collection-font-device" data-device-font="${esc(f.slug)}" data-device-name="${esc(f.n)}">${desktop.enabled?desktop.buttons(f,true):!f.manual?`<a class="ib download-button" href="${f.gf}" target="_blank" rel="noopener" aria-label="Download ${esc(f.n)}" title="Download ${esc(f.n)}">${ICON.get}</a>`:''}</div>${c.smart?'':`<button class="ib" data-action="ci-rmfont" data-id="${c.id}" data-slug="${s}" aria-label="Remove ${esc(f.n)}" title="Remove">${ICON.x}</button>`}</div>`; }).join('')}</div>` : ''}
      ${c.pairs.length ? `<p class="ci-sub">Pairings</p><div class="collection-items">${c.pairs.map((p, pi) => { const h = BY[p.h], b = BY[p.b]; return `<div class="ci-row"><button class="ci-pair" data-action="openpair" data-col="${c.id}" data-idx="${pi}" data-h="${p.h}" data-b="${p.b}" title="Open in the pairing builder"><span class="collection-font-label" data-preview-label="${c.id}">${esc(h.n)} + ${esc(b.n)}</span>${h.manual||b.manual?'<span class="manual-badge">Includes manually added fonts · verify licences</span>':''}<span class="h collection-specimen" data-col-preview data-col="${c.id}" data-font="${h.slug}" style="font-family:${fam(h)};font-weight:${pairHW(p)}">${esc(collectionPreviewText(c,h))}</span><span class="b collection-specimen" data-col-preview data-col="${c.id}" data-font="${b.slug}" style="font-family:${fam(b)}">${esc(collectionPreviewText(c,b))}</span></button><button class="ib" data-action="ci-rmpair" data-id="${c.id}" data-h="${p.h}" data-b="${p.b}" aria-label="Remove ${esc(h.n)} and ${esc(b.n)} pairing" title="Remove">${ICON.x}</button></div>`; }).join('')}</div>` : ''}
      ${!c.fonts.length && !c.pairs.length ? `<p class="ci-empty">${c.smart ? 'Enable a downloaded font or collection to see it here.' : c.fixed ? 'Tap the heart on a font, or save a pairing here.' : 'Use the save button on any font or pairing to add it here.'}</p>` : ''}
      <div class="ci-acts">
        ${c.fonts.length ? `<button class="btn sm" data-action="ci-show" data-id="${c.id}">Show in library</button>` : ''}
        ${c.fonts.length || c.pairs.length ? `<button class="btn sm" data-action="ci-css" data-id="${c.id}">Copy embed code</button><button class="btn sm" data-action="ci-export" data-id="${c.id}">Export</button><button class="btn sm" data-action="ci-share" data-id="${c.id}">${ICON.link} Copy share link</button>` : ''}
        ${!c.fixed ? `<button class="btn sm quiet" data-action="ci-rename" data-id="${c.id}">Rename</button><button class="btn sm danger" data-action="ci-delete" data-id="${c.id}">Delete</button>` : ''}
      </div>
    </div>` : ''}
  </section>`;
}

/* ---------- font detail ---------- */
function similarTo(f) {
  return F.filter(x => x !== f && available(x)).map(x => ({x, s:(x.c === f.c ? 3 : 0) + x.t.filter(t => f.t.includes(t)).length * 2 + x.u.filter(u => f.u.includes(u)).length}))
    .sort((a, b) => b.s - a.s || a.x.n.localeCompare(b.x.n)).slice(0, 4).map(o => o.x);
}
function pairCard(p) {
  if (!available(BY[p.h]) || !available(BY[p.b])) return '';
  const h = BY[p.h], b = BY[p.b]; const hw = pairHW(p);
  loadFont(h, [hw]); loadFont(b, [400]);
  return `<article class="pair">
    <p class="ph" data-pv style="font-family:${fam(h)};font-weight:${hw}">${esc(proof())}</p>
    <p class="pb" style="font-family:${fam(b)}">${SHORT_BODY}</p>
    <div class="pair-meta">
      <div class="pair-names"><a href="#/font/${h.slug}">${esc(h.n)}</a><span>with</span><a href="#/font/${b.slug}">${esc(b.n)}</a></div>
      ${p.prov ? `<span class="prov">${PROV[p.prov]}</span>` : ''}
      ${p.note ? `<p class="pair-note">${esc(p.note)}</p>` : ''}
      ${p.refs ? `<p class="pair-sources">References: ${p.refs.map(r => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.label)}</a>`).join(' · ')}</p>` : ''}
      <div class="pair-acts"><button class="btn sm" data-action="openpair" data-h="${h.slug}" data-b="${b.slug}">Open in builder</button>
      <button class="ib" data-action="save" data-kind="pair" data-h="${h.slug}" data-b="${b.slug}" aria-label="Save ${esc(h.n)} with ${esc(b.n)} to a collection" title="Save pairing">${ICON.save}</button></div>
    </div>
  </article>`;
}
function renderFont(f) {
  loadFont(f, f.w);
  const pairs = PAIRS.filter(p => p.h === f.slug || p.b === f.slug);
  const sim = similarTo(f); sim.forEach(x => loadFont(x));
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&@?!%$\u20ac\u00a3#*()[]{}.,;:\u2019\u201c\u201d-\u2013\u2014/';
  const partner = f.c === 'serif' || f.c === 'slab' ? 'inter' : (f.slug === 'source-serif-4' ? 'inter' : 'source-serif-4');
  $('#view-font').innerHTML = `
    <a class="back" href="#/">${ICON.back} Library</a>
    <div class="detail-top">
      <div>
        <h1 class="detail-name" style="font-family:${fam(f)};font-weight:${pvWeight(f)}">${esc(f.n)}</h1>
        <p class="detail-blurb">${esc(f.b)}</p>
        <div class="actions">
          ${desktop.enabled ? `<span class="font-device-controls" data-device-font="${esc(f.slug)}" data-device-name="${esc(f.n)}">${desktop.buttons(f)}</span>` : f.manual?`<a class="btn" href="#/local">Local details</a>` : `<a class="ib download-button" aria-label="Download ${esc(f.n)} from ${SOURCES[f.source]}" title="Download ${esc(f.n)}" href="${f.gf}" target="_blank" rel="noopener">${ICON.get}</a>`}
          ${f.source === 'google' ? `<a class="btn" href="${f.fs}" target="_blank" rel="noopener">Fontsource</a>` : ''}
          ${f.src ? `<a class="btn" href="${f.src}" target="_blank" rel="noopener">Source files</a>` : ''}
          <button class="btn" data-action="fav" data-slug="${f.slug}" aria-pressed="${isFav(f.slug)}">${ICON.heart} Favourite</button>
          <button class="btn" data-action="save" data-kind="font" data-slug="${f.slug}">${ICON.save} Save</button>
        </div>
      </div>
      <aside class="panel info" aria-label="About this font">
        <dl>
          <dt>Source</dt><dd>${SOURCES[f.source]}</dd>
          <dt>${f.source === 'fontsource' ? 'Attribution' : 'Designer'}</dt><dd>${esc(f.d)}</dd>
          <dt>Publisher</dt><dd>${esc(f.p)}</dd>
          ${f.y ? `<dt>Added to catalog</dt><dd>${f.y}</dd>` : ''}
          <dt>Classification</dt><dd>${kindLabel(f)}</dd>
          <dt>Styles</dt><dd>${f.v ? 'Variable, weights ' + f.w[0] + ' to ' + f.w[f.w.length - 1] : f.w.map(w => WNAME[w]).join(', ')}</dd>
          <dt>Licence</dt><dd>${f.manual?'<span class="manual-badge spaced-meta"><span>External import</span><span>Licence unverified</span></span> Verify usage rights yourself. This font may not be open-source.':''}<a ${f.manual?'hidden':''} href="${f.licenseUrl || (/Apache/.test(f.lic) && !/OFL/.test(f.lic) ? 'https://www.apache.org/licenses/LICENSE-2.0' : /Ubuntu/.test(f.lic) ? 'https://ubuntu.com/legal/font-licence' : 'https://openfontlicense.org')}" target="_blank" rel="noopener">${esc(f.lic)}</a></dd>
          ${!f.manual?`<dt>Install</dt><dd><code>npm i @fontsource/${f.fontsourceId || f.slug}</code></dd>`:''}
        </dl>
        <div class="tagrow"><b>Good for</b><div class="tags">${f.u.map(u => `<button class="btn sm" data-action="filterto" data-group="use" data-val="${u}">${USES[u]}</button>`).join('')}</div></div>
        <div class="tagrow"><b>Feeling</b><div class="tags">${f.t.filter(t => FEEL.includes(t)).map(t => `<button class="btn sm" data-action="filterto" data-group="feel" data-val="${t}">${THEMES[t]}</button>`).join('')}</div></div>
        ${f.s.length || f.a.length || f.c === 'mono' ? `<div class="tagrow"><b>Style</b><div class="tags">${f.s.map(k => `<button class="btn sm" data-action="filterto" data-group="cls" data-val="${k}">${SUBS[k]}</button>`).join('')}${[...new Set([...(f.c === 'mono' ? ['mono'] : []), ...f.a])].map(k => `<button class="btn sm" data-action="filterto" data-group="app" data-val="${k}">${APPEAR[k]}</button>`).join('')}</div></div>` : ''}
      </aside>
    </div>
    <h2 class="sec">Weights</h2>
    <div class="wf">${f.w.map(w => `<div class="wf-row"><span class="wf-label">${w} ${WNAME[w] || ""}</span><p data-pv style="font-family:${fam(f)};font-weight:${w}"></p></div>`).join('')}</div>
    <h2 class="sec">Sizes</h2>
    <div class="wf sizes">${[14, 18, 24, 36, 56].map(s => `<div class="wf-row"><span class="wf-label">${s}px</span><p data-pv style="font-family:${fam(f)};font-weight:${pvWeight(f)};font-size:${s}px"></p></div>`).join('')}</div>
    <h2 class="sec">Characters</h2>
    <div class="glyphs" style="font-family:${fam(f)};font-weight:${pvWeight(f)}">${[...glyphs].map(g => `<span>${esc(g)}</span>`).join('')}</div>
    <h2 class="sec">Pairs well with</h2>
    ${pairs.length ? `<div class="pairs">${pairs.map(pairCard).join('')}</div>` : `<p style="color:var(--muted);margin:0">There\u2019s no curated pairing for ${esc(f.n)} yet.</p>`}
    <p style="margin-top:18px;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-action="openpair" data-h="${f.slug}" data-b="${partner}">Try ${esc(f.n)} in the builder</button><button class="btn quiet" data-action="randfor" data-slug="${f.slug}">${ICON.dice} Find it a random partner</button></p>
    <h2 class="sec">Similar fonts</h2>
    <div class="similar">${sim.map(x => `<a href="#/font/${x.slug}"><span class="big" style="font-family:${fam(x)};font-weight:${pvWeight(x)}">Aa</span><b>${esc(x.n)}</b><small>${CLS[x.c]}, ${esc(x.p)}</small></a>`).join('')}</div>`;
  updatePreviews();
  document.title = `${f.n} | OpenShelf`;
}

/* ---------- pairings + randomiser ---------- */
function fontOptions(sel) {
  return Object.entries(CLS).map(([k, l]) => `<optgroup label="${esc(l)}">${F.filter(f => f.c === k && available(f)).sort((a, b) => a.n.localeCompare(b.n)).map(f => `<option value="${f.slug}" ${f.slug === sel ? 'selected' : ''}>${esc(f.n)}</option>`).join('')}</optgroup>`).join('');
}
const textOK = f => f.u.some(u => u === 'body' || u === 'longform' || u === 'ui');
function randomPair() {
  const o = state.rand;
  let pool = F.filter(available);
  if (o.from) { const c = getCol(o.from); if (c) { const s = new Set([...c.fonts, ...c.pairs.flatMap(p => [p.h, p.b])]); pool = F.filter(f => available(f) && s.has(f.slug)); } }
  if (o.varOnly) pool = pool.filter(f => f.v);
  const H = state.locks.h ? [BY[state.pair.h]] : pool.filter(f => o.hCls.includes(f.c) && (!o.theme || f.t.includes(o.theme)));
  const B = state.locks.b ? [BY[state.pair.b]] : pool.filter(f => o.bCls.includes(f.c) && (!o.textOnly || textOK(f)));
  let chosen = null, count = 0;
  // Reservoir sampling keeps memory constant as the catalog grows.
  for (const h of H) for (const b of B) {
    if (!available(h) || !available(b) || h === b || (o.contrast && h.c === b.c)) continue;
    if (h.slug === state.pair.h && b.slug === state.pair.b) continue;
    if (Math.random() < 1 / ++count) chosen = {h:h.slug,b:b.slug};
  }
  return chosen;
}
function doRandomise() {
  const r = randomPair();
  if (!r) { toast('No combinations match these options. Loosen a setting and try again.'); return; }
  state.history.push(clonePair(state.pair)); if (state.history.length > 30) state.history.shift();
  const old = state.pair;
  state.pair = normPS({h:r.h, b:r.b, hs: state.locks.h ? old.hs : Object.assign({}, old.hs, {w:0, i:false}), bs: state.locks.b ? old.bs : Object.assign({}, old.bs, {w:0, i:false})});
  renderBuilder();
}
function builderWeights() {
  const pr = state.pair, h = BY[pr.h], b = BY[pr.b], p = findPair(pr.h, pr.b);
  return { h, b, p, hw: pr.hs.w && h.w.includes(pr.hs.w) ? pr.hs.w : pairHW(p), bw: pr.bs.w && b.w.includes(pr.bs.w) ? pr.bs.w : pvWeight(b) };
}
function applyBuilderStyles() {
  const pr = state.pair; const {h, b, hw, bw} = builderWeights();
  loadFont(h, [hw], pr.hs.i); loadFont(b, [bw], pr.bs.i);
  const ph = $('#b-ph'), pb = $('#b-pb'); if (!ph) return;
  Object.assign(ph.style, { fontFamily:familyCSS(h), fontWeight:hw, fontStyle:pr.hs.i ? 'italic' : 'normal', fontSize:`min(${pr.hs.size}px, 13vw)`, letterSpacing:pr.hs.ls + 'em', textTransform:pr.hs.up ? 'uppercase' : 'none' });
  Object.assign(pb.style, { fontFamily:familyCSS(b), fontWeight:bw, fontStyle:pr.bs.i ? 'italic' : 'normal', fontSize:pr.bs.size + 'px', lineHeight:pr.bs.lh });
  $$('#adjust output[data-for]').forEach(o => { const [side, k] = o.dataset.for.split('.'); const v = pr[side][k]; o.textContent = k === 'size' ? v + 'px' : k === 'ls' ? (v > 0 ? '+' : '') + v.toFixed(2) + 'em' : v.toFixed(2); });
  store.set('pair', state.pair);
}
function renderAdjust() {
  const pr = state.pair; const {h, b, p, hw, bw} = builderWeights();
  const wsel = (key, f, cur, def) => `<select class="mini" data-adj="${key}" aria-label="${key[0] === 'h' ? 'Heading' : 'Body'} weight"><option value="0" ${!pr[key.split('.')[0]].w ? 'selected' : ''}>Default (${def})</option>${f.w.map(w => `<option value="${w}" ${pr[key.split('.')[0]].w === w ? 'selected' : ''}>${w} ${WNAME[w] || ""}</option>`).join('')}</select>`;
  const tog = (key, label) => { const [sd, k] = key.split('.'); return `<button class="btn sm" data-action="adj-toggle" data-k="${key}" aria-pressed="${!!pr[sd][k]}">${label}</button>`; };
  const sl = (key, label, min, max, step) => { const [sd, k] = key.split('.'); return `<label class="adj-sl"><span>${label}</span><input type="range" data-adj="${key}" min="${min}" max="${max}" step="${step}" value="${pr[sd][k]}"><output data-for="${key}"></output></label>`; };
  $('#adjust').innerHTML = `
    <div class="adj-col"><h5>Heading: ${esc(h.n)}</h5>
      <div class="adj-row">${wsel('hs.w', h, hw, pairHW(p))}${tog('hs.i', '<i style="font-family:Georgia,serif">I</i> Italic')}${tog('hs.up', 'Uppercase')}</div>
      ${sl('hs.size', 'Size', 24, 140, 2)}${sl('hs.ls', 'Tracking', -0.08, 0.3, 0.01)}
    </div>
    <div class="adj-col"><h5>Body: ${esc(b.n)}</h5>
      <div class="adj-row">${wsel('bs.w', b, bw, pvWeight(b))}${tog('bs.i', '<i style="font-family:Georgia,serif">I</i> Italic')}</div>
      ${sl('bs.size', 'Size', 12, 28, 1)}${sl('bs.lh', 'Line height', 1.1, 2.2, 0.05)}
    </div>
    <div class="adj-foot"><button class="linkbtn" data-action="adj-reset">Reset adjustments</button></div>`;
}
function renderBuilder() {
  const pr = state.pair; const {h, b, p} = builderWeights();
  if (!$('#b-ph')) return;
  $('#ph').value = h.slug; $('#pb').value = b.slug;
  $('#b-names').innerHTML = `<span>Heading <a href="#/font/${h.slug}">${esc(h.n)}</a></span><span>Body <a href="#/font/${b.slug}">${esc(b.n)}</a></span>${p.prov ? `<span>${PROV[p.prov]}</span>` : ''}`;
  $$('[data-action="lock"]').forEach(x => { const on = state.locks[x.dataset.which]; x.setAttribute('aria-pressed', String(on)); x.innerHTML = on ? ICON.lock : ICON.unlock; x.title = on ? 'Locked for randomising' : 'Lock for randomising'; });
  const u = $('[data-action="undo"]'); if (u) u.disabled = !state.history.length;
  renderAdjust(); applyBuilderStyles();
}
function renderRandOpts() {
  const o = state.rand;
  const chips = (key, sel) => Object.entries(CLS).map(([k, l]) => `<button type="button" data-action="randcls" data-key="${key}" data-val="${k}" aria-pressed="${sel.includes(k)}">${l}</button>`).join('');
  return `<div class="adv-grid">
    <div><h5>Heading styles</h5><div class="minichips">${chips('hCls', o.hCls)}</div></div>
    <div><h5>Body styles</h5><div class="minichips">${chips('bCls', o.bCls)}</div></div>
    <div><h5>Heading feeling</h5><select class="sel" data-rand="theme" style="width:100%"><option value="">Any feeling</option>${FEEL.map(k => [k, THEMES[k]]).map(([k, l]) => `<option value="${k}" ${o.theme === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <h5 style="margin-top:16px">Pick from</h5><select class="sel" data-rand="from" style="width:100%"><option value="">The whole library</option>${allCollections().map(c => `<option value="${c.id}" ${o.from === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div><h5>Rules</h5>
      <label class="chk"><input type="checkbox" data-rand="contrast" ${o.contrast ? 'checked' : ''}> Mix styles (no two sans, no two serifs)</label>
      <label class="chk"><input type="checkbox" data-rand="textOnly" ${o.textOnly ? 'checked' : ''}> Body font must suit running text</label>
      <label class="chk"><input type="checkbox" data-rand="varOnly" ${o.varOnly ? 'checked' : ''}> Variable fonts only</label>
      <button type="button" class="linkbtn" data-action="randreset" style="margin-top:10px">Reset options</button></div>
  </div>`;
}
function renderPairList() {
  const list = PAIRS.filter(p => available(BY[p.h]) && available(BY[p.b]) && (!state.prov || p.prov === state.prov) && (!state.mood || p.m.includes(state.mood)));
  $('#pairs').innerHTML = list.length ? list.map(pairCard).join('') : `<div class="pair"><p class="pair-note">No curated pairings match. Try another mood.</p></div>`;
  $$('#prov-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.val === state.prov)));
}
function renderPairings() {
  const advOpen = store.get('advOpen', false);
  $('#view-pairings').innerHTML = `
    <header class="page-head"><h1>Pairings</h1>
      <p><span class="copy-line">A heading face and a body face. Build your own, let the randomiser suggest one, or start from our editorial picks and source-linked references.</span> <span class="copy-line">Your text in the bar above becomes the headline.</span></p></header>
    <section class="panel builder" aria-label="Pairing builder">
      <div class="bcontrols">
        <div class="bfield"><label for="ph">Heading</label><div class="bfield-row"><select id="ph" class="sel">${fontOptions(state.pair.h)}</select><button class="ib lock" data-action="lock" data-which="h" aria-label="Lock heading font when randomising" aria-pressed="false"></button></div></div>
        <button class="btn quiet swapbtn" data-action="swap" aria-label="Swap heading and body">${ICON.swap}</button>
        <div class="bfield"><label for="pb">Body</label><div class="bfield-row"><select id="pb" class="sel">${fontOptions(state.pair.b)}</select><button class="ib lock" data-action="lock" data-which="b" aria-label="Lock body font when randomising" aria-pressed="false"></button></div></div>
        <div class="bactions">
          <button class="btn primary" data-action="randomise">${ICON.dice} Randomise</button>
          <button class="ib" data-action="undo" aria-label="Back to previous pairing" title="Previous pairing">${ICON.undo}</button>
          <button class="ib" data-action="save" data-kind="pair" data-current="1" aria-label="Save this pairing" title="Save pairing">${ICON.save}</button>
        </div>
      </div>
      <div class="adjust" id="adjust"></div>
      <details class="adv" id="adv" ${advOpen ? 'open' : ''}><summary>${ICON.chev} Randomiser options</summary><div id="adv-body">${renderRandOpts()}</div></details>
      <div class="bpreview"><p class="ph" id="b-ph" data-pv></p><p class="pb" id="b-pb">${BODY_SAMPLE}</p></div>
      <div class="bfoot" id="b-names"></div>
    </section>
    <div class="pfilters">
      <div class="ptitle"><h2>Recommended pairings</h2><p class="pguide">Most professional advice comes down to one idea: contrast in one way (serif against sans, weight or width) and agree in others (x-height, proportions, historical era). Families designed together are the safest choice.</p></div>
      <div class="seg" id="prov-seg" role="group" aria-label="Filter by origin" style="padding:2px">
        ${[['', 'All'], ...Object.entries(PROV)].map(([k, l]) => `<button data-action="prov" data-val="${k}" aria-pressed="${state.prov === k}" style="width:auto;padding:0 14px;font-size:13px">${l}</button>`).join('')}
      </div>
      <label class="sr" for="mood">Mood</label>
      <select id="mood" class="sel"><option value="">Any mood</option>${Object.entries(MOODS).map(([k, l]) => `<option value="${k}" ${state.mood === k ? 'selected' : ''}>${l}</option>`).join('')}</select>
    </div>
    <div class="pairs" id="pairs"></div>`;
  $('#ph').addEventListener('change', e => { state.history.push(clonePair(state.pair)); state.pair.h = e.target.value; Object.assign(state.pair.hs, {w:0, i:false}); renderBuilder(); });
  $('#pb').addEventListener('change', e => { state.history.push(clonePair(state.pair)); state.pair.b = e.target.value; Object.assign(state.pair.bs, {w:0, i:false}); renderBuilder(); });
  $('#mood').addEventListener('change', e => { state.mood = e.target.value; renderPairList(); });
  $('#adv').addEventListener('toggle', e => store.set('advOpen', e.target.open));
  renderBuilder(); renderPairList(); updatePreviews();
  document.title = 'Font pairings | OpenShelf';
}

/* ---------- import link banner ---------- */
function showImportBanner(encoded) {
  let data; try { data = JSON.parse(b64d(encoded)); } catch (e) { toast('That share link is incomplete or damaged.'); return; }
  const list = (data && data.collections) || [];
  const c = list[0]; if (!c) { toast('That share link has no collection in it.'); return; }
  const parts = []; if ((c.fonts || []).length) parts.push(plural(c.fonts.length, 'font')); if ((c.pairs || []).length) parts.push(plural(c.pairs.length, 'pairing'));
  const bn = $('#banner'); bn._data = data;
  bn.innerHTML = `<p>Someone shared \u201c${esc(c.name || 'a collection')}\u201d with you${parts.length ? ': ' + parts.join(' and ') : ''}. Add it to your collections?</p><button class="btn sm primary" data-action="banner-import">Add collection</button><button class="btn sm quiet" data-action="banner-close">Dismiss</button>`;
  bn.hidden = false;
}

/* ---------- routing ---------- */
let lastKey = null;
let pageTransition, routeHash;
function route() {
  const changed=routeHash!==undefined && routeHash!==location.hash;
  const articleRoute=[routeHash,location.hash].some(h=>h?.startsWith('#/knowledge'));
  routeHash=location.hash;
  pageTransition?.skipTransition();
  if (changed && !articleRoute && !reducedMotion() && document.startViewTransition) {
    pageTransition=document.startViewTransition(renderRoute);
    pageTransition.finished.catch(()=>{});
  } else { renderRoute(); if(changed) enterMotion($('main > section:not([hidden])')); }
}
function renderRoute() {
  closePop();
  closeDrawer();
  setNavOpen(false);
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  let page = parts[0] || 'library';
  if (page === 'import') { showImportBanner(parts.slice(1).join('/')); history.replaceState(null, '', location.href.split('#')[0] + '#/'); page = 'library'; }
  if (page === 'font' && !available(BY[parts[1]])) page = 'library';
  if (!['library', 'pairings', 'font', 'about', 'local', 'knowledge', 'collections'].includes(page)) page = 'library';
  $$('main > section').forEach(s => { s.hidden = s.id !== 'view-'+page; });
  document.body.dataset.page = page;
  const navPage = page === 'font' ? 'library' : page;
  $$('.nav a').forEach(a => { if (a.dataset.nav === navPage) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (page === 'library') { $('#view-library').hidden = false; renderLibrary(); document.title = 'OpenShelf: Open Source Font Library'; }
  if (page === 'pairings') { $('#view-pairings').hidden = false; const local=F.filter(available); if (!available(BY[state.pair.h]) || !available(BY[state.pair.b])) { if(local.length)state.pair=normPS({h:local[0].slug,b:(local[1]||local[0]).slug}); } if(local.length)renderPairings();else $('#view-pairings').innerHTML='<header class="page-head"><h1>Pairings</h1><p>Download fonts before using pairings offline.</p></header>'; }
  if (page === 'font') { $('#view-font').hidden = false; renderFont(BY[parts[1]]); }
  if (page === 'local') { $('#view-local').hidden = false; if(desktop.enabled)desktop.showLocal();else window.OpenShelfLocal.show(); }
  if (page === 'knowledge') { $('#view-knowledge').hidden = false; window.OpenShelfKnowledge.show(); }
  if (page === 'collections') { $('#view-collections').hidden = false; renderDrawer(); document.title = 'Collections | OpenShelf'; }
  if (page === 'about') { $('#view-about').hidden = false; renderAbout(); }
  const key = page + (parts[1] || '');
  if (key !== lastKey) window.scrollTo(0, 0);
  lastKey = key;
}
const AUTHOR = { name:'Jin Yoshida', github:'https://github.com/jinyoshida01', portfolio:'https://jinyoshida.me' };
const GH_ICON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.3-4-2-5.5-2.5M14.5 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6 2.6 5 2.9 5 2.9a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.6 9.3c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/></svg>';
const WEB_ICON = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5S9.7 5.9 12 3.5z"/></svg>';
function authorLinks() {
  return `${AUTHOR.github ? `<a href="${AUTHOR.github}" target="_blank" rel="noopener">${GH_ICON}GitHub</a>` : ''}${AUTHOR.portfolio ? `<a href="${AUTHOR.portfolio}" target="_blank" rel="noopener">${WEB_ICON}Portfolio</a>` : ''}`;
}
function renderMadeBy() { $('#made-by').innerHTML = `<span>Made by <span class="who">${esc(AUTHOR.name)}</span></span>${authorLinks()}`; }
function renderAbout() {
  const designers = new Set(F.map(f => f.p)).size;
  const lic = {}; F.forEach(f => { lic[f.lic] = (lic[f.lic] || 0) + 1; });
  const licLinks = { 'SIL Open Font License 1.1':'https://openfontlicense.org', 'Apache License 2.0':'https://www.apache.org/licenses/LICENSE-2.0', 'Ubuntu Font Licence 1.0':'https://ubuntu.com/legal/font-licence', 'Open-source licence — see source':'https://fonts.google.com', 'MIT License':'https://opensource.org/license/mit', 'CC0 1.0 Universal':'https://creativecommons.org/publicdomain/zero/1.0/', 'The Unlicense':'https://unlicense.org/' };
  const byLic = k => F.filter(f => f.lic === k).map(f => f.n);
  $('#view-about').innerHTML = `
    <header class="page-head"><h1>About OpenShelf</h1>
      <p>A browsable library of free, open-source typefaces, with tools for comparing, pairing and organising them.</p></header>
    <div class="about-body">
      <h2 class="sec">What this is</h2>
      <p class="about-lede">I created OpenShelf as an all-in-one tool for open-source typefaces, so you can find, preview and pair fonts without having to go through several websites.</p>
      <p>OpenShelf collects ${F.filter(f=>!f.manual).length} open-source typefaces from ${designers} designers and foundries, so you can try them with your own words, find pairs that work, and keep shortlists for your projects.</p>
      <p>Every font here can be downloaded for free and used in personal and commercial work, including websites, apps, print, logos and video. Each font page identifies its catalog source, licence and available source files.</p>
      <p>${desktop.enabled?'OpenShelf downloads font files directly from their open-source repositories or Fontsource’s versioned CDN and saves the licence notices with them. Enable downloaded fonts to use them in other applications while OpenShelf is running.':'OpenShelf doesn’t host or sell fonts. Previews load from Google Fonts or Fontsource’s versioned jsDelivr files, and download links lead to the corresponding source.'}</p>

      <h2 class="sec">What \u201copen source\u201d means for fonts</h2>
      <p>Most fonts in the library use the SIL Open Font License (OFL), a licence written specifically for typefaces. In plain terms:</p>
      <div class="can">
        <div><h3>You can</h3><ul>
          <li>Use the fonts for free in personal and commercial projects</li>
          <li>Embed them in websites, apps, documents and products</li>
          <li>Use them in logos and branding</li>
          <li>Modify them and share your changes</li>
          <li>Bundle them with software, even software you sell</li>
        </ul></div>
        <div><h3>You can\u2019t</h3><ul>
          <li>Sell the font files on their own</li>
          <li>Release a modified version under the original name if that name is reserved</li>
          <li>Release a modified version under a different, non-open licence</li>
          <li>Remove the copyright and licence notices that ship with the font</li>
        </ul></div>
      </div>
      <p>A handful of fonts use other open licences with similar freedoms. Here\u2019s the breakdown for the current library:</p>
      <table class="lic-table"><thead><tr><th>Licence</th><th>Fonts</th></tr></thead><tbody>
        ${Object.entries(lic).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<tr><td><a href="${licLinks[k]}" target="_blank" rel="noopener">${k}</a>${n <= 8 ? `<br><span class="about-note">${byLic(k).join(', ')}</span>` : ''}</td><td>${n}</td></tr>`).join('')}
      </tbody></table>
      <p class="about-note">This is a plain-language summary, not legal advice. Always check the licence file that ships with a font, especially for client work or anything you plan to redistribute.</p>

      <h2 class="sec">How to use it</h2>
      <p><strong>Library.</strong> Type anything in the preview box and every font shows your words. Filter by feeling, appearance, classification and use case on the left. Within a section, filters match all your picks by default; switch a section to \u201cMatch any\u201d to widen it. Each row has its own weight and italic controls, and \u201cWeight and style\u201d changes them all at once.</p>
      <p><strong>Pairings.</strong> Pick a heading and body font, adjust weight, size, spacing and case, or press Randomise with optional rules. Below the builder are recommended pairings, labelled by their basis, with linked sources for published recommendations, community discussions and award inspiration. Award-inspired choices are OpenShelf interpretations, not claims that the winning site uses these exact fonts.</p>
      <p><strong>Collections.</strong> Save fonts and pairings into named collections from anywhere on the site. Manage the same saved items on the Collections page or in the side panel. Preview font names, use shared page text, or save custom preview text for each collection. Each collection can give you ready-made embed code, be exported as a file, or be shared as a link.</p>

      <h2 class="sec">About the information</h2>
      <p>Google Fonts membership, designers, styles and dates are refreshed weekly. Additional families come from Fontsource’s public repository after checking their licence files and preview availability. Use the Source filter to browse either catalog. Dates for newly added records refer to their addition to the Google Fonts catalog, not necessarily their original release. Removed families disappear on the next successful refresh, and failed previews are hidden for the current visit with an option to retry. Classification and feeling labels combine the scored Google Fonts tag dataset with OpenShelf’s editorial annotations. Only family-wide source tags scoring at least 50 are included. Suggested uses remain editorial starting points. Pairing notes draw on widely shared typographic advice. If something looks wrong, check the font\u2019s Google Fonts page or source repository, which are the authority.</p>

      <h2 class="sec">Local Fonts and Knowledge</h2>${desktop.enabled?'<p>Downloaded and imported TTF/OTF fonts are stored on this computer. You can edit their details, export the files and metadata, and enable individual fonts or saved collections. Offline mode shows downloaded and installed fonts and stops remote previews. Fonts installed outside OpenShelf remain under your operating system’s control. The desktop catalog updates with the application. Check for updates downloads signed releases when available.</p>':''}<p ${desktop.enabled?'hidden':''}>Local font files and their editable descriptions, categories and notes are stored in this browser using IndexedDB. They are not uploaded. Use Export collection to save your font files and their details before clearing browser data. Import collection restores that file in another browser or on another device. Your own font licences apply to imported files.</p><p>The Knowledge library is a searchable directory of Google Fonts Knowledge articles. Each card links to the original article on Google Fonts. Excerpts and thumbnails retain author credits and are shared under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>, with <a href="https://github.com/google/fonts/tree/main/cc-by-sa/knowledge">source material on GitHub</a>. Weekly refreshes update the directory; failed updates preserve the previous snapshot. GitHub may pause scheduled workflows after 60 days of repository inactivity; they can be re-enabled from Actions.</p>
      <h2 class="sec">Privacy</h2>${desktop.enabled?'<p>Your preview text, settings, collections and font files stay on this computer. There are no accounts or uploads. Online previews and downloads contact Google Fonts, GitHub or jsDelivr; update checks contact GitHub Releases. Offline mode uses local files.</p>':''}
      <p ${desktop.enabled?'hidden':''}>Your preview text, settings and collections are stored only in this browser. There are no accounts. Public font previews contact Google Fonts or jsDelivr, depending on the family’s source. Imported Local Fonts are loaded from your browser’s storage.</p>

      <h2 class="sec">Credits</h2>
      <p>OpenShelf was designed and built by <strong>${esc(AUTHOR.name)}</strong>.${AUTHOR.github || AUTHOR.portfolio ? ` Find more work on ${[AUTHOR.github ? `<a href="${AUTHOR.github}" target="_blank" rel="noopener">GitHub</a>` : '', AUTHOR.portfolio ? `<a href="${AUTHOR.portfolio}" target="_blank" rel="noopener">the portfolio site</a>` : ''].filter(Boolean).join(' and ')}.` : ''}</p>
      <p>None of this exists without the type designers and foundries who chose to release their work openly, and the projects that make it easy to find and use: <a href="https://fonts.google.com" target="_blank" rel="noopener">Google Fonts</a>, <a href="https://fontsource.org" target="_blank" rel="noopener">Fontsource</a> and the <a href="https://openfontlicense.org" target="_blank" rel="noopener">Open Font License</a>. Every font page names its designer and publisher. If you use a font in your work, crediting them is a kind thing to do.</p>
      <p style="margin-top:28px"><a class="btn primary" href="#/" style="text-decoration:none">Browse the library</a></p>
    </div>`;
  document.title = 'About | OpenShelf';
}
function gotoPairings() { if (location.hash === '#/pairings') { renderBuilder(); window.scrollTo({top:0, behavior:'smooth'}); } else location.hash = '#/pairings'; }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const p = pop();
  if (!p.hidden && !p.contains(e.target) && !(p._anchor && p._anchor.contains(e.target))) closePop();
  const t = e.target.closest('[data-action]'); if (!t) return;
  const a = t.dataset.action;
  switch (a) {
    case 'fchip': { const set = state.f[t.dataset.set]; set.has(t.dataset.val) ? set.delete(t.dataset.val) : set.add(t.dataset.val); refilter(); break; }
    case 'fpanel-hide': setFPHidden(true); $('[data-action="fpanel-open"]').focus(); break;
    case 'fpanel-open': if (matchMedia('(min-width: 901px)').matches) { setFPHidden(false); const h = $('#fpanel .fp-hide'); if (h) h.focus(); break; } $('#fpanel').classList.add('on'); t.setAttribute('aria-expanded', 'true'); setTimeout(() => { const c = $('#fpanel .fp-close'); if (c) c.focus(); }, 50); break;
    case 'fpanel-close': closeFPanel(); break;
    case 'cardi': { const sl = t.dataset.slug; const f = BY[sl]; state.card[sl] = Object.assign({}, state.card[sl], {i: !libI(f)}); replaceCard(sl, '[data-action="cardi"]'); break; }
    case 'fmode': state.fmode[t.dataset.set] = t.dataset.mode; store.set('fmode', state.fmode); refilter(); break;
    case 'popdone': closePop(true); break;
    case 'shuffle': reshuffle(); state.sort = 'random'; renderLibrary(); break;
    case 'unfilter': { const g = t.dataset.group; if (g === 'exactw') state.exactW = false; else if (g === 'col') state.col = null; else if (state.f[g]) state.f[g].delete(t.dataset.val); refilter(); break; }
    case 'clear': clearFilters(); refilter(); break;
    case 'filterto': { clearFilters(); const g = t.dataset.group === 'cls' ? t.dataset.val.split(':')[0] : t.dataset.group; state.f[g].add(t.dataset.val); } if (location.hash === '#/' || location.hash === '') renderLibrary(); else location.hash = '#/'; break;
    case 'fav': { const s = t.dataset.slug; setFont('favs', s); refreshFav(s); pulse(t); toast(isFav(s) ? `Added ${BY[s].n} to Favourites` : `Removed ${BY[s].n} from Favourites`); afterColChange(); break; }
    case 'save': {
      if (!p.hidden && p._anchor === t) { closePop(); break; }
      const item = t.dataset.kind === 'font' ? {kind:'font', slug:t.dataset.slug} : t.dataset.current ? Object.assign({kind:'pair'}, clonePair(state.pair)) : {kind:'pair', h:t.dataset.h, b:t.dataset.b};
      openSaveMenu(t, item); break;
    }
    case 'collection-layout': state.collectionLayout=t.dataset.layoutValue;store.set('collectionLayout',state.collectionLayout);renderDrawer();break;
    case 'marker-open': state.markerMenu=state.markerMenu===t.dataset.id?null:t.dataset.id;renderDrawer();break;
    case 'marker-close': state.markerMenu=null;renderDrawer();break;
    case 'marker-set': {const c=getCol(t.dataset.id);c.marker=cleanMarker({...c.marker,[t.dataset.markerKind]:t.dataset.value});saveCols();renderDrawer();break;}
    case 'preview-all': allCollections().forEach(c => c.preview.mode = 'page'); saveCols(); renderDrawer(); toast('All collections now use the page preview text'); break;
    case 'drawer': drawerOpen() ? closeDrawer() : openDrawer(); break;
    case 'drawer-close': closeDrawer(); break;
    case 'ci-toggle': toggleCollection(t.dataset.id);break;
    case 'enabled-only': state.enabledOnly=!state.enabledOnly;t.setAttribute('aria-pressed',String(state.enabledOnly));state.limit=48;renderLibrary();break;
    case 'ci-rmfont': setFont(t.dataset.id, t.dataset.slug, false); if (t.dataset.id === 'favs') refreshFav(t.dataset.slug); afterColChange(); break;
    case 'ci-rmpair': setPair(t.dataset.id, {h:t.dataset.h, b:t.dataset.b}, false); afterColChange(); break;
    case 'ci-show': clearFilters(); state.col = t.dataset.id; closeDrawer(); if (location.hash === '#/' || location.hash === '') renderLibrary(); else location.hash = '#/'; break;
    case 'ci-css': copyText(embedCode(getCol(t.dataset.id)), 'Embed code copied'); break;
    case 'ci-export': { const c = getCol(t.dataset.id); download(fileName(c.name), JSON.stringify(exportObj([c]), null, 2)); break; }
    case 'ci-share': copyText(shareLink(getCol(t.dataset.id)), 'Share link copied. Anyone opening it can add this collection.'); break;
    case 'ci-rename': state.renaming = t.dataset.id; renderDrawer(); break;
    case 'ci-delete': {
      if (t.dataset.confirm) { const c = getCol(t.dataset.id); state.cols = state.cols.filter(x => x !== c); if (state.col === c.id) state.col = null; if (state.rand.from === c.id) state.rand.from = ''; saveCols(); renderDrawer(); toast(`Deleted \u201c${c.name}\u201d`); afterColChange(); }
      else { t.dataset.confirm = '1'; t.textContent = 'Confirm delete'; }
      break;
    }
    case 'import-toggle': { const scope = t.closest('#drawer') ? '#drawer' : '#view-collections'; state.importOpen = !state.importOpen; renderDrawer(); if (state.importOpen) $(scope+' [data-collection-import]').focus(); break; }
    case 'import-paste': { const input = $('[data-collection-import]', t.closest('.collection-manager')); const v = input.value.trim(); if (!v) { input.focus(); toast('Paste the JSON first'); break; } if (importText(v)) { state.importOpen = false; renderDrawer(); afterColChange(); } break; }
    case 'import-file': $('#file-in').click(); break;
    case 'export-all': download('open-shelf-collections.json', JSON.stringify(exportObj(state.cols), null, 2)); break;
    case 'copy-all': copyText(JSON.stringify(exportObj(state.cols), null, 2), 'All collections copied as JSON'); break;
    case 'openpair': { state.history.push(clonePair(state.pair)); const sc = t.dataset.col && getCol(t.dataset.col); const sp = sc && sc.pairs[+t.dataset.idx]; state.pair = normPS(sp && sp.h === t.dataset.h && sp.b === t.dataset.b ? sp : {h:t.dataset.h, b:t.dataset.b}); } store.set('pair', state.pair); closeDrawer(); gotoPairings(); break;
    case 'randfor': state.locks = {h:true, b:false}; state.history.push(clonePair(state.pair)); state.pair = normPS({h:t.dataset.slug, b:state.pair.b === t.dataset.slug ? 'inter' : state.pair.b}); store.set('pair', state.pair); location.hash = '#/pairings'; setTimeout(doRandomise, 0); break;
    case 'swap': state.history.push(clonePair(state.pair)); state.pair = normPS({h:state.pair.b, b:state.pair.h, hs:Object.assign({}, state.pair.hs, {w:0, i:false}), bs:Object.assign({}, state.pair.bs, {w:0, i:false})}); renderBuilder(); break;
    case 'adj-toggle': { const [sd, k] = t.dataset.k.split('.'); state.pair[sd][k] = !state.pair[sd][k]; renderBuilder(); break; }
    case 'adj-reset': state.pair = normPS({h:state.pair.h, b:state.pair.b}); renderBuilder(); break;
    case 'lock': state.locks[t.dataset.which] = !state.locks[t.dataset.which]; renderBuilder(); break;
    case 'randomise': doRandomise(); break;
    case 'undo': if (state.history.length) { state.pair = normPS(state.history.pop()); renderBuilder(); } break;
    case 'randcls': { const arr = state.rand[t.dataset.key]; const v = t.dataset.val; const i = arr.indexOf(v); if (i > -1) { if (arr.length > 1) arr.splice(i, 1); else toast('Keep at least one style selected'); } else arr.push(v); store.set('rand', state.rand); $('#adv-body').innerHTML = renderRandOpts(); break; }
    case 'randreset': state.rand = JSON.parse(JSON.stringify(DEFAULT_RAND)); store.set('rand', state.rand); $('#adv-body').innerHTML = renderRandOpts(); toast('Randomiser options reset'); break;
    case 'prov': state.prov = t.dataset.val; renderPairList(); updatePreviews(); break;
    case 'banner-import': { const bn = $('#banner'); try { const r = importFrom(bn._data); toast(r.made ? 'Collection added' : 'Added to Favourites'); } catch (err) { toast('Couldn\u2019t read that collection.'); } bn.hidden = true; afterColChange(); break; }
    case 'skip': e.preventDefault(); { const m = $('#main'); m.focus(); const v = $$('main > section').find(x => !x.hidden); const h = v && $('h1, .toolbar input, .fpanel summary', v); if (h && h.tagName === 'INPUT') h.focus(); } break;
    case 'banner-close': $('#banner').hidden = true; break;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('select[data-adj]')) { const [sd, k] = t.dataset.adj.split('.'); state.pair[sd][k] = +t.value; renderBuilder(); return; }
  if (t.matches('select[data-card="w"]')) { const sl = t.dataset.slug; state.card[sl] = Object.assign({}, state.card[sl], {w: +t.value}); replaceCard(sl, 'select[data-card="w"]'); return; }
  if (t.matches('#pop input[data-col]')) {
    const item = pop()._item; const c = getCol(t.dataset.col);
    if (item.kind === 'font') { setFont(c.id, item.slug, t.checked); if (c.id === 'favs') refreshFav(item.slug); toast(t.checked ? `Saved ${BY[item.slug].n} to ${c.name}` : `Removed ${BY[item.slug].n} from ${c.name}`); }
    else { setPair(c.id, item, t.checked); toast(t.checked ? `Saved pairing to ${c.name}` : `Removed pairing from ${c.name}`); }
    afterColChange(); return;
  }
  if (t.matches('[data-rand]')) { const k = t.dataset.rand; state.rand[k] = t.type === 'checkbox' ? t.checked : t.value; store.set('rand', state.rand); return; }
  if (t.id === 'file-in' && t.files && t.files[0]) {
    const fr = new FileReader();
    fr.onload = () => { if (importText(String(fr.result))) { state.importOpen = false; renderDrawer(); afterColChange(); } t.value = ''; };
    fr.onerror = () => toast('Couldn\u2019t read that file.');
    fr.readAsText(t.files[0]);
  }
});
document.addEventListener('input', e => {
  if (e.target.matches('[data-preview-page]')) {
    state.collectionText=e.target.value.slice(0,500); store.set('collectionText',state.collectionText);
    $$('[data-preview-page]').forEach(i=>{if(i!==e.target)i.value=state.collectionText;}); updateCollectionPreviews();
  }
  if (e.target.matches('[data-preview-custom]')) { const c=getCol(e.target.dataset.previewCustom); c.preview.text=e.target.value.slice(0,500); saveCols(); updateCollectionPreviews(); }
});
document.addEventListener('change',e=>{
 if(!e.target.matches('[data-collection-columns]'))return;
 state.collectionCols=e.target.value;store.set('collectionCols',state.collectionCols);renderDrawer();
});
document.addEventListener('change', e => {
  if (!e.target.matches('[data-preview-mode]')) return;
  const scope=e.target.closest('#drawer')?'#drawer':'#view-collections', id=e.target.dataset.previewMode;
  getCol(id).preview.mode=e.target.value; saveCols(); renderDrawer();
  const input=$(scope+' [data-preview-custom="'+id+'"]') || $(scope+' [data-preview-mode="'+id+'"]'); input?.focus();
});
document.addEventListener('submit', e => {
  const form = e.target.closest('[data-form]'); if (!form) return;
  e.preventDefault();
  const inp = $('input', form); const kind = form.dataset.form;
  if (kind === 'rename') { const n = inp.value.trim(); if (n) { getCol(form.dataset.id).name = n.slice(0, 60); saveCols(); toast('Collection renamed'); } state.renaming = null; renderDrawer(); afterColChange(); return; }
  if (kind === 'pop-new') {
    const item = pop()._item;
    const c = item.kind === 'font' ? newCollection(inp.value, [item.slug]) : newCollection(inp.value, [], [item.hs && !isDefaultStyle(item) ? {h:item.h, b:item.b, hs:normPS(item).hs, bs:normPS(item).bs} : {h:item.h, b:item.b}]);
    if (!c) { inp.focus(); return; }
    toast(`Created \u201c${c.name}\u201d and saved ${item.kind === 'font' ? BY[item.slug].n : 'the pairing'}`);
    closePop(true); afterColChange(); return;
  }
  if (kind === 'dr-new') { const scope = form.closest('#drawer') ? '#drawer' : '#view-collections'; const c = newCollection(inp.value); if (!c) { inp.focus(); return; } state.open.add(c.id); toast(`Created \u201c${c.name}\u201d`); renderDrawer(); $(scope+' [data-form="dr-new"] input').focus(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#nav-toggle').getAttribute('aria-expanded') === 'true') { setNavOpen(false); $('#nav-toggle').focus(); return; }
  if (e.key === 'Escape') { if ($('#fpanel').classList.contains('on')) closeFPanel(); else if (!pop().hidden) closePop(true); else if (drawerOpen()) closeDrawer(); else if (!$('#banner').hidden) $('#banner').hidden = true; }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  if (e.key === '/' && !typing) { e.preventDefault(); $('#proof-input').focus(); }
  if (e.key === 'Tab' && drawerOpen()) {
    const f = $$('#drawer button, #drawer a, #drawer input, #drawer textarea, #drawer select').filter(x => !x.disabled && x.offsetParent !== null);
    if (f.length) { if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
  }
});
$('#scrim').addEventListener('click', closeDrawer);
function setFPW(w) { w = Math.round(Math.max(200, Math.min(440, w))); document.documentElement.style.setProperty('--fp-w', w + 'px'); const r = $('#fp-resize'); if (r) r.setAttribute('aria-valuenow', w); store.set('fpw', w); }
function setFPHidden(h) { $('#view-library').classList.toggle('fp-off', h); store.set('fphidden', h); const b = $('[data-action="fpanel-open"]'); if (b) b.setAttribute('aria-expanded', String(!h)); }
function closeFPanel() { const fp = $('#fpanel'); if (!fp.classList.contains('on')) return; fp.classList.remove('on'); const b = $('[data-action="fpanel-open"]'); b.setAttribute('aria-expanded', 'false'); b.focus(); }
document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('#fpanel .fsec')) { store.set('fclosed', $$('#fpanel .fsec').filter(d => !d.open).map(d => d.dataset.sec)); } }, true);
window.addEventListener('resize', () => closePop());
document.addEventListener('input', e => { const t = e.target; if (!t.matches('#adjust input[type=range][data-adj]')) return; const [sd, k] = t.dataset.adj.split('.'); state.pair[sd][k] = +t.value; applyBuilderStyles(); });
let qT; $('#q').addEventListener('input', e => { state.q = e.target.value; clearTimeout(qT); qT = setTimeout(refilter, 140); });
$('#load-more').addEventListener('click', () => { state.limit += 48; renderLibrary(); });
$('#grid-columns').addEventListener('change', e => { state.gridCols = e.target.value; store.set('gridCols', state.gridCols); renderLibrary(); });
$('#sort').addEventListener('change', e => { state.sort = e.target.value; if (state.sort === 'random') reshuffle(); renderLibrary(); });
$$('.seg button[data-layout]').forEach(b => b.addEventListener('click', () => { state.layout = b.dataset.layout; store.set('layout', state.layout); renderLibrary(); }));
$('#theme-btn').addEventListener('click', () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme === 'light' ? 'dark' : 'light'; store.set('theme', r.dataset.theme); });
(() => { const t = store.get('theme', 'dark'); document.documentElement.dataset.theme = t === 'light' ? 'light' : 'dark'; })();

/* ---------- boot ---------- */
window.OpenShelfLocal.connect(syncLocalRegistry);
desktop.connect({toast,collection:getCol,collections:()=>state.cols,activationChanged:()=>{allCollections();$$(`[data-col-card="${ENABLED_ID}"]`).forEach(el=>{const y=el.closest('.dr-body')?.scrollTop;el.outerHTML=drawerItem(enabledCollection);if(y!==undefined)$('#drawer .dr-body').scrollTop=y;});observeCollectionFonts();updateCollectionPreviews();if(!$('#view-library').hidden&&(state.enabledOnly||state.col===ENABLED_ID))renderLibrary();},refresh:()=>{
  syncLocalRegistry();loaded.clear();unavailable.clear();$('#font-status').hidden=true;
  const open=drawerOpen();
  if(open){ if(!$('#view-library').hidden)renderLibrary();else if(!$('#view-local').hidden)desktop.showLocal();renderDrawer(); }
  else route();
}});
if(desktop.enabled){const b=document.createElement('button');b.className='btn sm enabled-only';b.dataset.action='enabled-only';b.setAttribute('aria-pressed',String(state.enabledOnly));b.textContent='Enabled only';$('#sort').before(b);}
$('#q').value=state.q;$('#sort').value=state.sort;
setupProof();
renderMadeBy();
$('#last-updated').classList.add('meta-row');
$('#last-updated').innerHTML = `<span>Website updated <time datetime="2026-10-12">12 October 2026</time></span><span>Font catalog checked <time datetime="${esc(catalog.updatedAt)}">${esc(catalog.updatedAt)}</time></span><span>Knowledge synced <time datetime="${esc(window.OPEN_SHELF_KNOWLEDGE.updatedAt)}">${esc(window.OPEN_SHELF_KNOWLEDGE.updatedAt)}</time></span>`;
buildPanel();
(function setupFPanel() {
  const r = $('#fp-resize');
  setFPW(store.get('fpw', 260)); setFPHidden(!!store.get('fphidden', false));
  let sx = 0, sw = 0;
  r.addEventListener('pointerdown', e => { sx = e.clientX; sw = $('#fpanel').getBoundingClientRect().width + 8; r.setPointerCapture(e.pointerId); r.classList.add('drag'); document.body.classList.add('resizing'); e.preventDefault(); });
  r.addEventListener('pointermove', e => { if (r.classList.contains('drag')) setFPW(sw + e.clientX - sx); });
  const end = () => { r.classList.remove('drag'); document.body.classList.remove('resizing'); };
  r.addEventListener('pointerup', end); r.addEventListener('pointercancel', end);
  r.addEventListener('dblclick', () => setFPW(260));
  r.addEventListener('keydown', e => {
    const cur = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--fp-w')) || 260;
    if (e.key === 'ArrowLeft') { setFPW(cur - 16); e.preventDefault(); } else if (e.key === 'ArrowRight') { setFPW(cur + 16); e.preventDefault(); }
    else if (e.key === 'Home') { setFPW(200); e.preventDefault(); } else if (e.key === 'End') { setFPW(440); e.preventDefault(); }
  });
})();
const floatingCollections=document.createElement('button');
floatingCollections.className='floating-collections btn';floatingCollections.dataset.action='drawer';floatingCollections.setAttribute('aria-label','Open collections panel');floatingCollections.setAttribute('aria-controls','drawer');floatingCollections.setAttribute('aria-expanded','false');floatingCollections.hidden=true;
floatingCollections.innerHTML=ICON.save+'<span>Collections</span><span data-collection-count></span>';document.body.appendChild(floatingCollections);
if('IntersectionObserver' in window)new IntersectionObserver(([e])=>{floatingCollections.hidden=e.isIntersecting;},{threshold:0}).observe($('.top'));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.markerMenu){state.markerMenu=null;renderDrawer();}});
updateColCount();
window.addEventListener('hashchange',()=>{store.set('lastRoute',location.hash);route();});
if(!location.hash){const last=store.get('lastRoute','#/');if(/^#\//.test(last))history.replaceState(null,'',last);}
route();
})();
