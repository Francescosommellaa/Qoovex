# Workspace Admin Extended Implementation

Data: 2026-07-01.

## Implementato

Questa sottofase completa la UI admin app-local di `apps/workspace` per:

- checklist configurabili;
- voci checklist;
- prove operative Evidence;
- pacchetti documentali;
- item pacchetto;
- share link revocabili.

Non sono state introdotte nuove API di dominio, nuove migration Prisma, nuovi provider storage o package condivisi.

## Route pagina

- `/checklists`: lista checklist, conteggi voci, cantiere collegato, creazione checklist.
- `/checklists/[checklistId]`: dettaglio checklist, aggiornamento, archiviazione, gestione voci e completamento.
- `/evidence`: lista prove, creazione NOTE/PHOTO/FILE, aggiornamento metadata, download protetto, archiviazione.
- `/document-packages`: lista pacchetti, conteggio item, indicatori link, creazione pacchetto.
- `/document-packages/[packageId]`: dettaglio pacchetto, item inclusi, ordine item, rimozione item, share link.

La shell workspace ora mostra link attivi a Dashboard, Documenti, Scadenze, Lavoratori, Cantieri, Checklist, Prove e Pacchetti.

## Componenti creati

- `ChecklistsPageView`, `ChecklistDetailView`, `ChecklistForm`, `ChecklistItemForm`, `ChecklistItemActions`.
- `EvidencePageView`, `EvidenceForm`, `EvidenceUpdateForm`, `EvidenceArchiveButton`.
- `DocumentPackagesPageView`, `DocumentPackageDetailView`, `DocumentPackageForm`, `DocumentPackageItemForm`, `DocumentPackageItemsList`, `ShareLinksPanel`, `ShareLinkCreateForm`.

I componenti riusano shell, page header, panel, empty state, badge e CSS module gia introdotti nel workspace admin core.

## API usate

- `/api/checklists` e `/api/checklists/[id]`.
- `/api/checklists/[id]/items` e `/api/checklists/[id]/items/[itemId]`.
- `/api/evidence`, `/api/evidence/[id]`, `/api/evidence/[id]/download`.
- `/api/document-packages`, `/api/document-packages/[id]`.
- `/api/document-packages/[id]/items` e `/api/document-packages/[id]/items/[itemId]`.
- `/api/document-packages/[id]/share-links` e `/api/document-packages/[id]/share-links/[shareLinkId]`.

Il client non invia mai `organizationId`; isolamento e permessi restano nei service server-side.

## Permessi UI

- OWNER e ADMIN vedono azioni di gestione complete.
- SAFETY_CONSULTANT puo usare le azioni consentite dai service per checklist, evidence e pacchetti.
- La creazione e revoca share link resta visibile solo a OWNER e ADMIN.
- SITE_MANAGER, WORKER e VIEWER non ricevono admin completo finche mancano filtri per risorsa.

La sicurezza resta sempre server-side.

## Evidence e Blob

Evidence NOTE usa JSON e non mostra input file.

Evidence PHOTO/FILE usa `multipart/form-data` verso l'endpoint esistente:

- massimo 4 MB;
- PHOTO: JPEG, PNG, WebP;
- FILE: PDF o immagini;
- download solo tramite route server-side.

La UI mostra metadata minimi e non mostra riferimenti interni di storage o URL Blob diretti.

## Share link

La lista share link mostra solo stato, scadenza e ultimo accesso.

Il valore copiabile del link viene mostrato solo subito dopo la creazione con il messaggio:

> Link creato. Copialo ora: per sicurezza non verra mostrato di nuovo.

I link gia creati non mostrano il valore copiabile. La revoca passa dall'endpoint protetto esistente.

## Empty state

- Checklist: `Crea una checklist configurata per seguire attivita, documenti o prove da controllare.`
- Evidence: `Aggiungi una foto, un file o una nota per collegare una prova al cantiere.`
- Pacchetti: `Crea un pacchetto documentale pronto per revisione.`

## Mobile-first

Le pagine seguono lo stesso pattern del workspace admin core:

- liste a card su mobile;
- form brevi;
- griglie solo da desktop;
- bottoni reali e label sui campi;
- nessuna tabella densa.

## Escluso

- viewer UI pubblica completa;
- nuove API dominio;
- nuove migration Prisma;
- nuovo design system condiviso;
- nuovi provider storage;
- template o checklist normative;
- AI/OCR, firma digitale, geolocalizzazione e pricing.

## Rischi e limiti

- I package item `DocumentPackageItem` vengono rimossi fisicamente perche il modello non espone `archivedAt`.
- Il form `DOCUMENT_VERSION` mostra versioni recuperate dai documenti accessibili; non esiste ancora una vista dedicata per scegliere versioni in modo avanzato.
- La UI non sostituisce audit prodotto ordinario: resta da pianificare audit esplicito per accessi, upload e share link.

## Prossima fase consigliata

Rifinire il flusso viewer pubblico e poi introdurre piccole schermate di dettaglio dedicate per Evidence e package condivisi, senza ampliare i permessi dei ruoli operativi finche non esistono assegnazioni per risorsa.
