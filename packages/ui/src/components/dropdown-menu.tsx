"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "#lib/utils"
import { usePlatform } from "#hooks/use-platform"
import { IconChevronRight, IconCheck } from "@tabler/icons-react"

/* ─── Context for Sliding Hover Indicator ─────────────────────── */

type MenuHoverIndicator = {
  height: number
  visible: boolean
  x: number
  y: number
  width: number
  variant?: "default" | "destructive"
}

const hiddenMenuIndicator: MenuHoverIndicator = {
  height: 0,
  visible: false,
  width: 0,
  x: 0,
  y: 0,
  variant: "default",
}

type MenuHoverContextValue = {
  moveHoverIndicator: (element: HTMLElement, variant?: "default" | "destructive") => void
  clearHoverIndicator: () => void
}

const MenuHoverContext = React.createContext<MenuHoverContextValue | null>(null)

/* ─── Components ─────────────────────────────────────────────── */

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  children,
  onMouseLeave: onMouseLeaveProp,
  onBlur: onBlurProp,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState(hiddenMenuIndicator)

  const moveHoverIndicator = React.useCallback(
    (element: HTMLElement, variant: "default" | "destructive" = "default") => {
      const content = contentRef.current
      if (!content) return
      const contentRect = content.getBoundingClientRect()
      const elRect = element.getBoundingClientRect()
      setHover({
        height: elRect.height,
        visible: true,
        width: elRect.width,
        x: elRect.left - contentRect.left,
        y: elRect.top - contentRect.top,
        variant,
      })
    },
    []
  )

  const clearHoverIndicator = React.useCallback(() => {
    setHover((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleMouseLeave = React.useCallback(
    (event: any) => {
      onMouseLeaveProp?.(event)
      clearHoverIndicator()
    },
    [onMouseLeaveProp, clearHoverIndicator]
  )

  const handleBlur = React.useCallback(
    (event: any) => {
      onBlurProp?.(event)
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return
      }
      clearHoverIndicator()
    },
    [onBlurProp, clearHoverIndicator]
  )

  const indicatorStyle: React.CSSProperties = {
    height: hover.height,
    opacity: hover.visible ? 1 : 0,
    transform: `translate3d(${hover.x}px, ${hover.y}px, 0)`,
    width: hover.width,
  }

  const ctxValue = React.useMemo<MenuHoverContextValue>(
    () => ({ moveHoverIndicator, clearHoverIndicator }),
    [moveHoverIndicator, clearHoverIndicator]
  )

  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuHoverContext.Provider value={ctxValue}>
          <MenuPrimitive.Popup
            ref={contentRef}
            data-slot="dropdown-menu-content"
            className={cn(
              "relative z-50 max-h-(--available-height) min-w-44 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-lg backdrop-blur-md duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              className
            )}
            onMouseLeave={handleMouseLeave}
            onBlur={handleBlur}
            {...props}
          >
            <span
              aria-hidden="true"
              className="dropdown-menu__hover-indicator rounded-lg"
              data-variant={hover.variant ?? "default"}
              style={indicatorStyle}
            />
            {children}
          </MenuPrimitive.Popup>
        </MenuHoverContext.Provider>
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-accent data-inset:pl-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  const menuHoverCtx = React.useContext(MenuHoverContext)

  const handleMouseEnter = (event: any) => {
    onMouseEnterProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget, variant)
  }

  const handleFocus = (event: any) => {
    onFocusProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget, variant)
  }

  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "group/dropdown-menu-item relative z-10 flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium outline-none select-none transition-colors duration-200 data-inset:pl-8 data-[variant=destructive]:text-destructive data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-foreground/90",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  const menuHoverCtx = React.useContext(MenuHoverContext)

  const handleMouseEnter = (event: any) => {
    onMouseEnterProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  const handleFocus = (event: any) => {
    onFocusProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "relative z-10 flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium outline-none select-none transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus:bg-transparent focus:text-accent-foreground data-highlighted:bg-transparent data-inset:pl-8 data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-foreground/90",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      {children}
      <IconChevronRight className="ml-auto text-muted-foreground" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 4,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn("min-w-40 rounded-xl bg-popover/95 p-1.5 text-popover-foreground shadow-xl border border-border backdrop-blur-md duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", className)}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  const menuHoverCtx = React.useContext(MenuHoverContext)

  const handleMouseEnter = (event: any) => {
    onMouseEnterProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  const handleFocus = (event: any) => {
    onFocusProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "relative z-10 flex cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2.5 text-xs sm:text-sm font-medium outline-none select-none transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus:bg-transparent focus:text-accent-foreground data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-foreground/90",
        className
      )}
      checked={checked}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center text-primary"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <IconCheck className="size-4" />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  const menuHoverCtx = React.useContext(MenuHoverContext)

  const handleMouseEnter = (event: any) => {
    onMouseEnterProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  const handleFocus = (event: any) => {
    onFocusProp?.(event)
    menuHoverCtx?.moveHoverIndicator(event.currentTarget)
  }

  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        "relative z-10 flex cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2.5 text-xs sm:text-sm font-medium outline-none select-none transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] focus:bg-transparent focus:text-accent-foreground data-highlighted:bg-transparent data-inset:pl-8 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 text-foreground/90",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2.5 flex items-center justify-center text-primary"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator>
          <IconCheck className="size-4" />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("-mx-1.5 my-1 h-px bg-border/60", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const platform = usePlatform()

  if (platform === "mobile") {
    return null
  }

  const formattedChildren = React.useMemo(() => {
    if (typeof children !== "string") return children
    if (platform === "windows") {
      return children
        .replace(/⌘/g, "Ctrl+")
        .replace(/⌫/g, "Del")
        .replace(/⌥/g, "Alt+")
        .replace(/⇧/g, "Shift+")
    }
    return children
  }, [children, platform])

  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ml-auto hidden md:inline-block font-mono text-[0.6875rem] tracking-wider text-muted-foreground/70 font-medium select-none truncate max-w-[5rem]",
        className
      )}
      {...props}
    >
      {formattedChildren}
    </span>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
