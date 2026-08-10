import { SidebarProvider, SidebarInset } from "@qoovex/ui/components/sidebar";
import { SirioSidebar } from "@/components/sirio-sidebar";
import { SirioTopbar } from "@/components/sirio-topbar";

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-dvh min-h-0! overflow-hidden bg-sidebar">
      <SirioSidebar />
      <SidebarInset className="h-dvh min-h-0 min-w-0 overflow-hidden">
        <SirioTopbar />
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
