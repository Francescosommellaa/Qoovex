-- Fase 4 remains additive: existing domain rows and share tokens are preserved.

CREATE TYPE "DocumentPackageRevisionOrigin" AS ENUM ('AUTOMATED_PREPARATION', 'LEGACY_BACKFILL');
CREATE TYPE "DocumentPackageRevisionStatus" AS ENUM ('PREPARED', 'APPROVED');
CREATE TYPE "DocumentPackageShareProposalTarget" AS ENUM ('NAMED_RECIPIENT', 'LINK_PURPOSE');
CREATE TYPE "DocumentPackageShareProposalStatus" AS ENUM ('PREPARING', 'READY_FOR_REVIEW', 'BLOCKED', 'APPROVED', 'PUBLISHED');
CREATE TYPE "OperationalEventType" AS ENUM ('LEGACY_EVENT', 'PROCESS_STARTED', 'STEP_STARTED', 'RULE_APPLIED', 'PROPOSAL_PREPARED', 'AUTOMATION_COMPLETED', 'DOCUMENT_LINKED', 'DOCUMENT_VERSION_ADDED', 'REQUIREMENT_SATISFIED', 'EXCEPTION_OPENED', 'EXCEPTION_RESOLVED', 'DECISION_REQUESTED', 'DECISION_RESOLVED', 'VALUE_CORRECTED', 'RETRY_SCHEDULED', 'PROCESS_BLOCKED', 'PROCESS_RESUMED', 'RESULT_CREATED', 'PACKAGE_PREPARED', 'PACKAGE_UPDATED', 'SHARE_APPROVED', 'SHARE_LINK_CREATED', 'SHARE_LINK_OPENED', 'SHARE_DOWNLOAD_REQUESTED', 'SHARE_LINK_REVOKED', 'SHARE_LINK_EXPIRED', 'PROCESS_COMPLETED', 'PROCESS_COMPLETED_WITH_EXCEPTIONS', 'PROCESS_TECHNICAL_FAILURE');
CREATE TYPE "OperationalActorType" AS ENUM ('SYSTEM', 'USER', 'SUPPORT', 'EXTERNAL');
CREATE TYPE "OperationalEventSourceType" AS ENUM ('ENGINE', 'DOMAIN', 'USER_ACTION', 'SHARING_ACCESS', 'CONTINUOUS_CONTROL');

ALTER TYPE "OperationalArtifactType" ADD VALUE 'SHARE_LINK';
ALTER TYPE "OperationalDecisionType" ADD VALUE 'APPROVE_DOCUMENT_PACKAGE_SHARE';
ALTER TYPE "OperationalProcessType" ADD VALUE 'DOCUMENT_PACKAGE_SHARING';

ALTER TABLE "OperationalEvent"
  ADD COLUMN "actorRole" "OrganizationRole",
  ADD COLUMN "actorType" "OperationalActorType" NOT NULL DEFAULT 'SYSTEM',
  ADD COLUMN "eventType" "OperationalEventType" NOT NULL DEFAULT 'LEGACY_EVENT',
  ADD COLUMN "sourceId" TEXT,
  ADD COLUMN "sourceType" "OperationalEventSourceType" NOT NULL DEFAULT 'ENGINE';

UPDATE "OperationalEvent"
SET "actorType" = 'USER'
WHERE "actorUserId" IS NOT NULL;

ALTER TABLE "ShareLink"
  ADD COLUMN "allowDownload" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "expiredAt" TIMESTAMP(3),
  ADD COLUMN "proposalId" TEXT,
  ADD COLUMN "purpose" TEXT,
  ADD COLUMN "recipientLabel" TEXT,
  ADD COLUMN "revisionId" TEXT;

CREATE TABLE "DocumentPackageRevision" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "documentPackageId" TEXT NOT NULL,
  "revisionNumber" INTEGER NOT NULL,
  "origin" "DocumentPackageRevisionOrigin" NOT NULL,
  "status" "DocumentPackageRevisionStatus" NOT NULL DEFAULT 'PREPARED',
  "manifest" JSONB NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "preparedById" TEXT,
  "approvedById" TEXT,
  "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DocumentPackageRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DocumentPackageShareProposal" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "documentPackageId" TEXT NOT NULL,
  "revisionId" TEXT NOT NULL,
  "processId" TEXT NOT NULL,
  "decisionId" TEXT,
  "targetKind" "DocumentPackageShareProposalTarget" NOT NULL,
  "recipientLabel" TEXT,
  "purpose" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "allowDownload" BOOLEAN NOT NULL DEFAULT false,
  "status" "DocumentPackageShareProposalStatus" NOT NULL DEFAULT 'PREPARING',
  "preparedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "createdById" TEXT NOT NULL,
  "approvedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DocumentPackageShareProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OperationalEventArtifactReference" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "artifactType" "OperationalArtifactType" NOT NULL,
  "artifactId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperationalEventArtifactReference_pkey" PRIMARY KEY ("id")
);

