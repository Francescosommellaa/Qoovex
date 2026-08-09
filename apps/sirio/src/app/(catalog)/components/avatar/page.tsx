import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarBadge,
  AvatarGroup,
  AvatarGroupCount,
} from "@qoovex/ui/components/avatar";
import { Badge } from "@qoovex/ui/components/badge";

export default function AvatarCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Avatar"
        description="Rappresentazione visiva di utenti, collaboratori e profili di cantiere con supporto a dimensioni, badge di presenza e gruppi."
        importPath="import { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount } from '@qoovex/ui/components/avatar'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Scala Dimensionale ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Scala Dimensionale</h2>
          <SpecimenGrid cols={1}>
            <Specimen title="Dimensioni Standard (XS, SM, Default, LG, XL)">
              <div className="flex flex-wrap items-end gap-6 py-2">
                <div className="flex flex-col items-center gap-2">
                  <Avatar size="xs">
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <span className="font-accent text-[0.6875rem] text-muted-foreground">XS (24px)</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar size="sm">
                    <AvatarFallback>GB</AvatarFallback>
                  </Avatar>
                  <span className="font-accent text-[0.6875rem] text-muted-foreground">SM (32px)</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar size="default">
                    <AvatarFallback>LC</AvatarFallback>
                  </Avatar>
                  <span className="font-accent text-[0.6875rem] text-muted-foreground">DEFAULT (40px)</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar size="lg">
                    <AvatarFallback>FA</AvatarFallback>
                  </Avatar>
                  <span className="font-accent text-[0.6875rem] text-muted-foreground">LG (48px)</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar size="xl">
                    <AvatarFallback className="bg-primary text-primary-foreground font-accent">QVX</AvatarFallback>
                  </Avatar>
                  <span className="font-accent text-[0.6875rem] text-muted-foreground">XL (56px)</span>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Indicatori di Presenza e Stato ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Stato e Presenza (Badge)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Stati Utente (Online, Away, Busy, Offline)">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar size="lg">
                  <AvatarFallback>MR</AvatarFallback>
                  <AvatarBadge status="online" />
                </Avatar>

                <Avatar size="lg">
                  <AvatarFallback>GB</AvatarFallback>
                  <AvatarBadge status="away" />
                </Avatar>

                <Avatar size="lg">
                  <AvatarFallback>LC</AvatarFallback>
                  <AvatarBadge status="busy" />
                </Avatar>

                <Avatar size="lg">
                  <AvatarFallback>FA</AvatarFallback>
                  <AvatarBadge status="offline" />
                </Avatar>
              </div>
            </Specimen>

            <Specimen title="Profilo Collaboratore in Scheda">
              <div className="flex items-center gap-3.5 w-full">
                <Avatar size="lg">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">MR</AvatarFallback>
                  <AvatarBadge status="online" />
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Marco Rossi</span>
                    <Badge variant="secondary" className="font-accent text-[0.6875rem]">AZIENDA</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Responsabile Cantiere Via Roma</span>
                </div>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 3: Avatar Group (Gruppo Collaboratori) ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Gruppo Collaboratori (AvatarGroup)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Stack Collaboratori (Dimensioni Default)">
              <div className="flex items-center gap-3">
                <AvatarGroup>
                  <Avatar size="default">
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <Avatar size="default">
                    <AvatarFallback>GB</AvatarFallback>
                  </Avatar>
                  <Avatar size="default">
                    <AvatarFallback>LC</AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount>+4</AvatarGroupCount>
                </AvatarGroup>
                <span className="text-xs text-muted-foreground font-medium">7 partecipanti</span>
              </div>
            </Specimen>

            <Specimen title="Stack Compatto Cantiere (Dimensioni SM)">
              <div className="flex items-center gap-3">
                <AvatarGroup>
                  <Avatar size="sm">
                    <AvatarFallback>FA</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">QV</AvatarFallback>
                  </Avatar>
                  <Avatar size="sm">
                    <AvatarFallback>MB</AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount>+2</AvatarGroupCount>
                </AvatarGroup>
                <span className="text-xs text-muted-foreground font-medium">Team Cantiere</span>
              </div>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
