# Sirio Sections

Scopo: una sezione per ogni area del design system.

Metti qui:
- file `sezione-*.tsx` che documentano un singolo argomento;
- demo isolate, esempi e contenuti di verifica visiva.

Non mettere qui:
- shell applicativa;
- componenti shared del design system: quelli stanno in `packages/ui`.

Regole:
- una sezione = un tema chiaro;
- niente logica business o fetch di prodotto;
- se una demo richiede molti sottopezzi, crea sottocomponenti locali nello stesso file o cartella dedicata con `README.md`.
