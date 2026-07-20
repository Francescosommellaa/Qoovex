# Data, storage and security

Prisma salva record, relazioni, stati, permessi, scadenze e audit. Vercel Blob privato salva file binari; DocumentVersion ed Evidence conservano solo metadati e blob key. Download e condivisione passano da endpoint autorizzati, senza esporre blob key, token hash o URL permanenti.

`CalendarEvent` salva metadati di eventi e task, intervallo, giornata intera, priorita, stato, assegnatario, cantiere, origine e UID iCalendar opzionale. L'importazione accetta solo contenuto `.ics` caricato dall'utente, massimo 512 KB e 200 eventi; non effettua fetch di URL esterni. Export, inventario, cancellazione Azienda e audit includono il calendario senza credenziali provider.

La migration incrementale `20260720010000_calendar_events` aggiunge il dominio calendario, enum, relazioni, indici e azioni audit. Al 2026-07-20 sviluppo locale e database Preview dedicato risultano allineati alle cinque migration canoniche e senza schema drift. Lo stato Production va verificato separatamente prima di ogni rollout; ogni deploy resta soggetto al wrapper protetto, al backup verificato e al controllo della cronologia.

La cronologia canonica parte da `20260712010000_single_company_baseline` e prosegue solo con migration incrementali fino a `20260720010000_calendar_events`. Le migration applicate sono immutabili: nome, ordine e checksum devono coincidere con `_prisma_migrations`; non usare `migrate resolve` per nascondere divergenze. Ogni evoluzione schema richiede migration dedicata e verifica Prisma. Non introdurre Supabase, Firebase, S3 o provider storage alternativi.

Auth, MFA, inviti, support session, audit e protezioni HTTP vivono in workspace. Se un account abilita MFA, pagine e API prodotto richiedono un'asserzione MFA legata alla specifica sessione Auth.js e alla sua `authVersion`. Enrollment, sostituzione, disattivazione, rigenerazione backup code e recupero richiedono prove separate dalla sola sessione primaria. Il rate limit persistente usa HMAC domain-separated, un unico upsert PostgreSQL atomico e cleanup delle finestre scadute; non salva email, username o IP grezzi.

Il recupero MFA non disattiva il fattore: autorizza una sostituzione entro una finestra limitata. OWNER, SUPER_ADMIN e account senza membership verificano l'email; i ruoli inferiori verificano l'email e richiedono la prima approvazione valida di un OWNER della stessa Azienda. La conferma del nuovo fattore incrementa `authVersion` e revoca tutte le sessioni. Non loggare segreti, token, contenuti file o metadata sensibili non necessari.
