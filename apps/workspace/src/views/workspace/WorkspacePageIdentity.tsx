"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";

interface WorkspacePageIdentityValue {
  identity: { label: string; pathname: string } | null;
  setIdentity: Dispatch<SetStateAction<{ label: string; pathname: string } | null>>;
}

const WorkspacePageIdentityContext = createContext<WorkspacePageIdentityValue | null>(null);

export function WorkspacePageIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<WorkspacePageIdentityValue["identity"]>(null);
  const value = useMemo(() => ({ identity, setIdentity }), [identity]);
  return <WorkspacePageIdentityContext.Provider value={value}>{children}</WorkspacePageIdentityContext.Provider>;
}

export function WorkspacePageIdentity({ label }: { label: string }) {
  const pathname = usePathname() ?? "";
  const context = useContext(WorkspacePageIdentityContext);
  const setIdentity = context?.setIdentity;

  useEffect(() => {
    if (!setIdentity) return;
    setIdentity({ label, pathname });
    return () => setIdentity((current) => current?.pathname === pathname ? null : current);
  }, [label, pathname, setIdentity]);

  return null;
}

export function useWorkspacePageIdentity(pathname: string) {
  const context = useContext(WorkspacePageIdentityContext);
  return context?.identity?.pathname === pathname ? context.identity.label : null;
}
