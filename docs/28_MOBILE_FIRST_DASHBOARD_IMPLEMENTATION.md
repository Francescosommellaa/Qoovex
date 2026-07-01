# 28 - Mobile-First Dashboard Implementation

## Cosa e stato implementato

La prima dashboard operativa del workspace mostra una sintesi mobile-first per capire rapidamente:

- stato documentale;
- documenti mancanti, scaduti, in scadenza o da verificare;
- scadenze registrate;
- cantieri attivi;
- lavoratori registrati;
- pacchetti documentali pronti per revisione o condivisi;
- prove recenti;
- prossime azioni utili.

La dashboard non promette conformita, certificazione o validita legale.

## Route pagina

- `/dashboard`: pagina dashboard interna.
- `/`: redirect verso `/dashboard`.

La pagina e server-rendered e legge dati tramite service server-side. Se accesso o ambiente non sono disponibili, mostra uno stato controllato.

## API e service

- `GET /api/dashboard`
- `apps/workspace/src/shared/server/dashboard-service.ts`

Il service:

- risolve il contesto autenticato lato server;
- usa `organizationId` dal contesto, mai dal client;
- applica `organization:read`;
- consente `OWNER`, `ADMIN` e `SAFETY_CONSULTANT`;
- nega `SITE_MANAGER`, `WORKER` e `VIEWER` finche mancano filtri per risorsa;
- filtra ogni query per `organizationId`;
- esclude record archiviati dalle liste standard;
- non restituisce `blobKey`, `tokenHash`, token raw o URL permanenti.

## Componenti creati

I componenti sono app-local in `apps/workspace/src/views/dashboard`:

- `DashboardView`;
- summary cards;
- quick actions;
- deadlines list;
- documents attention list;
- job sites list;
- workers overview;
- packages list;
- recent evidence list;
- empty state;
- access state.

Non e stato creato `packages/ui` perche non esiste ancora riuso reale cross-app.

## Dati mostrati

La dashboard mostra solo dati minimi:

- conteggi documentali per stato prudente;
- scadenze aperte ordinate per data;
- documenti in stato `MISSING`, `EXPIRED`, `EXPIRING_SOON`, `TO_REVIEW`;
- cantieri attivi con conteggi sintetici;
- lavoratori attivi con nome visualizzato e conteggi sintetici;
- pacchetti attivi con numero elementi e presenza di link attivo;
- prove recenti con tipo, titolo e presenza file.

Non vengono esposte note estese, dati personali non necessari, contenuto file, path Blob o token.

## Empty state

Quando mancano dati operativi, la dashboard propone azioni semplici:

- crea il primo cantiere;
- aggiungi un lavoratore;
- configura un tipo documento;
- crea un pacchetto per revisione.

Le azioni rapide restano disabilitate con copy `Schermata in preparazione` finche non esistono schermate CRUD dedicate.

## Comportamento mobile

Mobile e la forma primaria:

- layout a colonna singola;
- card compatte e leggibili;
- controlli touch-friendly;
- nessuna tabella densa;
- stati critici in alto.

Desktop amplia la griglia senza cambiare gerarchia informativa.

## Cosa resta escluso

- UI CRUD completa;
- form di creazione/modifica;
- dashboard personale per `SITE_MANAGER` o `WORKER`;
- filtri per assegnazione cantiere/lavoratore;
- grafici avanzati;
- dati demo hardcoded;
- nuove migration Prisma;
- nuovi provider storage;
- AI/OCR, firma digitale, geolocalizzazione, pricing.

## Rischi privacy

- La dashboard e interna, ma resta necessario minimizzare i dati personali.
- `WORKER` e `SITE_MANAGER` richiedono filtri per risorsa prima di essere abilitati.
- Il viewer esterno deve continuare a usare solo share link tokenizzati, non la dashboard interna.

## Prossima fase consigliata

Implementare le prime schermate CRUD mobile-first collegate alle azioni rapide:

1. documenti e versioni;
2. scadenze;
3. lavoratori;
4. cantieri;
5. pacchetti documentali.
