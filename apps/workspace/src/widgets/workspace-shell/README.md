# Workspace Shell Widget

Scopo: shell autenticata modulare del workspace.

Metti qui:
- composizione layout con sidebar, topbar e content scrollabile;
- scroll rail custom app-local;
- tipi pubblici della shell.

Non mettere qui:
- feature prodotto;
- logica business;
- componenti riusabili cross-app.

Regole:
- compone solo layer inferiori o widget peer;
- usa token e componenti pubblici del design system;
- il content deve scrollare dentro la shell, non sul body.
