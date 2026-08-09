import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { listNotificationPreferences } from "@shared/server/job-site-notification-preference-service";
import { NotificationPreferencesForm } from "@/views/job-site/NotificationPreferencesForm";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";

export default async function NotificationPreferencesPage() {
  const value = await listNotificationPreferences();
  return <WorkspacePage><WorkspacePageHeader title="Preferenze notifiche" description="Le preferenze sono personali e collegate alla tua Azienda." action={<Link className={buttonVariants({ variant: "outline" })} href="/">Torna al workspace</Link>} /><div className="grid gap-4 lg:grid-cols-[22rem_1fr]"><WorkspacePanel><NotificationPreferencesForm organizations={value.organizations} /></WorkspacePanel><WorkspacePanel title="Preferenze correnti">{value.preferences.length ? <ul className="divide-y">{value.preferences.map((preference) => <li className="py-3 text-sm" key={preference.id}>{preference.type} · {preference.channel} · {preference.frequency}</li>)}</ul> : <p className="text-sm text-muted-foreground">Le notifiche usano i valori predefiniti finché non salvi una preferenza.</p>}</WorkspacePanel></div></WorkspacePage>;
}
