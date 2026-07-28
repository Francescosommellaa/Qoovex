import { notFound } from "next/navigation";
import { getOperationalProcess } from "@features/operational-engine/server/operational-read-service";
import { AccessError } from "@shared/server/access-errors";
import { OperationalProcessView } from "@/views/operational-center/OperationalProcessView";

export default async function OperationalProcessPage({ params }: { params: Promise<{ processId: string }> }) {
  const { processId } = await params;
  try { return <OperationalProcessView process={await getOperationalProcess(processId)} />; }
  catch (error) { if (error instanceof AccessError && error.status === 404) notFound(); throw error; }
}
