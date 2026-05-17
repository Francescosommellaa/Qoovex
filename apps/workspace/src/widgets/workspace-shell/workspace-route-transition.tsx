"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import styles from "./workspace-route-transition.module.css";

interface WorkspaceRouteTransitionProps {
  children: React.ReactNode;
}

export function WorkspaceRouteTransition({
  children,
}: WorkspaceRouteTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={styles.frame}>
      {children}
    </div>
  );
}
