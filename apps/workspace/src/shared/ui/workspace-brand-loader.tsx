"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@qoovex/ui";
import styles from "./workspace-brand-loader.module.css";

export interface WorkspaceBrandLoaderProps {
  fullscreen?: boolean;
  delayedMs?: number;
  label?: React.ReactNode;
}

export function WorkspaceBrandLoader({
  fullscreen = false,
  delayedMs = 0,
  label = "Prepariamo il tuo workspace...",
}: WorkspaceBrandLoaderProps) {
  const [visible, setVisible] = React.useState(delayedMs <= 0);

  React.useEffect(() => {
    if (delayedMs <= 0) {
      setVisible(true);
      return;
    }

    const timeoutId = window.setTimeout(() => setVisible(true), delayedMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayedMs]);

  if (!visible) return null;

  return (
    <div
      className={cn(styles.root, fullscreen && styles.fullscreen)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={styles.inner}>
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.pulse} aria-hidden="true" />
        <span className={styles.logoWrap} aria-hidden="true">
          <Image
            src="/logo-icon/qoovex-icona-bianca-no-sfondo.svg"
            alt=""
            width={64}
            height={64}
            className={styles.logo}
          />
        </span>
        {label ? <span className={styles.label}>{label}</span> : null}
      </div>
    </div>
  );
}
