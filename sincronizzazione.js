// --- SCRIPT: sincronizzazione.js V1 ---

// Controlliamo se l'utente sta usando la modalità Cloud
const isCloudModeSync = localStorage.getItem('modalita_lettura') === 'cloud';

// Prepariamo le variabili vuote che riempiremo con gli strumenti di Firebase
let dbSync = null;
let setDocSync = null;
let getDocSync = null;
let docSync = null;
let utenteCloudSync = null;

if (isCloudModeSync) {
    (async function initFirebaseSync() {
        try {
            // Importiamo le librerie di Firebase (stessa versione che usi già)
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

            // Inizializza l'app solo se non esiste già, per evitare errori di duplicazione
            const app = fApp.getApps().length === 0 ? fApp.initializeApp(firebaseConfig) : fApp.getApp();
            const auth = fAuth.getAuth(app);
            
            // Assegniamo gli strumenti per il database
            dbSync = fDb.getFirestore(app);
            setDocSync = fDb.setDoc;
            getDocSync = fDb.getDoc;
            docSync = fDb.doc;

            // --- STEP 3: Modifica applicata qui ---
            // Restiamo in ascolto: appena Firebase conferma chi è l'utente, lo salviamo e scarichiamo i dati
            fAuth.onAuthStateChanged(auth, async (user) => {
                if (user) {
                    utenteCloudSync = user;
                    console.log("Sincronizzazione Cloud Pronta per l'utente:", user.uid);
                    
                    // --- SCARICA I DATI ALL'AVVIO ---
                    try {
                        // 1. Chiediamo al Cloud i Preferiti
                        const prefSnap = await getDocSync(docSync(dbSync, `utenti/${user.uid}/config`, "preferiti"));
                        let preferitiCloud = [];
                        if (prefSnap.exists() && prefSnap.data().lista) {
                            preferitiCloud = prefSnap.data().lista;
                        }

                        // 2. Chiediamo al Cloud il Segnalibro
                        const segnSnap = await getDocSync(docSync(dbSync, `utenti/${user.uid}/config`, "segnalibro"));
                        let segnalibroCloud = null;
                        if (segnSnap.exists() && !segnSnap.data().cancellato) {
                            segnalibroCloud = segnSnap.data();
                        }

                        // 3. Consegniamo i dati freschi all'interfaccia grafica
                        if (typeof applicaDatiDalCloud === "function") {
                            applicaDatiDalCloud(preferitiCloud, segnalibroCloud);
                        }

                    } catch (error) {
                        console.error("Errore nel download dei dati Cloud:", error);
                    }
                }
            });
            // --- Fine Modifica Step 3 ---

        } catch (e) { 
            console.error("Errore nell'inizializzazione di Cloud Sync:", e); 
        }
    })();
}

// ==========================================
// FUNZIONI DI SALVATAGGIO VERSO IL CLOUD
// ==========================================

// 1. Salva i Preferiti (Stelline)
async function salvaPreferitiCloud(listaPreferiti) {
    // Controlliamo che il cloud sia attivo e che l'utente sia stato riconosciuto
    if (isCloudModeSync && utenteCloudSync && dbSync) {
        try {
            // Creiamo o aggiorniamo un documento chiamato "preferiti" dentro la cartella "config" dell'utente
            await setDocSync(docSync(dbSync, `utenti/${utenteCloudSync.uid}/config`, "preferiti"), {
                lista: listaPreferiti,
                ultimoAggiornamento: new Date().getTime()
            });
            console.log("Preferiti sincronizzati correttamente sul Cloud!");
        } catch (error) {
            console.error("Errore durante il salvataggio dei preferiti:", error);
        }
    }
}

// 2. Salva il Segnalibro
async function salvaSegnalibroCloud(segnalibro) {
    if (isCloudModeSync && utenteCloudSync && dbSync) {
        try {
            // Se il segnalibro esiste lo salviamo, se è nullo (perché l'utente l'ha cancellato) salviamo un indicatore vuoto
            const dataToSave = segnalibro ? segnalibro : { cancellato: true };
            await setDocSync(docSync(dbSync, `utenti/${utenteCloudSync.uid}/config`, "segnalibro"), dataToSave);
            console.log("Segnalibro sincronizzato sul Cloud!");
        } catch (error) {
            console.error("Errore durante il salvataggio del segnalibro:", error);
        }
    }
}