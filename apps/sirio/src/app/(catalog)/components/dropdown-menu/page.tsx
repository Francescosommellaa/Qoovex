import { PageHeader } from "@/components/page-header";
import { Specimen, SpecimenGrid } from "@/components/specimen";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup } from "@qoovex/ui/components/dropdown-menu";
import { Button } from "@qoovex/ui/components/button";
import { IconDotsVertical, IconUser, IconSettings, IconLogout } from "@tabler/icons-react";

export default function DropdownMenuPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Dropdown Menu"
        description="Menu contestuale per azioni aggiuntive."
        importPath="import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, ... } from '@qoovex/ui/components/dropdown-menu'"
      />

      <div className="flex flex-col gap-12">
        <section>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">Esempio Base</h2>
          <SpecimenGrid cols={2}>
            <Specimen title="Semplice">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" />}>
                  Apri Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profilo</DropdownMenuItem>
                  <DropdownMenuItem>Fatturazione</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem disabled>Abbonamento (Coming soon)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>
            
            <Specimen title="Con Icone">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                  <IconDotsVertical className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <IconUser className="mr-2 h-4 w-4" />
                      <span>Profilo</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <IconSettings className="mr-2 h-4 w-4" />
                      <span>Impostazioni</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                    <IconLogout className="mr-2 h-4 w-4" />
                    <span>Esci</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Specimen>
          </SpecimenGrid>
        </section>
      </div>
    </div>
  );
}
