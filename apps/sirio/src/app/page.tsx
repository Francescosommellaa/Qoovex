import { Badge, Button, Card, Container, Section } from "@qoovex/ui";

const prudentCopy = [
  "Stato documentale",
  "Documenti da verificare",
  "Scadenze registrate",
  "Pacchetto pronto per revisione",
  "Condiviso in lettura",
];

const avoidedCopy = [
  "Sei a norma",
  "Conformita garantita",
  "Documento certificato",
  "Validita legale garantita",
  "Lavoratore abilitato automaticamente",
];

export default function SirioPage() {
  return (
    <main className="sirio-page">
      <header className="sirio-hero">
        <Container>
          <h1>Sirio — Qoovex Design System</h1>
          <p>
            Showcase tecnico delle primitive condivise. Sirio mostra componenti e token, ma la
            fonte canonica resta `packages/ui`.
          </p>
        </Container>
      </header>

      <Section title="Token base">
        <Container>
          <div className="token-grid">
            {["background", "surface", "accent", "attention", "muted", "text"].map((token) => (
              <Card key={token}>
                <div className={`token-swatch token-swatch--${token}`} />
                <h3>{token}</h3>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section title="Bottoni e card" tone="muted">
        <Container>
          <div className="component-grid">
            <Card>
              <h3>Button</h3>
              <div className="sample-actions">
                <Button>Primario</Button>
                <Button variant="secondary">Secondario</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </Card>
            <Card tone="accent">
              <h3>Card accent</h3>
              <p className="muted">Superficie per messaggi operativi o riepiloghi neutri.</p>
            </Card>
            <Card tone="attention">
              <h3>Card attention</h3>
              <p className="muted">Superficie per contenuti che richiedono attenzione.</p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section title="Badge e stati generici">
        <Container>
          <Card>
            <div className="sample-badges">
              <Badge variant="present">Presente</Badge>
              <Badge variant="missing">Mancante</Badge>
              <Badge variant="expired">Scaduto</Badge>
              <Badge variant="review">Da verificare</Badge>
              <Badge variant="ready">Pronto per revisione</Badge>
            </div>
          </Card>
        </Container>
      </Section>

      <Section title="Copy prudente" tone="muted">
        <Container>
          <div className="component-grid">
            <Card>
              <h3>Da usare</h3>
              <ul className="copy-list">
                {prudentCopy.map((copy) => (
                  <li key={copy}>{copy}</li>
                ))}
              </ul>
            </Card>
            <Card tone="attention">
              <h3>Copy da evitare</h3>
              <ul className="copy-list">
                {avoidedCopy.map((copy) => (
                  <li key={copy}>{copy}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3>Nota</h3>
              <p className="muted">
                Ricerca, preset e contenuti validati saranno forniti dal team Qoovex. Sirio non li
                inventa e non li conserva.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </main>
  );
}
