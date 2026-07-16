"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@qoovex/ui/components/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@qoovex/ui/components/tooltip";

const voices = [
  {
    initials: "TI",
    role: "Titolare di impresa",
    context: "Coordina persone, cantieri e scadenze",
  },
  {
    initials: "SU",
    role: "Subappaltatore",
    context: "Deve consegnare documenti e prove",
  },
  {
    initials: "AR",
    role: "Artigiano",
    context: "Lavora tra ufficio e cantiere",
  },
  {
    initials: "CS",
    role: "Consulente sicurezza",
    context: "Prepara contenuti per la revisione",
  },
] as const;

export function IllustrativeVoices() {
  return (
    <AvatarGroup aria-label="Profili rappresentati negli scenari illustrativi">
      {voices.map((voice) => (
        <Tooltip key={voice.initials}>
          <TooltipTrigger
            render={
              <button
                aria-label={`${voice.role}: ${voice.context}`}
                className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                type="button"
              />
            }
          >
            <Avatar className="size-11 ring-background sm:size-12" size="lg">
              <AvatarFallback className="bg-card font-mono text-xs font-semibold text-foreground">
                {voice.initials}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent className="flex-col items-start gap-0.5 px-3 py-2">
            <span className="font-medium">{voice.role}</span>
            <span className="text-background/70">{voice.context}</span>
          </TooltipContent>
        </Tooltip>
      ))}
    </AvatarGroup>
  );
}
