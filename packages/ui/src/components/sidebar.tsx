"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { useIsMobile } from "#hooks/use-mobile"
import { cn } from "#lib/utils"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "#components/button"
import { Input } from "#components/input"
import { Separator } from "#components/separator"
import { Skeleton } from "#components/skeleton"
import { SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_COOKIE_NAME } from "#lib/sidebar-state"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "#components/tooltip"
import { Badge } from "#components/badge"
import {
  IconLayoutSidebar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconSearch,
} from "@tabler/icons-react"
import {
  useSlidingIndicatorState,
  SlidingIndicatorProvider,
  SlidingIndicator,
  useSlidingIndicator,
  type SlidingIndicatorContextValue,
} from "#components/sliding-indicator"
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  sidebarId: string
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}
const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  inline = false,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  inline?: boolean
}) {
  const isMobile = useIsMobile()
  const sidebarId = React.useId()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      sidebarId,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, sidebarId, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-slot="sidebar-wrapper"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          } as React.CSSProperties
        }
        className={cn(
          "group/sidebar-wrapper flex w-full has-data-[variant=inset]:bg-sidebar",
          inline ? "relative h-full min-h-0" : "min-h-svh",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  inline = false,
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  inline?: boolean
}) {
  const { isMobile, sidebarId, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile && !inline) {
    return (
      <DialogPrimitive.Root open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <DialogPrimitive.Popup
            dir={dir}
            data-sidebar="sidebar"
            data-slot="sidebar"
            data-mobile="true"
            className="fixed inset-y-0 left-0 z-50 flex w-(--sidebar-width) max-w-[calc(100vw-2rem)] flex-col bg-sidebar p-0 text-sidebar-foreground shadow-2xl transition-transform duration-250 ease-out data-ending-style:-translate-x-full data-starting-style:-translate-x-full [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
          >
            <div className="flex h-full w-full flex-col" id={sidebarId}>{children}</div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    )
  }

  return (
    <div
      className={cn(
        "group peer text-sidebar-foreground",
        inline ? "relative flex h-full" : "hidden md:block"
      )}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-[var(--ease-standard)]",
          inline ? "h-full" : "",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "z-10 w-(--sidebar-width) transition-[left,right,width] duration-200 ease-[var(--ease-standard)] data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] flex",
          inline ? "absolute inset-y-0 h-full" : "fixed inset-y-0 hidden h-svh md:flex",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          id={sidebarId}
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { isMobile, open, openMobile, sidebarId, toggleSidebar } = useSidebar()
  const expanded = isMobile ? openMobile : open
  const label = expanded ? "Chiudi navigazione" : "Apri navigazione"

  return (
    <Button
      {...props}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      aria-controls={sidebarId}
      aria-expanded={expanded}
      aria-label={label}
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
    >
      <IconLayoutSidebar aria-hidden="true" />
    </Button>
  )
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { state, toggleSidebar } = useSidebar()
  const label = state === "expanded" ? "Riduci sidebar" : "Espandi sidebar"

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={label}
      tabIndex={-1}
      onClick={toggleSidebar}
      title={label}
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 bg-transparent group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "group-data-[collapsible=offcanvas]:translate-x-0",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

type SidebarInsetProps =
  | ({ as: "div" } & React.ComponentProps<"div">)
  | ({ as?: "main" } & React.ComponentProps<"main">)

function sidebarInsetClassName(className?: string) {
  return cn(
    "relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
    className
  )
}

function SidebarInset(props: SidebarInsetProps) {
  if (props.as === "div") {
    const { as: _as, className, ...divProps } = props
    return <div data-slot="sidebar-inset" className={sidebarInsetClassName(className)} {...divProps} />
  }

  const { as: _as, className, ...mainProps } = props
  return <main data-slot="sidebar-inset" className={sidebarInsetClassName(className)} {...mainProps} />
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("h-8 w-full bg-background shadow-none", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div"> & React.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-[var(--ease-standard)] group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-label",
      sidebar: "group-label",
    },
  })
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button"> & React.ComponentProps<"button">) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-all duration-150 ease-out group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-110 active:scale-90 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-group-action",
      sidebar: "group-action",
    },
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({
  className,
  children,
  onMouseLeave: onMouseLeaveProp,
  onBlur: onBlurProp,
  ...props
}: React.ComponentProps<"ul">) {
  const {
    containerRef,
    indicator,
    moveIndicator,
    clearIndicator,
    handleMouseLeave,
    handleBlur,
  } = useSlidingIndicatorState()

  const slidingCtxValue = React.useMemo<SlidingIndicatorContextValue>(
    () => ({
      indicator,
      moveIndicator,
      clearIndicator,
      containerRef,
    }),
    [indicator, moveIndicator, clearIndicator, containerRef]
  )

  return (
    <SlidingIndicatorProvider value={slidingCtxValue}>
      <ul
        ref={containerRef as React.RefObject<HTMLUListElement>}
        data-slot="sidebar-menu"
        data-sidebar="menu"
        className={cn("relative flex w-full min-w-0 flex-col gap-0", className)}
        onMouseLeave={(e) => {
          onMouseLeaveProp?.(e)
          handleMouseLeave()
        }}
        onBlur={(e) => {
          onBlurProp?.(e)
          handleBlur(e)
        }}
        {...props}
      >
        <SlidingIndicator rounded="md" />
        {children}
      </ul>
    </SlidingIndicatorProvider>
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button relative z-10 flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden hover:text-sidebar-accent-foreground focus-visible:ring-2 active:text-sidebar-accent-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-200 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  onMouseEnter: onMouseEnterProp,
  onFocus: onFocusProp,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()
  const slidingCtx = useSlidingIndicator()

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnterProp?.(event)
      slidingCtx?.moveIndicator(event.currentTarget)
    },
    [onMouseEnterProp, slidingCtx]
  )

  const handleFocus = React.useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      onFocusProp?.(event)
      slidingCtx?.moveIndicator(event.currentTarget)
    },
    [onFocusProp, slidingCtx]
  )

  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
        onMouseEnter: handleMouseEnter,
        onFocus: handleFocus,
      },
      props
    ),
    render: !tooltip ? render : <TooltipTrigger render={render} />,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive,
    },
  })

  if (!tooltip) {
    return comp
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      {comp}
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarCollapseButton({
  className,
  iconOnly = false,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuButton>, "tooltip"> & {
  iconOnly?: boolean
}) {
  const { sidebarId, state, toggleSidebar } = useSidebar()
  const expanded = state === "expanded"
  const label = expanded ? "Riduci menu" : "Espandi menu"
  const Icon = expanded
    ? IconLayoutSidebarLeftCollapse
    : IconLayoutSidebarLeftExpand

  return (
    <SidebarMenuButton
      {...props}
      aria-controls={sidebarId}
      aria-expanded={expanded}
      aria-label={label}
      className={cn(iconOnly && "size-8! w-8! shrink-0 p-2!", className)}
      data-sidebar="collapse-button"
      data-slot="sidebar-collapse-button"
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) toggleSidebar()
      }}
      tooltip={label}
    >
      <Icon aria-hidden="true" />
      {!iconOnly ? <span>{label}</span> : null}
    </SidebarMenuButton>
  )
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: useRender.ComponentProps<"button"> &
  React.ComponentProps<"button"> & {
    showOnHover?: boolean
  }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-all duration-150 ease-out group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:scale-110 active:scale-90 focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
          showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-action",
      sidebar: "menu-action",
    },
  })
}

