import "dotenv/config";

import { createHash } from "node:crypto";
import { prisma } from "../lib/prisma";
import { assertDatabaseTargetForCommand } from "../src/database-target-guard";

const LOCAL_DATABASE_PORT = 51225;
const DEV_USER_ID = "dev_qoovex_local_user";
const FIXTURE_ORGANIZATION_ID = "local_demo_organization";
const FIXTURE_ORGANIZATION_CODE = "QOOVEX-LOCAL-DEMO";
const LEGACY_FIXTURE_ORGANIZATION_CODES = ["QOOVEX-DEMO", FIXTURE_ORGANIZATION_CODE];
const FIXTURE_USER_IDS = {
  owner: DEV_USER_ID,
  admin: "local_demo_user_admin",
  consultant: "local_demo_user_consultant",
  manager: "local_demo_user_manager",
  worker: "local_demo_user_worker",
} as const;

function getLocalDatabaseConnectionString() {
  const connectionString =
    process.env.DATABASE_URL?.trim() ||
    process.env.DATABASE_PRISMA_DATABASE_URL?.trim() ||
    process.env.DATABASE_POSTGRES_URL?.trim();
  if (!connectionString) throw new Error("[seed] Local database connection is missing.");
  return connectionString;
}

function assertLocalSeedTarget() {
  assertDatabaseTargetForCommand("local fixture seed");
  if (process.env.QOOVEX_DATABASE_ENVIRONMENT?.trim() !== "local") {
    throw new Error("[seed] QOOVEX_DATABASE_ENVIRONMENT must be local.");
  }
  const port = Number(new URL(getLocalDatabaseConnectionString()).port);
  if (port !== LOCAL_DATABASE_PORT) {
    throw new Error(`[seed] Expected the canonical local database port ${LOCAL_DATABASE_PORT}.`);
  }
}

function atDayOffset(dayOffset: number, hour = 9) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() + dayOffset);
  return date;
}

function fixtureTokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

