# 02 — Architettura e confini

## verified_current_state

Workspace è il runtime autenticato; Web è informativo; Sirio conserva la foundation visuale; `packages/ui` ospita primitive condivise. Il dominio server-side applica access context, tenant isolation e audit prima della persistence. Blob è server-only e privato.

`JobSite` è un aggregate neutro con identificazione, tenant, nome, indirizzo, date, note, stato record e archiviazione. Non contiene `clientName`, fase operativa o lifecycle prodotto. Le assegnazioni foundation non sono partecipazioni cliente.

## Elementi rimossi

Document requirement, deadline, calendario, checklist, pacchetti/share link, source policy/check/acquisition, request/message/timeline contestuale, motore prodotto e ricerca universale. Nessun adapter, redirect, flag o doppia modalità li mantiene raggiungibili.

## approved_product_direction / conceptual_not_implemented

I futuri confini Azienda-cliente, immobili privati e isolamento cross-company restano concettuali. Nessuna route o API vNext esiste.
