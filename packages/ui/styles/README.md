# Styles

- `fonts.css`: General Sans e Cabinet Grotesk self-hosted da Fontshare.
- `tokens.css`: output generato da `src/tokens.ts`; non modificare manualmente.
- `base.css`: reset globale, tipografia, focus, controlli, accessibilità e stampa.
- `utilities.css`: sette utility Qoovex generiche e prefissate.
- `components/primitives.css`: rendering canonico delle primitive web.
- `components/forms.css`: Field e controlli form nativi, stati e accessibilitÃ .
- `components/feedback.css`: alert, stati asincroni, progress, tooltip e toast.
- `components/overlays.css`: modal, drawer, popover e dropdown Radix.
- `components/navigation.css`: Navbar e MobileNav.
- `components/layout.css`: AppShell, PageHeader, SectionHeader e Toolbar.
- `components/product.css`: data display e product components canonici.
- `components.css`: compatibilità temporanea, senza componenti product legacy.
- `index.css`: entrypoint layered `@qoovex/ui/styles.css`.

Usare `pnpm tokens:generate` per rigenerare il CSS e `pnpm tokens:check` per rilevare drift.
