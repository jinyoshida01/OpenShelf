const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'.desktop-dist');
fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','app.js','desktop.js','styles.css','desktop.css','local-fonts.js','knowledge.js','favicon.svg','site.webmanifest','icon-192.png','icon-512.png','data','knowledge-assets','assets'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
// The app starts completely offline; its UI uses the system font stack.
html=html.replace(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\n?/g,'');
fs.writeFileSync(path.join(out,'index.html'),html);
