// --- SCRIPT CENTRALIZZATO: cronologia.js ---

// Funzione universale per salvare i capitoli letti (aggiornata per supportare tutti i libri)
function salvaInCronologia(idCapitolo, titoloCapitolo, nomeOpera, cartellaOpera, fileEParametro = "/index.html?ch=") {
    let history = JSON.parse(localStorage.getItem('valtorta_cronologia_globale')) || [];

    let titoloBreve = titoloCapitolo;
    if (titoloBreve.length > 45) {
        titoloBreve = titoloBreve.substring(0, 42) + "...";
    }

    const entry = {
        id: idCapitolo,
        titolo: titoloBreve,
        opera: nomeOpera,
        // Usa il formato standard per l'Evangelo, oppure quello personalizzato (es. per i Quaderni)
        url: cartellaOpera + fileEParametro + idCapitolo, 
        timestamp: new Date().getTime()
    };

    history = history.filter(item => item.url !== entry.url);
    history.unshift(entry);

    if (history.length > 5) {
        history.pop();
    }

    localStorage.setItem('valtorta_cronologia_globale', JSON.stringify(history));
}
// --- NUOVE FUNZIONI PER LA POSIZIONE DI LETTURA (SCROLL) ---

// 1. Salva a che punto della pagina siamo arrivati
function salvaPosizioneScroll(idCapitolo, cartellaOpera) {
    // Recupera le posizioni salvate o crea un contenitore vuoto
    let posizioni = JSON.parse(localStorage.getItem('valtorta_scroll_posizioni')) || {};
    
    // Creiamo una chiave unica (es. "biblioteca_15")
    const chiave = cartellaOpera + "_" + idCapitolo;
    
    // Memorizziamo l'altezza attuale della pagina
    posizioni[chiave] = window.scrollY; 
    
    // Salviamo tutto nel dispositivo
    localStorage.setItem('valtorta_scroll_posizioni', JSON.stringify(posizioni));
}

// 2. Ripristina la pagina al punto salvato
function ripristinaPosizioneScroll(idCapitolo, cartellaOpera) {
    let posizioni = JSON.parse(localStorage.getItem('valtorta_scroll_posizioni')) || {};
    const chiave = cartellaOpera + "_" + idCapitolo;
    
    if (posizioni[chiave]) {
        // Usiamo un piccolo ritardo (mezzo secondo) per dare tempo al testo 
        // del capitolo di essere caricato sullo schermo prima di scorrere
        setTimeout(() => {
            window.scrollTo({
                top: posizioni[chiave],
                behavior: 'smooth' // Rende lo scorrimento fluido ed elegante
            });
        }, 500); 
    }
}