/**
 * Script IBRIDO: Evidenziatore + Cloud Firebase / Offline LocalStorage
 * VERSIONE V22 - Sicurezza Totale Offline (Importazioni Dinamiche)
 */

// BIVIO LOGICO PRINCIPALE: Controlla il "biglietto d'ingresso"
const isCloudMode = localStorage.getItem('modalita_lettura') === 'cloud';

// Variabili che verranno riempite solo se siamo in Cloud
let utenteCloud = null;
let db = null, setDoc = null, doc = null, collection = null, getDocs = null;

if (isCloudMode) {
    // SCARICAMENTO DINAMICO: Scarica Firebase solo se l'utente ha fatto il Login
    (async function initFirebase() {
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
            db = fDb.getFirestore(app);

            // Salviamo le funzioni per usarle dopo
            setDoc = fDb.setDoc;
            doc = fDb.doc;
            collection = fDb.collection;
            getDocs = fDb.getDocs;

            fAuth.onAuthStateChanged(auth, (user) => {
                if (user) {
                    utenteCloud = user;
                    setTimeout(window.ripristinaEvidenze, 500); // Ricarica dopo il login
                }
            });
        } catch (e) {
            console.error("Errore connessione Cloud:", e);
        }
    })();
}

// ---------------------------------------------------------
// INIZIO CODICE VISIVO (Stili, Popup, Modal)
// ---------------------------------------------------------
const style = document.createElement('style');
style.innerHTML = `
    .appunto-highlight { background-color: transparent; color: #0056b3; font-weight: bold; transition: background-color 0.8s ease-out; }
    .appunto-note-marker { cursor: pointer; background-color: #8b0000; color: #fdfdfd; font-weight: bold; font-size: 0.75em; margin-left: 5px; padding: 2px 7px; border-radius: 12px; text-decoration: none; vertical-align: text-top; box-shadow: 1px 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s, background-color 0.2s; display: inline-block; }
    .appunto-note-marker:hover { background-color: #b22222; transform: scale(1.1); }
    #appunti-popup { position: fixed; display: none; background: #fdfdfd; border: 1px solid #c0c0c0; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999 !important; padding: 6px; border-radius: 6px; flex-direction: column; gap: 5px; font-family: 'Segoe UI', sans-serif; }
    #appunti-popup button { background-color: #0056b3; border: none; color: white; cursor: pointer; padding: 8px 12px; border-radius: 4px; font-size: 0.9rem; transition: background 0.2s; display: flex; align-items: center; gap: 5px; justify-content: flex-start; }
    #appunti-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 9999999 !important; display: none; justify-content: center; align-items: center; backdrop-filter: blur(2px); }
    #appunti-modal-box { background: #fdfaf4; border: 2px solid #8b0000; border-radius: 8px; padding: 20px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); font-family: 'Georgia', serif; display: flex; flex-direction: column; gap: 15px; }
    #appunti-modal-title { margin: 0; color: #8b0000; font-size: 1.3rem; }
    #appunti-modal-snippet { font-style: italic; color: #666; font-size: 0.95rem; border-left: 3px solid #d1cbb8; padding-left: 10px; max-height: 80px; overflow-y: auto; }
    #appunti-modal-textarea { width: 100%; height: 160px; padding: 12px; border: 1px solid #d1cbb8; border-radius: 4px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 1rem; resize: vertical; box-sizing: border-box; background: #fff; line-height: 1.5; color: #333; }
    #appunti-modal-textarea:focus { outline: none; border-color: #8b0000; }
    .appunti-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px; }
    #appunti-modal-btn-cancel { background: transparent; border: 1px solid #888; color: #555; padding: 8px 15px; border-radius: 4px; cursor: pointer; transition: 0.2s; font-family: inherit; }
    #appunti-modal-btn-cancel:hover { background: #eee; }
    #appunti-modal-btn-save { background: #8b0000; border: none; color: white; font-weight: bold; padding: 8px 20px; border-radius: 4px; cursor: pointer; transition: 0.2s; font-family: inherit; }
    #appunti-modal-btn-save:hover { background: #a50000; }
`;
document.head.appendChild(style);

const popup = document.createElement('div');
popup.id = 'appunti-popup';
popup.innerHTML = `<button id="btnSottolineaBlu">🖍️ Sottolinea</button><button id="btnAggiungiNotaTesto">📝 Aggiungi Nota</button>`;
document.body.appendChild(popup);

