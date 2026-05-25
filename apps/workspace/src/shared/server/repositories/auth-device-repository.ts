import "server-only";

import { db } from "@qoovex/db";

export interface UpsertAuthDeviceInput {
  userId: string;
  fingerprintHash: string;
  userAgentHash?: string | null;
  label?: string | null;
}

export async function upsertAuthDevice(input: UpsertAuthDeviceInput) {
  const existing = await db.authDevice.findUnique({
    where: {
      userId_fingerprintHash: {
        userId: input.userId,
        fingerprintHash: input.fingerprintHash,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.authDevice.update({
      where: { id: existing.id },
      data: {
        userAgentHash: input.userAgentHash ?? null,
        label: input.label ?? null,
        lastSeenAt: new Date(),
      },
    });
    return { isNew: false, id: existing.id };
  }

  const device = await db.authDevice.create({
    data: {
      userId: input.userId,
      fingerprintHash: input.fingerprintHash,
      userAgentHash: input.userAgentHash ?? null,
      label: input.label ?? null,
    },
    select: { id: true },
  });

  return { isNew: true, id: device.id };
}
