/**
 * stampa_universale.js v1.0 — Bibliotheca Valtortiana
 * =====================================================
 * Soluzione di stampa unica e affidabile per TUTTO il progetto.
 *
 * Risolve i problemi di Safari Mac/iOS con window.print() su pagine
 * complesse (modali, sfondi fissi, container con overflow, ecc.).
 *
 * STRATEGIA:
 *   - Per stampa di contenuto DINAMICO (capitolo aperto, risultati ricerca
 *     in modale): si costruisce un IFRAME NASCOSTO con HTML pulito e
 *     stili dedicati, poi si chiama iframe.contentWindow.print().
 *     Questo aggira ogni problema di Safari/iOS perché la stampa avviene
 *     in un contesto isolato e già correttamente impaginato.
 *
 *   - Per stampa di pagine STATICHE (ricerche globali, miei appunti,
 *     ecc.) dove la pagina è già nella forma giusta e i CSS @media print
 *     funzionano: si usa la chiamata diretta window.print() sincrona,
 *     che su queste pagine semplici funziona ovunque.
 *
 * API PUBBLICA:
 *   - bvStampaContenuto({titolo, html, css?, footer?})  → cuore iframe
 *   - bvStampaCapitolo({titoloHTML, testoHTML, fonte?}) → capitolo aperto
 *   - bvStampaRisultatiRicerca({titoloHTML, listaHTML}) → risultati modale
 *   - bvStampaPagina()                                  → window.print()
 *   - bvPrint()                                         → alias retro-compat
 */