const modalHTML = document.createElement('div');
modalHTML.id = 'appunti-modal-overlay';
modalHTML.innerHTML = `<div id="appunti-modal-box"><h3 id="appunti-modal-title">Nuova Nota</h3><div id="appunti-modal-snippet"></div><textarea id="appunti-modal-textarea" placeholder="Scrivi qui le tue riflessioni..."></textarea><div class="appunti-modal-footer"><button id="appunti-modal-btn-cancel">Annulla</button><button id="appunti-modal-btn-save">Salva Nota</button></div></div>`;
document.body.appendChild(modalHTML);

let currentSelectionText = "";
let currentSelectionRange = null;
let currentModalCallback = null;

window.openCustomModal = function(title, snippetText, noteText, callback) {
    document.getElementById('appunti-modal-title').innerText = title;
    document.getElementById('appunti-modal-snippet').innerText = '"' + snippetText + '..."';
    const textarea = document.getElementById('appunti-modal-textarea');
    textarea.value = noteText || "";
    document.getElementById('appunti-modal-overlay').style.display = 'flex';
    textarea.focus();
    currentModalCallback = callback;
};

function closeCustomModal() {
    document.getElementById('appunti-modal-overlay').style.display = 'none';
    currentModalCallback = null;
}

document.getElementById('appunti-modal-btn-cancel').addEventListener('click', () => { closeCustomModal(); window.getSelection().removeAllRanges(); });
document.getElementById('appunti-modal-btn-save').addEventListener('click', () => { if (currentModalCallback) { currentModalCallback(document.getElementById('appunti-modal-textarea').value); } closeCustomModal(); });

function getReaderContainer() {
    if (window.location.pathname.includes('biblioteca')) return document.getElementById('modalContent');
    return document.getElementById('text-container') || document.getElementById('content') || document.getElementById('modalText-quaderni') || document.querySelector('main');
}

document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    const text = sel.toString().trim();
    const container = getReaderContainer();
    if (!container || (document.activeElement && document.activeElement.id === 'appunti-modal-textarea')) return;

    if (text.length > 5 && sel.rangeCount > 0) {
        currentSelectionText = text;
        currentSelectionRange = sel.getRangeAt(0).cloneRange();
        popup.style.display = 'flex';
        popup.style.position = 'fixed';
        popup.style.bottom = '30px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.top = 'auto';
        popup.style.zIndex = '9999';
    } else {
        popup.style.display = 'none';
    }
});
popup.addEventListener('mousedown', (e) => { e.preventDefault(); });

function getBookAndChapter() {
    let bookName = document.title;
    let chapterName = "";
    let fileName = window.location.pathname.split('/').pop() || "";
    let urlForRestore = fileName + window.location.search;

    if (window.location.pathname.includes('biblioteca')) {
        bookName = "L'Evangelo";
        const numSpan = document.getElementById('currentChapterNum');
        if (numSpan) chapterName = numSpan.innerText;
        if (typeof currentOpenChapter !== 'undefined') urlForRestore = "biblioteca/index.html?cap=" + currentOpenChapter;
    } else {
        if (fileName.includes('azaria')) bookName = "Libro di Azaria";
        else if (fileName.includes('romani')) bookName = "Epistola ai Romani";
        else if (fileName.includes('autobiografia')) bookName = "Autobiografia";
        else if (fileName.includes('1943')) bookName = "Quaderni 1943";
        else if (fileName.includes('1944')) bookName = "Quaderni 1944";
        else if (fileName.includes('1945')) bookName = "Quaderni 1945-1950";
        const titleEl = document.querySelector('.lezione-header') || document.querySelector('.azaria-titolo-header') || document.querySelector('h1.title-chapter, h2');
        if (titleEl) chapterName = titleEl.innerText;
        let prefix = window.location.pathname.includes('Quaderni') ? "Quaderni/" : "";
        if (typeof currentIndex !== 'undefined') urlForRestore = prefix + fileName + "?idx=" + currentIndex;
        else urlForRestore = prefix + fileName;
    }
    return { bookName, chapterName, urlForRestore };
}

