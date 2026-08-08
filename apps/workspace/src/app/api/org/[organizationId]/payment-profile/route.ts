import { getOrganizationPaymentProfile, upsertOrganizationPaymentProfile } from "@shared/server/job-site-payment-profile-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";

export async function GET(_: Request, { params }: { params: Promise<{ organizationId: string }> }) { try { return Response.json(await getOrganizationPaymentProfile((await params).organizationId)); } catch (error) { return asJobSiteApiError(error); } }
export async function PUT(request: Request, { params }: { params: Promise<{ organizationId: string }> }) { try { return Response.json(await upsertOrganizationPaymentProfile((await params).organizationId, await request.json())); } catch (error) { return asJobSiteApiError(error); } }
