"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconAlertTriangle, IconClock, IconKey, IconMail, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import type { OrganizationAccessPreset, OrganizationPermission, OrganizationRole, OrganizationScopeMode } from "@qoovex/types";
import { submitJson } from "@/views/administration/admin-api-client";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Proprietario", COLLABORATOR: "Collaboratore",
};
const presetLabels: Record<OrganizationAccessPreset, string> = {
  READ_ONLY: "Sola lettura",
  OPERATIONAL_COLLABORATION: "Collaborazione operativa",
  SITE_MANAGER: "Cantieri assegnati",
  LIMITED_UPLOAD: "Caricamento limitato",
  CUSTOM: "Personalizzato",
};

interface AccessMember {
  id: string;
  role: OrganizationRole;
  preset: OrganizationAccessPreset | null;
  permissionKeys: OrganizationPermission[];
  scopeMode: OrganizationScopeMode;
  expiresAt: string | null;
  accessVersion: number;
  updatedAt: string;
  revokedAt: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null; workerUserLinks: Array<{ worker: { id: string; displayName: string } }>; jobSiteParticipants: Array<{ jobSite: { id: string; name: string } }> };
}
interface AccessInvitation { id: string; email: string; role: Exclude<OrganizationRole, "OWNER">; workerId: string | null; expiresAt: string; revokedAt: string | null; worker: { displayName: string } | null }
interface AccessOverview {
  activeUsers: AccessMember[];
  revokedUsers: AccessMember[];
  pendingInvitations: AccessInvitation[];
  expiredInvitations: AccessInvitation[];
  revokedInvitations: AccessInvitation[];
  incomplete: Array<{ kind: "WORKER_LINK" | "JOB_SITE_SCOPE"; membershipId: string; userId: string; label: string; message: string }>;
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

function InvitationList({ invitations, empty, canManage, canResend = false }: { invitations: AccessInvitation[]; empty: string; canManage: boolean; canResend?: boolean }) {
  const router = useRouter();
  async function revoke(id: string) { await submitJson("/api/organization/invitations", "DELETE", { invitationId: id }); router.refresh(); }
  async function resend(id: string) { await submitJson("/api/organization/invitations", "PUT", { invitationId: id }); router.refresh(); }
  if (!invitations.length) return <p className="py-4 text-sm text-muted-foreground">{empty}</p>;
  return <ul className="divide-y divide-border">{invitations.map((invitation) => <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" key={invitation.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{invitation.email}</p><p className="mt-1 text-xs text-muted-foreground">{roleLabels[invitation.role]}{invitation.worker ? ` · ${invitation.worker.displayName}` : ""}</p></div><div className="flex flex-wrap gap-2">{canResend ? <Button onClick={() => void resend(invitation.id)} size="sm" type="button" variant="outline">Reinvia</Button> : null}{canManage && !invitation.revokedAt ? <Button onClick={() => void revoke(invitation.id)} size="sm" type="button" variant="outline">Revoca</Button> : null}</div></li>)}</ul>;
}

export function PeopleAccessView({ overview, canManage, canRevoke, invitableRoles }: { overview: AccessOverview; canManage: boolean; canRevoke: boolean; invitableRoles: Array<Exclude<OrganizationRole, "OWNER">> }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title="Accessi" description="Account, appartenenza all'azienda, permessi e inviti. Le assegnazioni ai cantieri restano nell'area dedicata." action={canManage && invitableRoles.length ? <Link className={buttonVariants()} data-link="plain" href="/settings/people/invite"><IconUserPlus aria-hidden="true" />Invita collaboratore</Link> : undefined} />

      {overview.incomplete.length ? <Card className="border-warning/40" size="sm"><CardHeader><IconAlertTriangle aria-hidden="true" className="size-5 text-warning" /><CardTitle><h2>Configurazioni incomplete</h2></CardTitle><CardDescription>Questi Collaboratori possono avere un accesso attivo ma non ancora un ambito operativo completo.</CardDescription><CardAction><Badge variant="warning">{overview.incomplete.length}</Badge></CardAction></CardHeader><CardContent><ul className="divide-y divide-border">{overview.incomplete.map((item) => <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" key={`${item.kind}-${item.membershipId}`}><div><p className="text-sm font-medium">{item.label}</p><p className="text-sm text-muted-foreground">{item.message}</p></div><Link className={buttonVariants({ variant: "outline", size: "sm" })} data-link="plain" href={item.kind === "JOB_SITE_SCOPE" ? "/" : "/workers"}>Completa</Link></li>)}</ul></CardContent></Card> : null}

      <Card size="sm"><CardHeader className="border-b"><CardTitle><h2>Utenti attivi</h2></CardTitle><CardDescription>Account che possono accedere all'azienda.</CardDescription><CardAction><Badge variant="outline">{overview.activeUsers.length}</Badge></CardAction></CardHeader><CardContent>{overview.activeUsers.length ? <ul className="divide-y divide-border">{overview.activeUsers.map((member) => <li className="grid gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center" key={member.id}><div className="min-w-0"><p className="truncate text-sm font-medium">{personName(member)}</p><p className="truncate text-sm text-muted-foreground">{member.user.email}</p>{member.role === "COLLABORATOR" ? <p className="mt-1 text-xs text-muted-foreground">{presetLabels[member.preset ?? "CUSTOM"]} · {member.scopeMode === "FULL" ? "Tutta l'Azienda" : "Risorse assegnate"} · {member.permissionKeys.length} permessi{member.expiresAt ? ` · scade ${new Date(member.expiresAt).toLocaleDateString("it-IT")}` : ""}</p> : null}</div><WorkspaceState label={roleLabels[member.role]} /><div className="flex flex-wrap gap-2"><span className="text-xs text-muted-foreground">Accesso v{member.accessVersion}</span>{canRevoke && member.role !== "OWNER" ? <AccessRevokeButton memberId={member.id} /> : null}</div></li>)}</ul> : <Empty className="min-h-40"><EmptyHeader><EmptyMedia variant="icon"><IconUsers aria-hidden="true" /></EmptyMedia><EmptyTitle>Nessun utente attivo</EmptyTitle><EmptyDescription>Gli account abilitati appariranno qui.</EmptyDescription></EmptyHeader></Empty>}</CardContent></Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card size="sm"><CardHeader><IconMail aria-hidden="true" className="size-5" /><CardTitle><h2>Inviti in attesa</h2></CardTitle><CardDescription>Ancora accettabili.</CardDescription><CardAction><Badge variant="outline">{overview.pendingInvitations.length}</Badge></CardAction></CardHeader><CardContent><InvitationList canManage={canManage} empty="Nessun invito in attesa." invitations={overview.pendingInvitations} /></CardContent></Card>
        <Card size="sm"><CardHeader><IconClock aria-hidden="true" className="size-5" /><CardTitle><h2>Inviti scaduti</h2></CardTitle><CardDescription>Da reinviare se ancora necessari.</CardDescription></CardHeader><CardContent><InvitationList canManage={false} canResend={canManage} empty="Nessun invito scaduto." invitations={overview.expiredInvitations} /></CardContent></Card>
        <Card size="sm"><CardHeader><IconKey aria-hidden="true" className="size-5" /><CardTitle><h2>Revocati</h2></CardTitle><CardDescription>Inviti annullati e accessi disattivati.</CardDescription></CardHeader><CardContent><InvitationList canManage={false} canResend={canManage} empty="Nessun invito revocato." invitations={overview.revokedInvitations} />{overview.revokedUsers.length ? <p className="mt-4 border-t pt-4 text-sm text-muted-foreground">{overview.revokedUsers.length} accessi utente revocati</p> : null}</CardContent></Card>
      </div>
    </WorkspacePage>
  );
}
