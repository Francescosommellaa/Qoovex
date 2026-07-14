import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "./class-names";

export type TraceProps = HTMLAttributes<HTMLOListElement> & { children: ReactNode };

export type TraceNodeProps = {
  action?: ReactNode;
  children?: ReactNode;
  description?: string;
  label: string;
  title: string;
} & HTMLAttributes<HTMLLIElement>;

export type TraceGapProps = TraceNodeProps;
export type TraceTerminalProps = TraceNodeProps;

export function Trace({ children, className, ...props }: TraceProps) {
  return <ol {...props} className={classNames("qv-trace", className)}>{children}</ol>;
}

function TraceNodeBase({ action, children, className, description, label, title, kind, ...props }: TraceNodeProps & { kind: "node" | "gap" | "terminal" }) {
  return (
    <li {...props} className={classNames("qv-trace-node", className)} data-kind={kind}>
      <span className="qv-trace-label">{label}</span>
      <h3 className="qv-trace-title">{title}</h3>
      {description ? <p className="qv-trace-description">{description}</p> : null}
      {children}
      {action ? <div>{action}</div> : null}
    </li>
  );
}

export function TraceNode(props: TraceNodeProps) {
  return <TraceNodeBase {...props} kind="node" />;
}

export function TraceGap(props: TraceGapProps) {
  return <TraceNodeBase {...props} kind="gap" />;
}

export function TraceTerminal(props: TraceTerminalProps) {
  return <TraceNodeBase {...props} kind="terminal" />;
}