-- Freeze the exact package metadata and references currently served by legacy links.
WITH legacy_manifests AS (
  SELECT
    package."id" AS "documentPackageId",
    package."organizationId",
    package."createdById",
    jsonb_build_object(
      'schemaVersion', 1,
      'package', jsonb_build_object(
        'title', package."title",
        'description', package."description"
      ),
      'items', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', item."id",
            'sourceItemId', item."id",
            'itemType', item."itemType",
            'position', item."position",
            'documentId', item."documentId",
            'documentVersionId', item."documentVersionId",
            'evidenceId', item."evidenceId",
            'checklistId', item."checklistId",
            'title', COALESCE(document."title", version_document."title", evidence."title", checklist."name"),
            'status', COALESCE(document."status"::text, version_document."status"::text, evidence."type"::text, checklist."status"::text),
            'originalFileName', COALESCE(version."originalFileName", evidence."originalFileName"),
            'mimeType', COALESCE(version."mimeType", evidence."mimeType"),
            'size', COALESCE(version."size", evidence."size"),
            'included', CASE
              WHEN item."itemType" = 'DOCUMENT' THEN document."id" IS NOT NULL AND document."archivedAt" IS NULL AND document_type."id" IS NOT NULL AND document_type."sensitivity" = 'STANDARD' AND document_type."categoryKey" <> 'UNCLASSIFIED'
              WHEN item."itemType" = 'DOCUMENT_VERSION' THEN version."id" IS NOT NULL AND version."archivedAt" IS NULL AND version_document."archivedAt" IS NULL AND version_document_type."id" IS NOT NULL AND version_document_type."sensitivity" = 'STANDARD' AND version_document_type."categoryKey" <> 'UNCLASSIFIED'
              WHEN item."itemType" = 'EVIDENCE' THEN evidence."id" IS NOT NULL AND evidence."archivedAt" IS NULL
              WHEN item."itemType" = 'CHECKLIST' THEN checklist."id" IS NOT NULL AND checklist."archivedAt" IS NULL
              WHEN item."itemType" = 'NOTE' THEN true
              ELSE false
            END,
            'exclusionReason', CASE
              WHEN item."itemType" = 'DOCUMENT' AND (document."id" IS NULL OR document."archivedAt" IS NOT NULL OR document_type."id" IS NULL OR document_type."sensitivity" <> 'STANDARD' OR document_type."categoryKey" = 'UNCLASSIFIED') THEN 'Riferimento non disponibile'
              WHEN item."itemType" = 'DOCUMENT_VERSION' AND (version."id" IS NULL OR version."archivedAt" IS NOT NULL OR version_document."archivedAt" IS NOT NULL OR version_document_type."id" IS NULL OR version_document_type."sensitivity" <> 'STANDARD' OR version_document_type."categoryKey" = 'UNCLASSIFIED') THEN 'Versione non disponibile'
              WHEN item."itemType" = 'EVIDENCE' AND (evidence."id" IS NULL OR evidence."archivedAt" IS NOT NULL) THEN 'Prova non disponibile'
              WHEN item."itemType" = 'CHECKLIST' AND (checklist."id" IS NULL OR checklist."archivedAt" IS NOT NULL) THEN 'Checklist non disponibile'
              ELSE NULL
            END,
            'hasFile', CASE
              WHEN item."itemType" = 'DOCUMENT_VERSION' AND version."id" IS NOT NULL AND version."archivedAt" IS NULL AND version_document."archivedAt" IS NULL AND version_document_type."id" IS NOT NULL AND version_document_type."sensitivity" = 'STANDARD' AND version_document_type."categoryKey" <> 'UNCLASSIFIED' THEN true
              WHEN item."itemType" = 'EVIDENCE' AND evidence."blobKey" IS NOT NULL AND evidence."archivedAt" IS NULL THEN true
              ELSE false
            END,
            'note', CASE WHEN item."itemType" = 'NOTE' THEN item."note" ELSE NULL END
          )
          ORDER BY item."position", item."createdAt", item."id"
        )
        FROM "DocumentPackageItem" item
        LEFT JOIN "Document" document ON document."id" = item."documentId"
        LEFT JOIN "DocumentType" document_type ON document_type."id" = document."documentTypeId"
        LEFT JOIN "DocumentVersion" version ON version."id" = item."documentVersionId"
        LEFT JOIN "Document" version_document ON version_document."id" = version."documentId"
        LEFT JOIN "DocumentType" version_document_type ON version_document_type."id" = version_document."documentTypeId"
        LEFT JOIN "Evidence" evidence ON evidence."id" = item."evidenceId"
        LEFT JOIN "Checklist" checklist ON checklist."id" = item."checklistId"
        WHERE item."documentPackageId" = package."id"
      ), '[]'::jsonb),
      'issues', '[]'::jsonb
    ) AS manifest
  FROM "DocumentPackage" package
  WHERE EXISTS (
    SELECT 1 FROM "ShareLink" share_link
    WHERE share_link."documentPackageId" = package."id"
  )
)
INSERT INTO "DocumentPackageRevision" (
  "id", "organizationId", "documentPackageId", "revisionNumber", "origin", "status",
  "manifest", "fingerprint", "preparedById", "approvedById", "preparedAt", "approvedAt", "createdAt"
)
SELECT
  'legacy_revision_' || md5(legacy_manifests."documentPackageId"),
  legacy_manifests."organizationId",
  legacy_manifests."documentPackageId",
  1,
  'LEGACY_BACKFILL',
  'APPROVED',
  legacy_manifests.manifest,
  encode(sha256(convert_to(legacy_manifests.manifest::text, 'UTF8')), 'hex'),
  legacy_manifests."createdById",
  legacy_manifests."createdById",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM legacy_manifests;

