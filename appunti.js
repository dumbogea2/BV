/**
 * Script universale per evidenziare il testo in blu e aggiungere note.
 * VERSIONE V18 - Editor Note Avanzato (Modal Personalizzato Multiriga)
 */

(function() {
    // 1. INIEZIONE STILI CSS (Inclusi i nuovi stili per l'Editor Note)
    const style = document.createElement('style');
    style.innerHTML = `
        .appunto-highlight { 
            background-color: transparent; color: #0056b3; font-weight: bold; 
            transition: background-color 0.8s ease-out; 
        }
        .appunto-note-marker {
            cursor: pointer; background-color: #8b0000; color: #fdfdfd;
            font-weight: bold; font-size: 0.75em; margin-left: 5px;
            padding: 2px 7px; border-radius: 12px; text-decoration: none;
            vertical-align: text-top; box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
            transition: transform 0.2s, background-color 0.2s; display: inline-block;
        }
        .appunto-note-marker:hover { background-color: #b22222; transform: scale(1.1); }
        
        /* Popup piccolino per scegliere se sottolineare o notare */
        #appunti-popup {
            position: absolute; display: none; background: #fdfdfd; border: 1px solid #c0c0c0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 999999 !important; padding: 6px; border-radius: 6px;
            flex-direction: column; gap: 5px; font-family: 'Segoe UI', sans-serif;
        }
                #appunti-popup button {
            background-color: #0056b3; border: none; color: white; cursor: pointer;
            padding: 8px 12px; border-radius: 4px; font-size: 0.9rem; transition: background 0.2s;
            display: flex; align-items: center; gap: 5px; justify-content: flex-start;
        }

        /* --- NUOVO EDITOR NOTE AVANZATO --- */
        #appunti-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 9999999 !important; display: none;
            justify-content: center; align-items: center; backdrop-filter: blur(2px);
        }
        #appunti-modal-box {
            background: #fdfaf4; border: 2px solid #8b0000; border-radius: 8px;
            padding: 20px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            font-family: 'Georgia', serif; display: flex; flex-direction: column; gap: 15px;
        }
        #appunti-modal-title { margin: 0; color: #8b0000; font-size: 1.3rem; }
        #appunti-modal-snippet {
            font-style: italic; color: #666; font-size: 0.95rem; 
            border-left: 3px solid #d1cbb8; padding-left: 10px; max-height: 80px; overflow-y: auto;
        }
        #appunti-modal-textarea {
            width: 100%; height: 160px; padding: 12px; border: 1px solid #d1cbb8;
            border-radius: 4px; font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 1rem; 
            resize: vertical; box-sizing: border-box; background: #fff; line-height: 1.5; color: #333;
        }
        #appunti-modal-textarea:focus { outline: none; border-color: #8b0000; }
        .appunti-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 5px; }
        #appunti-modal-btn-cancel {
            background: transparent; border: 1px solid #888; color: #555;
            padding: 8px 15px; border-radius: 4px; cursor: pointer; transition: 0.2s; font-family: inherit;
        }
        #appunti-modal-btn-cancel:hover { background: #eee; }
        #appunti-modal-btn-save {
            background: #8b0000; border: none; color: white; font-weight: bold;
            padding: 8px 20px; border-radius: 4px; cursor: pointer; transition: 0.2s; font-family: inherit;
        }
        #appunti-modal-btn-save:hover { background: #a50000; }
    `;
    document.head.appendChild(style);

    // 2. CREAZIONE DOM DEL POPUP PICCOLO
    const popup = document.createElement('div');
    popup.id = 'appunti-popup';
    popup.innerHTML = `
        <button id="btnSottolineaBlu">🖍️ Sottolinea</button>
        <button id="btnAggiungiNotaTesto">📝 Aggiungi Nota</button>
    `;
    document.body.appendChild(popup);

    // 3. CREAZIONE DOM DEL NUOVO EDITOR NOTE
    const modalHTML = document.createElement('div');
    modalHTML.id = 'appunti-modal-overlay';
    modalHTML.innerHTML = `
        <div id="appunti-modal-box">
            <h3 id="appunti-modal-title">Nuova Nota</h3>
            <div id="appunti-modal-snippet"></div>
            <textarea id="appunti-modal-textarea" placeholder="Scrivi qui le tue riflessioni... (puoi andare a capo)"></textarea>
            <div class="appunti-modal-footer">
                <button id="appunti-modal-btn-cancel">Annulla</button>
                <button id="appunti-modal-btn-save">Salva Nota</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalHTML);

    let currentSelectionText = "";
    let currentSelectionRange = null;

    // --- LOGICA DEL NUOVO EDITOR ---
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

    document.getElementById('appunti-modal-btn-cancel').addEventListener('click', () => {
        closeCustomModal();
        window.getSelection().removeAllRanges(); // Deseleziona se si annulla
    });

    document.getElementById('appunti-modal-btn-save').addEventListener('click', () => {
        if (currentModalCallback) {
            currentModalCallback(document.getElementById('appunti-modal-textarea').value);
        }
        closeCustomModal();
    });
    // ---------------------------------

    function getReaderContainer() {
        // Se siamo nell'Evangelo (nella cartella biblioteca), usiamo 'modalContent' come nel file originale
        if (window.location.pathname.includes('biblioteca')) {
            return document.getElementById('modalContent');
        }
        // Altrimenti usiamo i contenitori standard per le altre pagine (Quaderni, Romani, ecc.)
        return document.getElementById('text-container') || 
               document.getElementById('content') || 
               document.getElementById('modalText-quaderni') ||
               document.querySelector('main');
    }
    document.addEventListener("selectionchange", () => {
        const container = getReaderContainer();
        if (!container) return;

        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const text = sel.toString().trim();
            
            if (text.length > 5 && container.contains(range.commonAncestorContainer)) {
                currentSelectionText = text;
                currentSelectionRange = range.cloneRange();
            } else {
                currentSelectionText = "";
                currentSelectionRange = null;
            }
        }
    });

    document.addEventListener("mouseup", (e) => {
        if (popup.contains(e.target) || document.getElementById('appunti-modal-box').contains(e.target)) return;
        
        // Rimosso isStudyPage(), ora si comporta esattamente come nel file appunti.js originale!
        if (currentSelectionText.length > 5 && currentSelectionRange) {
            const rect = currentSelectionRange.getBoundingClientRect();
            popup.style.display = 'flex';
            popup.style.top = (window.scrollY + rect.top - popup.offsetHeight - 10) + 'px';
            popup.style.left = Math.max(10, window.scrollX + rect.left + (rect.width / 2) - (popup.offsetWidth / 2)) + 'px';
        } else {
            popup.style.display = 'none';
        }
    });

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
        if (isInvalidSnippet(snippet)) {
            alert("⚠️ Selezione troppo generica. Seleziona una frase del testo per evitare duplicati.");
            popup.style.display = 'none';
            return;
        }
        
        popup.style.display = 'none'; // Nasconde il menu piccolino

        if (type === "note") {
            // Apre il nuovo Editor Avanzato
            window.openCustomModal("Scrivi la tua Nota", snippet, "", function(testo) {
                if (testo && testo.trim() !== "") {
                    saveAppunto(type, snippet, testo.trim());
                }
                window.getSelection().removeAllRanges();
            });
        } else {
            // Se è solo sottolineatura, salva diretto
            saveAppunto(type, snippet, "");
            window.getSelection().removeAllRanges();
        }
    }

    document.getElementById("btnSottolineaBlu").addEventListener("click", () => handleSave("highlight"));
    document.getElementById("btnAggiungiNotaTesto").addEventListener("click", () => handleSave("note"));

    function saveAppunto(type, snippet, noteText) {
        const { bookName, chapterName, urlForRestore } = getBookAndChapter();
        let appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
        let newId = "app_" + Date.now();
        appunti.push({
            id: newId, type: type, book: bookName, chapter: chapterName,
            snippet: snippet, noteText: noteText, url: urlForRestore,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('valtorta_appunti', JSON.stringify(appunti));
        ripristinaEvidenze();
    }

    function ripristinaEvidenze() {
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

        let appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
        let currentCapAppunti = appunti.filter(a => {
            if (bookName === "L'Evangelo") return a.book === bookName && a.url.includes(urlForRestore.split('?')[1]);
            return a.book === bookName && a.url === urlForRestore;
        });

        let noteCounter = 1;
        currentCapAppunti.forEach(annotation => {
            let tokens = annotation.snippet.trim().split(/(\s+|[.,;:'"!?()\[\]«»“”‘’\-])/).filter(t => t.length > 0);
            let fuzzyPattern = tokens.map(t => {
                if (/\s+/.test(t)) return '(?:\\s|<[^>]+>|&nbsp;|&#160;)+';
                return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:<[^>]+>)*';
            }).join('');

            let regex = new RegExp("(" + fuzzyPattern + ")", "i");
            let isFirstNode = true;

            container.innerHTML = container.innerHTML.replace(regex, function(match) {
                let processed = match.replace(/(<[^>]+>)|([^<]+)/g, function(m, tag, text) {
                    if (tag) return m; 
                    if (!text || text.trim().length === 0) return m; 
                    let attrId = isFirstNode ? `id="${annotation.id}"` : "";
                    isFirstNode = false;
                    return `<span ${attrId} class="appunto-highlight">${text}</span>`;
                });
                if (annotation.type === "note") {
                    processed += `<span class="appunto-note-marker" onclick="window.gestisciNota(event, '${annotation.id}')">✎ ${noteCounter++}</span>`;
                }
                return processed;
            });
        });

        const params = new URLSearchParams(window.location.search);
        const targetAppId = params.get('appId');
        if (targetAppId) {
            if (window.appuntiScrollInterval) clearInterval(window.appuntiScrollInterval);
            
            let tentativi = 0;
            let successi = 0;
            
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

    window.ripristinaEvidenze = ripristinaEvidenze;
    window.gestisciNota = function(event, noteId) {
        event.stopPropagation(); 
        let appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];
        let index = appunti.findIndex(a => a.id === noteId);
        if (index === -1) return;
        let nota = appunti[index];
        
        // Usa il nuovo Editor Avanzato anche per modificare le note!
        window.openCustomModal("Modifica la tua Nota", nota.snippet, nota.noteText, function(nuovoTesto) {
            appunti[index].noteText = nuovoTesto.trim();
            localStorage.setItem('valtorta_appunti', JSON.stringify(appunti));
            ripristinaEvidenze();
        });
    };

    window.addEventListener('load', () => setTimeout(ripristinaEvidenze, 500));
})();