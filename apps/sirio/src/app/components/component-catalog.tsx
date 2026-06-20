"use client";

import { ArrowLeft, ArrowRight, DeviceMobile, DeviceTablet, Desktop, MagnifyingGlass, Warning, X } from "@phosphor-icons/react";
import {
  AdaptiveAppShell, AssistantPanel, Badge, Button, CalculationTrace, ChefApprovalPanel,
  CrewTaskCard, CriticalIssues, ExtractionReview, FreeTextEventIntake, FutureEventPlanner,
  InlineAlert, KitchenBriefing, MinimalServiceReference, MissingDataPrompt, NumberField,
  OperationalAssistantLauncher, OperationalPanel, PhysicalVerification, PreparationPlan,
  PreparationProposal, PreServiceDashboard, ProductionCompletionSheet, QuantityStatus,
  RuleEditor, RuleLibrary, SelectField, ServiceBriefing, SupportAccessPanel,
  SupportSessionBanner, TeamAccessPanel, InvitationComposer, TextField,
} from "@qoovex/ui/web";
import { useDeferredValue, useState } from "react";

import { catalog, futureEvents, groups, preparationFixture as prep, type CatalogItem } from "../event-data";

type Device = "phone" | "tablet" | "desktop";

function Trace() {
  return <CalculationTrace title={prep.item} input={`${prep.children} bambini`} rule="1 cad. + 10%" result={String(prep.required)} formula={prep.formula} source="Regola v3 · Comunioni · arrotonda per eccesso" />;
}

function EventList({ selected, onSelect }: { selected: boolean; onSelect: () => void }) {
  return <div className="sample-future">{futureEvents.map(([day, event, detail, issue]) => <button type="button" key={event} onClick={onSelect} data-selected={selected && event === "Comunione Rossi"}><time>{day}</time><span><b>{event}</b><small>{detail}</small></span><em>{issue}</em></button>)}</div>;
}

