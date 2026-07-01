# 00 - Product Reset

## Regola primaria

Qoovex e il sistema piu semplice per piccole imprese e subappaltatori che devono tenere pronti documenti, scadenze e prove di cantiere.

Il vecchio dominio legato a chef, cucina, ricette, menu, allergeni, eventi food, brigata, sala e pre-service non e piu parte del prodotto e non deve guidare decisioni, naming, UI, API, schema o documentazione.

## Nuovo dominio

Qoovex organizza:

- aziende;
- lavoratori;
- cantieri;
- documenti;
- scadenze;
- checklist configurabili;
- foto, file, note e prove operative;
- pacchetti documentali pronti per revisione;
- link di condivisione controllati.

## Linguaggio consentito

Usare formule prudenti:

- stato documentale;
- documenti presenti;
- documenti mancanti;
- documenti scaduti;
- documenti da verificare;
- checklist configurata;
- prova di cantiere;
- pacchetto documentale pronto per revisione;
- informazioni da confermare con consulente o responsabile.

## Linguaggio vietato

Non promettere:

- conformita garantita;
- sicurezza legale assicurata;
- certificazione dell'impresa;
- validita legale automatica dei documenti;
- idoneita o abilitazione automatica di lavoratori;
- sostituzione di consulenti, RSPP, tecnici o responsabili.

## Regole per Codex

- Non riutilizzare concetti del vecchio prodotto.
- Non inventare normative, documenti ufficiali o scadenze legali.
- Non introdurre provider diversi da Prisma per il database e Blob per file binari.
- Non introdurre compatibilita `Structure*` o ruoli legacy.
- Usare `Organization` come tenant tecnico e "Azienda" come label utente.
- Ogni nuova feature deve essere semplice, mobile-first, prudente e filtrata per `organizationId`.

## Cosa non generare piu

- Route, tipi o servizi `Structure*`.
- Ruoli chef/cucina/sala/brigata.
- Documenti o flussi food.
- Copy che suggerisce conformita automatica.
- Template normativi non validati.
