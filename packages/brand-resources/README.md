# @qoovex/brand-resources

Risorse di brand condivise. Lo stylesheet `styles/fontshare.css` e l'unico punto di integrazione tipografica esterna: carica General Sans e Cabinet Grotesk tramite Fontshare con `font-display: swap`.

General Sans e il carattere operativo. Cabinet Grotesk e riservato alla gerarchia display. Le app importano questo stylesheet, mentre `@qoovex/ui` usa soltanto i token tipografici semantici. Non duplicare font o import Fontshare nei consumer.
