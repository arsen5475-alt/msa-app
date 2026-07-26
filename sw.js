// MSA — service worker hors-ligne
// Met l'application en cache dès l'installation pour un fonctionnement complet sans réseau.
var CACHE = 'msa-v2';
var SHELL = ['/', '/index.html'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).catch(function(){})
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;

  // Navigation (ouverture de l'app) : réseau d'abord, sinon la copie en cache.
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put('/index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('/index.html').then(function(r){ return r || caches.match('/'); });
      })
    );
    return;
  }

  // Autres ressources (polices, etc.) : cache d'abord, puis réseau, et on met en cache au passage.
  e.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.status === 200){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
    })
  );
});
