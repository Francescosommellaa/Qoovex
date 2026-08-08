"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import {
  IconEye,
  IconEyeOff,
  IconSearch,
  IconX,
  IconPlus,
  IconMinus,
  IconChevronDown,
  IconCalendar,
  IconClock,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { Button } from "#components/button"
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
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1.5 text-base sm:text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/30 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        // Eliminazione freccette native spinner e X di cancellazione browser per evitare sovrapposizioni
        "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
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
      className={cn(
        "relative flex w-full items-center rounded-lg border border-input bg-transparent text-sm transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/30 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function InputAddon({
  className,
  position = "left",
  ...props
}: React.ComponentProps<"div"> & { position?: "left" | "right" }) {
  return (
    <div
      data-slot="input-addon"
      data-position={position}
      className={cn(
        "flex h-9 items-center px-3 text-xs font-medium text-muted-foreground select-none shrink-0",
        position === "left" && "border-r border-input/60 rounded-l-lg bg-muted/30",
        position === "right" && "border-l border-input/60 rounded-r-lg bg-muted/30",
        className
      )}
      {...props}
    />
  )
}

function InputIcon({
  className,
  position = "left",
  ...props
}: React.ComponentProps<"div"> & { position?: "left" | "right" }) {
  return (
    <div
      data-slot="input-icon"
      data-position={position}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 text-muted-foreground flex items-center justify-center pointer-events-none shrink-0 [&_svg]:size-4",
        position === "left" ? "left-3" : "right-3",
        className
      )}
      {...props}
    />
  )
}

function PasswordInput({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Nascondi password" : "Mostra password"}
      >
        {showPassword ? <IconEyeOff /> : <IconEye />}
      </Button>
    </div>
  )
}

function SearchInput({
  className,
  value,
  onChange,
  onClear,
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { onClear?: () => void }) {
  const isControlled = value !== undefined
  const hasValue = isControlled ? Boolean(value) : false

  return (
    <div className="relative w-full">
      <InputIcon position="left">
        <IconSearch />
      </InputIcon>
      <Input
        type="search"
        value={value}
        onChange={onChange}
        className={cn("pl-9 pr-9", className)}
        {...props}
      />
      {hasValue && onClear ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={onClear}
          aria-label="Azzera ricerca"
        >
          <IconX />
        </Button>
      ) : null}
    </div>
  )
}

const DEFAULT_COUNTRIES = [
  { code: "IT", name: "Italia", dialCode: "+39", flag: "🇮🇹" },
  { code: "FR", name: "Francia", dialCode: "+33", flag: "🇫🇷" },
  { code: "DE", name: "Germania", dialCode: "+49", flag: "🇩🇪" },
  { code: "ES", name: "Spagna", dialCode: "+34", flag: "🇪🇸" },
  { code: "GB", name: "Regno Unito", dialCode: "+44", flag: "🇬🇧" },
  { code: "US", name: "Stati Uniti", dialCode: "+1", flag: "🇺🇸" },
  { code: "CH", name: "Svizzera", dialCode: "+41", flag: "🇨🇭" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Belgio", dialCode: "+32", flag: "🇧🇪" },
  { code: "NL", name: "Paesi Bassi", dialCode: "+31", flag: "🇳🇱" },
  { code: "PT", name: "Portogallo", dialCode: "+351", flag: "🇵🇹" },
  { code: "RO", name: "Romania", dialCode: "+40", flag: "🇷🇴" },
  { code: "GR", name: "Grecia", dialCode: "+30", flag: "🇬🇷" },
]

function PhoneInput({
  className,
  value,
  onChange,
  defaultCountry = "IT",
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  defaultCountry?: string
}) {
  const [selectedCountry, setSelectedCountry] = React.useState(
    DEFAULT_COUNTRIES.find((c) => c.code === defaultCountry) || DEFAULT_COUNTRIES[0]
  )
  const [search, setSearch] = React.useState("")

  const filteredCountries = DEFAULT_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <InputGroup className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 px-3 text-xs font-medium text-foreground select-none shrink-0 border-r border-input/60 rounded-l-lg bg-muted/30 hover:bg-muted/60 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/30"
            />
          }
        >
          <span>{selectedCountry.flag}</span>
          <span className="font-accent">{selectedCountry.dialCode}</span>
          <IconChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-2">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Prefisso Paese</DropdownMenuLabel>
            <div className="relative mb-2 px-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cerca paese o prefisso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent pl-8 pr-2 text-xs outline-none focus:border-ring focus:ring-1 focus:ring-ring/30"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-none">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((c) => (
                  <DropdownMenuItem
                    key={c.code}
                    className={cn(
                      "flex items-center justify-between",
                      c.code === selectedCountry.code && "bg-accent/60 font-semibold"
                    )}
                    onClick={() => setSelectedCountry(c)}
                  >
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="font-accent text-muted-foreground">{c.dialCode}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <p className="p-2 text-center text-xs text-muted-foreground">Nessun paese trovato</p>
              )}
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        type="tel"
        value={value}
        onChange={onChange}
        className="rounded-l-none font-accent border-0 focus-visible:ring-0"
        placeholder="334 567 8901"
        {...props}
      />
    </InputGroup>
  )
}