async function main() {
  assertLocalSeedTarget();

  const summary = await prisma.$transaction(async (tx) => {
    const existingFixtureOrganizations = await tx.organization.findMany({
      where: {
        OR: [
          { code: { in: LEGACY_FIXTURE_ORGANIZATION_CODES } },
          { memberships: { some: { userId: DEV_USER_ID } } },
        ],
      },
      select: { id: true },
    });
    const existingFixtureOrganizationIds = existingFixtureOrganizations.map((organization) => organization.id);

    if (existingFixtureOrganizationIds.length > 0) {
      await tx.dataControlJob.deleteMany({
        where: { organizationId: { in: existingFixtureOrganizationIds } },
      });
      await tx.organization.deleteMany({
        where: { id: { in: existingFixtureOrganizationIds } },
      });
    }

    await tx.user.deleteMany({
      where: {
        id: { in: Object.values(FIXTURE_USER_IDS).filter((id) => id !== DEV_USER_ID) },
      },
    });
    await tx.user.deleteMany({
      where: {
        email: "demo.owner@qoovex.local",
        organizationMembership: null,
      },
    });

    const owner = await tx.user.upsert({
      where: { id: DEV_USER_ID },
      update: {
        email: "mario.rossi.dev.profile.email.molto.lunga@qoovex.local",
        username: "dev_mario_rossi",
        firstName: "Mario",
        lastName: "Rossi",
        name: "Mario Rossi",
        emailVerified: new Date(0),
        platformRole: "SUPER_ADMIN",
        suspendedAt: null,
        suspensionReason: null,
      },
      create: {
        id: DEV_USER_ID,
        email: "mario.rossi.dev.profile.email.molto.lunga@qoovex.local",
        username: "dev_mario_rossi",
        firstName: "Mario",
        lastName: "Rossi",
        name: "Mario Rossi",
        emailVerified: new Date(0),
        platformRole: "SUPER_ADMIN",
      },
    });

    await tx.user.createMany({
      data: [
        {
          id: FIXTURE_USER_IDS.admin,
          email: "giulia.bianchi@qoovex.local",
          username: "local_demo_giulia",
          firstName: "Giulia",
          lastName: "Bianchi",
          name: "Giulia Bianchi",
          emailVerified: new Date(0),
        },
        {
          id: FIXTURE_USER_IDS.consultant,
          email: "andrea.romano@qoovex.local",
          username: "local_demo_andrea",
          firstName: "Andrea",
          lastName: "Romano",
          name: "Andrea Romano",
          emailVerified: new Date(0),
        },
        {
          id: FIXTURE_USER_IDS.manager,
          email: "sara.conti@qoovex.local",
          username: "local_demo_sara",
          firstName: "Sara",
          lastName: "Conti",
          name: "Sara Conti",
          emailVerified: new Date(0),
        },
        {
          id: FIXTURE_USER_IDS.worker,
          email: "luca.verdi@qoovex.local",
          username: "local_demo_luca",
          firstName: "Luca",
          lastName: "Verdi",
          name: "Luca Verdi",
          emailVerified: new Date(0),
        },
      ],
    });

    await tx.organization.create({
      data: {
        id: FIXTURE_ORGANIZATION_ID,
        name: "Edilizia Aurora Demo",
        code: FIXTURE_ORGANIZATION_CODE,
        createdById: owner.id,
      },
    });

    await tx.organizationMembership.createMany({
      data: [
        { id: "local_demo_membership_owner", organizationId: FIXTURE_ORGANIZATION_ID, userId: owner.id, role: "OWNER" },
        { id: "local_demo_membership_admin", organizationId: FIXTURE_ORGANIZATION_ID, userId: FIXTURE_USER_IDS.admin, role: "ADMIN" },
        { id: "local_demo_membership_consultant", organizationId: FIXTURE_ORGANIZATION_ID, userId: FIXTURE_USER_IDS.consultant, role: "SAFETY_CONSULTANT" },
        { id: "local_demo_membership_manager", organizationId: FIXTURE_ORGANIZATION_ID, userId: FIXTURE_USER_IDS.manager, role: "SITE_MANAGER" },
        { id: "local_demo_membership_worker", organizationId: FIXTURE_ORGANIZATION_ID, userId: FIXTURE_USER_IDS.worker, role: "WORKER" },
      ],
    });

    await tx.worker.createMany({
      data: [
        {
          id: "local_demo_worker_luca",
          organizationId: FIXTURE_ORGANIZATION_ID,
          displayName: "Luca Verdi",
          email: "luca.verdi@qoovex.local",
          phone: "+39 320 000 0101",
          roleLabel: "Operaio specializzato",
          notes: "Profilo dimostrativo locale.",
        },
        {
          id: "local_demo_worker_elena",
          organizationId: FIXTURE_ORGANIZATION_ID,
          displayName: "Elena Ferri",
          email: "elena.ferri@qoovex.local",
          phone: "+39 320 000 0102",
          roleLabel: "Operatrice di cantiere",
          notes: "Profilo dimostrativo locale.",
        },
        {
          id: "local_demo_worker_paolo",
          organizationId: FIXTURE_ORGANIZATION_ID,
          displayName: "Paolo Neri",
          email: "paolo.neri@qoovex.local",
          roleLabel: "Addetto manutenzione",
          status: "ARCHIVED",
          archivedAt: atDayOffset(-30),
          notes: "Profilo archiviato dimostrativo.",
        },
      ],
    });

    await tx.jobSite.createMany({
      data: [
        {
          id: "local_demo_site_roma",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Ristrutturazione Via Roma",
          address: "Via Roma 24, Milano",
          clientName: "Condominio Aurora",
          startDate: atDayOffset(-45),
          endDate: atDayOffset(90),
          notes: "Scenario dimostrativo: riqualificazione interna.",
        },
        {
          id: "local_demo_site_logistica",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Nuovo polo logistico",
          address: "Via dell'Industria 8, Monza",
          clientName: "Logistica Nord S.r.l.",
          startDate: atDayOffset(-10),
          endDate: atDayOffset(180),
          notes: "Scenario dimostrativo: opere preliminari.",
        },
        {
          id: "local_demo_site_archived",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Manutenzione Condominio Glicine",
          address: "Via Glicine 3, Sesto San Giovanni",
          clientName: "Condominio Glicine",
          status: "ARCHIVED",
          startDate: atDayOffset(-180),
          endDate: atDayOffset(-35),
          archivedAt: atDayOffset(-30),
          notes: "Cantiere concluso e archiviato, scenario dimostrativo.",
        },
      ],
    });

    await tx.workerUserLink.create({
      data: {
        id: "local_demo_worker_user_link",
        organizationId: FIXTURE_ORGANIZATION_ID,
        workerId: "local_demo_worker_luca",
        userId: FIXTURE_USER_IDS.worker,
        linkedById: owner.id,
      },
    });
    await tx.jobSiteUserAssignment.create({
      data: {
        id: "local_demo_site_user_assignment",
        organizationId: FIXTURE_ORGANIZATION_ID,
        jobSiteId: "local_demo_site_roma",
        userId: FIXTURE_USER_IDS.manager,
        assignedById: owner.id,
      },
    });
    await tx.jobSiteWorkerAssignment.createMany({
      data: [
        {
          id: "local_demo_site_worker_luca",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_roma",
          workerId: "local_demo_worker_luca",
          assignedById: owner.id,
        },
        {
          id: "local_demo_site_worker_elena",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_logistica",
          workerId: "local_demo_worker_elena",
          assignedById: owner.id,
        },
      ],
    });

    await tx.documentType.createMany({
      data: [
        {
          id: "local_demo_doc_type_identity",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Documento identificativo",
          description: "Tipologia configurata per lo scenario dimostrativo.",
          appliesTo: "WORKER",
          requiresExpiryDate: true,
        },
        {
          id: "local_demo_doc_type_training",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Attestato formativo interno",
          description: "Documento operativo da sottoporre a verifica.",
          appliesTo: "WORKER",
          requiresExpiryDate: true,
        },
        {
          id: "local_demo_doc_type_site",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Verbale di cantiere",
          description: "Documento configurato per il cantiere.",
          appliesTo: "JOB_SITE",
          requiresExpiryDate: false,
        },
        {
          id: "local_demo_doc_type_company",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Documento aziendale",
          description: "Documento configurato per l'Azienda.",
          appliesTo: "ORGANIZATION",
          requiresExpiryDate: true,
        },
      ],
    });

    await tx.documentRequirement.createMany({
      data: [
        {
          id: "local_demo_requirement_identity",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Documento identificativo lavoratori",
          description: "Requisito dimostrativo configurabile.",
          targetType: "WORKER",
          documentTypeId: "local_demo_doc_type_identity",
        },
        {
          id: "local_demo_requirement_training",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Attestato interno lavoratori",
          description: "Requisito dimostrativo configurabile.",
          targetType: "WORKER",
          documentTypeId: "local_demo_doc_type_training",
        },
        {
          id: "local_demo_requirement_site",
          organizationId: FIXTURE_ORGANIZATION_ID,
          name: "Verbale avvio cantiere",
          description: "Requisito dimostrativo configurabile.",
          targetType: "JOB_SITE",
          documentTypeId: "local_demo_doc_type_site",
          jobSiteId: "local_demo_site_roma",
        },
      ],
    });

    await tx.document.createMany({
      data: [
        {
          id: "local_demo_document_present",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_identity",
          ownerType: "WORKER",
          workerId: "local_demo_worker_luca",
          title: "Documento identificativo · Luca Verdi",
          status: "PRESENT",
          expiryDate: atDayOffset(120),
          reviewedAt: atDayOffset(-4),
          reviewedById: FIXTURE_USER_IDS.consultant,
          notes: "Metadati dimostrativi; nessun file Blob associato.",
        },
        {
          id: "local_demo_document_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_training",
          ownerType: "WORKER",
          workerId: "local_demo_worker_elena",
          title: "Attestato interno · Elena Ferri",
          status: "TO_REVIEW",
          expiryDate: atDayOffset(60),
          notes: "In attesa di verifica nello scenario dimostrativo.",
        },
        {
          id: "local_demo_document_expiring",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_identity",
          ownerType: "WORKER",
          workerId: "local_demo_worker_elena",
          title: "Documento identificativo · Elena Ferri",
          status: "EXPIRING_SOON",
          expiryDate: atDayOffset(12),
          reviewedAt: atDayOffset(-90),
          reviewedById: FIXTURE_USER_IDS.admin,
        },
        {
          id: "local_demo_document_expired",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_training",
          ownerType: "WORKER",
          workerId: "local_demo_worker_luca",
          title: "Attestato interno · Luca Verdi",
          status: "EXPIRED",
          expiryDate: atDayOffset(-8),
          reviewedAt: atDayOffset(-120),
          reviewedById: FIXTURE_USER_IDS.consultant,
        },
        {
          id: "local_demo_document_missing",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_site",
          ownerType: "JOB_SITE",
          jobSiteId: "local_demo_site_logistica",
          title: "Verbale avvio · Nuovo polo logistico",
          status: "MISSING",
          notes: "Documento mancante nello scenario dimostrativo.",
        },
        {
          id: "local_demo_document_company",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentTypeId: "local_demo_doc_type_company",
          ownerType: "ORGANIZATION",
          title: "Documento aziendale dimostrativo",
          status: "PRESENT",
          expiryDate: atDayOffset(240),
          reviewedAt: atDayOffset(-14),
          reviewedById: FIXTURE_USER_IDS.admin,
          notes: "Metadati dimostrativi; nessun file Blob associato.",
        },
      ],
    });

    await tx.deadline.createMany({
      data: [
        {
          id: "local_demo_deadline_overdue",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Aggiornare attestato interno di Luca",
          dueDate: atDayOffset(-8),
          sourceType: "DOCUMENT",
          documentId: "local_demo_document_expired",
          workerId: "local_demo_worker_luca",
          jobSiteId: "local_demo_site_roma",
          status: "EXPIRED",
        },
        {
          id: "local_demo_deadline_upcoming",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Verificare documento di Elena",
          dueDate: atDayOffset(5),
          remindAt: atDayOffset(2),
          sourceType: "DOCUMENT",
          documentId: "local_demo_document_review",
          workerId: "local_demo_worker_elena",
          jobSiteId: "local_demo_site_logistica",
          status: "EXPIRING_SOON",
        },
        {
          id: "local_demo_deadline_scheduled",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Riesame documenti cantiere Via Roma",
          dueDate: atDayOffset(21),
          remindAt: atDayOffset(14),
          sourceType: "MANUAL",
          jobSiteId: "local_demo_site_roma",
          status: "SCHEDULED",
        },
        {
          id: "local_demo_deadline_done",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Controllo iniziale cantiere",
          dueDate: atDayOffset(-14),
          sourceType: "MANUAL",
          jobSiteId: "local_demo_site_roma",
          status: "DONE",
        },
      ],
    });

    await tx.calendarEvent.createMany({
      data: [
        {
          id: "local_demo_calendar_meeting",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Riunione avanzamento Via Roma",
          description: "Evento dimostrativo con responsabile di cantiere.",
          startAt: atDayOffset(2, 10),
          endAt: atDayOffset(2, 11),
          kind: "EVENT",
          priority: "MEDIUM",
          assignedToId: FIXTURE_USER_IDS.manager,
          jobSiteId: "local_demo_site_roma",
          createdById: owner.id,
        },
        {
          id: "local_demo_calendar_task",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Verifica documenti polo logistico",
          description: "Task dimostrativo assegnato al consulente.",
          startAt: atDayOffset(4, 14),
          endAt: atDayOffset(4, 16),
          kind: "TASK",
          priority: "HIGH",
          status: "IN_PROGRESS",
          assignedToId: FIXTURE_USER_IDS.consultant,
          jobSiteId: "local_demo_site_logistica",
          createdById: owner.id,
        },
        {
          id: "local_demo_calendar_all_day",
          organizationId: FIXTURE_ORGANIZATION_ID,
          title: "Consegna materiali prevista",
          description: "Evento giornaliero dimostrativo.",
          startAt: atDayOffset(7, 0),
          endAt: atDayOffset(8, 0),
          allDay: true,
          kind: "EVENT",
          priority: "LOW",
          jobSiteId: "local_demo_site_roma",
          createdById: owner.id,
        },
      ],
    });

    await tx.checklist.createMany({
      data: [
        {
          id: "local_demo_checklist_open",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_roma",
          name: "Apertura giornaliera Via Roma",
          description: "Checklist operativa dimostrativa.",
        },
        {
          id: "local_demo_checklist_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_logistica",
          name: "Controllo area di lavoro",
          description: "Checklist dimostrativa con elementi da verificare.",
        },
      ],
    });
    await tx.checklistItem.createMany({
      data: [
        {
          id: "local_demo_checklist_item_done",
          organizationId: FIXTURE_ORGANIZATION_ID,
          checklistId: "local_demo_checklist_open",
          label: "Verifica accessi",
          status: "DONE",
          completedAt: atDayOffset(-1, 8),
          completedById: FIXTURE_USER_IDS.manager,
        },
        {
          id: "local_demo_checklist_item_open",
          organizationId: FIXTURE_ORGANIZATION_ID,
          checklistId: "local_demo_checklist_open",
          label: "Controlla delimitazioni",
          status: "OPEN",
        },
        {
          id: "local_demo_checklist_item_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          checklistId: "local_demo_checklist_review",
          label: "Conferma area materiali",
          status: "TO_REVIEW",
          completedAt: atDayOffset(-1, 15),
          completedById: FIXTURE_USER_IDS.worker,
        },
      ],
    });

    await tx.evidence.createMany({
      data: [
        {
          id: "local_demo_evidence_note",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_roma",
          workerId: "local_demo_worker_luca",
          checklistItemId: "local_demo_checklist_item_done",
          type: "NOTE",
          title: "Accessi verificati",
          description: "Nota dimostrativa senza file Blob.",
          createdById: FIXTURE_USER_IDS.manager,
        },
        {
          id: "local_demo_evidence_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_logistica",
          workerId: "local_demo_worker_luca",
          checklistItemId: "local_demo_checklist_item_review",
          type: "NOTE",
          title: "Area materiali da verificare",
          description: "Nota dimostrativa in attesa di revisione.",
          createdById: FIXTURE_USER_IDS.worker,
        },
      ],
    });

    await tx.documentPackage.createMany({
      data: [
        {
          id: "local_demo_package_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_roma",
          title: "Pacchetto Via Roma · revisione",
          description: "Pacchetto dimostrativo pronto per revisione.",
          status: "READY_FOR_REVIEW",
          createdById: FIXTURE_USER_IDS.consultant,
        },
        {
          id: "local_demo_package_draft",
          organizationId: FIXTURE_ORGANIZATION_ID,
          jobSiteId: "local_demo_site_logistica",
          title: "Pacchetto polo logistico · bozza",
          description: "Pacchetto dimostrativo in preparazione.",
          status: "DRAFT",
          createdById: FIXTURE_USER_IDS.consultant,
        },
      ],
    });
    await tx.documentPackageItem.createMany({
      data: [
        {
          id: "local_demo_package_item_document",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentPackageId: "local_demo_package_review",
          itemType: "DOCUMENT",
          documentId: "local_demo_document_present",
          position: 0,
        },
        {
          id: "local_demo_package_item_evidence",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentPackageId: "local_demo_package_review",
          itemType: "EVIDENCE",
          evidenceId: "local_demo_evidence_note",
          position: 1,
        },
        {
          id: "local_demo_package_item_checklist",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentPackageId: "local_demo_package_review",
          itemType: "CHECKLIST",
          checklistId: "local_demo_checklist_open",
          position: 2,
        },
        {
          id: "local_demo_package_item_note",
          organizationId: FIXTURE_ORGANIZATION_ID,
          documentPackageId: "local_demo_package_draft",
          itemType: "NOTE",
          note: "Nota dimostrativa per completare il pacchetto.",
          position: 0,
        },
      ],
    });
    await tx.shareLink.create({
      data: {
        id: "local_demo_share_link",
        organizationId: FIXTURE_ORGANIZATION_ID,
        documentPackageId: "local_demo_package_review",
        tokenHash: fixtureTokenHash("local-demo-share-link-not-for-production"),
        expiresAt: atDayOffset(10),
        createdById: owner.id,
      },
    });

    await tx.notificationPreference.createMany({
      data: Object.values(FIXTURE_USER_IDS).map((userId, index) => ({
        id: `local_demo_notification_preference_${index}`,
        organizationId: FIXTURE_ORGANIZATION_ID,
        userId,
        emailDigestEnabled: index < 3,
        emailDigestFrequency: index === 0 ? "DAILY" : index < 3 ? "WEEKLY" : "OFF",
        emailDigestHour: 8 + index,
      })),
    });
    await tx.notification.createMany({
      data: [
        {
          id: "local_demo_notification_overdue",
          organizationId: FIXTURE_ORGANIZATION_ID,
          userId: owner.id,
          type: "DEADLINE_OVERDUE",
          severity: "WARNING",
          title: "Scadenza superata",
          message: "L'attestato interno di Luca richiede attenzione.",
          sourceType: "DEADLINE",
          sourceId: "local_demo_deadline_overdue",
          dedupeKey: "local-demo-deadline-overdue",
          actionHref: "/deadlines/local_demo_deadline_overdue",
        },
        {
          id: "local_demo_notification_review",
          organizationId: FIXTURE_ORGANIZATION_ID,
          userId: FIXTURE_USER_IDS.consultant,
          type: "DOCUMENT_TO_REVIEW",
          severity: "ATTENTION",
          title: "Documento da verificare",
          message: "L'attestato interno di Elena è pronto per la verifica.",
          sourceType: "DOCUMENT",
          sourceId: "local_demo_document_review",
          dedupeKey: "local-demo-document-review",
          actionHref: "/documents/local_demo_document_review",
        },
        {
          id: "local_demo_notification_package",
          organizationId: FIXTURE_ORGANIZATION_ID,
          userId: owner.id,
          type: "PACKAGE_READY_FOR_REVIEW",
          severity: "INFO",
          title: "Pacchetto pronto per revisione",
          message: "Il pacchetto Via Roma è pronto per la revisione.",
          sourceType: "DOCUMENT_PACKAGE",
          sourceId: "local_demo_package_review",
          dedupeKey: "local-demo-package-review",
          actionHref: "/document-packages/local_demo_package_review",
          readAt: atDayOffset(-1),
        },
        {
          id: "local_demo_notification_expiring",
          organizationId: FIXTURE_ORGANIZATION_ID,
          userId: FIXTURE_USER_IDS.manager,
          type: "DOCUMENT_EXPIRING_SOON",
          severity: "ATTENTION",
          title: "Documento in scadenza",
          message: "Il documento identificativo di Elena scade a breve.",
          sourceType: "DOCUMENT",
          sourceId: "local_demo_document_expiring",
          dedupeKey: "local-demo-document-expiring",
          actionHref: "/documents/local_demo_document_expiring",
        },
      ],
    });

    await tx.organizationInvitation.create({
      data: {
        id: "local_demo_invitation",
        organizationId: FIXTURE_ORGANIZATION_ID,
        email: "nuova.persona@qoovex.local",
        role: "WORKER",
        tokenHash: fixtureTokenHash("local-demo-invitation-not-for-production"),
        invitedById: owner.id,
        expiresAt: atDayOffset(7),
      },
    });

    await tx.productAuditEvent.createMany({
      data: [
        {
          id: "local_demo_audit_document",
          organizationId: FIXTURE_ORGANIZATION_ID,
          actorUserId: FIXTURE_USER_IDS.consultant,
          actorRole: "SAFETY_CONSULTANT",
          action: "DOCUMENT_UPDATED",
          entityType: "DOCUMENT",
          entityId: "local_demo_document_review",
          outcome: "SUCCESS",
          metadata: { fixture: true, summary: "Documento preparato per la verifica" },
          createdAt: atDayOffset(-1, 16),
        },
        {
          id: "local_demo_audit_checklist",
          organizationId: FIXTURE_ORGANIZATION_ID,
          actorUserId: FIXTURE_USER_IDS.manager,
          actorRole: "SITE_MANAGER",
          action: "CHECKLIST_ITEM_COMPLETED",
          entityType: "CHECKLIST_ITEM",
          entityId: "local_demo_checklist_item_done",
          outcome: "SUCCESS",
          metadata: { fixture: true, summary: "Verifica accessi completata" },
          createdAt: atDayOffset(-1, 8),
        },
        {
          id: "local_demo_audit_package",
          organizationId: FIXTURE_ORGANIZATION_ID,
          actorUserId: FIXTURE_USER_IDS.consultant,
          actorRole: "SAFETY_CONSULTANT",
          action: "DOCUMENT_PACKAGE_UPDATED",
          entityType: "DOCUMENT_PACKAGE",
          entityId: "local_demo_package_review",
          outcome: "SUCCESS",
          metadata: { fixture: true, summary: "Pacchetto pronto per revisione" },
          createdAt: atDayOffset(-2, 14),
        },
      ],
    });

    return {
      organizationId: FIXTURE_ORGANIZATION_ID,
      users: Object.keys(FIXTURE_USER_IDS).length,
      workers: 3,
      jobSites: 3,
      documents: 6,
      deadlines: 4,
      calendarEvents: 3,
      checklists: 2,
      evidence: 2,
      documentPackages: 2,
      notifications: 4,
      blobObjectsCreated: 0,
    };
  }, { timeout: 30_000 });

  console.log(`[seed] Local fixture completed: ${JSON.stringify(summary)}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "[seed] Unexpected failure.");
    process.exitCode = 1;
  });