function isInvalidSnippet(text) {
    const genericPatterns = [/^sezione\s+[ivxl]+/i, /^capitolo\s+\d+/i, /^lezione\s+\d+/i];
    if (text.length < 10) return true; 
    return genericPatterns.some(p => p.test(text.trim()) && text.length < 15);
}

function handleSave(type) {
    let snippet = currentSelectionText.replace(/^[\s\W]*(\d+\.\d+|\[\d+\])[\s\W]*/, '').trim();
    if (isInvalidSnippet(snippet)) { alert("⚠️ Selezione troppo generica."); popup.style.display = 'none'; return; }
    popup.style.display = 'none'; 
    if (type === "note") {
        window.openCustomModal("Scrivi la tua Nota", snippet, "", function(testo) {
            if (testo && testo.trim() !== "") saveAppunto(type, snippet, testo.trim());
            window.getSelection().removeAllRanges();
        });
    } else {
        saveAppunto(type, snippet, "");
        window.getSelection().removeAllRanges();
    }
}

document.getElementById("btnSottolineaBlu").addEventListener("click", () => handleSave("highlight"));
document.getElementById("btnAggiungiNotaTesto").addEventListener("click", () => handleSave("note"));

// ---------------------------------------------------------
// BIVIO DI SALVATAGGIO (Firebase vs LocalStorage)
// ---------------------------------------------------------
async function saveAppunto(type, snippet, noteText) {
    const { bookName, chapterName, urlForRestore } = getBookAndChapter();
    let newId = "app_" + Date.now();
    
    const nuovoAppunto = {
        id: newId, type: type, book: bookName, chapter: chapterName,
        snippet: snippet, noteText: noteText, url: urlForRestore,
        date: new Date().toLocaleDateString()
    };

    // 1. SALVA SEMPRE IN LOCALE PER PRIMA COSA (Istanteo per PWA Offline)
    let appuntiLocali = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
    appuntiLocali.push(nuovoAppunto);
    localStorage.setItem('valtorta_appunti', JSON.stringify(appuntiLocali));
    
    // Aggiorna la grafica immediatamente
    window.ripristinaEvidenze();

    // 2. INVIA AL CLOUD SE ONLINE
    if (isCloudMode && utenteCloud && db) {
        try {
            await setDoc(doc(db, `utenti/${utenteCloud.uid}/appunti`, newId), nuovoAppunto);
        } catch(e) {
            console.warn("Sei Offline: Appunto salvato solo nel dispositivo.");
        }
    }
}

