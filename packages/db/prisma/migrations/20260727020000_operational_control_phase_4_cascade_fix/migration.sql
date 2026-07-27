-- Keep organization erasure and fixture-scoped cleanup compatible with the
-- immutable sharing graph. These children share the same organization owner;
-- ordinary product flows never delete revisions or operational processes.
ALTER TABLE "DocumentPackageShareProposal"
  DROP CONSTRAINT "DocumentPackageShareProposal_revisionId_fkey",
  ADD CONSTRAINT "DocumentPackageShareProposal_revisionId_fkey"
    FOREIGN KEY ("revisionId") REFERENCES "DocumentPackageRevision"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DocumentPackageShareProposal"
  DROP CONSTRAINT "DocumentPackageShareProposal_processId_fkey",
  ADD CONSTRAINT "DocumentPackageShareProposal_processId_fkey"
    FOREIGN KEY ("processId") REFERENCES "OperationalProcess"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ShareLink"
  DROP CONSTRAINT "ShareLink_revisionId_fkey",
  ADD CONSTRAINT "ShareLink_revisionId_fkey"
    FOREIGN KEY ("revisionId") REFERENCES "DocumentPackageRevision"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