UPDATE "ShareLink" share_link
SET
  "revisionId" = 'legacy_revision_' || md5(share_link."documentPackageId"),
  "allowDownload" = true,
  "expiredAt" = CASE
    WHEN share_link."expiresAt" IS NOT NULL AND share_link."expiresAt" <= CURRENT_TIMESTAMP
      THEN share_link."expiresAt"
    ELSE NULL
  END;

ALTER TABLE "ShareLink" ALTER COLUMN "revisionId" SET NOT NULL;

-- Existing operational events inherit the process artifact references once.
INSERT INTO "OperationalEventArtifactReference" (
  "id", "organizationId", "eventId", "artifactType", "artifactId", "createdAt"
)
SELECT
  'event_ref_' || md5(event."id" || ':' || artifact."artifactType"::text || ':' || artifact."artifactId"),
  event."organizationId",
  event."id",
  artifact."artifactType",
  artifact."artifactId",
  event."occurredAt"
FROM "OperationalEvent" event
JOIN "OperationalArtifactReference" artifact ON artifact."processId" = event."processId"
ON CONFLICT DO NOTHING;

CREATE FUNCTION "qoovex_sync_operational_event_artifacts"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO "OperationalEventArtifactReference" (
    "id", "organizationId", "eventId", "artifactType", "artifactId", "createdAt"
  )
  SELECT
    'event_ref_' || md5(NEW."id" || ':' || artifact."artifactType"::text || ':' || artifact."artifactId"),
    NEW."organizationId",
    NEW."id",
    artifact."artifactType",
    artifact."artifactId",
    NEW."occurredAt"
  FROM "OperationalArtifactReference" artifact
  WHERE artifact."processId" = NEW."processId"
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "OperationalEvent_sync_artifacts"
AFTER INSERT ON "OperationalEvent"
FOR EACH ROW
EXECUTE FUNCTION "qoovex_sync_operational_event_artifacts"();

CREATE INDEX "DocumentPackageRevision_organizationId_documentPackageId_cr_idx" ON "DocumentPackageRevision"("organizationId", "documentPackageId", "createdAt");
CREATE INDEX "DocumentPackageRevision_organizationId_status_createdAt_idx" ON "DocumentPackageRevision"("organizationId", "status", "createdAt");
CREATE UNIQUE INDEX "DocumentPackageRevision_documentPackageId_revisionNumber_key" ON "DocumentPackageRevision"("documentPackageId", "revisionNumber");
CREATE UNIQUE INDEX "DocumentPackageShareProposal_decisionId_key" ON "DocumentPackageShareProposal"("decisionId");
CREATE INDEX "DocumentPackageShareProposal_organizationId_documentPackage_idx" ON "DocumentPackageShareProposal"("organizationId", "documentPackageId", "status", "createdAt");
CREATE INDEX "DocumentPackageShareProposal_organizationId_expiresAt_statu_idx" ON "DocumentPackageShareProposal"("organizationId", "expiresAt", "status");
CREATE UNIQUE INDEX "DocumentPackageShareProposal_organizationId_processId_key" ON "DocumentPackageShareProposal"("organizationId", "processId");
CREATE INDEX "OperationalEventArtifactRef_org_type_artifact_event_idx" ON "OperationalEventArtifactReference"("organizationId", "artifactType", "artifactId", "eventId");
CREATE UNIQUE INDEX "OperationalEventArtifactReference_eventId_artifactType_arti_key" ON "OperationalEventArtifactReference"("eventId", "artifactType", "artifactId");
CREATE INDEX "OperationalEvent_organizationId_eventType_occurredAt_idx" ON "OperationalEvent"("organizationId", "eventType", "occurredAt");
CREATE UNIQUE INDEX "ShareLink_proposalId_key" ON "ShareLink"("proposalId");
CREATE INDEX "ShareLink_organizationId_revisionId_idx" ON "ShareLink"("organizationId", "revisionId");
CREATE INDEX "Document_organizationId_title_idx" ON "Document"("organizationId", "title");
CREATE INDEX "Deadline_organizationId_title_idx" ON "Deadline"("organizationId", "title");
CREATE INDEX "Checklist_organizationId_name_idx" ON "Checklist"("organizationId", "name");
CREATE INDEX "Evidence_organizationId_title_idx" ON "Evidence"("organizationId", "title");
CREATE INDEX "DocumentPackage_organizationId_title_idx" ON "DocumentPackage"("organizationId", "title");
CREATE INDEX "ShareLink_organizationId_purpose_idx" ON "ShareLink"("organizationId", "purpose");
CREATE INDEX "ShareLink_organizationId_recipientLabel_idx" ON "ShareLink"("organizationId", "recipientLabel");
CREATE INDEX "OperationalDecision_organizationId_question_idx" ON "OperationalDecision"("organizationId", "question");
CREATE INDEX "OperationalException_organizationId_title_idx" ON "OperationalException"("organizationId", "title");

