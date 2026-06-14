# Design Contract

Il contratto Stable v0.5 e` definito da:

- `visual-language.md`;
- `color-system.md`;
- `typography-system.md`;
- `blur-system.md`;
- `component-visual-rules.md`.

`@qoovex/ui` e` l'unica implementazione runtime. Sirio documenta e verifica il
contratto; non possiede token o primitive alternative.

Ogni modifica successiva deve:

1. partire dal componente canonico piu` profondo;
2. dichiarare funzione, stato e fallback;
3. verificare 375, 768, 1024 e 1440 px;
4. superare tastiera, zoom 200%, reduced motion/transparency e forced colors;
5. aggiornare documentazione, Components Map e Decisions.
