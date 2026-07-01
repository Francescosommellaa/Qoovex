# Document Status And Deadlines

Data: 2026-06-30.

## Obiettivo

Definire stati documentali e scadenze in modo prudente.

Qoovex mostra stato operativo e promemoria. Non decide conformita legale, validita formale o idoneita di persone, imprese o cantieri.

## Stati documentali consentiti

- `PRESENT`: documento presente nel sistema.
- `MISSING`: documento mancante secondo una configurazione, checklist o requisito inserito.
- `EXPIRED`: scadenza registrata superata.
- `EXPIRING_SOON`: scadenza registrata prossima.
- `TO_REVIEW`: documento presente ma da verificare.
- `ARCHIVED`: documento archiviato e non attivo.

## Come calcolare MISSING

Un documento puo risultare `MISSING` solo se esiste una configurazione interna:

- `DocumentRequirement` creato dall'utente o dal progetto;
- checklist configurata;
- richiesta esplicita associata a un cantiere, lavoratore o azienda.

Qoovex non deve inventare che un documento e richiesto per legge.

Copy corretto:

- "Documento mancante secondo configurazione".
- "Richiesto dalla checklist configurata".
- "Informazione da completare".

Copy vietato:

- "Documento obbligatorio per legge".
- "Impresa non conforme".
- "Cantiere non a norma".

## Scadenze manuali

Una `Deadline` registra una data fornita o confermata da utente, progetto o materiale validato.

Fonte ammessa:

- manuale;
- collegata a documento;
- collegata a checklist;
- altra fonte dichiarata e confermata.

Fonte non ammessa:

- calcolo normativo inventato;
- durata ufficiale non fornita;
- inferenza automatica non validata.

## Differenza tra stati

`EXPIRED`:

- `dueDate` e precedente alla data corrente;
- la data era registrata dall'utente o da fonte confermata.

`EXPIRING_SOON`:

- `dueDate` e futura ma vicina;
- la soglia deve essere configurabile o documentata come default operativo, non legale.

`TO_REVIEW`:

- esiste un documento o una prova;
- un utente autorizzato deve ancora controllare il contenuto o confermare i metadati;
- non significa che il documento sia invalido.

`PRESENT`:

- esiste almeno un record documento attivo o una versione caricata;
- non significa che il documento sia corretto o sufficiente.

## Copy prudente

Usare:

- "Documento presente".
- "Documento mancante".
- "Documento scaduto".
- "Da verificare".
- "In scadenza".
- "Scadenza registrata".
- "Richiesto dalla checklist configurata".
- "Pacchetto pronto per revisione".
- "Informazioni da confermare con il consulente o responsabile".

Non usare:

- "Conforme".
- "A norma".
- "Certificato".
- "Valido legalmente".
- "Abilitato automaticamente".
- "Obbligatorio per legge".
- "Sicurezza garantita".

## Esempi di messaggi utente

Corretto:

- "Documento presente, da verificare".
- "Documento mancante secondo la checklist configurata".
- "Scadenza registrata superata".
- "Pacchetto pronto per revisione".
- "Condiviso in lettura".

Da evitare:

- "Documento non valido legalmente".
- "Lavoratore abilitato".
- "Impresa conforme".
- "Cantiere a norma".

## Default operativi

Se serve una soglia `EXPIRING_SOON` prima della configurazione utente, usare un default tecnico esplicito e modificabile, ad esempio 30 giorni. Non presentarlo come soglia normativa.

## Test futuri

I test su stati e scadenze devono verificare:

- `MISSING` nasce solo da requisito/configurazione;
- `EXPIRED` nasce solo da `dueDate` registrata;
- `EXPIRING_SOON` usa una soglia dichiarata;
- `TO_REVIEW` non implica conformita o invalidita;
- copy e API non usano frasi vietate.
