# MFA recovery API

Il recupero verifica prima l'email. `OWNER`, `PLATFORM_ADMIN` e account senza membership ricevono un'autorizzazione self-service; un `COLLABORATOR` richiede inoltre la decisione MFA di un `OWNER` attivo della stessa Azienda.

Una richiesta approvata autorizza una sola sostituzione TOTP entro 30 minuti. MFA resta attiva e il workspace resta bloccato fino alla conferma del nuovo fattore.
