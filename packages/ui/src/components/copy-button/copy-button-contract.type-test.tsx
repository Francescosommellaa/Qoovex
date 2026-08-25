import { CopyButton } from "../copy-button"

const labelled = <CopyButton aria-label="Copia identificativo" value="QVX-014" />
const labelledBy = <CopyButton aria-labelledby="copy-label" value="https://qoovex.com" />
const disabled = <CopyButton aria-label="Copia codice" disabled value="A1B2" />

// @ts-expect-error CopyButton requires aria-label or aria-labelledby.
const unnamed = <CopyButton value="QVX-014" />
// @ts-expect-error CopyButton owns its glyph choreography.
const children = <CopyButton aria-label="Copia" value="QVX-014">Copy</CopyButton>
// @ts-expect-error CopyButton has one quiet presentation.
const variant = <CopyButton aria-label="Copia" value="QVX-014" variant="default" />
// @ts-expect-error CopyButton has one canonical size.
const size = <CopyButton aria-label="Copia" value="QVX-014" size="xs" />
// @ts-expect-error CopyButton owns clipboard activation.
const onClick = <CopyButton aria-label="Copia" onClick={() => undefined} value="QVX-014" />
// @ts-expect-error copied is internal transient feedback, not controlled state.
const copied = <CopyButton aria-label="Copia" copied value="QVX-014" />
// @ts-expect-error fixed visual geometry cannot be replaced through inline styles.
const geometryOverride = <CopyButton aria-label="Copia" style={{ width: 64 }} value="QVX-014" />
// @ts-expect-error only the internal copying state may remain focusable while unavailable.
const focusableDisabled = <CopyButton aria-label="Copia" disabled focusableWhenDisabled value="QVX-014" />

void [labelled, labelledBy, disabled, unnamed, children, variant, size, onClick, copied, geometryOverride, focusableDisabled]
