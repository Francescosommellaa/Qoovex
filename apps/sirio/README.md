# Sirio App

Catalogo e reference UX del design system canonico Qoovex.

Sirio consuma la stessa foundation di marketing e workspace da `@qoovex/ui`: shadcn `base-nova`, Base UI, Tabler Icons, Tailwind CSS v4, General Sans / ARRAY e tema Vercel light/dark/system. Componenti, hook, utility e comportamenti condivisi non vengono duplicati nell'app.

I marchi provengono dagli SVG canonici di `@qoovex/brand-resources`. Provenienza e avvisi MIT della foundation sono conservati in `packages/ui/THIRD_PARTY_NOTICES.md`.

## Route

- `/`: reindirizzamento all’ingresso canonico del catalogo;
- `/foundations/*`: token e fondazioni visuali;
- `/foundations/interaction-states`: selector semantici, composizione e combinazioni reali degli interaction state;
- `/foundations/focus`: indicatore condiviso, composizione, composite owner, focus transfer/restoration e Focus Not Obscured;
- `/foundations/pointer-touch`: capability reali, target effettivi, hit-area compatte, collisioni e lifecycle press/cancel;
- `/foundations/typography`: gerarchia canonica, pesi Fontshare reali, numeri, wrapping, overflow e fallback;
- `/foundations/icons`: scala Tabler, allineamento misurabile, semantica accessibile, loader e lifecycle Motion;
- `/components/*`: primitive condivise e relativi stati;
- `/patterns`: overview delle composizioni operative canoniche, distinta dalla documentazione dei componenti;
- `/patterns/work-queue`: pattern canonico per code operative, gruppi, item ed empty state;
- `/patterns/timeline-event`: pattern canonico per eventi human-readable, dettagli e fallback della cronologia;
- `/patterns/status-presentation`: pattern canonico per tradurre gli stati di dominio in label, tono e contesto umani;
- `/patterns/form-validation`: pattern canonico per label, errori locali, focus e feedback accessibili nei form;
- `/patterns/money`: pattern canonico per lettura, input e variazioni economiche in euro;
- `/patterns/proposal-review`: pattern canonico per comprendere una proposta, confrontarne i dati affidabili e vedere le azioni disponibili;
- `/patterns/contextual-attachment`: pattern canonico per allegare file dal contesto corretto senza esporre riferimenti tecnici;
- `/patterns/invitation`: pattern canonico per presentare, accettare e recuperare gli inviti senza esporre dettagli tecnici;
- `/marketing`: landing Qoovex rappresentativa;
- `/dashboard`: shell e dashboard Qoovex rappresentativa.

La preview marketing compone la dashboard reale di Sirio. I dati sono dimostrativi e non provengono dal runtime prodotto.

## Contratto

- gli import condivisi usano subpath espliciti `@qoovex/ui/components/*`, `hooks/*` e `lib/*`;
- `src/app/globals.css` importa una sola volta `@qoovex/ui/styles/base.css` e dichiara le sorgenti Tailwind dell'app;
- Sirio non contiene copie locali di primitive, provider tema, utility `cn` o hook mobile;
- nessun Prisma, auth, API o servizio prodotto;
- nessuna promessa normativa inventata.

La foundation motion e documentata e provata in `/foundations/motion`: quattro ruoli semantici, inversione/input rapido, fallback reduced-motion e proof CSS senza runtime Motion. Reveal del tema, navigation, overlay Base UI, switch, tab e stati di caricamento restano specimen dei rispettivi componenti e devono applicare lo stesso contratto durante i refactor dedicati.

La foundation interaction-state e provata in `/foundations/interaction-states`: gli alias `qv-*` normalizzano soltanto stati nativi, ARIA e Base UI; la matrice usa primitive reali per mostrare composizione, focus additivo, availability e rapid interaction senza duplicare gli stati in React.

La foundation focus e provata in `/foundations/focus` con navigazione DOM reale da tastiera: outline condiviso, stati composti, delega child/composite, Dialog Base UI con restoration, temi, forced colors e contenitore sticky. Sirio non simula `:focus-visible` in React.

La foundation pointer/touch e provata in `/foundations/pointer-touch`: separa visual size, hit area e spacing; usa controlli reali e Pointer Events per mouse, touch e pen; mostra target compatti allocati senza overlap, press/cancel, input rapido, focus invariato e lo Switch Motion-first come proof di feedback che non modifica la geometria interattiva. Sirio non simula hover o pressed in React.

La foundation typography e provata in `/foundations/typography`: mostra i sei ruoli condivisi, General Sans e l'uso raro di Array, tutti i pesi realmente caricati, cifre proporzionali/tabulari, stringhe ostili, wrap, truncation intenzionale recuperabile e fallback di sistema. La proof non anima metriche tipografiche e non duplica token o loader.

La foundation iconografica e provata in `/foundations/icons`: usa le API Tabler native senza wrapper, misura i ruoli 14/16/20/28px, distingue icon+text, icon-only e leading multilinea, rende espliciti decorative/informative/status, e verifica `currentColor`, forced colors, loader reduced-motion e reversal del chevron Motion. Il glyph non possiede hit area o focus.

## Comandi

```bash
pnpm --filter @qoovex/sirio type-check
pnpm --filter @qoovex/sirio build
```