function Specimen({ item }: { item: CatalogItem }) {
  const [changed, setChanged] = useState(false);
  const [open, setOpen] = useState(item.id === "assistant-panel");
  const [intake, setIntake] = useState("Domani Comunione Rossi, 70 adulti e 22 bambini. Menu bambini con cotoletta. Un ospite senza lattosio.");
  const [quantity, setQuantity] = useState(1);
  const [margin, setMargin] = useState("10");
  const [email, setEmail] = useState("marco@ristorante.it");
  const [role, setRole] = useState<"HEAD_OF_HALL" | "HEAD_CHEF" | "KITCHEN_CREW">("KITCHEN_CREW");
  const [supportCode, setSupportCode] = useState("QVX-ROSSI24");
  const [supportReason, setSupportReason] = useState("Verifica accesso capo cucina");

  if (item.id === "assistant-launcher" || item.id === "assistant-panel") return <div className="sample-assistant"><OperationalAssistantLauncher onOpen={() => setOpen(true)} />{open ? <div role="dialog" aria-modal="true" aria-label="Assistente operativo"><AssistantPanel eyebrow="Assistente operativo" title="Quante cotolette servono domani?" action={<Button variant="secondary" aria-label="Chiudi assistente" onClick={() => setOpen(false)}><X aria-hidden="true" /></Button>}><div role="status"><strong>Prepara {prep.required} cotolette.</strong><p>{prep.event}: {prep.children} bambini.</p><Trace /></div></AssistantPanel></div> : <p>L’assistente resta chiuso finché serve.</p>}</div>;
  if (item.id === "team-access") return <TeamAccessPanel members={[{ id: "1", name: "Franco Bianchi", email: "direzione@rossi.it", role: "ADMIN" }, { id: "2", name: "Elena Sala", email: "sala@rossi.it", role: "HEAD_OF_HALL" }, { id: "3", name: "Marco Chef", email: "chef@rossi.it", role: "HEAD_CHEF" }, { id: "4", name: "Luca", email: "luca@rossi.it", role: "KITCHEN_CREW" }]} canRevoke={(memberRole) => memberRole !== "ADMIN"} onRevoke={() => setChanged(true)} />;
  if (item.id === "invitation-composer") return <InvitationComposer email={email} role={role} onEmailChange={setEmail} onRoleChange={setRole} onSubmit={() => setChanged(true)} />;
  if (item.id === "support-access") return <SupportAccessPanel code={supportCode} reason={supportReason} onCodeChange={setSupportCode} onReasonChange={setSupportReason} onSubmit={() => setChanged(true)} />;
  if (item.id === "support-banner") return <SupportSessionBanner structure="Villa Rossi" reason="Verifica accesso capo cucina" expiresAt="29 min" onClose={() => setChanged(true)} />;

  if (item.id === "free-text-intake") return <FreeTextEventIntake value={intake} onChange={setIntake} onSubmit={() => setChanged(true)} submitLabel={changed ? "Evento strutturato" : "Struttura evento"} status={changed ? "8 dati estratti, 1 dato da verificare." : ""} />;
  if (item.id === "extraction-review") return <ExtractionReview title="Comunione Rossi"><div className="sample-extraction">{[["Data", "Domani"], ["Bambini", "22"], ["Orario torta", changed ? "Verificato" : "Non trovato"], ["Sala", changed ? "Verificato" : "Giardino?"]].map(([label, value]) => <Button variant="secondary" key={label} onClick={() => setChanged(true)}><span><small>{label}</small><b>{value}</b></span></Button>)}</div></ExtractionReview>;
  if (item.id === "missing-data") return <MissingDataPrompt title="Quante cotolette usate per bambino?"><p>Senza questa regola non posso calcolare la preparazione.</p><Button onClick={() => setChanged(true)} disabled={changed}>{changed ? "Regola salvata: 1 cad. + 10%" : "Salva 1 cad. + 10%"}</Button></MissingDataPrompt>;
  if (item.id === "rule-library") return <RuleLibrary title="Regole interne"><div className="sample-list">{[["Cotolette bambini", "Comunioni", "v3"], ["Riso", "Menu Rossi", "70 g"], ["Patate al forno", "Generale", "180 g"]].map((row) => <Button variant="secondary" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><small>{row[2]}</small></Button>)}</div></RuleLibrary>;
  if (item.id === "rule-editor" || item.id === "fields") return <RuleEditor quantity={quantity} margin={margin} onQuantityChange={setQuantity} onMarginChange={setMargin} onSubmit={() => setChanged(true)} submitLabel={changed ? "Regola salvata" : "Salva regola"} />;
  if (item.id === "calculation-trace") return <Trace />;

  if (item.id === "pre-service-dashboard") return <PreServiceDashboard title="Oggi → lunedì"><EventList selected={changed} onSelect={() => setChanged(true)} /></PreServiceDashboard>;
  if (item.id === "future-planner") return <FutureEventPlanner title="Eventi futuri"><EventList selected={changed} onSelect={() => setChanged(true)} /></FutureEventPlanner>;
  if (item.id === "kitchen-briefing") return <KitchenBriefing eyebrow="BRIEFING CUCINA · DOMANI" title="Comunione Rossi"><ul><li><b>92</b> ospiti totali</li><li><b>22</b> menu bambini</li><li><b>1</b> senza lattosio</li><li><b>3</b> preparazioni da chiudere</li></ul></KitchenBriefing>;
  if (item.id === "service-briefing") return <ServiceBriefing eyebrow="BRIEFING SALA · DOMANI" title="Comunione Rossi"><ul><li><b>12:30</b> arrivo ospiti</li><li><b>22</b> bambini · tavoli 8–10</li><li><b>1</b> senza lattosio · tavolo 4</li><li><b>15:40</b> torta in giardino</li></ul></ServiceBriefing>;
  if (item.id === "critical-issues" || item.id === "feedback") return <CriticalIssues title="Problemi da risolvere"><div className="sample-issues"><InlineAlert tone="critical" icon={<Warning aria-hidden="true" />} title="Dolce senza lattosio">Richiesti 3 · prodotti 0</InlineAlert><InlineAlert icon={<Warning aria-hidden="true" />} title="Orario torta Crespi">Dato mancante</InlineAlert></div></CriticalIssues>;

  if (item.id === "preparation-plan") return <PreparationPlan title={prep.item}><QuantityStatus items={[{ label: "Richiesto", value: prep.required }, { label: "Approvato", value: prep.approved }, { label: "Prodotto", value: prep.produced }]} /></PreparationPlan>;
  if (item.id === "preparation-proposal") return <PreparationProposal title={prep.item}><Badge tone="attention">Da valutare</Badge><Trace /><Button onClick={() => setChanged(true)}>{changed ? "Proposta aperta" : "Valuta proposta"}</Button></PreparationProposal>;
  if (item.id === "chef-approval") return <ChefApprovalPanel title={prep.item}><div className="qv-form-grid"><NumberField label="Quantità approvata" defaultValue={prep.approved} /><SelectField label="Assegna a" defaultValue="marco"><option value="marco">Marco</option><option value="elena">Elena</option></SelectField><Button onClick={() => setChanged(true)} disabled={changed}>{changed ? "Approvate 35 cotolette" : "Approva preparazione"}</Button></div></ChefApprovalPanel>;
  if (item.id === "quantity-status") return <QuantityStatus items={[{ label: "Richiesto", value: prep.required }, { label: "Approvato", value: prep.approved }, { label: "Prodotto", value: prep.produced }, { label: "Assegnato", value: prep.assigned }, { label: "Extra teorico", value: prep.theoretical, detail: "Da verificare", state: "theoretical" }, { label: "Verificato", value: "Non ancora" }]} />;
  if (item.id === "physical-verification") return <PhysicalVerification title="Cotolette disponibili"><form onSubmit={(event) => { event.preventDefault(); setChanged(true); }}><QuantityStatus items={[{ label: "Disponibili teoriche", value: 38, detail: "Non usare come conteggio fisico", state: "theoretical" }]} /><NumberField label="Quantità contata" placeholder="Inserisci conteggio" /><Button type="submit">{changed ? "Conteggio verificato" : "Registra verifica"}</Button></form></PhysicalVerification>;
  if (item.id === "crew-task" || item.id === "status") return <CrewTaskCard title={prep.item} quantity={`${prep.approved} approvate`} event="Comunioni di domani" priority="alta" done={changed} onToggle={setChanged} />;
  if (item.id === "production-completion" || item.id === "overlays") return <ProductionCompletionSheet title={prep.item}><form className="qv-form-grid" onSubmit={(event) => { event.preventDefault(); setChanged(true); }}><NumberField label="Quantità prodotta" defaultValue={prep.produced} /><TextField label="Posizione" defaultValue={prep.location} /><TextField label="Nota opzionale" /><Button type="submit">{changed ? "Produzione registrata" : "Registra produzione"}</Button></form></ProductionCompletionSheet>;
  if (item.id === "minimal-service") return <MinimalServiceReference title="Comunione Rossi"><h3>Cotoletta bambini · 13:25</h3><InlineAlert icon={<Warning aria-hidden="true" />} title="1 senza lattosio">Tavolo 4 · posto 3</InlineAlert><p>Nessun aggiornamento richiesto.</p></MinimalServiceReference>;

  if (item.id === "adaptive-shell") return <AdaptiveAppShell current="prepare" navigation={[{ id: "prepare", label: "Prepara", href: "#prepare", visible: true }, { id: "events", label: "Eventi", href: "#events", visible: true }, { id: "rules", label: "Regole", href: "#rules", visible: true }, { id: "direction", label: "Direzione", href: "#direction", visible: false }]}><p>Domani · 3 preparazioni da verificare</p></AdaptiveAppShell>;
  if (item.id === "adaptive-list") return <OperationalPanel title="Preparazioni"><div className="sample-list">{[["Cotolette bambini", "35", "Approvato"], ["Patate", "18 kg", "Mancano 6 kg"], ["Dolce no lattosio", "3", "Critico"]].map((row) => <Button variant="secondary" key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><small>{row[2]}</small></Button>)}</div></OperationalPanel>;
  return <div className="sample-primitives"><Button onClick={() => setChanged(true)}>{changed ? "Azione completata" : item.name}</Button><Button variant="secondary">Secondaria</Button><span role="status">{changed ? "Operazione completata." : ""}</span></div>;
}

