import Link from "next/link";
import { listClientHome } from "@shared/server/job-site-lifecycle-service";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { ClientHomeWorkQueue } from "@/views/workspace/ClientHomeWorkQueue";
import { presentJobSiteStatus } from "@shared/lib/product-state-presentation";
import { LinkPropertyForm, PropertyForm } from "@/views/job-site/JobSiteForms";

export default async function ClientHomePage() {
  const home = await listClientHome();
  const count = home.properties.reduce((total, value) => total + value.jobSites.length, 0) + home.unlinkedJobSites.length;
  const unlinkedOptions = home.unlinkedJobSites.map((value) => ({ id: value.jobSite.id, label: `${value.jobSite.name} — ${value.jobSite.organization.name}` }));
  const activeWorks = [
    ...home.properties.flatMap((property) => property.jobSites.filter((link) => link.jobSite.status === "ACTIVE").map((link) => ({ jobSite: link.jobSite, property }))),
    ...home.unlinkedJobSites.filter((participant) => participant.jobSite.status === "ACTIVE").map((participant) => ({ jobSite: participant.jobSite, property: null })),
  ];
  const otherWorks = home.unlinkedJobSites.filter((participant) => participant.jobSite.status !== "ACTIVE");
  return <WorkspacePage>
    <WorkspacePageHeader title="I tuoi lavori" description="Controlla prima le azioni da svolgere, poi consulta i lavori e i tuoi immobili." />
    <section aria-labelledby="client-home-tasks"><h2 className="sr-only" id="client-home-tasks">Azioni da fare</h2><ClientHomeWorkQueue items={home.workQueueItems} /></section>
    <section aria-labelledby="client-home-active-job-sites" className="space-y-3"><h2 className="text-xl font-semibold tracking-tight" id="client-home-active-job-sites">Lavori attivi</h2><WorkspacePanel description="Apri un lavoro per consultare aggiornamenti, richieste e attività condivise.">{activeWorks.length ? <ul className="divide-y">{activeWorks.map(({ jobSite, property }) => <li className="flex flex-wrap items-center justify-between gap-3 py-3" key={jobSite.id}><div><Link className="font-medium hover:underline" href={`/client/job-sites/${jobSite.id}`}>{jobSite.name} — {jobSite.organization.name}</Link>{property ? <p className="mt-1 text-sm text-muted-foreground">{property.displayName}{property.addressLine ? ` · ${property.addressLine}` : ""}</p> : <p className="mt-1 text-sm text-muted-foreground">Altro lavoro</p>}</div><WorkspaceState state={presentJobSiteStatus(jobSite.status)} /></li>)}</ul> : <p className="text-sm text-muted-foreground">Non ci sono lavori attivi al momento. Puoi comunque consultare tutti i lavori nella sezione qui sotto.</p>}</WorkspacePanel></section>
    <section aria-labelledby="client-home-properties" className="space-y-3"><h2 className="text-xl font-semibold tracking-tight" id="client-home-properties">I tuoi immobili</h2>
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
        {home.properties.map((property) => {
          const otherPropertyWorks = property.jobSites.filter((link) => link.jobSite.status !== "ACTIVE");
          const hasActiveWork = property.jobSites.length !== otherPropertyWorks.length;
          return <WorkspacePanel key={property.id} title={property.displayName} description={property.addressLine ?? "Indirizzo privato non indicato"}>{otherPropertyWorks.length ? <ul className="divide-y">{otherPropertyWorks.map((link) => <li className="flex items-center justify-between py-3" key={link.id}><Link className="font-medium hover:underline" href={`/client/job-sites/${link.jobSite.id}`}>{link.jobSite.name} — {link.jobSite.organization.name}</Link><WorkspaceState state={presentJobSiteStatus(link.jobSite.status)} /></li>)}</ul> : null}{hasActiveWork ? <p className="text-sm text-muted-foreground">I lavori attivi di questo immobile sono mostrati sopra.</p> : null}{!property.jobSites.length ? <p className="text-sm text-muted-foreground">Non hai ancora aggiunto lavori a questo immobile.</p> : null}<LinkPropertyForm propertyId={property.id} jobSites={unlinkedOptions} /></WorkspacePanel>;
        })}
        {otherWorks.length ? <WorkspacePanel title="Altri lavori" description="Lavori a cui partecipi.">{otherWorks.map((participant) => <div className="flex flex-wrap items-center justify-between gap-3 py-3" key={participant.id}><Link className="font-medium hover:underline" href={`/client/job-sites/${participant.jobSite.id}`}>{participant.jobSite.name} — {participant.jobSite.organization.name}</Link><WorkspaceState state={presentJobSiteStatus(participant.jobSite.status)} /></div>)}</WorkspacePanel> : null}
        {!count ? <WorkspaceEmptyState title="Nessun lavoro" description="I lavori appariranno dopo l'accettazione di un invito." /> : null}
        </div>
        <WorkspacePanel><PropertyForm /></WorkspacePanel>
      </div>
    </section>
  </WorkspacePage>;
}
