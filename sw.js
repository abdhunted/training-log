// Offline cache for the Training Log. Bump VERSION when you replace index.html so phones pick up the update.
const VERSION='v6';
const CORE=['./','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
const clean=res=>res.redirected?res.blob().then(b=>new Response(b,{status:200,headers:res.headers})):Promise.resolve(res);
self.addEventListener('install',e=>{e.waitUntil(caches.open('app-'+VERSION).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'reload'}).then(clean).then(r=>c.put(u,r))))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!=='app-'+VERSION&&k!=='fonts').map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    const key=r.mode==='navigate'?'./':r;
    e.respondWith(caches.match(key,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(clean).then(res=>{const cp=res.clone();caches.open('app-'+VERSION).then(c=>c.put(key,cp));return res;}).catch(()=>caches.match('./'))));
  }else if(u.host==='fonts.googleapis.com'||u.host==='fonts.gstatic.com'){
    e.respondWith(caches.open('fonts').then(c=>c.match(r).then(hit=>{const net=fetch(r).then(res=>{c.put(r,res.clone());return res;}).catch(()=>hit);return hit||net;})));
  }
});
