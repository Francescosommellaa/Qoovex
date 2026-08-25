import { CloseButton } from "../close-button"

const labelled = <CloseButton aria-label="Chiudi pannello" />
const labelledBy = <CloseButton aria-labelledby="close-panel-label" />
const disabled = <CloseButton aria-label="Chiudi pannello" disabled />

// @ts-expect-error CloseButton requires aria-label or aria-labelledby.
const unnamed = <CloseButton />

// @ts-expect-error IconX is owned by CloseButton.
const children = <CloseButton aria-label="Chiudi pannello">X</CloseButton>

// @ts-expect-error CloseButton has one quiet presentation.
const variant = <CloseButton aria-label="Chiudi pannello" variant="destructive" />

// @ts-expect-error CloseButton has one canonical size.
const size = <CloseButton aria-label="Chiudi pannello" size="xs" />

// @ts-expect-error CloseButton is an immediate UI command and has no loading lifecycle.
const loading = <CloseButton aria-label="Chiudi pannello" loading />

// @ts-expect-error Fixed visual geometry cannot be replaced through inline styles.
const geometryOverride = <CloseButton aria-label="Chiudi pannello" style={{ width: 64 }} />

void [labelled, labelledBy, disabled, unnamed, children, variant, size, loading, geometryOverride]