export function ComponentCatalog() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string>("Tutti");
  const [device, setDevice] = useState<Device>("phone");
  const deferredQuery = useDeferredValue(query.toLocaleLowerCase("it"));
  const visible = catalog.filter((item) => (group === "Tutti" || item.group === group) && `${item.name} ${item.purpose}`.toLocaleLowerCase("it").includes(deferredQuery));

  return <div className="catalog-page">
    <header className="catalog-hero"><p className="eyebrow">Sirio / Componenti canonici</p><h1>Dal dato.<br />Alla decisione.</h1><p>Componenti web condivisi da @qoovex/ui, validati con fixture realistiche prima degli adattatori native.</p></header>
    <div className="catalog-toolbar" aria-label="Filtri catalogo"><label className="search-field"><MagnifyingGlass aria-hidden="true" /><span className="visually-hidden">Cerca componente</span><input type="search" placeholder="Cerca componente" value={query} onChange={(event) => setQuery(event.target.value)} /></label><div className="group-filter" aria-label="Filtra per gruppo">{["Tutti", ...groups].map((value) => <button type="button" key={value} aria-pressed={group === value} onClick={() => setGroup(value)}>{value}</button>)}</div><div className="device-switcher" aria-label="Viewport specimen">{(["phone", "tablet", "desktop"] as const).map((value) => <button type="button" key={value} aria-pressed={device === value} onClick={() => setDevice(value)}>{value === "phone" ? <DeviceMobile aria-hidden="true" /> : value === "tablet" ? <DeviceTablet aria-hidden="true" /> : <Desktop aria-hidden="true" />}<span>{value === "phone" ? "Phone" : value === "tablet" ? "Tablet" : "Desktop"}</span></button>)}</div></div>
    <div className="catalog-layout"><aside className="catalog-index"><p>{visible.length} componenti</p><nav aria-label="Indice componenti">{visible.map((item) => <a key={item.id} href={`#${item.id}`}>{item.name}</a>)}</nav></aside><div className="catalog-list" aria-live="polite">{visible.length ? visible.map((item, index) => <section className="component-section" id={item.id} key={item.id}><header><div><span>{item.group}</span><h2>{item.name}</h2><p>{item.purpose}</p></div><code>Web / @qoovex/ui</code></header><div className="component-body"><div className="specimen-wrap" data-device={device}><div className="specimen-label"><span>{device}</span><small>{device === "phone" ? "390 × 844" : device === "tablet" ? "768 × 1024" : "1440 × 900"}</small></div><div className="specimen-canvas"><Specimen item={item} /></div></div><dl className="component-notes"><div><dt>Anatomia</dt><dd>{item.anatomy}</dd></div><div><dt>Varianti</dt><dd>{item.variants}</dd></div><div><dt>Accessibilità</dt><dd>{item.accessibility}</dd></div></dl></div><footer><a className={index === 0 ? "disabled" : ""} href={index === 0 ? `#${item.id}` : `#${visible[index - 1]?.id}`} aria-disabled={index === 0}><ArrowLeft aria-hidden="true" /> Precedente</a><a className={index === visible.length - 1 ? "disabled" : ""} href={index === visible.length - 1 ? `#${item.id}` : `#${visible[index + 1]?.id}`} aria-disabled={index === visible.length - 1}>Successivo <ArrowRight aria-hidden="true" /></a></footer></section>) : <div className="empty-state"><h2>Nessun componente trovato</h2><p>Modifica la ricerca o mostra tutti i gruppi.</p><button type="button" onClick={() => { setQuery(""); setGroup("Tutti"); }}>Azzera filtri</button></div>}</div></div>
  </div>;
}
