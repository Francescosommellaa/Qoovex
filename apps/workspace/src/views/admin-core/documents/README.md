# Documents Admin Views

UI app-local per lista documenti, dettaglio documento e versioni file.

`DocumentOverviewView`, `DocumentAreaPageView` e `DocumentCategoryList` presentano stato e categorie senza chart decorativi o query per card. `DocumentCreateFlow` segue macroarea, destinazione, categoria, tipo, file e riepilogo: non ammette `Senza tipo`, consente la creazione inline classificata con `settings:update` e preserva il documento durante il retry del file. Il dettaglio mostra macroarea, categoria, tipo, sensibilita e contesto prima delle versioni.

Usa solo le API gia protette sotto `/api/documents` e non espone `blobKey`, URL permanenti o contenuto file.

`DocumentsPageView` usa Card, Badge, Alert, Empty, Button e Dialog della foundation Qoovex con icone Tabler. La lista copre filtri URL, contesto/scadenza, modalita selezione file, empty state role-safe, responsive senza overflow e fallback reduced-motion/forced-colors.

`DocumentCreateDialog` compone `DocumentCreateFlow` sia dalla lista sia dal dettaglio cantiere. All'apertura carica una sola volta i tipi documento dalla API protetta; nella lista riusa lavoratori e cantieri gia presenti nel read model, mentre nel cantiere mantiene il contesto bloccato. Loading, errore/retry, titolo e descrizione accessibili usano le primitive condivise.

`DocumentDetailsDialog` conserva l'utente nella lista: mostra subito i metadati gia caricati e, nelle viste operative, recupera le versioni con una singola richiesta lazy alla API protetta. Il dialog gestisce loading, errore con retry, empty state, upload autorizzato e focus restoration; X e backdrop restano i dismiss standard e il footer espone soltanto la CTA primaria `Gestisci documento`. Nell'archivio la stessa composizione opera in sola lettura, senza copy ridondante visibile, upload, footer di gestione o richiesta versioni non supportata. Il trigger non mostra frecce perche apre un overlay e non cambia pagina.

`DocumentDetailView` usa la stessa foundation per riepilogo, metadati, note, versioni, upload, scadenze e gestione avanzata. Le sezioni sensibili sono progressive disclosure native, responsive e accessibili; form, errori, empty state e pending state non dipendono piu dal CSS legacy di Admin Core.

I filtri di stato e quelli archivio usano la stessa struttura `Vista documenti` e lo stesso segmented control del Calendario. Cambia soltanto la dimensione del filtro: `/documents` filtra per stato, mentre `/documents/archive` contiene gia soltanto record `ARCHIVED` e filtra quindi per contesto (Azienda, Lavoratori, Cantieri). La route archivio richiede `documents:archive` e distingue il rischio con il bordo rosso delle card, senza fondi, badge laterali, avvisi ripetuti o hover su superfici che non sono azionabili. Ogni documento archiviato espone il dettaglio rapido in sola lettura, `Ripristina`, che lo riporta prudenzialmente in `TO_REVIEW`, ed `Elimina definitivamente`: il Dialog usa la gerarchia canonica, mostra il titolo esatto in una riga selezionabile e copiabile, richiede di incollarlo nel campo di conferma e abilita solo allora la CTA distruttiva. La cancellazione rimuove documento, versioni e Blob privati; scadenze e pacchetti storici sono preservati senza il collegamento al documento.
