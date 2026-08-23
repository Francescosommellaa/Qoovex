import { IconBuilding, IconExternalLink } from "@tabler/icons-react";

import styles from "./responsive-contract-proof.module.css";
import { Badge } from "@qoovex/ui/components/badge";
import { Button } from "@qoovex/ui/components/button";
import { cn } from "@qoovex/ui/lib/utils";

type ResponsiveContractProofProps = {
  className?: string;
  label: string;
};

export function ResponsiveContractProof({ className, label }: ResponsiveContractProofProps) {
  return (
    <article
      aria-label={label}
      className={cn("qv-surface-contained rounded-xl p-4", styles.container, className)}
      data-responsive-component
    >
      <div className={styles.composition} data-responsive-composition>
        <div className={styles.summary}>
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted" aria-hidden="true">
            <IconBuilding className="qv-icon-default" />
          </span>
          <div className={styles.copy}>
            <h3 className={cn("font-semibold", styles.title)}>
              Riqualificazione energetica del complesso condominiale di via Alessandro Manzoni
            </h3>
            <p className={cn("mt-1 text-sm text-muted-foreground", styles.longValue)}>
              responsabile.progetto.esteso@azienda-edile-esempio.it
            </p>
            <div className={styles.metadata}>
              <Badge variant="secondary">In revisione</Badge>
              <span className="text-xs tabular-nums text-muted-foreground">22/08/2026 · 14:07</span>
            </div>
          </div>
        </div>

        <div className={styles.actions} data-responsive-actions>
          <Button type="button" variant="outline">
            Condividi
          </Button>
          <Button type="button">
            Apri dettaglio
            <IconExternalLink aria-hidden="true" />
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ResponsiveSafeAreaProof() {
  return (
    <div
      className={cn("qv-surface-base rounded-xl", styles.safeAreaStage)}
      data-responsive-safe-area
    >
      <ResponsiveContractProof label="Composizione dentro una superficie che rispetta la safe area" />
    </div>
  );
}
