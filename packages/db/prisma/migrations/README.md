# Prisma migrations

La baseline `20260712010000_single_company_baseline` descrive il modello Qoovex mono-azienda: l'account conserva direttamente `organizationId` e `organizationRole`.

La cronologia precedente e stata sostituita prima del pilot, quando il database conteneva solo dati fittizi. Per un database esistente non classificato non applicare reset: creare prima un piano di migrazione dedicato.
