import { redirect } from "next/navigation";

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  redirect(`/people/assignments${from ? `?from=${encodeURIComponent(from)}` : ""}`);
}
