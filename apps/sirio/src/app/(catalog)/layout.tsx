import { SidebarProvider, SidebarInset } from "@qoovex/ui/components/sidebar";
import { SirioSidebar } from "@/components/sirio-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ThemeToggle } from "@qoovex/ui/components/theme-toggle";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SirioSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
             {/* SidebarTrigger is inside SidebarHeader usually, but we have collapse button there. */}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