-- Built-in PostgreSQL full-text indexes over allow-listed metadata only.
CREATE INDEX "Document_search_metadata_fts_idx" ON "Document" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '')));
CREATE INDEX "DocumentType_search_metadata_fts_idx" ON "DocumentType" USING GIN (to_tsvector('simple'::regconfig, coalesce("name", '') || ' ' || coalesce("description", '')));
CREATE INDEX "Worker_search_metadata_fts_idx" ON "Worker" USING GIN (to_tsvector('simple'::regconfig, coalesce("displayName", '') || ' ' || coalesce("roleLabel", '')));
CREATE INDEX "JobSite_search_metadata_fts_idx" ON "JobSite" USING GIN (to_tsvector('simple'::regconfig, coalesce("name", '') || ' ' || coalesce("clientName", '') || ' ' || coalesce("address", '')));
CREATE INDEX "Deadline_search_metadata_fts_idx" ON "Deadline" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '')));
CREATE INDEX "Checklist_search_metadata_fts_idx" ON "Checklist" USING GIN (to_tsvector('simple'::regconfig, coalesce("name", '') || ' ' || coalesce("description", '')));
CREATE INDEX "Evidence_search_metadata_fts_idx" ON "Evidence" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '') || ' ' || coalesce("description", '')));
CREATE INDEX "DocumentPackage_search_metadata_fts_idx" ON "DocumentPackage" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '') || ' ' || coalesce("description", '')));
CREATE INDEX "OperationalProcess_search_metadata_fts_idx" ON "OperationalProcess" USING GIN (to_tsvector('simple'::regconfig, coalesce("triggerKind", '')));
CREATE INDEX "OperationalDecision_search_metadata_fts_idx" ON "OperationalDecision" USING GIN (to_tsvector('simple'::regconfig, coalesce("question", '') || ' ' || coalesce("explanation", '')));
CREATE INDEX "OperationalException_search_metadata_fts_idx" ON "OperationalException" USING GIN (to_tsvector('simple'::regconfig, coalesce("title", '') || ' ' || coalesce("explanation", '') || ' ' || coalesce("nextStep", '')));
CREATE INDEX "ShareLink_search_metadata_fts_idx" ON "ShareLink" USING GIN (to_tsvector('simple'::regconfig, coalesce("purpose", '') || ' ' || coalesce("recipientLabel", '')));

ALTER TABLE "DocumentPackageRevision" ADD CONSTRAINT "DocumentPackageRevision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageRevision" ADD CONSTRAINT "DocumentPackageRevision_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageRevision" ADD CONSTRAINT "DocumentPackageRevision_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageRevision" ADD CONSTRAINT "DocumentPackageRevision_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_documentPackageId_fkey" FOREIGN KEY ("documentPackageId") REFERENCES "DocumentPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "DocumentPackageRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_processId_fkey" FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "OperationalDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DocumentPackageShareProposal" ADD CONSTRAINT "DocumentPackageShareProposal_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "DocumentPackageRevision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "DocumentPackageShareProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OperationalEventArtifactReference" ADD CONSTRAINT "OperationalEventArtifactReference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OperationalEventArtifactReference" ADD CONSTRAINT "OperationalEventArtifactReference_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "OperationalEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
