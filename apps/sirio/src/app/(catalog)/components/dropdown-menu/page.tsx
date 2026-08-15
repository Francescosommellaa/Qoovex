"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@qoovex/ui/components/dropdown-menu";
import { Button } from "@qoovex/ui/components/button";
import {
  IconDotsVertical,
  IconUser,
  IconSettings,
  IconLogout,
  IconBuildingStore,
  IconShare,
  IconDownload,
  IconFileTypePdf,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconTrash,
  IconFilter,
  IconUserCheck,
} from "@tabler/icons-react";

export default function DropdownMenuPage() {
  const [showInternal, setShowInternal] = useState(true);
  const [showShared, setShowShared] = useState(true);
  const [role, setRole] = useState("company");

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Dropdown Menu"
        description="Menu contestuale a comparsa con supporto ad icone, sottomenu nidificati, checkbox, radio e scorciatoie da tastiera."
        importPath="import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, ... } from '@qoovex/ui/components/dropdown-menu'"
      />

      <div className="flex flex-col gap-12">
        {/* ── Sezione 1: Menu Azioni Cantiere & Sottomenu ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Menu Azioni & Sottomenu Nidificato</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Menu Azioni Cantiere con Scorciatoie" visualId="dropdown-open">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  <IconBuildingStore />
                  <span>Azioni Cantiere</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>JOB-SITE #8942-2026</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconUser />
                      <span>Visualizza Dettagli</span>
                      <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconSettings />
                      <span>Gestisci Step</span>
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant="destructive">
                      <IconTrash />
                      <span>Elimina Cantiere</span>
                      <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>

            <Specimen title="Sottomenu Nidificato (Esporta Dati)">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="secondary" />}>
                  <IconDownload />
                  <span>Esporta Report</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Formato di Export</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <IconShare />
                      <span>Condividi Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <IconDownload />
                        <span>Scarica File</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>
                          <IconFileTypePdf />
                          <span>Documento PDF</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconFileTypeCsv />
                          <span>Tabella CSV</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconFileTypeXls />
                          <span>Foglio Excel</span>
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>
          </SpecimenGrid>
        </section>

        {/* ── Sezione 2: Checkbox & Radio Items ────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Filtri Checkbox & Selezione Ruolo (Radio)</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Filtri Checkbox (Visibilità Contenuti)">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  <IconFilter />
                  <span>Filtra Elementi</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Filtri Cronologia</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={showInternal}
                      onCheckedChange={setShowInternal}
                    >
                      Mostra Eventi Interni
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={showShared}
                      onCheckedChange={setShowShared}
                    >
                      Mostra Allegati Cliente
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>

            <Specimen title="Selezione Ruolo (Radio Group)">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  <IconUserCheck />
                  <span>Ruolo Attivo</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Seleziona Ruolo</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={role} onValueChange={setRole}>
                      <DropdownMenuRadioItem value="company">
                        Azienda (Responsabile)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="client">
                        Cliente (Committente)
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="external">
                        Collaboratore Esterno
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
