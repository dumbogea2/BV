// --- SCRIPT IBRIDO: cronologia.js V22 ---

// BIVIO LOGICO: Controlla se siamo in modalità Cloud
const isCloudModeCron = localStorage.getItem('modalita_lettura') === 'cloud';
let dbCron = null, setDocCron = null, docCron = null;
let utenteCloudCron = null;

if (isCloudModeCron) {
    (async function initFirebaseCron() {
        try {
            const fApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fAuth = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
            const fDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");

            const firebaseConfig = {
                apiKey: "AIzaSyBHEhVjlZIs-mIPnteFiOiBgHryL1R9_Zk",
                authDomain: "appuntivaltorta.firebaseapp.com",
                projectId: "appuntivaltorta",
                storageBucket: "appuntivaltorta.firebasestorage.app",
                messagingSenderId: "940851152715",
                appId: "1:940851152715:web:0e47bd8ca7282efac3cace"
            };

            const app = fApp.initializeApp(firebaseConfig);
            const auth = fAuth.getAuth(app);
            dbCron = fDb.getFirestore(app);
            setDocCron = fDb.setDoc;
            docCron = fDb.doc;

            fAuth.onAuthStateChanged(auth, (user) => {
                if (user) utenteCloudCron = user;
            });
        } catch (e) { console.error("Cloud Cronologia non disponibile offline"); }
    })();
}

// Funzione universale per salvare i capitoli letti
async function salvaInCronologia(idCapitolo, titoloCapitolo, nomeOpera, cartellaOpera, fileEParametro = "/index.html?ch=") {
    let titoloBreve = titoloCapitolo;
    if (titoloBreve.length > 45) titoloBreve = titoloBreve.substring(0, 42) + "...";

    const urlCompleto = cartellaOpera + fileEParametro + idCapitolo;
    const entry = {
        id: idCapitolo,
        titolo: titoloBreve,
        opera: nomeOpera,
        url: urlCompleto, 
        timestamp: new Date().getTime()
    };

    if (isCloudModeCron && utenteCloudCron && dbCron) {
        // --- SALVATAGGIO CLOUD ---
        // Usiamo l'URL come ID (pulito dai caratteri vietati) per evitare duplicati dello stesso capitolo
        const docId = urlCompleto.replace(/[/\\?%*:|"<>]/g, '_');
        await setDocCron(docCron(dbCron, `utenti/${utenteCloudCron.uid}/cronologia`, docId), entry);
    } else {
        // --- SALVATAGGIO LOCALE (Offline) ---
        let history = JSON.parse(localStorage.getItem('valtorta_cronologia_globale')) || [];
        history = history.filter(item => item.url !== entry.url);
        history.unshift(entry);
        if (history.length > 15) history.pop();
        localStorage.setItem('valtorta_cronologia_globale', JSON.stringify(history));
    }
}

// Funzioni Scroll (Mantengono logica locale per velocità, ma pronte per espansioni)
function salvaPosizioneScroll(idCapitolo, cartellaOpera) {
    let posizioni = JSON.parse(localStorage.getItem('valtorta_scroll_posizioni')) || {};
    const chiave = cartellaOpera + "_" + idCapitolo;
    posizioni[chiave] = window.scrollY; 
    localStorage.setItem('valtorta_scroll_posizioni', JSON.stringify(posizioni));
}

function ripristinaPosizioneScroll(idCapitolo, cartellaOpera) {
    let posizioni = JSON.parse(localStorage.getItem('valtorta_scroll_posizioni')) || {};
    const chiave = cartellaOpera + "_" + idCapitolo;
    if (posizioni[chiave]) {
        setTimeout(() => {
            window.scrollTo({ top: posizioni[chiave], behavior: 'smooth' });
        }, 500); 
    }
}