# Data, storage and security

Prisma salva record, relazioni, stati, permessi, scadenze e audit. Vercel Blob privato salva file binari; DocumentVersion ed Evidence conservano solo metadati e blob key. Download e condivisione passano da endpoint autorizzati, senza esporre blob key, token hash o URL permanenti.

La cronologia canonica parte da `20260712010000_single_company_baseline`, gia registrata nel database condiviso, e prosegue solo con migration incrementali. Le migration applicate sono immutabili: nome, ordine e checksum devono coincidere con `_prisma_migrations`; non usare `migrate resolve` per nascondere divergenze. Ogni evoluzione schema richiede migration dedicata e verifica Prisma. Non introdurre Supabase, Firebase, S3 o provider storage alternativi.

Auth, MFA, inviti, support session, audit e protezioni HTTP vivono in workspace. Non loggare segreti, token, contenuti file o metadata sensibili non necessari.
