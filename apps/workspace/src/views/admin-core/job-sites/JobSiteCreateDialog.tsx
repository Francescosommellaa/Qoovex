"use client";

import { IconBuildingPlus } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@qoovex/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobSiteForm } from "./JobSiteForm";

interface JobSiteCreateDialogProps {
  className?: string;
  initialOpen?: boolean;
}

export function JobSiteCreateDialog({ className, initialOpen = false }: JobSiteCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && initialOpen) router.replace("/job-sites", { scroll: false });
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button className={className} type="button" />}>
        <IconBuildingPlus aria-hidden="true" />
        Aggiungi cantiere
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Aggiungi cantiere</DialogTitle>
          <DialogDescription>Registra le informazioni utili per collegare persone, documenti e attività.</DialogDescription>
        </DialogHeader>
        <JobSiteForm layout="dialog" mode="create" onCreated={() => handleOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
