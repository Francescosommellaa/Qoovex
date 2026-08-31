"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { inputControlClassName } from "./input/input-styles"
import {
  IconCalendar,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { IconButton } from "#components/icon-button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "#components/dropdown-menu"
import { cn } from "#lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-focus-target="composite"
      className={cn(
        inputControlClassName,
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Temporary compatibility: native numeric consumers still overlay their
        // own controls. NumberInput owns their eventual migration.
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        className
      )}
      {...props}
    />
  )
}

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      data-focus-owner="composite"
      className={cn(
        "qv-input-group qv-touch-target-field relative flex h-9 w-full min-w-0 items-center rounded-lg border text-base sm:text-sm",
        className
      )}
      {...props}
    />
  )
}

function InputAddon({
  className,
  position,
  children,
  ...props
}: React.ComponentProps<"div"> & { position?: "left" | "right" }) {
  return (
    <div
      data-slot="input-addon"
      data-position={position}
      className={cn(
        "qv-input-addon flex shrink-0 items-center px-3 text-muted-foreground",
        className
      )}
      {...props}
    >
      <span>{children}</span>
    </div>
  )
}

function InputIcon({
  className,
  position = "left",
  "aria-hidden": ariaHidden = true,
  ...props
}: React.ComponentProps<"div"> & { position?: "left" | "right" }) {
  return (
    <div
      data-slot="input-icon"
      data-position={position}
      aria-hidden={ariaHidden}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none shrink-0 [&_svg]:size-4",
        position === "left" ? "left-3" : "right-3",
        className
      )}
      {...props}
    />
  )
}

function OTPInput({
  length = 6,
  value = "",
  onChangeOTP,
  className,
}: {
  length?: number
  value?: string
  onChangeOTP?: (otp: string) => void
  className?: string
}) {
  const inputsRef = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.slice(-1)
    const newOtp = value.split("")
    newOtp[idx] = val
    const combined = newOtp.join("")
    onChangeOTP?.(combined)

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el
          }}
          type="text"
          maxLength={1}
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className="h-11 w-10 text-center font-accent text-lg font-bold rounded-lg border border-input bg-background shadow-2xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all"
        />
      ))}
    </div>
  )
}

function DatePickerInput({
  className,
  value,
  onChangeDate,
  placeholder = "Seleziona data...",
}: {
  className?: string
  value?: string
  onChangeDate?: (dateStr: string) => void
  placeholder?: string
}) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const formattedDate = value ? value : ""

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()
  const firstDayIndex = (new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay() + 6) % 7

  const monthNames = [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
    "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
  ]

  const handleSelectDay = (day: number) => {
    const yyyy = currentMonth.getFullYear()
    const mm = String(currentMonth.getMonth() + 1).padStart(2, "0")
    const dd = String(day).padStart(2, "0")
    const dateStr = `${yyyy}-${mm}-${dd}`
    onChangeDate?.(dateStr)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative w-full cursor-pointer text-left border-0 p-0 bg-transparent outline-none"
          >
            <InputIcon position="left">
              <IconCalendar />
            </InputIcon>
            <Input
              readOnly
              value={formattedDate}
              placeholder={placeholder}
              className={cn("pl-9 font-accent cursor-pointer", className)}
            />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-72 p-3">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Seleziona Data</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="flex items-center justify-between mb-3 pt-1">
            <IconButton
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Mese precedente"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }}
            >
              <IconChevronLeft aria-hidden="true" />
            </IconButton>
            <span className="text-xs font-semibold font-accent">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <IconButton
              type="button"
              variant="ghost"
              size="xs"
              aria-label="Mese successivo"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }}
            >
              <IconChevronRight aria-hidden="true" />
            </IconButton>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {["Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"].map((d) => (
              <span key={d} className="text-[0.6875rem] font-semibold text-muted-foreground">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              return (
                <DropdownMenuItem
                  key={day}
                  className="flex size-8 items-center justify-center rounded-lg p-0 text-xs font-semibold font-accent justify-center"
                  onClick={() => handleSelectDay(day)}
                >
                  {day}
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TimePickerInput({
  className,
  value = "09:00",
  onChangeTime,
}: {
  className?: string
  value?: string
  onChangeTime?: (timeStr: string) => void
}) {
  const hours = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, "0"))
  const minutes = ["00", "15", "30", "45"]
  const [selectedHour, selectedMinute] = value.split(":")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative w-full cursor-pointer text-left border-0 p-0 bg-transparent outline-none"
          >
            <InputIcon position="left">
              <IconClock />
            </InputIcon>
            <Input
              readOnly
              value={value}
              className={cn("pl-9 font-accent cursor-pointer", className)}
            />
          </button>
        }
      />
      <DropdownMenuContent align="start" className="w-48 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Seleziona Orario</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="flex gap-1 pt-1">
            <div className="flex-1 max-h-40 overflow-y-auto space-y-0.5">
              <p className="px-2 py-1 text-[0.625rem] font-semibold text-muted-foreground uppercase font-accent">Ora</p>
              {hours.map((h) => (
                <DropdownMenuItem
                  key={h}
                  className={cn(
                    "px-2 py-1 text-xs font-accent font-semibold rounded-md",
                    h === selectedHour && "bg-accent font-bold text-accent-foreground"
                  )}
                  onClick={() => onChangeTime?.(`${h}:${selectedMinute || "00"}`)}
                >
                  {h}
                </DropdownMenuItem>
              ))}
            </div>
            <div className="w-px bg-border/50" />
            <div className="flex-1 max-h-40 overflow-y-auto space-y-0.5">
              <p className="px-2 py-1 text-[0.625rem] font-semibold text-muted-foreground uppercase font-accent">Min</p>
              {minutes.map((m) => (
                <DropdownMenuItem
                  key={m}
                  className={cn(
                    "px-2 py-1 text-xs font-accent font-semibold rounded-md",
                    m === selectedMinute && "bg-accent font-bold text-accent-foreground"
                  )}
                  onClick={() => onChangeTime?.(`${selectedHour || "09"}:${m}`)}
                >
                  {m}
                </DropdownMenuItem>
              ))}
            </div>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  Input,
  InputGroup,
  InputAddon,
  InputIcon,
  OTPInput,
  DatePickerInput,
  TimePickerInput,
}
