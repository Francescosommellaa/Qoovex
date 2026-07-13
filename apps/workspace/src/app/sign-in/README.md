# Sign-in route

Pagina pubblica di accesso workspace.

Usa NextAuth Credentials tramite `signIn("credentials")` e callback URL interno sanitizzato. Espone i percorsi pubblici per reinviare la verifica email e recuperare la password. Non esegue query DB direttamente.
