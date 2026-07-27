# Types Package

Scopo: tipi condivisi tra app e package.

Metti qui:
- contratti TypeScript, enum string union, DTO e type helper condivisi.
- contratti operational platform-neutral minimizzati; gli input azione sono discriminati e non espongono transizioni libere.

Non mettere qui:
- logica runtime;
- hook, componenti o utilita` eseguibili.

Regole:
- tipi nominati in modo esplicito;
- esporta solo cio` che e` davvero cross-package o cross-app.
