const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const server = require('./server');
let origin;
test.before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;});
test.after(()=>new Promise(resolve=>server.close(resolve)));
test('public pages have security headers',async()=>{for(const path of ['/']) {const res=await fetch(origin+path);assert.equal(res.status,200);assert.match(res.headers.get('content-security-policy'),/object-src 'none'/);assert.equal(res.headers.get('x-frame-options'),'DENY');}});
test('private files and admin are not served',async()=>{for(const path of ['/package.json','/server.js','/admin.html','/admin.js','/.env','/.git/config','/node_modules/tailwindcss/package.json']) assert.equal((await fetch(origin+path)).status,404);});
test('malformed paths cannot crash server',async()=>{assert.equal((await fetch(origin+'/%E0%A4%A')).status,400);assert.equal((await fetch(origin+'/%00')).status,400);assert.equal((await fetch(origin+'/')).status,200);});
test('unsupported methods and HEAD',async()=>{assert.equal((await fetch(origin+'/',{method:'POST'})).status,405);assert.equal(await (await fetch(origin+'/',{method:'HEAD'})).text(),'');});
const source=fs.readFileSync('shared.js','utf8').split('/* Keyboard navigation')[0];
function shared(raw){const context=vm.createContext({URL,structuredClone,location:{href:'https://example.com/'},window:{localStorage:{getItem:()=>raw,setItem(){}}}});vm.runInContext(source+';globalThis.api=Portfolio;',context);return context.api;}
test('reject dangerous link schemes and SVG image payloads',()=>{const api=shared(null);for(const value of ['javascript:alert(1)','data:text/html,test','vbscript:foo']) assert.equal(api.url(value),'#');assert.equal(api.url('data:image/svg+xml;base64,AAAA',true),'#');assert.equal(api.url('https://github.com/test'),'https://github.com/test');});
test('invalid previews fall back and unknown keys cannot alter prototype',()=>{const defaults={nom:'Oussama',projets:[{titre:'Test',technos:['JS']}]};for(const raw of ['{','{"projets":null}','{"nom":[]}']) assert.equal(shared(raw).preview(defaults).nom,'Oussama');const result=shared('{"nom":"Test","__proto__":{"polluted":true}}').preview(defaults);assert.equal(result.nom,'Test');assert.equal(Object.hasOwn(result,'__proto__'),false);});

test('legacy previews separate training from professional experience', () => {
  const defaults = vm.runInNewContext(fs.readFileSync('config.js', 'utf8') + '; CONFIG;');
  const legacy = {...defaults, experiences: [...defaults.experiences, ...defaults.formations]};
  delete legacy.formations;
  const result = shared(JSON.stringify(legacy)).preview(defaults);
  assert.equal(result.experiences.length, 2);
  assert.equal(result.formations.length, 2);
  assert.equal(result.experiences[1].date, '2023');
  assert.equal(result.formations[0].date, '2021-09/2023-06');
  assert.equal(shared(JSON.stringify(result)).preview(defaults).formations.length, 2);
});

test('explicit training lists and undated experience survive migration', () => {
  const api = shared(null);
  const current = {experiences: [{date: '2022'}], formations: []};
  assert.equal(api.migrateJourney(current), current);
  const legacy = {experiences: [{date: 'unknown'}, {date: '2023'}, {date: '2019/2021'}]};
  const result = api.migrateJourney(legacy);
  assert.equal(result.experiences.length, 2);
  assert.equal(result.formations.length, 1);
  assert.equal(legacy.experiences.length, 3);
});

test('removed pages and scripts are unavailable', async () => {
  for (const pathname of ["/blog.html","/blog.js","/article.html","/article.js","/etudes-de-cas.html","/case-study.js"]) assert.equal((await fetch(origin + pathname)).status, 404);
  const home = await (await fetch(origin + '/')).text();
  assert.doesNotMatch(home, /href="(?:blog|article|etudes-de-cas)\.html/);
});
