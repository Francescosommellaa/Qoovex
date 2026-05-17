"use client";

import * as React from "react";
import { cn } from "@qoovex/ui";
import styles from "./workspace-scroll-area.module.css";

interface WorkspaceScrollAreaProps {
  children: React.ReactNode;
}

export function WorkspaceScrollArea({ children }: WorkspaceScrollAreaProps) {
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          styles.viewport,
          "h-full overflow-y-auto overscroll-contain px-(--spacing-3) pb-(--spacing-5) pt-(--spacing-2) md:px-(--spacing-5) md:pb-(--spacing-6) md:pt-(--spacing-3) lg:px-(--spacing-8)",
        )}
      >
        {children}
      </div>
    </div>
  );
}
