"use client";

import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  FloatingNavigation,
  type FloatingNavigationLink,
} from "@qoovex/ui/components/floating-navigation";
import { BrandMark } from "@/components/brand-mark";

const demoSurfaceLinks: FloatingNavigationLink[] = [
  { href: "#", label: "Panoramica" },
  { href: "#funzionalita", label: "Funzionalità" },
  { href: "#prezzi", label: "Prezzi" },
];

const demoResourceLinks: FloatingNavigationLink[] = [
  {
    href: "#",
    label: "Documentazione",
    description: "Guide e riferimenti tecnici per l'integrazione.",
  },
  {
    href: "#",
    label: "Stato del servizio",
    description: "Monitora uptime e incidenti in tempo reale.",
  },
];

export default function FloatingNavigationPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Floating Navigation"
        description="Barra di navigazione sticky fluttuante con indicatore hover scorrevole, resource dropdown, sezioni mobili, e pannello mobile fluttuante. I link di navigazione al suo interno utilizzano il componente Tabs (TabsList + TabsTrigger)."
        importPath="import { FloatingNavigation } from '@qoovex/ui/components/floating-navigation'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Modalità Marketing (espansa)
          </h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Header con link, risorse dropdown, e CTA">
              <div className="relative h-[5rem] w-full overflow-hidden rounded-2xl border bg-muted/30">
                <FloatingNavigation
                  activeHref="#"
                  brand={(compact) => <BrandMark compact={compact} variant="sirio" />}
                  homeHref="#"
                  resourceLabel="Esplora"
                  resourceLinks={demoResourceLinks}
                  surfaceLabel="Sezioni"
                  surfaceLinks={demoSurfaceLinks}
                />
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Anatomia Interna</h2>
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground leading-7">
            <p className="mb-3 text-foreground font-medium">
              Il componente <code className="text-xs bg-muted px-1.5 py-0.5 rounded">FloatingNavigation</code> è composto da:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Shell</strong> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;header&gt;</code> sticky con backdrop-blur, border, e transizione compact/expanded.
              </li>
              <li>
                <strong>Brand</strong> — Logo reso tramite render prop <code className="text-xs bg-muted px-1.5 py-0.5 rounded">brand(compact)</code>.
              </li>
              <li>
                <strong>Navigation Links</strong> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;TabsList&gt;</code> + <code className="text-xs bg-muted px-1.5 py-0.5 rounded">&lt;TabsTrigger&gt;</code> dal componente Tabs condiviso.
                L'indicatore hover (<code className="text-xs bg-muted px-1.5 py-0.5 rounded">.tabs__hover-indicator</code>) scorre tra le voci con <code className="text-xs bg-muted px-1.5 py-0.5 rounded">cubic-bezier(0.16, 1, 0.3, 1)</code> a 260ms.
              </li>
              <li>
                <strong>Resource Dropdown</strong> — <code className="text-xs bg-muted px-1.5 py-0.5 rounded">NavigationResourceDropdown</code> interno che sfrutta <code className="text-xs bg-muted px-1.5 py-0.5 rounded">useTabsList()</code> per condividere lo stesso indicatore hover.
              </li>
              <li>
                <strong>Mobile Sheet</strong> — Hamburger menu per viewport sotto il breakpoint desktop.
              </li>
              <li>
                <strong>Section Mode</strong> — In scroll compatto con sezioni, la barra collassa a capsola e mostra le sezioni della pagina corrente.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
