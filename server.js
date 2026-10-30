const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const publicFiles = new Set(['index.html','404.html','config.js','shared.js','script.js','translations.js','style.css','tailwind.min.css','lucide.js','favicon-32x32.png','og-image.jpg','CV-Oussama-Khiati.pdf','robots.txt','sitemap.xml']);
const localAdmin = process.env.ENABLE_LOCAL_ADMIN === '1';
publicFiles.add('assets/fontawesome/icons.js');
publicFiles.add('favicon.svg');
for (const file of fs.readdirSync(path.join(root, 'assets', 'tech-icons'))) {
 if (/^[a-z0-9-]+\.svg$/.test(file)) publicFiles.add(`assets/tech-icons/${file}`);
}
if (localAdmin) { publicFiles.add('admin.html'); publicFiles.add('admin.js'); }
const contentTypes = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.pdf':'application/pdf','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const headers = {
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'strict-origin-when-cross-origin',
 'X-Frame-Options':'DENY',
 'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
 'Content-Security-Policy': "default-src 'self'; script-src 'self'" + (localAdmin ? " 'unsafe-inline'" : '') + "; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self' mailto:",
 'Cache-Control':'no-cache'
};
const server = http.createServer((request,response) => {
 const end = (status,text,extra={}) => { response.writeHead(status,{...headers,'Content-Type':'text/plain; charset=utf-8',...extra}); response.end(request.method === 'HEAD' ? undefined : text); };
 if (!['GET','HEAD'].includes(request.method)) return end(405,'Method not allowed',{'Allow':'GET, HEAD'});
 let pathname;
 try { pathname = decodeURIComponent(new URL(request.url,'http://localhost').pathname); }
 catch { return end(400,'Bad request'); }
 if (pathname.includes('\0') || pathname.includes('\\')) return end(400,'Bad request');
 const filename = pathname === '/' ? 'index.html' : pathname.slice(1);
 if (!publicFiles.has(filename)) {
  response.writeHead(404,{...headers,'Content-Type':'text/html; charset=utf-8'});
  return response.end(request.method === 'HEAD' ? undefined : fs.readFileSync(path.join(root,'404.html')));
 }
 fs.readFile(path.join(root,filename),(error,content) => {
  if(error) return end(error.code==='ENOENT'?404:500,'File unavailable');
  response.writeHead(200,{...headers,'Content-Type':contentTypes[path.extname(filename)] || 'application/octet-stream'});
  response.end(request.method === 'HEAD' ? undefined : content);
 });
});
if (require.main === module) server.listen(port, '127.0.0.1', () => console.log(`Portfolio: http://localhost:${port}`));
module.exports = server;
