import Link from "next/link";
import { IconMail, IconUserPlus, IconUsers } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";
import { buttonVariants } from "@qoovex/ui/components/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@qoovex/ui/components/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@qoovex/ui/components/empty";
import type { OrganizationRole } from "@qoovex/types";
import { presentOrganizationRole } from "@shared/lib/product-state-presentation";
import { WorkspacePage, WorkspacePageHeader, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

interface Member {
  id: string;
  role: OrganizationRole;
  user: { email: string; firstName: string | null; lastName: string | null };
}

interface Invitation {
  id: string;
  email: string;
  role: Exclude<OrganizationRole, "OWNER">;
  expiresAt: string | Date;
}

function memberName(member: Member) {
  return `${member.user.firstName ?? ""} ${member.user.lastName ?? ""}`.trim() || member.user.email;
}

function initials(value: string) {
  return value
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("it-IT");
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function PeopleSettingsView({ members, invitations, canManage }: { members: Member[]; invitations: Invitation[]; canManage: boolean }) {
  const memberCount = members.length === 1 ? "1 utente" : `${members.length} utenti`;
  const invitationCount = invitations.length === 1 ? "1 invito" : `${invitations.length} inviti`;

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Utenti e inviti"
        description="Qui trovi soltanto gli account che possono entrare in Qoovex, il ruolo assegnato e gli inviti in attesa."
        action={canManage ? (
          <Link className={`${buttonVariants()} h-10 w-full sm:h-8 sm:w-auto`} data-link="plain" href="/settings/people/invite">
            <IconUserPlus aria-hidden="true" />
            Invita utente
          </Link>
        ) : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle><h2>Utenti con accesso</h2></CardTitle>
            <CardDescription>Account e ruolo attivi nel workspace.</CardDescription>
            <CardAction><Badge variant="outline">{memberCount}</Badge></CardAction>
          </CardHeader>
          <CardContent>
            {!members.length ? (
              <Empty className="min-h-56 py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon"><IconUsers aria-hidden="true" /></EmptyMedia>
                  <EmptyTitle>Nessun utente</EmptyTitle>
                  <EmptyDescription>Gli account abilitati ad accedere all'azienda appariranno qui.</EmptyDescription>
                </EmptyHeader>
                {canManage ? (
                  <EmptyContent>
                    <Link className={buttonVariants()} data-link="plain" href="/settings/people/invite">
                      <IconUserPlus aria-hidden="true" />
                      Invita utente
                    </Link>
                  </EmptyContent>
                ) : null}
              </Empty>
            ) : (
              <ul aria-label="Utenti con accesso" className="divide-y divide-border">
                {members.map((member) => {
                  const name = memberName(member);
                  return (
                    <li className="py-4 first:pt-0 last:pb-0" key={member.id}>
                      <article className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                        <Avatar size="lg">
                          <AvatarFallback className="font-medium text-foreground">{initials(name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-medium text-foreground">{name}</h3>
                          <a className="mt-1 block truncate text-sm text-muted-foreground" data-link="quiet" href={`mailto:${member.user.email}`}>{member.user.email}</a>
                        </div>
                        <div className="col-start-2 sm:col-start-auto"><WorkspaceState state={presentOrganizationRole(member.role)} /></div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-6">
          <Card size="sm">
            <CardHeader className="border-b">
              <CardTitle><h2>Inviti in attesa</h2></CardTitle>
              <CardDescription>Inviti ancora utilizzabili. Il ruolo viene assegnato quando l'invito viene accettato.</CardDescription>
              <CardAction><Badge variant="outline">{invitationCount}</Badge></CardAction>
            </CardHeader>
            <CardContent>
              {!invitations.length ? (
                <Empty className="min-h-40 py-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><IconMail aria-hidden="true" /></EmptyMedia>
                    <EmptyTitle>Nessun invito in attesa</EmptyTitle>
                    <EmptyDescription>Gli inviti inviati compariranno qui fino alla scadenza.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul aria-label="Inviti in attesa" className="divide-y divide-border">
                  {invitations.map((invitation) => (
                    <li className="py-4 first:pt-0 last:pb-0" key={invitation.id}>
                      <article className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                          <h3 className="min-w-0 truncate text-sm font-medium text-foreground">{invitation.email}</h3>
                          <WorkspaceState state={presentOrganizationRole(invitation.role)} />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Scade il <time dateTime={new Date(invitation.expiresAt).toISOString()}>{formatDate(invitation.expiresAt)}</time>
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkspacePage>
  );
}
