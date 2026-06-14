# Component Rules Stable v0.5

## Contratto comune

- Target interattivo minimo 44 px in comfort e compact.
- Focus ring distinto da glow, contrasto minimo 3:1.
- Disabled resta leggibile e non assomiglia all'azione primaria.
- Stato mai comunicato soltanto con colore.
- Hover non contiene informazione esclusiva.
- Reduced motion raggiunge lo stesso stato senza movimento.

## Materiali

`Surface` possiede Paper, Crystal e Inverse. `Card`, overlay e navigazione
compongono questo contratto. Nessun consumer applica classi glass o
backdrop-filter direttamente.

## Form

`Field` possiede label, descrizione, messaggio e stato. Input, Textarea e Select
sono Paper anche dentro Crystal. Errore usa `aria-invalid`, messaggio specifico
e `role=alert`.

## Overlay

Dialog, AlertDialog, Drawer, Popover, DropdownMenu e Tooltip usano Radix per
tastiera, collisioni, focus, Escape, portal e ripristino. Dialog e Drawer usano
Crystal overlay; menu e popover preferiscono Paper.

## Motion

Pressione, apertura e prossimita` sono consentite. Magnetic resta opt-in,
marketing-only, massimo 6 px entro 32 px e viene disattivato su touch,
disabled e reduced motion.

## Divieti

- Crystal in liste ripetute.
- Blur sui discendenti.
- Overlay annidati senza necessita`.
- Icon button senza nome accessibile.
- Componenti app-local che duplicano primitive canoniche.