const DEFAULT_CURRENCIES = [
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
]

function CurrencyInput({
  className,
  value,
  onChange,
  defaultCurrency = "EUR",
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & {
  defaultCurrency?: string
}) {
  const [selectedCurrency, setSelectedCurrency] = React.useState(
    DEFAULT_CURRENCIES.find((c) => c.code === defaultCurrency) || DEFAULT_CURRENCIES[0]
  )

  return (
    <InputGroup className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex h-9 items-center gap-1.5 px-3 text-xs font-medium text-foreground select-none shrink-0 border-r border-input/60 rounded-l-lg bg-muted/30 hover:bg-muted/60 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring/30"
            />
          }
        >
          <span className="font-accent font-bold text-primary">{selectedCurrency.symbol}</span>
          <span className="font-accent text-muted-foreground">{selectedCurrency.code}</span>
          <IconChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 p-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Seleziona Valuta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {DEFAULT_CURRENCIES.map((c) => (
              <DropdownMenuItem
                key={c.code}
                className={cn(
                  "flex items-center justify-between",
                  c.code === selectedCurrency.code && "bg-accent/60 font-semibold"
                )}
                onClick={() => setSelectedCurrency(c)}
              >
                <span className="font-accent font-bold">{c.symbol}</span>
                <span className="text-muted-foreground">{c.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Input
        type="text"
        value={value}
        onChange={onChange}
        className="rounded-l-none font-accent border-0 focus-visible:ring-0"
        placeholder="12500,00"
        {...props}
      />
    </InputGroup>
  )
}

function NumberInput({
  className,
  value = 0,
  min,
  max,
  step = 1,
  onChangeValue,
  ...props
}: Omit<React.ComponentProps<"input">, "type" | "onChange" | "value" | "min" | "max" | "step"> & {
  value?: number
  min?: number
  max?: number
  step?: number
  onChangeValue?: (val: number) => void
}) {
  const handleIncrement = () => {
    const next = Number(value ?? 0) + Number(step)
    if (max !== undefined && next > Number(max)) return
    onChangeValue?.(next)
  }

  const handleDecrement = () => {
    const next = Number(value ?? 0) - Number(step)
    if (min !== undefined && next < Number(min)) return
    onChangeValue?.(next)
  }

  return (
    <div className="relative flex w-full items-center">
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        className="absolute left-1.5 z-10 size-6 rounded-md"
        onClick={handleDecrement}
      >
        <IconMinus className="size-3" />
      </Button>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChangeValue?.(Number(e.target.value))}
        className={cn("px-9 text-center font-accent", className)}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        className="absolute right-1.5 z-10 size-6 rounded-md"
        onClick={handleIncrement}
      >
        <IconPlus className="size-3" />
      </Button>
    </div>
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
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }}
            >
              <IconChevronLeft />
            </Button>
            <span className="text-xs font-semibold font-accent">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }}
            >
              <IconChevronRight />
            </Button>
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
                  className="flex size-8 items-center justify-center rounded-lg p-0 text-xs font-medium font-accent justify-center"
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
            <div className="flex-1 max-h-40 overflow-y-auto scrollbar-none space-y-0.5">
              <p className="px-2 py-1 text-[0.625rem] font-semibold text-muted-foreground uppercase font-accent">Ora</p>
              {hours.map((h) => (
                <DropdownMenuItem
                  key={h}
                  className={cn(
                    "px-2 py-1 text-xs font-accent font-medium rounded-md",
                    h === selectedHour && "bg-accent font-bold text-accent-foreground"
                  )}
                  onClick={() => onChangeTime?.(`${h}:${selectedMinute || "00"}`)}
                >
                  {h}
                </DropdownMenuItem>
              ))}
            </div>
            <div className="w-px bg-border/50" />
            <div className="flex-1 max-h-40 overflow-y-auto scrollbar-none space-y-0.5">
              <p className="px-2 py-1 text-[0.625rem] font-semibold text-muted-foreground uppercase font-accent">Min</p>
              {minutes.map((m) => (
                <DropdownMenuItem
                  key={m}
                  className={cn(
                    "px-2 py-1 text-xs font-accent font-medium rounded-md",
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
  PasswordInput,
  SearchInput,
  PhoneInput,
  CurrencyInput,
  NumberInput,
  OTPInput,
  DatePickerInput,
  TimePickerInput,
}
