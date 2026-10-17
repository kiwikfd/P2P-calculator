// Меняйте версию при крупных обновлениях, чтобы сбросить кэш
const V='p2p-v3';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png','favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  const own=u.origin===location.origin;
  const sdk=u.hostname==='www.gstatic.com'&&u.pathname.startsWith('/firebasejs/');
  if(!own&&!sdk)return; // запросы к Firebase/Google идут напрямую
  // кэш сразу, обновление в фоне
  e.respondWith(caches.open(V).then(async c=>{
    const hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>hit);
    return hit||net;
  }));
});
