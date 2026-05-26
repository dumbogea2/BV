const CACHE_NAME = 'valtorta-cache-v43'; // Bump versione: aggiunto clients.claim, network-first per HTML, file Polifonia

// 1. FILE FONDAMENTALI (Scaricati subito durante l'installazione)
const urlsToCache = [
 // --- PAGINE PRINCIPALI E SCRIPT ---
  '/',           // FONDAMENTALE: Salva la radice del sito per l'avvio da icona su iPhone
  './',          // FONDAMENTALE: Sicurezza aggiuntiva per i percorsi relativi
  './index.html',
  './offline.html',
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
  './mappa/mappa_palestina/blank.png', // Immagine di fallback

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

  // --- POLIFONIA VALTORTIANA (Studi e Approfondimenti) ---
  './PolifoniaValtortiana/home.html',
  './PolifoniaValtortiana/polifonia.html',
  './PolifoniaValtortiana/polifonia_v1.js',
  './PolifoniaValtortiana/polifonia_v2.js',
  './PolifoniaValtortiana/mia_cronologia.html',
  './PolifoniaValtortiana/miei_appunti.html',
  './PolifoniaValtortiana/ricerca_studi.html',
  './PolifoniaValtortiana/images/PolifoniaValtortiana1.jpg',
  './PolifoniaValtortiana/images/PolifoniaValtortiana2.jpg',
  './PolifoniaValtortiana/images/img1.png',
  './PolifoniaValtortiana/images/v2_img1.png',
  './PolifoniaValtortiana/images/Riflesso_opera.png',
  
];
// --- ELENCO ESATTO DELLE IMMAGINI DELLA MAPPA (Livelli 0, 1, 2, 3) ---
const mapTilesList = [
  // Livello Zoom 0 (1 immagine)
  './mappa/mappa_palestina/0/0/0.jpg',
  
  // Livello Zoom 1 (4 immagini)
  './mappa/mappa_palestina/1/0/0.jpg',
  './mappa/mappa_palestina/1/0/1.jpg',
  './mappa/mappa_palestina/1/1/0.jpg',
  './mappa/mappa_palestina/1/1/1.jpg',
  
  // Livello Zoom 2 (9 immagini)
  './mappa/mappa_palestina/2/0/0.jpg',
  './mappa/mappa_palestina/2/0/1.jpg',
  './mappa/mappa_palestina/2/0/2.jpg',
  './mappa/mappa_palestina/2/1/0.jpg',
  './mappa/mappa_palestina/2/1/1.jpg',
  './mappa/mappa_palestina/2/1/2.jpg',
  './mappa/mappa_palestina/2/2/0.jpg',
  './mappa/mappa_palestina/2/2/1.jpg',
  './mappa/mappa_palestina/2/2/2.jpg',
  
  // Livello Zoom 3 (25 immagini)
  './mappa/mappa_palestina/3/0/0.jpg',
  './mappa/mappa_palestina/3/0/1.jpg',
  './mappa/mappa_palestina/3/0/2.jpg',
  './mappa/mappa_palestina/3/0/3.jpg',
  './mappa/mappa_palestina/3/0/4.jpg',
  './mappa/mappa_palestina/3/1/0.jpg',
  './mappa/mappa_palestina/3/1/1.jpg',
  './mappa/mappa_palestina/3/1/2.jpg',
  './mappa/mappa_palestina/3/1/3.jpg',
  './mappa/mappa_palestina/3/1/4.jpg',
  './mappa/mappa_palestina/3/2/0.jpg',
  './mappa/mappa_palestina/3/2/1.jpg',
  './mappa/mappa_palestina/3/2/2.jpg',
  './mappa/mappa_palestina/3/2/3.jpg',
  './mappa/mappa_palestina/3/2/4.jpg',
  './mappa/mappa_palestina/3/3/0.jpg',
  './mappa/mappa_palestina/3/3/1.jpg',
  './mappa/mappa_palestina/3/3/2.jpg',
  './mappa/mappa_palestina/3/3/3.jpg',
  './mappa/mappa_palestina/3/3/4.jpg',
  './mappa/mappa_palestina/3/4/0.jpg',
  './mappa/mappa_palestina/3/4/1.jpg',
  './mappa/mappa_palestina/3/4/2.jpg',
  './mappa/mappa_palestina/3/4/3.jpg',
  './mappa/mappa_palestina/3/4/4.jpg'
];
// --- INIZIO PASSO 3 (INSTALLAZIONE RESILIENTE + MAPPE OFFLINE) ---
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Forza il Service Worker ad attivarsi subito

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            console.log("1. Inizio caching dei file base (App e Libri)...");
            
            // Scarica i file base uno ad uno (se uno fallisce, non blocca gli altri)
            await Promise.all(
                urlsToCache.map(url => {
                    return cache.add(url).catch(err => console.log('File base saltato (non trovato):', url));
                })
            );

            console.log("2. Inizio caching silente delle mappe usando lista esatta...");
            
            // Usiamo direttamente l'array che abbiamo creato sopra
            for (const url of mapTilesList) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        await cache.put(url, response);
                    } else {
                        console.log('Immagine mappa non trovata sul server:', url);
                    }
                } catch (e) {
                    // Errore silenzioso
                }
            }
            console.log("3. Installazione e Download Offline completati con successo!");
        })
    );
});
// --- FINE PASSO 3 ---

