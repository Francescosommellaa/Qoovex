import { getOrganizationPaymentProfile, upsertOrganizationPaymentProfile } from "@shared/server/vnext-payment-profile-service";
import { asVNextApiError } from "@shared/server/vnext-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string }> }) { try { return Response.json(await getOrganizationPaymentProfile((await params).organizationId)); } catch (error) { return asVNextApiError(error); } }
export async function PUT(request: Request, { params }: { params: Promise<{ organizationId: string }> }) { try { return Response.json(await upsertOrganizationPaymentProfile((await params).organizationId, await request.json())); } catch (error) { return asVNextApiError(error); } }
