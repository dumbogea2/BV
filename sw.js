const CACHE_NAME = 'valtorta-cache-v8'; // Versione aggiornata per forzare il ricaricamento

// 1. FILE FONDAMENTALI (Scaricati subito durante l'installazione)
const urlsToCache = [
 // --- PAGINE PRINCIPALI E SCRIPT ---
  '/',           // FONDAMENTALE: Salva la radice del sito per l'avvio da icona su iPhone
  './',          // FONDAMENTALE: Sicurezza aggiuntiva per i percorsi relativi
  './index.html',
  './login.html',
  './pwa_info.html',
  './istruzioni.html',
  './mia_cronologia.html',
  './miei_appunti.html',
  './ricerca_universale.html',
  './Quaderni/ricerca.html',
  './archivio.html',
  './cronologia.js',
  './sincronizzazione.js',
  './appunti.js',

  // --- IMMAGINI E SFONDI DELLA HOME ---
  './sfondo.png',
  './sfondo2.png',
  './home_sfondo.png',
  './EvangeloButton.png',
  './mappa-pergamena.png',
  './QuaderniButtonimg.jpg',
  './libro_azaria_copertina.png',
  './imgButtonRomani.png',
  './AutobiografiaButton.png',
  './ricerca_universale_button.png',
  './ArchivioButton.jpg',

  // --- MAPPA (Librerie e icone di base) ---
  './mappa/index.html',
  './mappa/leaflet/leaflet.css',
  './mappa/leaflet/leaflet.js',
  './mappa/img/citta.svg',
  './mappa/img/acqua.svg',
  './mappa/img/sacro.svg',

  // --- BIBLIOTECA PRINCIPALE ---
  './biblioteca/index.html',
  './biblioteca/archivio.js',
  './biblioteca/sfondo.png',
  './biblioteca/handmadepaper.png',

  // --- QUADERNI E OPERE MINORI ---
  './Quaderni/home.html',
  './Quaderni/Quaderni-home.png',
  './Quaderni/handmadepaper.png',
  
  './Quaderni/quaderni_1943.html',
  './Quaderni/archivio_1943.js',
  './Quaderni/Quaderni1.png',
  
  './Quaderni/quaderni_1944.html',
  './Quaderni/archivio_1944.js',
  './Quaderni/Quaderni2.png',
  
  './Quaderni/quaderni_1945-1950.html',
  './Quaderni/archivio_1945-1950.js',
  './Quaderni/Quaderni3.png',
  
  './Quaderni/quadernetti.html',
  './Quaderni/Quadernetti.js',
  './Quaderni/Quadernetti.png',
  
  './Quaderni/libro_azaria.html',
  './Quaderni/archivio_azaria.js',
  './Quaderni/imgAzaria.png',
  
  './Quaderni/lezioni_romani.html',
  './Quaderni/archivio_romani.js',
  './Quaderni/imgRomani.png',
  
  './Quaderni/autobiografia.html',
  './Quaderni/Autobiografia.js',
  './Quaderni/Autobiografia.png',

  // --- PRESENTAZIONE ---
  './presentazione/index.html'
];

// Installazione: scarica i file fondamentali nella cache
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Attivazione: Pulisce le vecchie cache se cambiamo versione
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Gestione richieste migliorata per evitare "Schermate Bianche" su Safari
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Se è in cache, restituiscilo subito (velocità massima)
      if (cachedResponse) return cachedResponse;

      // 2. Se non è in cache, prova a scaricarlo
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        // Lo salva in cache per la prossima volta (Caching Dinamico)
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // 3. SE SEI OFFLINE e il file non è in cache, mostra una pagina di cortesia o l'indice
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        // Per immagini o script mancanti, restituisce una risposta vuota (non blocca l'app)
        return new Response('', { status: 404, statusText: 'Offline' });
      });
    })
  );
});