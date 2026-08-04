# Servizi server foundation

I servizi applicano identità, tenant e permission server-derived. Sono presenti servizi vNext per contesti, participant, inviti, agreement, timeline, step, richieste, proposte, pagamenti documentati, dispute, allegati, chiusura, export, processi e notifiche, oltre alle foundation auth, audit, supporto e data-control.

Non esistono superfici prodotto legacy autonome; `Document`, `DocumentVersion`, `Evidence` ed `EvidenceRevision` restano foundation interne. Sono presenti enqueue, processi registrati, ricerca e timeline vNext. Blob key e segreti non devono raggiungere output client. La presenza dei servizi non equivale a verifica end-to-end.
