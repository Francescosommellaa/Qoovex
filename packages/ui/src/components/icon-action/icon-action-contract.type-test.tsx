import { IconSettings } from "@tabler/icons-react"

import { IconAction } from "../icon-action"

const forward = <IconAction intent="forward" />
const visibility = <IconAction intent="visibility" state="hidden" />
const disclosure = <IconAction intent="disclosure" state="open" />
const menu = <IconAction intent="menu" state="closed" />
const copy = <IconAction intent="copy" state="success" />
const neutral = <IconAction icon={IconSettings} intent="neutral" />

// @ts-expect-error Stateful intents require a semantic state.
const missingState = <IconAction intent="visibility" />

// @ts-expect-error Motion primitives are not part of the public contract.
const motionPrimitive = <IconAction duration={0.2} intent="forward" />

// @ts-expect-error Canonical intents own their glyph.
const replacedGlyph = <IconAction icon={IconSettings} intent="increment" />

// @ts-expect-error Glyph geometry is owned by the foundation.
const customGeometry = <IconAction className="size-8" intent="forward" />

void forward
void visibility
void disclosure
void menu
void copy
void neutral
void missingState
void motionPrimitive
void replacedGlyph
void customGeometry
