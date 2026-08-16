import { db } from "@qoovex/db";
import { afterAll } from "vitest";

afterAll(async () => {
  await db.$disconnect();
});
