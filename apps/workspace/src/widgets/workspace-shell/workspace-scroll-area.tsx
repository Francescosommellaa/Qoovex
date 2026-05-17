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
          "h-full overflow-y-auto overscroll-contain px-(--spacing-4) pb-(--spacing-6) pt-(--spacing-4) md:px-(--spacing-6) md:pb-(--spacing-8) lg:px-(--spacing-8)",
        )}
      >
        {children}
      </div>
    </div>
  );
}
