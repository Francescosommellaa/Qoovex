-- AddForeignKey
ALTER TABLE "JobSiteRequest" ADD CONSTRAINT "JobSiteRequest_openedByParticipantId_fkey" FOREIGN KEY ("openedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSiteDispute" ADD CONSTRAINT "JobSiteDispute_openedByParticipantId_fkey" FOREIGN KEY ("openedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSitePostClosureRequest" ADD CONSTRAINT "JobSitePostClosureRequest_openedByParticipantId_fkey" FOREIGN KEY ("openedByParticipantId") REFERENCES "JobSiteParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
