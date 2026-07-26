"use client";

import { IconUserPlus } from "@tabler/icons-react";
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
import { GuidedWorkerCreateFlow } from "./GuidedWorkerCreateFlow";

interface WorkerCreateDialogProps {
  className?: string;
  initialOpen?: boolean;
  jobSites: Array<{ id: string; name: string }>;
}

export function WorkerCreateDialog({ className, initialOpen = false, jobSites }: WorkerCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen && initialOpen) router.replace("/workers", { scroll: false });
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogTrigger render={<Button className={className} type="button" />}>
        <IconUserPlus aria-hidden="true" />
        Aggiungi lavoratore
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-1rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Aggiungi lavoratore</DialogTitle>
          <DialogDescription>Registra il profilo operativo. Se deve usare Qoovex, puoi invitarlo con il ruolo Lavoratore.</DialogDescription>
        </DialogHeader>
        <GuidedWorkerCreateFlow jobSites={jobSites} onCreated={(worker) => { handleOpenChange(false); router.push(`/workers/${worker.id}`); router.refresh(); }} />
      </DialogContent>
    </Dialog>
  );
}
