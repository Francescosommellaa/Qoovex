# @qoovex/brand-resources

Risorse di brand condivise. Il package espone gli asset SVG canonici di Qoovex, workspace e Sirio senza richiedere copie nei consumer.

Lo stylesheet `styles/fontshare.css` e l'unico punto di integrazione tipografica esterna: carica General Sans e Cabinet Grotesk tramite Fontshare con `font-display: swap`. General Sans e il carattere operativo. Cabinet Grotesk e riservato alla gerarchia display. Le app produttive importano questo stylesheet, mentre `@qoovex/ui` usa soltanto i token tipografici semantici.

Sirio consuma gli SVG tramite gli export del package, ma continua a usare Geist e Geist Mono durante l'approvazione della nuova foundation. Non duplicare gli asset e non importare Fontshare nei consumer che non lo richiedono.
