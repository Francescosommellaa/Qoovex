# UI, brand and surfaces

## `verified_current_state`

La foundation visuale resta shadcn `base-nova`, Base UI, Tabler, Tailwind CSS v4, Geist/Geist Mono e tema light/dark/system. Il Workspace usa Panoramica Azienda, shell capability-driven, ricerca metadata-only in Dialog `Ctrl/Cmd+K`, Azioni rapide, route dominio e Condivisioni a pacchetto. Non esiste una home cliente autenticata.

## `approved_product_direction`

La superficie cliente e separata dalla Panoramica Azienda e opera sempre in un contesto `CLIENT_JOB_SITE` o nella raccolta privata degli immobili. Il selettore di contesto futuro deve mostrare chiaramente parte rappresentata, Azienda o cantiere e uscita dal contesto; cambiare contesto ricostruisce scope, cache, notifiche, ricerca e deep link.

La home cliente risponde a immobili gestiti nell'app, cantieri aperti, Aziende invitanti, risposte necessarie, modifiche da confermare, pagamenti richiesti, avanzamento e aggiornamenti recenti. Il dettaglio concettuale comprende Riepilogo, Timeline, Step, Modifiche, Pagamenti, Persone, Documenti condivisi e Archivio.

Stati concettuali obbligatori: loading, empty, error, invito pendente/scaduto, conferma iniziale richiesta, risposta pendente, contenuto ritirato/sostituito, accesso sospeso/revocato, cantiere chiuso e export scaduto. Le azioni economiche mostrano parte rappresentata, versione, conseguenze e autorita rivalidata prima della conferma.

Il cliente vede soltanto nome, cognome e ruolo operativo dei Collaborator. Nessuna schermata cliente mostra automaticamente contatti, documenti Worker, permessi Azienda, note interne o altri cantieri.

## `conceptual_not_implemented`

Contesto cliente, immobili, sezioni, stati e azioni sopra descritti non sono route, componenti, navigazione o copy runtime. Questo task non modifica `packages/ui`, Sirio, Workspace UI, token, font, tema, iconografia o motion.

## `hard_stop`

Qualunque implementazione UI richiedera schema/runtime autorizzati, proof Sirio e verifica accessibilita separati. La documentazione non simula capability o link vNext.
