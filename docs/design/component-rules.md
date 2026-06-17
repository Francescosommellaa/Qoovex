# Regole componenti

Nessun componente runtime e' approvato nella fase corrente di fondazione.

`packages/ui` e' temporaneamente solo stili. Possiede `tokens.css`, `base.css`
e l'entrypoint pubblico degli stili. Sirio puo' usare markup app-local per
mostrare la direzione, ma quel markup non e' una API componente riusabile.

## Prima di aggiungere un componente

Rispondere si' a ogni domanda:

1. Risolve un problema ricorrente d'interfaccia?
2. E' abbastanza generico da appartenere a `packages/ui`?
3. Ha tutti gli stati richiesti?
4. Funziona in default, cucina e revisione?
5. E' accessibile di default?
6. Usa solo token semantici?
7. Il modello di contenuto e' chiaro?
8. Il comportamento responsive e' documentato?
9. Esiste un piano test mirato?
10. Rimuoverlo renderebbe Qoovex peggiore?

## Stati richiesti

Ogni futuro componente deve definire:

- default;
- hover;
- focus;
- active;
- selected;
- loading;
- disabled;
- empty;
- error;
- warning;
- success;
- changed;
- unsaved;
- syncing;
- offline;
- conflict;
- read-only;
- permission denied.

## Stati specifici Qoovex

I componenti Qoovex dovranno supportare stati culinari come:

- ingrediente mancante;
- allergene critico;
- quantita' scalata;
- ricetta modificata;
- menu pubblicato;
- QR attivo;
- lista spesa generata;
- task in servizio;
- preparazione completata;
- versione precedente;
- conflitto tra collaboratori.

## Divieti

- Non creare alternative app-local alle future primitive canoniche.
- Non comunicare significato solo tramite colore.
- Non usare movimento decorativo.
- Non introdurre effetti visuali prima di uno scopo semantico chiaro.
- Non ricreare il logo o usare icone non Phosphor quando serve un'icona.

