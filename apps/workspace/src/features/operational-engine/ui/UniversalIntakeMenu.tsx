"use client";

import { IconChevronDown, IconFilePlus, IconPackageExport, IconPhotoPlus, IconPlus, IconUserPlus, IconBuildingPlus } from "@tabler/icons-react";
import Link from "next/link";
import type { OrganizationRole } from "@qoovex/types";
import { Button } from "@qoovex/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@qoovex/ui/components/dropdown-menu";

const entries = {
  document: { label: "Documento", description: "Registra un documento", href: "/documents/new", icon: IconFilePlus },
  upload: { label: "File documento", description: "Aggiungi una versione", href: "/documents?intent=upload", icon: IconFilePlus },
  worker: { label: "Lavoratore", description: "Registra un lavoratore", href: "/workers/new", icon: IconUserPlus },
  site: { label: "Cantiere", description: "Registra un cantiere", href: "/job-sites/new", icon: IconBuildingPlus },
  evidence: { label: "Prova", description: "Registra una prova", href: "/evidence/new", icon: IconPhotoPlus },
  package: { label: "Pacchetto", description: "Prepara un pacchetto", href: "/document-packages/new", icon: IconPackageExport },
} as const;

const byRole: Record<OrganizationRole, readonly (keyof typeof entries)[]> = {
  OWNER: ["document", "worker", "site", "evidence", "package"],
  ADMIN: ["document", "worker", "site", "evidence", "package"],
  SAFETY_CONSULTANT: ["upload", "evidence", "package"],
  SITE_MANAGER: ["evidence"],
  WORKER: ["upload", "evidence"],
};

export function UniversalIntakeMenu({ role }: { role: OrganizationRole }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="min-h-10 sm:min-h-8" />}>
        <IconPlus />Nuovo ingresso<IconChevronDown />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Scegli il flusso controllato</DropdownMenuLabel>
          {byRole[role].map((key) => {
            const item = entries[key];
            const Icon = item.icon;
            return <DropdownMenuItem key={key} render={<Link href={item.href} />}><Icon /><span><span className="block font-medium">{item.label}</span><span className="block text-xs text-muted-foreground">{item.description}</span></span></DropdownMenuItem>;
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
