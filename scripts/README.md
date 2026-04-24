# Scripts

Scopo: script operativi del monorepo usati per validazioni locali, CI e guardrail automatici.

Metti qui:
- script di check, audit, validazione struttura e quality gate del repo;
- automazioni usate da `package.json` root o dalla CI.

Non mettere qui:
- logica di prodotto;
- script temporanei senza ownership chiara;
- automazioni duplicate gia` coperte da package/app specifici.

Regole:
- uno script = una responsabilita` chiara;
- gli script devono essere safe da eseguire in locale e in CI;
- se uno script introduce una regola stabile del repo, allinea anche docs e Cursor rules.