function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-data-active/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`
  })

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"a"> &
  React.ComponentProps<"a"> & {
    size?: "sm" | "md"
    isActive?: boolean
  }) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn(
          "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-all duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "sidebar-menu-sub-button",
      sidebar: "menu-sub-button",
      size,
      active: isActive,
    },
  })
}

/* ─── SidebarResizeHandle ────────────────────────────────────────────── */

function SidebarResizeHandle({
  minWidth = 224,
  maxWidth = 360,
  defaultWidth = 256,
  onWidthChange,
}: {
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  onWidthChange?: (width: number) => void
}) {
  const { isMobile, state } = useSidebar()
  const drag = React.useRef<{ pointerId: number; startWidth: number; startX: number } | null>(null)
  const previousBodyStyles = React.useRef<{ cursor: string; userSelect: string } | null>(null)

  React.useEffect(() => () => {
    if (!previousBodyStyles.current) return
    document.body.style.cursor = previousBodyStyles.current.cursor
    document.body.style.userSelect = previousBodyStyles.current.userSelect
  }, [])

  if (isMobile || state !== "expanded") return null

  const finishResize = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    drag.current = null
    if (previousBodyStyles.current) {
      document.body.style.cursor = previousBodyStyles.current.cursor
      document.body.style.userSelect = previousBodyStyles.current.userSelect
      previousBodyStyles.current = null
    }
  }

  return (
    <div
      aria-label="Ridimensiona navigazione"
      aria-orientation="vertical"
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      className="absolute inset-y-2 -right-2 z-30 hidden w-4 touch-none cursor-col-resize items-center justify-center outline-none after:h-10 after:w-0.5 after:rounded-full after:bg-transparent hover:after:bg-sidebar-border focus-visible:after:bg-sidebar-ring md:flex"
      data-slot="sidebar-resize-handle"
      onDoubleClick={() => onWidthChange?.(defaultWidth)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") onWidthChange?.(minWidth)
        else if (event.key === "ArrowRight") onWidthChange?.(maxWidth)
        else return
        event.preventDefault()
      }}
      onLostPointerCapture={finishResize}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.focus()
        drag.current = { pointerId: defaultWidth, startWidth: defaultWidth, startX: event.clientX }
        previousBodyStyles.current = { cursor: document.body.style.cursor, userSelect: document.body.style.userSelect }
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"
        event.currentTarget.setPointerCapture(event.pointerId)
        event.preventDefault()
      }}
      onPointerMove={(event) => {
        if (!drag.current || drag.current.pointerId !== event.pointerId) return
        const nextWidth = Math.min(maxWidth, Math.max(minWidth, drag.current.startWidth + event.clientX - drag.current.startX))
        onWidthChange?.(nextWidth)
      }}
      onPointerUp={finishResize}
      role="separator"
      tabIndex={0}
      title="Trascina per ridimensionare. Doppio clic per ripristinare."
    />
  )
}

/* ─── AdaptiveSidebar (AppSidebar) ───────────────────────────────────── */

export interface SidebarNavItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  isActive?: boolean
  onClick?: (event: React.MouseEvent) => void
}

export interface SidebarNavGroup {
  id?: string
  label?: string
  items: SidebarNavItem[]
}

export interface AdaptiveSidebarProps extends Omit<React.ComponentProps<"div">, "children"> {
  brand?: {
    logo?: React.ReactNode
    title?: string
    href?: string
  }
  search?: {
    placeholder?: string
    onClick?: () => void
    shortcut?: string
  }
  groups?: SidebarNavGroup[]
  footer?: {
    account?: {
      name?: string | null
      email?: string | null
      role?: string | null
    }
    actions?: React.ReactNode
  }
  pathname?: string
  resizable?: boolean
  collapsible?: "offcanvas" | "icon" | "none"
  variant?: "sidebar" | "floating" | "inset"
  side?: "left" | "right"
  inline?: boolean
  children?: React.ReactNode
}

function AdaptiveSidebar({
  brand,
  search,
  groups,
  footer,
  pathname,
  resizable = false,
  collapsible = "icon",
  variant = "inset",
  side = "left",
  inline = false,
  className,
  children,
  ...props
}: AdaptiveSidebarProps) {
  const [sidebarWidth, setSidebarWidth] = React.useState(256)

  return (
    <Sidebar
      collapsible={collapsible}
      variant={variant}
      side={side}
      inline={inline}
      className={className}
      style={resizable ? ({ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties) : undefined}
      {...props}
    >
      {/* Header */}
      {(brand || search) && (
        <SidebarHeader className="h-14 flex-row items-center justify-between border-b px-4 py-0 gap-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
          {brand && (
            brand.href ? (
              <a
                href={brand.href}
                className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden text-lg font-bold tracking-tight group-data-[collapsible=icon]:flex-initial group-data-[collapsible=icon]:justify-center"
              >
                {brand.logo}
                {brand.title && (
                  <span className="truncate font-sans text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                    {brand.title}
                  </span>
                )}
              </a>
            ) : (
              <div className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden text-lg font-bold tracking-tight group-data-[collapsible=icon]:flex-initial group-data-[collapsible=icon]:justify-center">
                {brand.logo}
                {brand.title && (
                  <span className="truncate font-sans text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">
                    {brand.title}
                  </span>
                )}
              </div>
            )
          )}
          {search && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={search.placeholder ?? "Cerca"}
              onClick={search.onClick}
              className="group-data-[collapsible=icon]:hidden shrink-0"
            >
              <IconSearch className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          )}
        </SidebarHeader>
      )}

      {/* Main Navigation Content */}
      <SidebarContent>
        {groups?.map((group, groupIdx) => (
          <SidebarGroup key={group.id ?? group.label ?? `group-${groupIdx}`}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.isActive ??
                    (pathname
                      ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                      : false)
                  const ItemIcon = item.icon
                  return (
                    <SidebarMenuItem key={item.name + item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={item.onClick}
                        tooltip={item.name}
                        render={<a href={item.href} />}
                      >
                        {ItemIcon && <ItemIcon />}
                        <span>{item.name}</span>
                        {item.badge !== undefined && (
                          <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {children}
      </SidebarContent>

      {/* Footer */}
      {footer && (
        <SidebarFooter className="border-t p-2 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:items-center">
          {footer.account && (
            <div className="flex items-center justify-between p-2 text-xs group-data-[collapsible=icon]:hidden">
              <div className="flex flex-col min-w-0">
                {footer.account.name && (
                  <span className="font-medium text-foreground truncate">
                    {footer.account.name}
                  </span>
                )}
                {footer.account.email && (
                  <span className="text-muted-foreground truncate">
                    {footer.account.email}
                  </span>
                )}
              </div>
              {footer.account.role && (
                <Badge variant="outline" className="text-[0.65rem] shrink-0">
                  {footer.account.role}
                </Badge>
              )}
            </div>
          )}

          {footer.actions && (
            <div className="w-full group-data-[collapsible=icon]:hidden">
              {footer.actions}
            </div>
          )}
        </SidebarFooter>
      )}

      {/* Resizable Handle */}
      {resizable && (
        <SidebarResizeHandle
          defaultWidth={sidebarWidth}
          onWidthChange={setSidebarWidth}
        />
      )}
    </Sidebar>
  )
}

const AppSidebar = AdaptiveSidebar

export {
  AdaptiveSidebar,
  AppSidebar,
  Sidebar,
  SidebarCollapseButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarResizeHandle,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