// ---------------------------------------------------------
// BIVIO DI LETTURA E COLORAZIONE
// ---------------------------------------------------------
window.ripristinaEvidenze = async function() {
    let container = getReaderContainer();
    if (!container) return; 

    const { bookName, urlForRestore } = getBookAndChapter();
    
    container.querySelectorAll('.appunto-note-marker').forEach(el => el.remove());
    container.querySelectorAll('.appunto-highlight').forEach(el => {
        const parent = el.parentNode;
        if(parent) {
            while (el.firstChild) parent.insertBefore(el.firstChild, el);
            parent.removeChild(el);
        }
    });
    container.normalize(); 

    let appunti = [];
    
    // LETTURA INTELLIGENTE: Cloud o Locale?
    if (isCloudMode && utenteCloud && db) {
        if (!navigator.onLine) {
            // Se sei in aereo, carica all'istante dal locale senza aspettare Firebase
            appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
        } else {
            try {
                const snapshot = await getDocs(collection(db, `utenti/${utenteCloud.uid}/appunti`));
                snapshot.forEach((d) => appunti.push(d.data()));
                // Copia di sicurezza per i futuri offline
                localStorage.setItem('valtorta_appunti', JSON.stringify(appunti));
            } catch(e) {
                appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
            }
        }
    } else if (!isCloudMode) {
        appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
    } else {
        return; 
    }

    let currentCapAppunti = appunti.filter(a => {
        if (bookName === "L'Evangelo") return a.book === bookName && a.url.includes(urlForRestore.split('?')[1]);
        return a.book === bookName && a.url === urlForRestore;
    });

    let noteCounter = 1;

    currentCapAppunti.forEach(annotation => {
        const snippetStr = annotation.snippet;
        if (!snippetStr || snippetStr.trim() === "") return;

        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
        const charMap = []; 
        let node;
        while ((node = walker.nextNode())) {
            if (node.parentNode && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentNode.nodeName)) continue;
            let text = node.nodeValue;
            for (let i = 0; i < text.length; i++) {
                if (!/\s/.test(text[i])) charMap.push({ node: node, offset: i, char: text[i].toLowerCase() });
            }
        }

        const searchStr = snippetStr.replace(/\s+/g, '').toLowerCase();
        const pageText = charMap.map(c => c.char).join('');
        const matchStartIndex = pageText.indexOf(searchStr);

        if (matchStartIndex !== -1) {
            const matchEndIndex = matchStartIndex + searchStr.length - 1;
            const nodesInvolved = new Map();
            for (let i = matchStartIndex; i <= matchEndIndex; i++) {
                let current = charMap[i];
                if (!nodesInvolved.has(current.node)) {
                    nodesInvolved.set(current.node, { min: current.offset, max: current.offset });
                } else {
                    let data = nodesInvolved.get(current.node);
                    data.max = Math.max(data.max, current.offset); 
                }
            }

            let lastHighlightedNode = null;
            let isFirst = true;

            Array.from(nodesInvolved.entries()).forEach(([textNode, range]) => {
                let highlightEnd = range.max + 1;
                let highlightStart = range.min;
                if (highlightEnd < textNode.nodeValue.length) textNode.splitText(highlightEnd);
                let highlightNode = textNode;
                if (highlightStart > 0) highlightNode = textNode.splitText(highlightStart);

                let span = document.createElement('span');
                span.className = 'appunto-highlight';
                if (isFirst) { span.id = annotation.id; isFirst = false; }
                
                highlightNode.parentNode.insertBefore(span, highlightNode);
                span.appendChild(highlightNode);
                lastHighlightedNode = span;
            });

            if (annotation.type === "note" && lastHighlightedNode) {
                let noteBtn = document.createElement('span');
                noteBtn.className = 'appunto-note-marker';
                noteBtn.textContent = '✎ ' + (noteCounter++);
                noteBtn.onclick = (e) => window.gestisciNota(e, annotation.id);
                lastHighlightedNode.parentNode.insertBefore(noteBtn, lastHighlightedNode.nextSibling);
            }
        }
    });

    const params = new URLSearchParams(window.location.search);
    const targetAppId = params.get('appId');
    if (targetAppId) {
        if (window.appuntiScrollInterval) clearInterval(window.appuntiScrollInterval);
        let tentativi = 0; let successi = 0;
        window.appuntiScrollInterval = setInterval(() => {
            const targetEl = document.getElementById(targetAppId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
                targetEl.style.backgroundColor = "rgba(255, 235, 59, 0.4)";
                setTimeout(() => targetEl.style.backgroundColor = "transparent", 800);
                successi++;
                if (successi > 8) clearInterval(window.appuntiScrollInterval);
            }
            if (++tentativi > 30) clearInterval(window.appuntiScrollInterval); 
        }, 150); 
    }
}

window.gestisciNota = async function(event, noteId) {
    event.stopPropagation(); 
    let appunti = [];
    
    if (isCloudMode && utenteCloud && db) {
        if (!navigator.onLine) {
            appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
        } else {
            try {
                const snapshot = await getDocs(collection(db, `utenti/${utenteCloud.uid}/appunti`));
                snapshot.forEach((d) => appunti.push(d.data()));
            } catch(e) { appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || []; }
        }
    } else {
        appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
    }

    let index = appunti.findIndex(a => a.id === noteId);
    if (index === -1) return;
    let nota = appunti[index];
    
    window.openCustomModal("Modifica la tua Nota", nota.snippet, nota.noteText, async function(nuovoTesto) {
        nota.noteText = nuovoTesto.trim();
        
        // Salva sempre prima in locale
        appunti[index] = nota;
        localStorage.setItem('valtorta_appunti', JSON.stringify(appunti));
        window.ripristinaEvidenze();

        // Tenta il Cloud in background
        if (isCloudMode && utenteCloud && db) {
            try { await setDoc(doc(db, `utenti/${utenteCloud.uid}/appunti`, nota.id), nota); }
            catch(e) { console.warn("Offline: Nota salvata localmente"); }
        }
    });
};

if (!isCloudMode) {
    window.addEventListener('load', () => setTimeout(window.ripristinaEvidenze, 500));
}