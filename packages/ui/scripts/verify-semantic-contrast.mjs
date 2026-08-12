import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const read = (path) => readFileSync(join(root, path), "utf8")
const tokenSource = read("packages/ui/styles/tokens.css")

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function readBlock(selector) {
  const start = tokenSource.indexOf(`${selector} {`)
  assert(start >= 0, `Blocco token mancante: ${selector}`)
  const openingBrace = tokenSource.indexOf("{", start)
  let depth = 0

  for (let index = openingBrace; index < tokenSource.length; index += 1) {
    if (tokenSource[index] === "{") depth += 1
    if (tokenSource[index] === "}") depth -= 1
    if (depth === 0) return tokenSource.slice(openingBrace + 1, index)
  }

  throw new Error(`Blocco token non chiuso: ${selector}`)
}

function readColor(block, name, seen = new Set()) {
  assert(!seen.has(name), `Riferimento token circolare: --${name}`)
  seen.add(name)
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`))
  assert(match, `Token mancante: --${name}`)
  const value = match[1].trim()
  const reference = value.match(/^var\(--([a-z-]+)\)$/)
  if (reference) return readColor(block, reference[1], seen)
  const color = value.match(
    /^oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/
  )
  assert(color, `Formato colore non supportato per --${name}: ${value}`)
  return {
    lightness: Number(color[1]),
    chroma: Number(color[2]),
    hue: Number(color[3]),
  }
}

function toSrgb({ lightness, chroma, hue }) {
  const radians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b
  const l = lPrime ** 3
  const m = mPrime ** 3
  const s = sPrime ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel)))
  const encode = (channel) =>
    channel <= 0.0031308
      ? 12.92 * channel
      : 1.055 * channel ** (1 / 2.4) - 0.055
  return [...linear.map(encode), 1]
}

function composite(source, backdrop, alpha = source[3]) {
  return [
    source[0] * alpha + backdrop[0] * (1 - alpha),
    source[1] * alpha + backdrop[1] * (1 - alpha),
    source[2] * alpha + backdrop[2] * (1 - alpha),
    1,
  ]
}

function luminance(color) {
  const linearize = (channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4
  return (
    0.2126 * linearize(color[0]) +
    0.7152 * linearize(color[1]) +
    0.0722 * linearize(color[2])
  )
}

function contrast(first, second) {
  const firstLuminance = luminance(first)
  const secondLuminance = luminance(second)
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  )
}

const themes = {
  light: readBlock('[data-theme="vercel"]'),
  dark: readBlock('[data-theme="vercel"].dark'),
}

const reports = []
for (const [themeName, block] of Object.entries(themes)) {
  const colors = Object.fromEntries(
    [
      "background",
      "foreground",
      "muted-foreground",
      "destructive",
      "destructive-foreground",
      "info",
      "info-foreground",
      "success",
      "success-foreground",
      "warning",
      "warning-foreground",
      "warning-emphasis",
    ].map((name) => [name, toSrgb(readColor(block, name))])
  )
  const tinted = (name, alpha) =>
    composite(colors[name], colors.background, alpha)

  const cases = [
    ["Badge destructive", colors.destructive, tinted("destructive", themeName === "dark" ? 0.2 : 0.1), 4.5],
    ["Badge info", colors.info, tinted("info", 0.1), 4.5],
    ["Badge success", colors.success, tinted("success", 0.1), 4.5],
    ["Badge warning", colors["warning-emphasis"], tinted("warning", 0.15), 4.5],
    ["Button destructive", colors.destructive, tinted("destructive", themeName === "dark" ? 0.2 : 0.1), 4.5],
    ["Alert title on info", colors.foreground, tinted("info", 0.1), 4.5],
    ["Alert description on info", colors["muted-foreground"], tinted("info", 0.1), 4.5],
    ["Alert info icon", colors.info, tinted("info", 0.1), 3],
    ["Alert success icon", colors.success, tinted("success", 0.1), 3],
    ["Alert warning icon", colors["warning-emphasis"], tinted("warning", 0.1), 3],
    ["Alert destructive icon", colors.destructive, tinted("destructive", 0.1), 3],
    ["Solid destructive", colors["destructive-foreground"], colors.destructive, 4.5],
    ["Solid info", colors["info-foreground"], colors.info, 4.5],
    ["Solid success", colors["success-foreground"], colors.success, 4.5],
    ["Solid warning", colors["warning-foreground"], colors.warning, 4.5],
    [
      "Warning component edge",
      themeName === "dark" ? colors.warning : colors["warning-emphasis"],
      themeName === "dark" ? colors.background : colors.warning,
      3,
    ],
    [
      "Work queue attention edge",
      composite(colors["warning-emphasis"], colors.background, 0.7),
      tinted("warning", 0.05),
      3,
    ],
    [
      "Work queue blocking edge",
      composite(colors.destructive, colors.background, 0.7),
      tinted("destructive", 0.04),
      3,
    ],
    ["Status destructive", colors.destructive, colors.background, 4.5],
    ["Status info", colors.info, colors.background, 4.5],
    ["Status success", colors.success, colors.background, 4.5],
    ["Status warning", colors["warning-emphasis"], colors.background, 4.5],
  ]

  for (const [label, foreground, background, minimum] of cases) {
    const ratio = contrast(foreground, background)
    assert(
      ratio >= minimum,
      `${themeName} ${label}: contrasto ${ratio.toFixed(2)}:1 sotto ${minimum}:1`
    )
    reports.push(`${themeName} ${label} ${ratio.toFixed(2)}:1`)
  }
}

for (const [path, expected] of [
  ["packages/ui/src/components/badge.tsx", "text-warning-emphasis"],
  ["packages/ui/src/components/alert.tsx", "text-warning-emphasis"],
  ["packages/ui/src/components/dialog.tsx", "text-warning-emphasis"],
  ["packages/ui/src/components/timeline.tsx", "text-warning-emphasis"],
  ["packages/ui/src/components/slider.tsx", "bg-warning-emphasis"],
  ["packages/ui/src/components/work-queue-item.tsx", "border-warning-emphasis/70"],
]) {
  assert(read(path).includes(expected), `${path} non usa ${expected}`)
}

console.log(`Semantic contrast verified (${reports.length} combinations).`)
if (process.env.QOOVEX_CONTRAST_REPORT === "1") {
  console.log(reports.join("\n"))
}
