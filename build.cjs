const fs = require('fs');
const files = ['index.html','404.html','config.js','shared.js','script.js','translations.js','style.css','tailwind.min.css','favicon-32x32.png','og-image.jpg','CV-Oussama-Khiati.pdf','robots.txt','sitemap.xml'];
fs.mkdirSync('dist',{recursive:true});
// Remove obsolete pages left over from a previous build.
for (const file of ["blog.html","blog.js","article.html","article.js","etudes-de-cas.html","case-study.js"]) fs.rmSync(require('node:path').join(__dirname, 'dist', file), {force:true});
fs.copyFileSync('favicon.svg', 'dist/favicon.svg');
for (const file of files) fs.copyFileSync(file, `dist/${file}`);
fs.cpSync('assets/tech-icons', 'dist/assets/tech-icons', {recursive:true});
fs.cpSync('assets/fontawesome', 'dist/assets/fontawesome', {recursive:true});
