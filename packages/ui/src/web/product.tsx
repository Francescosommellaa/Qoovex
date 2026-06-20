import type { ReactNode } from "react";
import type { StructureRole } from "@qoovex/types";
import { Badge, Button, NumberField, SelectField, TextAreaField, TextField } from "./primitives";

export interface OperationalPanelProps { eyebrow?: string; title: string; action?: ReactNode; children: ReactNode; className?: string }
export function OperationalPanel({ eyebrow, title, action, children, className = "" }: OperationalPanelProps) {
  return <section className={`qv-panel ${className}`.trim()}><header><div>{eyebrow ? <small>{eyebrow}</small> : null}<h3>{title}</h3></div>{action}</header><div className="qv-panel__body">{children}</div></section>;
}

export interface CalculationTraceProps { title: string; input: string; rule: string; result: string; formula: string; source: string }
export function CalculationTrace({ title, input, rule, result, formula, source }: CalculationTraceProps) {
  return <div className="qv-trace sample-trace"><header><span><small>Calcolo verificabile</small><strong>{title}</strong></span></header><div className="qv-trace__formula"><span className="qv-trace__step"><small>Input</small><b>{input}</b></span><i aria-label="moltiplicato per">×</i><span className="qv-trace__step"><small>Regola</small><b>{rule}</b></span><i aria-label="uguale">=</i><span className="qv-trace__step"><small>Risultato</small><b>{result}</b></span></div><footer><span>{formula}</span><small>{source}</small></footer></div>;
}

export interface QuantityItem { label: string; value: string | number; detail?: string; state?: "theoretical" | "verified" }
export function QuantityStatus({ items }: { items: readonly QuantityItem[] }) {
  return <div className="qv-quantity">{items.map((item) => <div key={item.label} data-theoretical={item.state === "theoretical" || undefined} data-verified={item.state === "verified" || undefined}><small>{item.label}</small><strong data-qv-numeric>{item.value}</strong>{item.detail ? <span>{item.detail}</span> : null}</div>)}</div>;
}

export function CrewTaskCard({ title, quantity, event, priority, done, onToggle }: { title: string; quantity: string; event: string; priority: "alta" | "media" | "bassa"; done: boolean; onToggle: (done: boolean) => void }) {
  return <article className="qv-panel qv-crew-task"><div><Badge tone={priority === "alta" ? "attention" : "neutral"}>{priority}</Badge><h3>{title}</h3><p>{quantity} · {event}</p></div><StatusToggle checked={done} onChange={onToggle} /></article>;
}

function StatusToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return <Button variant={checked ? "secondary" : "primary"} type="button" aria-pressed={checked} onClick={() => onChange(!checked)}>{checked ? "Fatto" : "Segna fatto"}</Button>;
}

export function FreeTextEventIntake({ value, onChange, onSubmit, status, submitLabel = "Struttura evento" }: { value: string; onChange: (value: string) => void; onSubmit: () => void; status?: string; submitLabel?: string }) {
  return <form className="qv-panel qv-panel__body" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><TextAreaField label="Descrivi l’evento" value={value} onChange={(event) => onChange(event.currentTarget.value)} /><Button type="submit">{submitLabel}</Button><span role="status">{status}</span></form>;
}

export function RuleEditor({ quantity, margin, onQuantityChange, onMarginChange, onSubmit, submitLabel = "Salva regola" }: { quantity: number; margin: string; onQuantityChange: (value: number) => void; onMarginChange: (value: string) => void; onSubmit: () => void; submitLabel?: string }) {
  return <form className="qv-panel qv-panel__body qv-form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><NumberField label="Quantità base" value={quantity} onChange={(event) => onQuantityChange(event.currentTarget.valueAsNumber)} /><SelectField label="Margine" value={margin} onChange={(event) => onMarginChange(event.currentTarget.value)}><option value="10">10%</option><option value="15">15%</option></SelectField><Button type="submit">{submitLabel}</Button></form>;
}

export function SupportSessionBanner({ structure, reason, expiresAt, onClose }: { structure: string; reason: string; expiresAt: string; onClose: () => void }) {
  return <aside className="qv-support-banner" aria-label="Sessione supporto attiva"><div><small>Supporto Qoovex attivo · {expiresAt}</small><strong>{structure}</strong><span>{reason}</span></div><Button variant="secondary" type="button" onClick={onClose}>Chiudi supporto</Button></aside>;
}

