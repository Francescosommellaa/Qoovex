import { IconPin } from "@tabler/icons-react"

import { ToggleButton } from "../toggle-button"

const text = <ToggleButton>Fissa</ToggleButton>
const textWithIcon = <ToggleButton><IconPin />Fissa</ToggleButton>
const labelledIcon = <ToggleButton aria-label="Fissato" size="icon"><IconPin /></ToggleButton>
const labelledByIcon = <ToggleButton aria-labelledby="pin-label" size="icon-sm"><IconPin /></ToggleButton>

// @ts-expect-error Icon-only ToggleButton requires aria-label or aria-labelledby.
const unnamedIcon = <ToggleButton size="icon"><IconPin /></ToggleButton>

// @ts-expect-error ToggleButton has one quiet presentation and no command variants.
const commandVariant = <ToggleButton variant="primary">Fissa</ToggleButton>

// @ts-expect-error ToggleButton does not expose loading semantics.
const loading = <ToggleButton loading>Fissa</ToggleButton>

void text
void textWithIcon
void labelledIcon
void labelledByIcon
void unnamedIcon
void commandVariant
void loading
