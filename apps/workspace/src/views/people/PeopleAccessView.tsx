"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconClock, IconKey, IconMail, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import type { OrganizationRole } from "@qoovex/types";
import { submitJson } from "@/views/admin-core/admin-api-client";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Proprietario", ADMIN: "Amministratore", SAFETY_CONSULTANT: "Consulente sicurezza", SITE_MANAGER: "Responsabile cantiere", WORKER: "Lavoratore",
};

interface AccessMember {
  id: string;
  role: OrganizationRole;
  revokedAt: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null; workerUserLinks: Array<{ worker: { id: string; displayName: string } }>; jobSiteUserAssignments: Array<{ jobSite: { id: string; name: string } }> };
}
interface AccessInvitation { id: string; email: string; role: Exclude<OrganizationRole, "OWNER">; workerId: string | null; expiresAt: string; revokedAt: string | null; worker: { displayName: string } | null }
interface AccessOverview {
  activeUsers: AccessMember[];
  revokedUsers: AccessMember[];
  pendingInvitations: AccessInvitation[];
  expiredInvitations: AccessInvitation[];
  revokedInvitations: AccessInvitation[];
  incomplete: Array<{ kind: "WORKER_LINK" | "SITE_MANAGER_SCOPE"; membershipId: string; userId: string; label: string; message: string }>;
}

function personName(member: AccessMember) {
  return `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim() || member.user.email;
}

function AccessRevokeButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function revoke() {
    setPending(true);
    try { await submitJson("/api/organization/members", "DELETE", { memberId }); router.refresh(); }
    finally { setPending(false); }
  }
  return <Button disabled={pending} onClick={() => void revoke()} size="sm" type="button" variant="outline">{pending ? "Revoca..." : "Revoca accesso"}</Button>;
}

function InvitationList({ invitations, empty, canManage }: { invitations: AccessInvitation[]; empty: string; canManage: boolean }) {
  const router = useRouter();
  async function revoke(id: string) { await submitJson("/api/organization/invitations", "DELETE", { invitationId: id }); router.refresh(); }
  if (!invitations.length) return <p className="py-4 text-sm text-muted-foreground">{empty}</p>;
  return <ul className="divide-y divide-border">{invitations.map((invitation) => <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" key={invitation.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{invitation.email}</p><p className="mt-1 text-xs text-muted-foreground">{roleLabels[invitation.role]}{invitation.worker ? ` · ${invitation.worker.displayName}` : ""}</p></div>{canManage && !invitation.revokedAt ? <Button onClick={() => void revoke(invitation.id)} size="sm" type="button" variant="outline">Revoca</Button> : null}</li>)}</ul>;
}

export function PeopleAccessView({ overview, canManage, canRevoke, invitableRoles }: { overview: AccessOverview; canManage: boolean; canRevoke: boolean; invitableRoles: Array<Exclude<OrganizationRole, "OWNER" | "WORKER">> }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Accessi" description="Account, appartenenza all'azienda, ruoli e inviti. Le assegnazioni ai cantieri restano nell'area dedicata." action={canManage && invitableRoles.length ? <Link className={buttonVariants()} data-link="plain" href="/people/access/invite"><IconUserPlus aria-hidden="true" />Invita persona</Link> : undefined} />

      {overview.incomplete.length ? <Card className="border-warning/40" size="sm"><CardHeader><IconAlertTriangle aria-hidden="true" className="size-5 text-warning" /><CardTitle><h2>Configurazioni incomplete</h2></CardTitle><CardDescription>Questi account possono avere un ruolo attivo ma non ancora un ambito operativo completo.</CardDescription><CardAction><Badge variant="warning">{overview.incomplete.length}</Badge></CardAction></CardHeader><CardContent><ul className="divide-y divide-border">{overview.incomplete.map((item) => <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" key={`${item.kind}-${item.membershipId}`}><div><p className="text-sm font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.message}</p></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} data-link="plain" href={item.kind === "SITE_MANAGER_SCOPE" ? "/people/assignments" : "/workers?access=ACCESS_SETUP_REQUIRED"}>Completa</Link></li>)}</ul></CardContent></Card> : null}

      <Card size="sm"><CardHeader className="border-b"><CardTitle><h2>Utenti attivi</h2></CardTitle><CardDescription>Account che possono accedere all'azienda.</CardDescription><CardAction><Badge variant="outline">{overview.activeUsers.length}</Badge></CardAction></CardHeader><CardContent>{overview.activeUsers.length ? <ul className="divide-y divide-border">{overview.activeUsers.map((member) => <li className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={member.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{personName(member)}</p><p className="truncate text-sm text-muted-foreground">{member.user.email}</p></div><WorkspaceState label={roleLabels[member.role]} />{canRevoke && member.role !== "OWNER" ? <AccessRevokeButton memberId={member.id} /> : null}</li>)}</ul> : <Empty className="min-h-40"><EmptyHeader><EmptyMedia variant="icon"><IconUsers aria-hidden="true" /></EmptyMedia><EmptyTitle>Nessun utente attivo</EmptyTitle><EmptyDescription>Gli account abilitati appariranno qui.</EmptyDescription></EmptyHeader></Empty>}</CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card size="sm"><CardHeader><IconMail aria-hidden="true" className="size-5" /><CardTitle><h2>Inviti in attesa</h2></CardTitle><CardDescription>Ancora accettabili.</CardDescription><CardAction><Badge variant="outline">{overview.pendingInvitations.length}</Badge></CardAction></CardHeader><CardContent><InvitationList canManage={canManage} empty="Nessun invito in attesa." invitations={overview.pendingInvitations} /></CardContent></Card>
        <Card size="sm"><CardHeader><IconClock aria-hidden="true" className="size-5" /><CardTitle><h2>Inviti scaduti</h2></CardTitle><CardDescription>Da reinviare se ancora necessari.</CardDescription></CardHeader><CardContent><InvitationList canManage={false} empty="Nessun invito scaduto." invitations={overview.expiredInvitations} /></CardContent></Card>
        <Card size="sm"><CardHeader><IconKey aria-hidden="true" className="size-5" /><CardTitle><h2>Revocati</h2></CardTitle><CardDescription>Inviti annullati e accessi disattivati.</CardDescription></CardHeader><CardContent><InvitationList canManage={false} empty="Nessun invito revocato." invitations={overview.revokedInvitations} />{overview.revokedUsers.length ? <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{overview.revokedUsers.length} accessi utente revocati</p> : null}</CardContent></Card>
      </div>
    </WorkspacePage>
  );
}