export interface TeamMember { id: string; name: string; email: string; role: StructureRole }
export function TeamAccessPanel({ members, canRevoke, onRevoke }: { members: readonly TeamMember[]; canRevoke: (role: StructureRole) => boolean; onRevoke: (id: string) => void }) {
  return <OperationalPanel eyebrow="Accessi" title="Persone e reparti"><div className="qv-team-list">{members.map((member) => <div className="qv-team-row" key={member.id}><div><strong>{member.name}</strong><span>{member.email}</span></div><Badge>{member.role}</Badge>{canRevoke(member.role) ? <Button variant="secondary" type="button" onClick={() => onRevoke(member.id)}>Revoca</Button> : null}</div>)}</div></OperationalPanel>;
}

export function InvitationComposer({ email, role, onEmailChange, onRoleChange, onSubmit }: { email: string; role: Exclude<StructureRole, "ADMIN">; onEmailChange: (value: string) => void; onRoleChange: (value: Exclude<StructureRole, "ADMIN">) => void; onSubmit: () => void }) {
  return <OperationalPanel eyebrow="Invito" title="Aggiungi al reparto"><form className="qv-form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><TextField type="email" label="Email" value={email} onChange={(event) => onEmailChange(event.currentTarget.value)} /><SelectField label="Ruolo" value={role} onChange={(event) => onRoleChange(event.currentTarget.value as Exclude<StructureRole, "ADMIN">)}><option value="HEAD_OF_HALL">Capo sala</option><option value="HEAD_CHEF">Capo cucina</option><option value="KITCHEN_CREW">Brigata</option></SelectField><Button type="submit">Invia invito</Button></form></OperationalPanel>;
}

export function SupportAccessPanel({ code, reason, onCodeChange, onReasonChange, onSubmit }: { code: string; reason: string; onCodeChange: (value: string) => void; onReasonChange: (value: string) => void; onSubmit: () => void }) {
  return <OperationalPanel eyebrow="Super Admin" title="Apri supporto"><form className="qv-form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><TextField label="Codice struttura" value={code} onChange={(event) => onCodeChange(event.currentTarget.value)} /><TextField label="Motivo" value={reason} onChange={(event) => onReasonChange(event.currentTarget.value)} /><Button type="submit">Apri sessione</Button></form></OperationalPanel>;
}

export interface NavigationItem { id: string; label: string; href: string; visible: boolean }
export function AdaptiveAppShell({ current, navigation, support, children }: { current: string; navigation: readonly NavigationItem[]; support?: ReactNode; children: ReactNode }) {
  return <div className="qv-role-view">{support}<nav aria-label="Area operativa">{navigation.filter((item) => item.visible).map((item) => <a key={item.id} href={item.href} aria-current={current === item.id ? "page" : undefined}>{item.label}</a>)}</nav><main>{children}</main></div>;
}

export function OperationalAssistantLauncher({ onOpen }: { onOpen: () => void }) { return <Button type="button" onClick={onOpen}>Chiedi a Qoovex</Button>; }
export function AssistantPanel(props: OperationalPanelProps) { return <OperationalPanel {...props} />; }

type NamedPanelProps = Omit<OperationalPanelProps, "eyebrow"> & { eyebrow?: string };
export function ExtractionReview(props: NamedPanelProps) { return <OperationalPanel eyebrow="Estrazione" {...props} />; }
export function MissingDataPrompt(props: NamedPanelProps) { return <OperationalPanel eyebrow="Dato mancante" {...props} />; }
export function RuleLibrary(props: NamedPanelProps) { return <OperationalPanel eyebrow="Regole" {...props} />; }
export function PreServiceDashboard(props: NamedPanelProps) { return <OperationalPanel eyebrow="Pre-Service" {...props} />; }
export function KitchenBriefing(props: NamedPanelProps) { return <OperationalPanel eyebrow="Cucina" {...props} />; }
export function ServiceBriefing(props: NamedPanelProps) { return <OperationalPanel eyebrow="Sala" {...props} />; }
export function CriticalIssues(props: NamedPanelProps) { return <OperationalPanel eyebrow="Criticità" {...props} />; }
export function FutureEventPlanner(props: NamedPanelProps) { return <OperationalPanel eyebrow="Eventi futuri" {...props} />; }
export function PreparationPlan(props: NamedPanelProps) { return <OperationalPanel eyebrow="Piano preparazioni" {...props} />; }
export function PreparationProposal(props: NamedPanelProps) { return <OperationalPanel eyebrow="Proposta" {...props} />; }
export function ChefApprovalPanel(props: NamedPanelProps) { return <OperationalPanel eyebrow="Decisione chef" {...props} />; }
export function PhysicalVerification(props: NamedPanelProps) { return <OperationalPanel eyebrow="Verifica fisica" {...props} />; }
export function ProductionCompletionSheet(props: NamedPanelProps) { return <OperationalPanel eyebrow="Produzione" {...props} />; }
export function MinimalServiceReference(props: NamedPanelProps) { return <OperationalPanel eyebrow="Servizio" {...props} />; }
