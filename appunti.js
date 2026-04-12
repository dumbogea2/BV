/**
 * Script universale per evidenziare il testo in blu e aggiungere note.
 */

(function() {
    // 1. Inietta gli stili per il popup e le evidenziazioni blu
    const style = document.createElement('style');
    style.innerHTML = `
        .appunto-highlight { background-color: transparent; color: #0056b3; font-weight: bold; }
        .appunto-note-marker { cursor: pointer; color: #0056b3; font-weight: bold; font-size: 0.9em; margin-left: 5px; text-decoration: none; }
        .appunto-note-marker:hover { text-decoration: underline; }

        #appunti-popup {
            position: absolute; display: none; background: #fdfdfd; border: 1px solid #c0c0c0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; padding: 6px; border-radius: 6px;
            flex-direction: column; gap: 5px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        #appunti-popup button {
            background-color: #0056b3; border: none; color: white; cursor: pointer;
            padding: 8px 12px; border-radius: 4px; font-size: 0.9rem; transition: background 0.2s;
            display: flex; align-items: center; gap: 5px; justify-content: flex-start;
        }
        #appunti-popup button:hover { background-color: #003d82; }
    `;
    document.head.appendChild(style);

    // 2. Crea il popup fluttuante
    const popup = document.createElement('div');
    popup.id = 'appunti-popup';
    popup.innerHTML = `
        <button id="btnSottolineaBlu">🖍️ Sottolinea (Segnalibro Blu)</button>
        <button id="btnAggiungiNotaTesto">📝 Aggiungi Nota qui</button>
    `;
    document.body.appendChild(popup);

    let currentSelectionText = "";
    let currentSelectionRange = null;

    // 3. Ascolta la selezione del testo
    document.addEventListener("selectionchange", () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const text = sel.toString().trim();
            if (text.length > 5) { // Attiva solo se c'è una selezione di senso compiuto
                currentSelectionText = text;
                currentSelectionRange = sel.getRangeAt(0).cloneRange();
            } else {
                currentSelectionText = "";
                currentSelectionRange = null;
            }
        }
    });

    document.addEventListener("mouseup", showPopup);
    document.addEventListener("touchend", (e) => setTimeout(() => showPopup(e), 150));

    function showPopup(e) {
        if (currentSelectionText.length > 5 && currentSelectionRange) {
            const rect = currentSelectionRange.getBoundingClientRect();
            popup.style.display = 'flex';
            let top = window.scrollY + rect.top - popup.offsetHeight - 10;
            if (top < window.scrollY) top = window.scrollY + rect.bottom + 10; // Se non c'è spazio sopra, vai sotto

            let left = window.scrollX + rect.left + (rect.width / 2) - (popup.offsetWidth / 2);
            if (left < 10) left = 10; // Non far uscire dallo schermo a sx

            popup.style.top = top + 'px';
            popup.style.left = left + 'px';
        } else {
            popup.style.display = 'none';
        }
    }

    // Clic fuori dal popup lo chiude
    document.addEventListener("mousedown", (e) => {
        if (!popup.contains(e.target) && window.getSelection().toString().trim().length === 0) {
            popup.style.display = 'none';
        }
    });

    // 4. Funzioni per identificare Libro e Capitolo coerenti con la cronologia
    function getBookAndChapter() {
        let bookName = document.title;
        let chapterName = "";
        let urlForRestore = window.location.pathname + window.location.search;

        if (window.location.pathname.includes('biblioteca/index.html')) {
            bookName = "L'Evangelo";
            const numSpan = document.getElementById('currentChapterNum');
            if (numSpan) chapterName = numSpan.innerText;
            if (typeof currentOpenChapter !== 'undefined') urlForRestore = "?cap=" + currentOpenChapter;
        } else if (window.location.pathname.includes('libro_azaria')) {
            bookName = "Libro di Azaria";
        } else if (window.location.pathname.includes('lezioni_romani')) {
            bookName = "Epistola ai Romani";
        } else if (window.location.pathname.includes('autobiografia')) {
            bookName = "Autobiografia";
        } else if (window.location.pathname.includes('quadernetti')) {
            bookName = "Quadernetti";
        } else if (window.location.pathname.includes('1943')) {
            bookName = "Quaderni 1943";
        } else if (window.location.pathname.includes('1944')) {
            bookName = "Quaderni 1944";
        } else if (window.location.pathname.includes('1945')) {
            bookName = "Quaderni 1945-1950";
        }

        // Per i quaderni, prendiamo il capitolo dalla pagina se disponibile
        if (window.location.pathname.includes('Quaderni')) {
            const titleEl = document.querySelector('.lezione-header') || document.querySelector('.azaria-titolo-header');
            if (titleEl) {
                chapterName = titleEl.innerText;
                const dataEl = titleEl.nextElementSibling;
                if (dataEl && dataEl.tagName === 'H4') chapterName += " - " + dataEl.innerText;
            }
            if (typeof currentIndex !== 'undefined') urlForRestore = "?idx=" + currentIndex;
        }

        if (!chapterName) chapterName = "Capitolo selezionato";
        return { bookName, chapterName, urlForRestore };
    }

    // 5. Azioni dei bottoni
    document.getElementById("btnSottolineaBlu").addEventListener("click", () => {
        saveAppunto("highlight", currentSelectionText, "");
        closePopupAndClearSelection();
    });

    document.getElementById("btnAggiungiNotaTesto").addEventListener("click", () => {
        let noteText = prompt("Scrivi la tua nota personale:");
        if (noteText && noteText.trim() !== "") {
            saveAppunto("note", currentSelectionText, noteText.trim());
        }
        closePopupAndClearSelection();
    });

    function closePopupAndClearSelection() {
        popup.style.display = 'none';
        window.getSelection().removeAllRanges();
        currentSelectionText = "";
    }

    function saveAppunto(type, snippet, noteText) {
        const { bookName, chapterName, urlForRestore } = getBookAndChapter();
        let appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];

        let newId = "app_" + Date.now();
        appunti.push({
            id: newId,
            type: type,
            book: bookName,
            chapter: chapterName,
            snippet: snippet,
            noteText: noteText,
            url: urlForRestore,
            date: new Date().toLocaleDateString()
        });

        localStorage.setItem('valtorta_appunti', JSON.stringify(appunti));

        if (typeof window.ripristinaEvidenze === 'function') {
            window.ripristinaEvidenze();
        }
    }

    // 6. Funzione di "Ridisegno" (Ripristino) per applicare le evidenze visive senza toccare l'HTML originale
    // Per evitare corruzioni, usiamo un metodo "sicuro" che agisce solo sui nodi di testo se possibile,
    // ma siccome è complesso, adottiamo un fallback intelligente basato su regex applicato *solo*
    // dove il testo non contiene tag HTML pericolosi.

    window.valtortaUserNotes = {}; // Dizionario globale per recuperare le note

    window.ripristinaEvidenze = function() {
        let container = document.getElementById('text-container') || document.getElementById('modalContent');
        if (!container) return;

        const { bookName } = getBookAndChapter();
        let appunti = JSON.parse(localStorage.getItem('valtorta_appunti')) || [];

        // Prendiamo gli appunti del libro corrente
        let currentBookAppunti = appunti.filter(a => a.book === bookName);
        if (currentBookAppunti.length === 0) return;

        // Ordiniamo per data (i più vecchi prima per non sovrapporsi)
        currentBookAppunti.sort((a,b) => a.id.localeCompare(b.id));

        let noteCounter = 1;
        window.valtortaUserNotes = {};

        // Funzione per eseguire la sostituzione sicura testuale
        const highlightText = (node, snippet, replacementHTML) => {
            if (node.nodeType === 3) { // Text node
                const index = node.nodeValue.indexOf(snippet);
                if (index > -1) {
                    const matchedText = node.nodeValue.substring(index, index + snippet.length);
                    const before = node.nodeValue.substring(0, index);
                    const after = node.nodeValue.substring(index + snippet.length);

                    const span = document.createElement('span');
                    span.innerHTML = replacementHTML;

                    const afterNode = document.createTextNode(after);
                    node.nodeValue = before;
                    node.parentNode.insertBefore(span, node.nextSibling);
                    node.parentNode.insertBefore(afterNode, span.nextSibling);
                    return true; // Fatto
                }
            } else if (node.nodeType === 1 && node.childNodes && !/(script|style|textarea|span)/i.test(node.tagName)) {
                // Ricorsione sui figli
                for (let i = 0; i < node.childNodes.length; i++) {
                    if (highlightText(node.childNodes[i], snippet, replacementHTML)) {
                        i += 2; // Salta i nuovi nodi creati
                    }
                }
            }
            return false;
        };

        // Applichiamo
        currentBookAppunti.forEach(annotation => {
            let replacement = "";
            if (annotation.type === "highlight") {
                replacement = `<span class="appunto-highlight">${annotation.snippet}</span>`;
            } else if (annotation.type === "note") {
                window.valtortaUserNotes[annotation.id] = annotation.noteText;
                let marker = `<span class="appunto-note-marker" onclick="window.openNoteWindow('${annotation.id}')">[${noteCounter}]</span>`;
                replacement = `<span class="appunto-highlight">${annotation.snippet}</span>${marker}`;
                noteCounter++;
            }

            // Per maggiore robustezza, siccome il text node match potrebbe fallire se ci sono <i> ecc in mezzo,
            // facciamo anche un fallback con replace() selettivo sull'innerHTML se non troviamo il nodo.
            // Attenzione: su HTML complessi questo potrebbe rompere tag, per questo è un fallback.
            let success = false;
            for(let i=0; i < container.childNodes.length; i++){
                 if(highlightText(container.childNodes[i], annotation.snippet, replacement)){
                     success = true;
                     break;
                 }
            }

            if(!success) {
                 let safeSnippet = annotation.snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                 let regex = new RegExp("(" + safeSnippet + ")", "g");
                 container.innerHTML = container.innerHTML.replace(regex, replacement);
            }
        });
    };

    // 7. Funzione per aprire la nota in una nuova finestra/scheda
    window.openNoteWindow = function(noteId) {
        event.stopPropagation(); // Evita trigger accidentali
        let text = window.valtortaUserNotes[noteId];
        if (text) {
            let newWin = window.open("", "_blank");
            newWin.document.write(`
                <html><head><title>Nota Personale</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fcfcfc; padding: 40px; color: #333; line-height: 1.6; }
                    .note-box { background: white; border-left: 5px solid #28a745; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 1.1rem; border-radius: 8px; }
                    h2 { color: #28a745; margin-top: 0; }
                </style>
                </head><body>
                    <div class="note-box">
                        <h2>📝 La tua nota</h2>
                        <p>${text.replace(/\n/g, '<br>')}</p>
                        <button onclick="window.close()" style="margin-top:20px; padding:8px 15px; cursor:pointer; background:#ccc; border:none; border-radius:4px;">Chiudi Finestra</button>
                    </div>
                </body></html>
            `);
            newWin.document.close();
        }
    };

})();
