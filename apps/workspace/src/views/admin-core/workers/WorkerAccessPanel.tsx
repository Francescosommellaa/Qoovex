"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconLink, IconLinkOff, IconMail } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldError, FieldLabel } from "@qoovex/ui/components/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import type { WorkerUserLinkResponse } from "@qoovex/types";
import { submitJson } from "../admin-api-client";

export function WorkerAccessPanel({ workerId, workerEmail, links, options, canManage }: { workerId: string; workerEmail: string | null | undefined; links: WorkerUserLinkResponse[]; options: Array<{ id: string; label: string; email: string }>; canManage: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invited, setInvited] = useState(false);
  async function link(formData: FormData) { setPending(true); setError(null); try { await submitJson("/api/resource-assignments/worker-user-links", "POST", { workerId, userId: formData.get("userId") }); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Collegamento non riuscito."); } finally { setPending(false); } }
  async function unlink(linkId: string) { setPending(true); setError(null); try { await submitJson(`/api/resource-assignments/worker-user-links/${linkId}`, "DELETE"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Rimozione non riuscita."); } finally { setPending(false); } }
  async function invite() { if (!workerEmail) return; setPending(true); setError(null); try { await submitJson("/api/organization/invitations", "POST", { email: workerEmail, role: "WORKER", workerId }); setInvited(true); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Invito non riuscito."); } finally { setPending(false); } }

  return <div className="grid gap-3">{error ? <FieldError>{error}</FieldError> : null}{invited ? <p className="text-sm text-success">Invito inviato. Il collegamento verra creato all'accettazione.</p> : null}{links.length ? <ul className="grid gap-2">{links.map((item) => <li className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between" key={item.id}><div className="min-w-0"><strong className="block truncate text-sm">{item.userLabel}</strong><span className="block truncate text-xs text-muted-foreground">{item.userEmail}</span></div>{canManage ? <Button disabled={pending} onClick={() => void unlink(item.id)} size="sm" type="button" variant="outline"><IconLinkOff aria-hidden="true" />Scollega</Button> : null}</li>)}</ul> : <div className="rounded-lg border border-dashed p-4"><p className="text-sm font-medium">Nessun account collegato</p><p className="mt-1 text-sm text-muted-foreground">Un invito WORKER creato da questo profilo lo colleghera automaticamente all'accettazione.</p></div>}{canManage && !links.length && options.length ? <form action={link} className="grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"><Field><FieldLabel htmlFor={`worker-access-${workerId}`}>Account WORKER gia attivo</FieldLabel><Select items={options.map((item) => ({ value: item.id, label: `${item.label} · ${item.email}` }))} name="userId" required><SelectTrigger id={`worker-access-${workerId}`}><SelectValue placeholder="Seleziona account" /></SelectTrigger><SelectContent><SelectGroup>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label} · {item.email}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Button disabled={pending} type="submit"><IconLink aria-hidden="true" />Collega</Button></form> : null}{canManage && !links.length && workerEmail ? <Button className="w-fit" disabled={pending || invited} onClick={() => void invite()} size="sm" type="button" variant="outline"><IconMail aria-hidden="true" />{pending ? "Invio..." : invited ? "Invito inviato" : "Invita come lavoratore"}</Button> : null}</div>;
}
