"use client";

import { useEffect, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@qoovex/ui/components/dialog";
import { SidebarMenuButton } from "@qoovex/ui/components/sidebar";
import { UniversalSearchWidget } from "./UniversalSearchWidget";

export function UniversalSearchDialog({ iconOnly = false }: { iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger
        render={(
          <SidebarMenuButton
            aria-label="Cerca nel workspace"
            className={iconOnly ? "size-9! w-9! shrink-0 justify-center p-0!" : undefined}
            tooltip={iconOnly ? { align: "end", children: "Cerca nel workspace", hidden: false, side: "bottom" } : "Cerca nel workspace"}
          />
        )}
      >
        <IconSearch aria-hidden />
        {iconOnly ? <span className="sr-only">Cerca nel workspace</span> : <><span>Cerca</span><kbd className="ml-auto text-[10px] text-muted-foreground group-data-[collapsible=icon]:hidden">Ctrl K</kbd></>}
      </DialogTrigger>
      <DialogContent className="max-h-[min(92dvh,52rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cerca nel workspace</DialogTitle>
          <DialogDescription>Consulta i metadati operativi che sei autorizzato a vedere. La ricerca non è una destinazione della navigazione.</DialogDescription>
        </DialogHeader>
        <UniversalSearchWidget />
      </DialogContent>
    </Dialog>
  );
}