(function (global) {
    'use strict';

    // ---------------------------------------------------------------
    // CSS BASE per la stampa "sobria bianco/nero" — usato per tutto
    // il contenuto stampato in iframe (capitoli, risultati ricerca).
    // ---------------------------------------------------------------
    const CSS_BASE_STAMPA = `
        @page { margin: 1.8cm; }
        html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Georgia', 'Garamond', 'Times New Roman', serif;
            line-height: 1.55;
            font-size: 12pt;
        }
        h1, h2, h3 {
            color: #000 !important;
            font-family: 'Georgia', 'Times New Roman', serif;
        }
        h1.bv-titolo-stampa {
            font-size: 1.5em;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin: 0 0 18px 0;
            text-align: left;
        }
        .bv-contenuto-stampa {
            font-size: 1em;
            line-height: 1.65;
            text-align: justify;
        }
        .bv-contenuto-stampa p { margin: 0 0 0.7em 0; }
        a { color: #000; text-decoration: none; }
        /* Evidenziazioni rese sobrie per la stampa */
        mark, mark.target-word {
            background: transparent !important;
            color: #000 !important;
            font-weight: bold !important;
            border-bottom: 1px solid #000;
            padding: 0 1px;
        }
        mark.saved-bookmark {
            background: transparent !important;
            color: #000 !important;
            font-weight: bold !important;
            border-bottom: 2px dashed #000;
        }
        /* Risultati di ricerca */
        .bv-result-item, .result-item {
            page-break-inside: avoid;
            border-bottom: 1px solid #999;
            padding: 8px 0;
            margin: 0 0 8px 0;
            color: #000 !important;
        }
        .bv-result-item:last-child, .result-item:last-child {
            border-bottom: none;
        }
        .result-snippet { color: #000 !important; }
        .book-title {
            font-weight: bold;
            border-left: 4px solid #000;
            padding: 6px 10px;
            margin: 14px 0 10px 0;
            background: #f0f0f0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        /* Nascondi eventuali pulsanti residui */
        button, .btn-print-pdf, .appunto-actions { display: none !important; }
        /* Footer */
        .bv-footer-stampa {
            margin-top: 2rem;
            padding-top: 0.7rem;
            border-top: 1px solid #000;
            font-size: 0.78em;
            color: #333;
            text-align: center;
        }
    `;

    // ---------------------------------------------------------------
    // CUORE DEL SISTEMA — stampa via iframe nascosto
    // ---------------------------------------------------------------
    /**
     * Stampa un contenuto qualsiasi tramite iframe nascosto.
     * Funziona su Safari Mac/iOS, Chrome, Firefox, Edge.
     *
     * @param {Object} opts
     * @param {string} opts.titolo  - titolo della finestra di stampa
     * @param {string} opts.html    - HTML del corpo (verrà avvolto in <body>)
     * @param {string} [opts.css]   - CSS aggiuntivo opzionale
     * @param {string} [opts.footer]- HTML del footer opzionale (sotto al contenuto)
     */
    function bvStampaContenuto(opts) {
        opts = opts || {};
        const titolo = opts.titolo || 'Stampa — Bibliotheca Valtortiana';
        const html = opts.html || '';
        const cssExtra = opts.css || '';
        const footer = (opts.footer !== undefined)
            ? opts.footer
            : `<div class="bv-footer-stampa">
                 L'Evangelo come mi è stato rivelato — Maria Valtorta<br>
                 Bibliotheca Valtortiana &middot; Stampato il ${new Date().toLocaleDateString('it-IT')}
               </div>`;

        // Rimuovi eventuali iframe di stampa precedenti rimasti orfani
        const vecchio = document.getElementById('bv-print-iframe');
        if (vecchio && vecchio.parentNode) {
            vecchio.parentNode.removeChild(vecchio);
        }

        // Crea iframe nascosto
        const iframe = document.createElement('iframe');
        iframe.id = 'bv-print-iframe';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<title>${escapeHTML(titolo)}</title>
<style>${CSS_BASE_STAMPA}\n${cssExtra}</style>
</head>
<body>
${html}
${footer}
</body>
</html>`);
        doc.close();

        // Su Safari/iOS è cruciale dare un po' di tempo per il rendering
        // PRIMA di chiamare print(). 250ms è un buon compromesso.
        const stampaQuandoPronto = function () {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (err) {
                console.error('[stampa_universale] errore in print():', err);
                // fallback estremo
                try { window.print(); } catch (e) { /* noop */ }
            }
            // Rimuovi l'iframe dopo che la dialog è stata chiusa.
            // 1.5s sono sufficienti su tutti i browser testati.
            setTimeout(function () {
                if (iframe && iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
            }, 1500);
        };

        // Aspetta il load dell'iframe se necessario, poi piccolo delay
        if (iframe.contentWindow && iframe.contentDocument
            && iframe.contentDocument.readyState === 'complete') {
            setTimeout(stampaQuandoPronto, 250);
        } else {
            iframe.addEventListener('load', function () {
                setTimeout(stampaQuandoPronto, 250);
            }, { once: true });
            // safety net se 'load' non scatta
            setTimeout(stampaQuandoPronto, 600);
        }
    }

    // ---------------------------------------------------------------
    // SCORCIATOIA: stampa di un capitolo / sezione corrente
    // ---------------------------------------------------------------
    /**
     * Stampa un capitolo/sezione attualmente visualizzato.
     * @param {Object} opts
     * @param {string} opts.titoloHTML - HTML del titolo (può includere markup)
     * @param {string} opts.testoHTML  - HTML del corpo del capitolo
     * @param {string} [opts.fonte]    - testo della fonte (link o riga finale)
     */
    function bvStampaCapitolo(opts) {
        opts = opts || {};
        const titoloHTML = opts.titoloHTML || '';
        const testoHTML = opts.testoHTML || '';
        const fonte = opts.fonte || '';

        const corpo = `
            <h1 class="bv-titolo-stampa">${titoloHTML}</h1>
            <div class="bv-contenuto-stampa">${testoHTML}</div>
            ${fonte ? `<div style="margin-top:1.2em;font-size:0.85em;text-align:center;">${fonte}</div>` : ''}
        `;

        bvStampaContenuto({
            titolo: stripTagsBreve(titoloHTML) || 'Capitolo',
            html: corpo
        });
    }

    // ---------------------------------------------------------------
    // SCORCIATOIA: stampa elenco risultati di ricerca da modale
    // ---------------------------------------------------------------
    /**
     * Stampa una lista di risultati di ricerca, normalmente contenuta
     * in una modale o pannello che dà problemi al window.print() di Safari.
     *
     * @param {Object} opts
     * @param {string} opts.titoloHTML - intestazione (es. "Risultati per: ...")
     * @param {string} opts.listaHTML  - innerHTML del contenitore risultati
     */
    function bvStampaRisultatiRicerca(opts) {
        opts = opts || {};
        const titoloHTML = opts.titoloHTML || 'Risultati di ricerca';
        const listaHTML = opts.listaHTML || '';

        if (!listaHTML || !listaHTML.trim()) {
            alert('Nessun risultato da stampare.');
            return;
        }

        const corpo = `
            <h1 class="bv-titolo-stampa">${titoloHTML}</h1>
            <div class="bv-risultati-stampa">${listaHTML}</div>
        `;

        bvStampaContenuto({
            titolo: stripTagsBreve(titoloHTML) || 'Risultati ricerca',
            html: corpo
        });
    }

    // ---------------------------------------------------------------
    // SCORCIATOIA: stampa pagina statica
    // (ricerche globali, "miei appunti", istruzioni)
    // ---------------------------------------------------------------
    /**
     * Stampa la pagina corrente con il classico window.print().
     * Adatto a pagine STATICHE dove i CSS @media print sono già configurati
     * e dove non ci sono modali/iframe/sfondi che bloccano Safari.
     */
    function bvStampaPagina() {
        // Garantisce visibilità di html/body (alcune pagine giocano con display)
        try {
            document.documentElement.style.display = '';
            if (document.body.style.display === 'none') {
                document.body.style.display = 'block';
            }
        } catch (e) { /* noop */ }
        window.print();
    }

    // ---------------------------------------------------------------
    // HELPER privati
    // ---------------------------------------------------------------
    function escapeHTML(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function stripTagsBreve(s) {
        // utile solo per il <title> della finestra di stampa
        return String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
    }

    // ---------------------------------------------------------------
    // ESPOSIZIONE GLOBALE
    // ---------------------------------------------------------------
    global.bvStampaContenuto       = bvStampaContenuto;
    global.bvStampaCapitolo        = bvStampaCapitolo;
    global.bvStampaRisultatiRicerca = bvStampaRisultatiRicerca;
    global.bvStampaPagina          = bvStampaPagina;

    // Alias retrocompatibile con il vecchio ios_print.js
    // (così le pagine di ricerca globale e l'export Word continuano a funzionare
    //  senza modifiche, e qualsiasi vecchio codice trova ancora bvPrint).
    global.bvPrint = bvStampaPagina;

})(window);
