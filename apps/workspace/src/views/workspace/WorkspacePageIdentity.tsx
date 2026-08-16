"use client";

import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { usePathname } from "next/navigation";

interface WorkspacePageIdentityValue {
  identity: { label: string; pathname: string } | null;
  section: { label: string; pathname: string } | null;
  setIdentity: Dispatch<SetStateAction<{ label: string; pathname: string } | null>>;
  setSection: Dispatch<SetStateAction<{ label: string; pathname: string } | null>>;
}

const WorkspacePageIdentityContext = createContext<WorkspacePageIdentityValue | null>(null);

export function WorkspacePageIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<WorkspacePageIdentityValue["identity"]>(null);
  const [section, setSection] = useState<WorkspacePageIdentityValue["section"]>(null);
  const value = useMemo(() => ({ identity, section, setIdentity, setSection }), [identity, section]);
  return <WorkspacePageIdentityContext.Provider value={value}>{children}</WorkspacePageIdentityContext.Provider>;
}

function WorkspacePageIdentityRegistration({ label, setIdentity }: { label: string; setIdentity: WorkspacePageIdentityValue["setIdentity"] }) {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    setIdentity({ label, pathname });
    return () => setIdentity((current) => current?.pathname === pathname ? null : current);
  }, [label, pathname, setIdentity]);

  return null;
}

export function WorkspacePageIdentity({ label }: { label: string }) {
  const context = useContext(WorkspacePageIdentityContext);
  return context ? <WorkspacePageIdentityRegistration label={label} setIdentity={context.setIdentity} /> : null;
}

function WorkspacePageSectionIdentityRegistration({ label, setSection }: { label: string; setSection: WorkspacePageIdentityValue["setSection"] }) {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    setSection({ label, pathname });
    return () => setSection((current) => current?.pathname === pathname && current.label === label ? null : current);
  }, [label, pathname, setSection]);

  return null;
}

export function WorkspacePageSectionIdentity({ label }: { label: string }) {
  const context = useContext(WorkspacePageIdentityContext);
  return context ? <WorkspacePageSectionIdentityRegistration label={label} setSection={context.setSection} /> : null;
}

export function useWorkspacePageIdentity(pathname: string) {
  const context = useContext(WorkspacePageIdentityContext);
  return {
    label: context?.identity?.pathname === pathname ? context.identity.label : null,
    sectionLabel: context?.section?.pathname === pathname ? context.section.label : null,
  };
}
