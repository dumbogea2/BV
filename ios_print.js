/**
 * ios_print.js v2 — Bibliotheca Valtortiana
 *
 * PROBLEMA iOS Safari/Chrome:
 *   - window.print() dentro setTimeout() viene bloccato da iOS
 *     perché non è più nel contesto diretto del click utente.
 *   - window.open() + print() su popup non funziona su iOS
 *     (i popup sono bloccati dal sistema).
 *
 * SOLUZIONE:
 *   - Su iOS: window.print() SINCRONO, chiamato direttamente.
 *     Il ritardo visivo non serve — iOS gestisce il dialogo in modo nativo.
 *   - Su desktop (Chrome/Firefox/Safari Mac): comportamento invariato.
 *   - Caso popup (printResults biblioteca): su iOS viene ignorato il popup
 *     e si stampa la pagina corrente come fallback, che è il massimo
 *     ottenibile su iOS (i popup sono bloccati dal sistema operativo).
 */
function bvPrint(targetWin) {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        // Su iOS: print() deve essere SINCRONO nel gestore del click.
        // Ignoriamo targetWin (popup) perché iOS blocca window.open().
        window.print();
    } else {
        // Desktop: comportamento normale
        var win = targetWin || window;
        win.print();
    }
}
