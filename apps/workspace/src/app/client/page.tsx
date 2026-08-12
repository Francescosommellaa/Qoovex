import Link from "next/link";
import { buttonVariants } from "@qoovex/ui/components/button";
import { listClientHome } from "@shared/server/job-site-lifecycle-service";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { presentJobSiteStatus } from "@shared/lib/product-state-presentation";
import { LinkPropertyForm, PropertyForm } from "@/views/job-site/JobSiteForms";

export default async function ClientHomePage() {
  const home = await listClientHome();
  const count = home.properties.reduce((total, value) => total + value.jobSites.length, 0) + home.unlinkedJobSites.length;
  const unlinkedOptions = home.unlinkedJobSites.map((value) => ({ id: value.jobSite.id, label: `${value.jobSite.name} — ${value.jobSite.organization.name}` }));
  const allSites = [...home.properties.flatMap((value) => value.jobSites.map((link) => link.jobSite)), ...home.unlinkedJobSites.map((value) => value.jobSite)];
  return <WorkspacePage>
    <WorkspacePageHeader title="I tuoi lavori" description="Immobili e cantieri a cui partecipi come cliente. Le Aziende restano isolate tra loro." action={<a className={buttonVariants({ variant: "outline" })} href="/api/client/data-export">Esporta i miei dati</a>} />
    <div className="grid gap-4 sm:grid-cols-3"><WorkspacePanel title="Immobili"><p className="text-3xl font-semibold">{home.properties.length}</p></WorkspacePanel><WorkspacePanel title="Cantieri"><p className="text-3xl font-semibold">{count}</p></WorkspacePanel><WorkspacePanel title="Azioni richieste"><p className="text-3xl font-semibold">{allSites.filter((value) => ["PENDING_INITIAL_CONFIRMATION", "CLOSURE_PROPOSED"].includes(value.status)).length}</p></WorkspacePanel></div>
    <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        {home.properties.map((property) => <WorkspacePanel key={property.id} title={property.displayName} description={property.addressLine ?? "Indirizzo privato non indicato"}>{property.jobSites.length ? <ul className="divide-y">{property.jobSites.map((link) => <li className="flex items-center justify-between py-3" key={link.id}><Link className="font-medium hover:underline" href={`/client/job-sites/${link.jobSite.id}`}>{link.jobSite.name} — {link.jobSite.organization.name}</Link><WorkspaceState state={presentJobSiteStatus(link.jobSite.status)} /></li>)}</ul> : <p className="text-sm text-muted-foreground">Nessun cantiere collegato.</p>}<LinkPropertyForm propertyId={property.id} jobSites={unlinkedOptions} /></WorkspacePanel>)}
        {home.unlinkedJobSites.length ? <WorkspacePanel title="Cantieri non collegati a un immobile">{home.unlinkedJobSites.map((participant) => <div className="flex items-center justify-between py-3" key={participant.id}><Link className="font-medium hover:underline" href={`/client/job-sites/${participant.jobSite.id}`}>{participant.jobSite.name} — {participant.jobSite.organization.name}</Link><WorkspaceState state={presentJobSiteStatus(participant.jobSite.status)} /></div>)}</WorkspacePanel> : null}
        {!count ? <WorkspaceEmptyState title="Nessun cantiere" description="I cantieri appariranno dopo l'accettazione di un invito." /> : null}
      </div>
      <WorkspacePanel><PropertyForm /></WorkspacePanel>
    </div>
  </WorkspacePage>;
}
