# Widgets Layer

Scopo: blocchi compositivi grandi ma riusabili tra piu` view.

Metti qui:
- card complesse, navbar, sidebar, blocchi compositi e shell intermedie;
- composizioni che usano features/entities/shared ma non rappresentano un'intera pagina.

Non mettere qui:
- route entrypoint;
- casi d'uso atomici;
- primitive UI base.

Regole:
- puo` importare da `features`, `entities`, `shared`;
- non puo` importare da `views` o `app`;
- ogni widget deve avere una responsabilita` di composizione chiara.
