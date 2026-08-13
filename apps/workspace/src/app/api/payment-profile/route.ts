import { getOrganizationPaymentProfile, upsertOrganizationPaymentProfile } from "@shared/server/job-site-payment-profile-service";
import { asJobSiteApiError } from "@shared/server/job-site-api-response";
import { requireCurrentOrganizationId } from "@shared/server/access-context-service";

export async function GET() { try { return Response.json(await getOrganizationPaymentProfile(await requireCurrentOrganizationId())); } catch (error) { return asJobSiteApiError(error); } }
export async function PUT(request: Request) { try { return Response.json(await upsertOrganizationPaymentProfile(await requireCurrentOrganizationId(), await request.json())); } catch (error) { return asJobSiteApiError(error); } }
