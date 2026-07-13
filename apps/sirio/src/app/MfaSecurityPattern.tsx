import { Alert, Button, Card, Field, Input, LoadingState, Panel, Status } from "@qoovex/ui";

export function MfaSecurityPattern() {
  return (
    <div className="mfa-pattern" aria-label="Specimen sicurezza account e recupero MFA">
      <div className="mfa-pattern__grid">
        <Card>
          <div className="mfa-pattern__heading">
            <div>
              <p className="mfa-pattern__eyebrow">Accesso al workspace</p>
              <h3>Conferma MFA</h3>
            </div>
            <Status tone="warning">Conferma richiesta</Status>
          </div>
          <p className="muted">Inserisci il codice dell&apos;app Authenticator oppure un codice di recupero.</p>
          <Field htmlFor="mfa-gate-code" label="Codice MFA" description="Sei cifre oppure un codice di recupero monouso.">
            <Input autoComplete="one-time-code" id="mfa-gate-code" inputMode="numeric" placeholder="123456" />
          </Field>
          <div className="mfa-pattern__actions">
            <Button>Apri il workspace</Button>
            <Button variant="ghost">Non hai piu accesso ai codici?</Button>
          </div>
        </Card>

        <Card tone="info">
          <div className="mfa-pattern__heading">
            <div>
              <p className="mfa-pattern__eyebrow">Primo enrollment</p>
              <h3>Proteggi l&apos;account</h3>
            </div>
            <Status tone="info">Email verificata</Status>
          </div>
          <Alert title="Controlla la posta" tone="info">Il codice per iniziare la configurazione scade tra 10 minuti.</Alert>
          <Field htmlFor="mfa-email-code" label="Codice ricevuto via email">
            <Input autoComplete="one-time-code" id="mfa-email-code" inputMode="numeric" placeholder="000000" />
          </Field>
          <div className="mfa-pattern__actions">
            <Button>Continua</Button>
            <Button disabled variant="secondary">Invio in corso</Button>
          </div>
        </Card>
      </div>

      <Panel>
        <div className="mfa-pattern__heading">
          <div>
            <p className="mfa-pattern__eyebrow">Recupero autonomo</p>
            <h3>In attesa dell&apos;OWNER</h3>
          </div>
          <Status tone="warning">Approvazione richiesta</Status>
        </div>
        <p>Hai verificato la tua email. Un OWNER dell&apos;Azienda deve approvare la sostituzione del fattore entro 30 minuti.</p>
        <Alert title="Il workspace resta protetto" tone="warning">
          MFA non viene disattivata. Dopo l&apos;approvazione dovrai configurare un nuovo fattore e accedere di nuovo.
        </Alert>
      </Panel>

      <div className="mfa-pattern__grid">
        <Card>
          <div className="mfa-pattern__heading">
            <div>
              <p className="mfa-pattern__eyebrow">Inbox OWNER</p>
              <h3>Richieste da controllare</h3>
            </div>
            <Status tone="danger">2 richieste</Status>
          </div>
          <div className="mfa-pattern__request-list">
            <article className="mfa-pattern__request">
              <strong className="mfa-pattern__email">capocantiere.con.nome.molto.lungo@example-construction.test</strong>
              <span>Ruolo SITE_MANAGER · scade tra 18 minuti</span>
            </article>
            <article className="mfa-pattern__request">
              <strong>consulente@example.test</strong>
              <span>Ruolo SAFETY_CONSULTANT · scade tra 24 minuti</span>
            </article>
          </div>
          <Field htmlFor="owner-current-factor" label="Il tuo fattore MFA" description="La decisione richiede il fattore corrente dell'OWNER.">
            <Input autoComplete="one-time-code" id="owner-current-factor" inputMode="numeric" />
          </Field>
          <div className="mfa-pattern__actions">
            <Button>Approva</Button>
            <Button variant="danger">Rifiuta</Button>
          </div>
        </Card>

        <Card tone="warning">
          <p className="mfa-pattern__eyebrow">Errori e recupero</p>
          <h3>Troppi tentativi</h3>
          <Alert title="Riprova tra qualche minuto" tone="danger">
            Il limite protegge il fattore corrente. Nessun codice o secret viene registrato nell&apos;audit.
          </Alert>
          <Field error="Codice scaduto o non valido." htmlFor="mfa-error-code" label="Codice MFA">
            <Input aria-invalid="true" id="mfa-error-code" value="000000" readOnly />
          </Field>
          <Button variant="secondary">Richiedi un nuovo codice</Button>
        </Card>
      </div>

      <div className="mfa-pattern__grid">
        <LoadingState label="Verifica della richiesta MFA in corso" />
        <Card>
          <p className="mfa-pattern__eyebrow">Configurazione completata</p>
          <h3>Conserva i codici di recupero</h3>
          <Alert title="Verranno mostrati una sola volta" tone="positive">
            Il cambio revoca tutte le sessioni. Dopo aver salvato i codici dovrai accedere nuovamente.
          </Alert>
          <pre className="mfa-pattern__codes">Q7M2K-8R4TP{"\n"}C6N9H-2W5XZ{"\n"}F3J8P-7K4MV</pre>
          <Button>Ho salvato i codici</Button>
        </Card>
      </div>
    </div>
  );
}
