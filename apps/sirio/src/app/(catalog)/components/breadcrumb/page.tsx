import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@qoovex/ui/components/breadcrumb";
import { Badge } from "@qoovex/ui/components/badge";
import Link from "next/link";
import {
  IconHome,
  IconBuildingStore,
  IconFileText,
  IconReceipt2,
  IconFolders,
  IconChevronRight,
  IconSlash,
} from "@tabler/icons-react";

export default function BreadcrumbCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Breadcrumb"
        description="Indicatore di navigazione gerarchica contestuale con supporto ad icone, codici d'accento, livelli collassati ed elementi responsive."
        importPath="import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from '@qoovex/ui/components/breadcrumb'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Gerarchia Cantiere con Icone e Font Accent ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Gerarchia Cantiere con Icone</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Navigazione Cantiere con Icone e Codice Accent">
              <div className="w-full py-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href="/" />}>
                        <IconHome />
                        <span>Azienda</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href="/" />}>
                        <IconBuildingStore />
                        <span>Cantieri Attivi</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-accent text-primary">
                        JOB-SITE #8942-2026
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Livelli Profondi Collassati (BreadcrumbEllipsis) ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Gerarchia Profonda con Ellipsi</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Percorso Collassato con Icona Ellipsi e Badge Stato">
              <div className="w-full py-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href="/" />}>
                        <IconHome />
                        <span>Dashboard</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link href="/" />}>
                        <IconReceipt2 />
                        <span>Pagamenti Documentati</span>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="gap-2">
                        <span>Ricevuta #4092</span>
                        <Badge variant="outline" className="font-accent text-[0.6875rem]">CONFERMATO</Badge>
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 3: Varianti Separatore (Chevron vs Slash) ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Separatori Personalizzati</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Separatore Chevron (Standard)">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>Progetti</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <IconChevronRight />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Documentazione</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Specimen>

            <Specimen title="Separatore Slash (Minimal)">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href="/" />}>Archivio</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator>
                    <IconSlash />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    <BreadcrumbPage>2026</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
