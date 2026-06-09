## Shared Components

Componenti riusabili cross-pagina per il marketing site.

Esempi: topbar, footer, wrapper layout.

### SiteTopbar

- Expanded trasparente fino a 24 px di scroll, poi pill glass sempre visibile.
- Desktop compact: `880 x 52`, padding `4 4 4 16`, gap 28 e blur reale 15 px.
- Mobile expanded: nessun fondo, bordo, raggio o ombra. Mobile compact:
  inset 12 px, altezza 54 px e superficie Paper neutra.
- Lo stato compact aggiunge un velo superiore neutro da 64 px con blur 3 px,
  deliberatamente piu` leggero della pill.
- Il tono privilegia `data-nav-tone`, poi rileva la luminanza della superficie
  realmente renderizzata sotto la barra.
- I mega menu supportano hover, click, tastiera, Escape e click esterno.
- Mega menu e `Select` condividono superficie, bordo, blur, radius e ombra
  tramite i token canonici di `@qoovex/ui`.
- Il pannello mobile usa accordion, focus trap e blocco dello scroll pagina.
- Le CTA usano esclusivamente le varianti condivise di `Button`.
