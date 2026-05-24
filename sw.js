const CACHE_NAME = 'valtorta-cache-v39'; // Versione aggiornata per forzare il ricaricamento

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

// --- INIZIO FETCH BLINDATO V12 (FIX SCHERMATA BIANCA) ---
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cerca ignorando i parametri (es. ?cap=15)
      let response = await cache.match(event.request, { ignoreSearch: true });
      if (response) return response;

      // 2. Doppio controllo con il Trucco delle Forbici
      const urlSenzaParametri = event.request.url.split('?')[0];
      response = await cache.match(urlSenzaParametri, { ignoreSearch: true });
      if (response) return response;

      // 3. Se non è in memoria, prova internet
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // 4. Modalità Offline Estrema (BUGFIX SCHERMATA BIANCA)
        if (event.request.mode === 'navigate') {
          // ASPETTIAMO che la cache trovi la home page usando percorsi diversi
          let fallback = await cache.match('./index.html', { ignoreSearch: true });
          if (!fallback) fallback = await cache.match('./', { ignoreSearch: true });
          if (!fallback) fallback = await cache.match('/', { ignoreSearch: true });
          
          if (fallback) return fallback;
        }
        // Se proprio non c'è nulla, non far crashare l'app ma restituisci un vuoto controllato
        return new Response('', { status: 404, statusText: 'Offline' });
      }
    })
  );
});
// --- FINE FETCH BLINDATO V12 ---