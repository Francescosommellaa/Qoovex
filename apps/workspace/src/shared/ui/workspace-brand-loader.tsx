"use client";

import Image from "next/image";
import * as React from "react";
import { cn, useTheme } from "@qoovex/ui";
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
  const { theme } = useTheme();
  const [visible, setVisible] = React.useState(delayedMs <= 0);
  const isVisible = delayedMs <= 0 || visible;
  const logoSrc =
    theme === "white"
      ? "/logo-icon/qoovex-icona-nera-no-sfondo.svg"
      : "/logo-icon/qoovex-icona-bianca-no-sfondo.svg";

  React.useEffect(() => {
    if (delayedMs <= 0) return;

    const timeoutId = window.setTimeout(() => setVisible(true), delayedMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayedMs]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(styles.root, fullscreen && styles.fullscreen)}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <div className={styles.inner}>
        <span className={styles.logoWrap} aria-hidden="true">
          <span className={styles.ring} />
          <Image
            src={logoSrc}
            alt=""
            width={48}
            height={48}
            className={styles.logo}
          />
        </span>
        <span className={styles.progress} aria-hidden="true" />
        {label ? <span className={styles.label}>{label}</span> : null}
      </div>
    </div>
  );
}
