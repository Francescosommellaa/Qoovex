# Workspace Views

Componenti app-local per l'interfaccia prodotto di `apps/workspace`.

Contengono solo UI specifica del workspace admin. Non sono un design system condiviso e non devono importare Prisma o logica server-side.

In development locale, `DevRoleSwitcher` mostra in modo esplicito il ruolo simulato dalla sessione dev firmata. Riusa i controlli di `@qoovex/ui`, non modifica la membership persistita e rimanda sempre alla dashboard dopo il cambio ruolo.
