# @qoovex/brand-resources

Risorse di brand condivise. Lo stylesheet `styles/fontshare.css` e l'unico punto di integrazione tipografica esterna: carica Satoshi e Chillax tramite Fontshare con `font-display: swap`.

Le app importano questo stylesheet, mentre `@qoovex/ui` usa soltanto i token tipografici semantici. Non duplicare font o import Fontshare nei consumer.