// Attivazione: Pulisce le vecchie cache + prende controllo immediato delle pagine aperte
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 1. Pulisci vecchie cache
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 2. Prendi controllo IMMEDIATO delle pagine già aperte
      // Senza questo, il SW nuovo resta in attesa finché tutte le tab non sono chiuse.
      // Con questo, scatta 'controllerchange' nelle pagine aperte → banner visibile.
      self.clients.claim()
    ])
  );
});

// --- FETCH IBRIDO V13 ---
// HTML pages → NETWORK-FIRST (con fallback cache): le pagine sono sempre fresche online,
// ma funzionano offline grazie alla cache.
// Tutto il resto (immagini, JS archivi, CSS) → CACHE-FIRST: prestazioni massime, file pesanti non si ri-scaricano.
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Capisci se è una richiesta di documento HTML (navigazione o file .html)
  const accept = event.request.headers.get('accept') || '';
  const url = event.request.url.split('?')[0];
  const isHtml = event.request.mode === 'navigate'
              || accept.includes('text/html')
              || url.endsWith('.html')
              || url.endsWith('/');

  if (isHtml) {
    // STRATEGIA NETWORK-FIRST per HTML
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        try {
          // 1. Prova rete (con timeout implicito del browser)
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            // Aggiorna la cache con la versione fresca
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // 2. Offline o rete in errore → fallback cache
          let response = await cache.match(event.request, { ignoreSearch: true });
          if (response) return response;
          const urlSenzaParametri = event.request.url.split('?')[0];
          response = await cache.match(urlSenzaParametri, { ignoreSearch: true });
          if (response) return response;
          // 3. Modalità Offline Estrema (BUGFIX SCHERMATA BIANCA)
          if (event.request.mode === 'navigate') {
            let fallback = await cache.match('./index.html', { ignoreSearch: true });
            if (!fallback) fallback = await cache.match('./', { ignoreSearch: true });
            if (!fallback) fallback = await cache.match('/', { ignoreSearch: true });
            if (fallback) return fallback;
          }
          return new Response('', { status: 404, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // STRATEGIA CACHE-FIRST per immagini, JS, CSS, ecc. (logica originale conservata)
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      let response = await cache.match(event.request, { ignoreSearch: true });
      if (response) return response;
      const urlSenzaParametri = event.request.url.split('?')[0];
      response = await cache.match(urlSenzaParametri, { ignoreSearch: true });
      if (response) return response;
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        return new Response('', { status: 404, statusText: 'Offline' });
      }
    })
  );
});
// --- FINE FETCH IBRIDO V13 ---