/**
 * ios_print.js v3 — Bibliotheca Valtortiana
 *
 * Gestisce la stampa su iOS e desktop in modo affidabile.
 * - iOS Safari/Chrome: window.print() SINCRONO nel gestore del click
 * - Desktop: window.print() standard
 * - Garantisce visibilità della pagina prima della stampa
 */
function bvPrint() {
    // Assicura che <html> e <body> siano visibili prima di stampare
    document.documentElement.style.display = '';
    if (document.body.style.display === 'none') {
        document.body.style.display = 'block';
    }
    window.print();
}
