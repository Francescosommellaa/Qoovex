import { Button, Container, Section } from "@qoovex/ui";
import styles from "./workspace-navigation.module.css";

const primary = ["Da fare", "Cantieri", "Lavoratori", "Documenti"];

function NavigationSpecimen({ compact = false }: { compact?: boolean }) {
  const items = compact ? primary.filter((item) => item !== "Lavoratori") : primary;
  return (
    <article className={styles.shell}>
      <header><strong>Qoovex</strong><span>{compact ? "Vista lavoratore" : "Vista amministrazione"}</span></header>
      <nav aria-label={compact ? "Navigazione lavoratore" : "Navigazione amministrazione"}>
        {items.map((item, index) => <a aria-current={index === 0 ? "page" : undefined} href="#" key={item}>{item}</a>)}
      </nav>
      <div className={styles.tools}>
        {!compact ? <a className={styles.notification} href="#"><span>Notifiche</span><strong aria-label="3 notifiche non lette">3</strong></a> : null}
        <details><summary>Aggiungi</summary><div>{(compact ? ["File a un documento", "Prova"] : ["Documento", "Cantiere", "Lavoratore", "Prova"]).map((item) => <a href="#" key={item}>{item}</a>)}</div></details>
        <details><summary>Azienda e account</summary><div>{!compact ? <a href="#">Impostazioni</a> : null}<a href="#">Sicurezza</a><button type="button">Esci</button></div></details>
      </div>
      <main><p>Da fare</p><h2>{compact ? "Le tue prossime attività" : "Situazioni da risolvere"}</h2><Button size="sm">Apri prossima azione</Button></main>
    </article>
  );
}

export default function WorkspaceNavigationSpecimenPage() {
  return (
    <main>
      <Section title="Shell e navigazione workspace" description="Le attività quotidiane restano separate da notifiche, creazione e impostazioni.">
        <Container size="wide"><div className={styles.grid}><NavigationSpecimen /><NavigationSpecimen compact /></div></Container>
      </Section>
      <Section tone="muted" title="Comportamento verificabile" description="Quattro destinazioni al massimo, una sola voce corrente e complessità avanzata su richiesta.">
        <Container><ul className={styles.checks}><li>Owner, Admin e Consulente: quattro destinazioni.</li><li>Responsabile e Lavoratore: tre destinazioni.</li><li>Notifiche con conteggio fuori dalla navigazione primaria.</li><li>Menu Aggiungi e account accessibili da tastiera tramite elementi nativi.</li><li>Testo lungo e contenuto ristretto senza terzo livello di navigazione.</li></ul></Container>
      </Section>
    </main>
  );
}
