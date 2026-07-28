-- PostgreSQL truncates identifiers to 63 bytes. Keep the physical names aligned
-- with the explicit Prisma mappings so fresh and already-migrated databases
-- produce the same schema without recreating otherwise identical indexes.
ALTER INDEX IF EXISTS "ContextTimelineEvent_organizationId_targetType_targetId_occurre"
  RENAME TO "ContextTimelineEvent_organizationId_targetType_targetId_occ_idx";

ALTER INDEX IF EXISTS "DocumentPackageItem_organizationId_jobSiteWorkerAssignmentId_id"
  RENAME TO "DocumentPackageItem_organizationId_jobSiteWorkerAssignmentI_idx";

ALTER INDEX IF EXISTS "DocumentSourcePolicy_organizationId_documentTypeId_archivedAt_i"
  RENAME TO "DocumentSourcePolicy_organizationId_documentTypeId_archived_idx";

ALTER INDEX IF EXISTS "DocumentVersion_organizationId_documentId_reviewStatus_createdA"
  RENAME TO "DocumentVersion_organizationId_documentId_reviewStatus_crea_idx";

ALTER INDEX IF EXISTS "OperationalRequest_organizationId_targetType_targetId_createdAt"
  RENAME TO "OperationalRequest_organizationId_targetType_targetId_creat_idx";
