# Operational Protocol

Questo documento definisce il contratto operativo minimo del monorepo Qoovex.

Obiettivo:
- ridurre errori di posizionamento del codice;
- impedire duplicazioni di pattern;
- dare ad AI e dev una checklist breve prima, durante e dopo ogni task.

## Ordine di verita`

Quando devi decidere cosa fare, usa questo ordine:

1. business rules del prodotto;
2. `project_brain.json`;
3. `README.md` locale della cartella;
4. `docs/CodePatterns.md`;
5. codice reale gia` presente;
6. preferenze personali.

Se due fonti sembrano in conflitto:
- non inventare una terza strada;
- fermati, segnala il conflitto, chiarisci prima.

## Lettura minima prima di toccare codice

Leggi sempre:

1. `docs/HowToUse.md`;
2. `project_brain.json`;
3. `README.md` della cartella in cui andrai a lavorare;
4. i file reali gia` esistenti del punto toccato.

Leggi `docs/project_brain.archive.json` solo se il brain compatto non basta.

## Classificazione del task

Prima di scrivere codice, classifica il task:

- `marketing` -> `apps/web`
- `workspace product` -> `apps/workspace`
- `design system showcase` -> `apps/sirio`
- `shared ui` -> `packages/ui`
- `db / prisma / client db` -> `packages/db`
- `shared types` -> `packages/types`
- `shared pure utils / shared hooks` -> `packages/utils`
- `shared config` -> `packages/config`
- `shared brand assets` -> `packages/brand`

Se il task tocca piu` zone:
- individua la fonte canonica;
- modifica prima la fonte canonica;
- poi allinea i consumer.

Prima di editare:
- dichiara mentalmente o esplicitamente la lista dei file che toccherai;
- non iniziare a cambiare file fuori scope "gia` che ci sei".

## Regola di piazzamento

Ogni file nuovo deve rispondere a una domanda semplice:

- questo file e` specifico di una app?
- e` riusabile da piu` app?
- e` un caso d'uso?
- e` modello di dominio?
- e` composizione di pagina?
- e` solo shell/router/framework glue?

Mappa obbligatoria:

- `shared` = primitive app-local, config, lib, api, action comuni dell'app
- `entities` = dominio stabile e riusabile
- `features` = azioni utente e casi d'uso
- `widgets` = blocchi compositi grandi, riusabili tra view
- `views` = schermate complete
- `app` = entrypoint Next, route, layout, page, route handler

Se un file non ha una casa chiara:
- non creare il file finche' la casa non e` chiara.

## Regola di creazione file

Prima di creare un file nuovo, verifica:

1. esiste gia` qualcosa di equivalente?
2. puoi estendere un file esistente senza peggiorarlo?
3. il file appartiene davvero a quel layer?
4. il nome spiega il dominio o il caso d'uso?
5. stai evitando un file generico tipo `utils.ts`, `helpers.ts`, `temp.ts`?

Se crei una nuova cartella manuale:
- crea nello stesso change anche il suo `README.md`.

Non creare o modificare manualmente file dentro:
- `node_modules`
- `.next`
- `.turbo`
- `.vercel`
- output generati del framework o del build system

## Regola di composizione del codice

- `page.tsx` compone, non contiene business logic lunga;
- `layout.tsx` monta shell e provider, non feature logic;
- `route.ts` valida e delega, non contiene logica business lunga;
- i componenti UI non devono contenere business logic pesante;
- query DB non vanno nei componenti client;
- la logica condivisa non va duplicata dentro le app.

Ordine file:
- rispetta sempre `docs/CodePatterns.md`.

## Regola di dipendenza

Prima di aggiungere una dipendenza:

1. verifica se il repo la copre gia`;
2. verifica se puoi risolvere con stack esistente;
3. verifica se impatta una sola app o il monorepo;
4. verifica se cambia le convenzioni gia` fissate.

Se la risposta non e` chiara:
- fermati e chiedi.

## Regola di aggiornamento documentazione

Aggiorna nello stesso task:

- `project_brain.json` se cambia la verita` corrente;
- `docs/project_brain.archive.json` solo per storico lungo;
- `README.md` locale della cartella se cambia il suo contratto;
- `docs/CodePatterns.md` se cambia una regola di struttura o ordine dei file;
- `.cursor/rules/qoovex.mdc` se cambia una regola che Cursor deve applicare sempre.

## Checklist finale obbligatoria

Prima di chiudere un task, verifica:

1. il codice e` nel posto giusto;
2. non hai creato un secondo pattern per la stessa cosa;
3. hai rispettato il `README.md` locale;
4. hai rispettato `docs/CodePatterns.md`;
5. non hai violato `project_brain.json`;
6. se hai creato una cartella, hai aggiunto il suo `README.md`;
7. se hai cambiato una regola stabile, hai aggiornato docs/brain/rules.

Comandi minimi:

- `pnpm check:fast` per repo guard + lint + type-check
- `pnpm check` per quality gate completo con build e browser audit

Se anche un solo punto e` dubbio, il task non e` ancora chiuso bene.
