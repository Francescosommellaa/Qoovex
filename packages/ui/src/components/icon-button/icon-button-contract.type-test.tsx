import { IconPlus } from "@tabler/icons-react"

import { IconButton } from "../icon-button"

const labelledBy = <IconButton aria-labelledby="icon-button-name"><IconPlus /></IconButton>
const ariaLabel = <IconButton aria-label="Aggiungi"><IconPlus /></IconButton>

// @ts-expect-error IconButton requires aria-label or aria-labelledby.
const unnamed = <IconButton><IconPlus /></IconButton>

void labelledBy
void ariaLabel
void unnamed
