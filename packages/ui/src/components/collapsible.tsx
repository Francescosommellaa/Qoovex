"use client"

import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "#lib/utils"

type CollapsibleContentContextValue = {
  contentId: string | null
  setContentId: (contentId: string | null) => void
}

const CollapsibleContentContext = React.createContext<CollapsibleContentContextValue | null>(null)

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref) {
    ref.current = value
  }
}

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  const [contentId, setContentId] = React.useState<string | null>(null)
  const contextValue = React.useMemo(
    () => ({ contentId, setContentId }),
    [contentId],
  )

  return (
    <CollapsibleContentContext.Provider value={contextValue}>
      <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
    </CollapsibleContentContext.Provider>
  )
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  const context = React.useContext(CollapsibleContentContext)

  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      {...props}
      aria-controls={props["aria-controls"] ?? context?.contentId ?? undefined}
    />
  )
}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  const context = React.useContext(CollapsibleContentContext)
  const { ref: contentRef, ...contentProps } = props
  const handleRef = React.useCallback((element: HTMLDivElement | null) => {
    assignRef(contentRef, element)
    context?.setContentId(element?.id ?? null)
  }, [contentRef, context])

  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      ref={handleRef}
      className={cn(
        "grid grid-rows-[0fr] opacity-0 transition-all duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-open:grid-rows-[1fr] data-open:opacity-100 data-closed:grid-rows-[0fr] data-closed:opacity-0",
        className
      )}
      {...contentProps}
    >
      <div className="overflow-hidden">{children}</div>
    </CollapsiblePrimitive.Panel>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
