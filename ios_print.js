/**
 * ios_print.js — Bibliotheca Valtortiana
 * Funzione di stampa compatibile con iOS (Safari e Chrome/WebView).
 *
 * Su desktop chiama window.print() normalmente.
 * Su iOS il dialogo di stampa richiede un focus esplicito sul documento
 * e un breve setTimeout, altrimenti non parte.
 *
 * Uso:
 *   bvPrint();                        // stampa la pagina corrente
 *   bvPrint(finestra);                // stampa una finestra popup (caso printResults)
 */
function bvPrint(targetWin) {
    var win = targetWin || window;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        // Su iOS occorre dare il focus e poi invocare print con un ritardo minimo
        win.focus();
        setTimeout(function () {
            win.print();
        }, 300);
    } else {
        win.print();
    }
}
