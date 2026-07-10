import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { recordRuntimeErrorBestEffort } = await import("@shared/server/runtime-error-service");
  await recordRuntimeErrorBestEffort({
    error,
    source: `${context.routeType}:${context.renderSource ?? "server"}`,
    routePath: request.path,
    requestMethod: request.method,
    digest: error instanceof Error && "digest" in error ? String(error.digest) : null,
    requestId: typeof request.headers["x-vercel-id"] === "string" ? request.headers["x-vercel-id"] : null,
  });
};
