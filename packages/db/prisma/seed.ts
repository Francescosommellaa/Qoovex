import { prisma } from "../lib/prisma";

async function main() {
  const owner = await prisma.user.upsert({
    where: { email: "demo.owner@qoovex.local" },
    update: {
      firstName: "Demo",
      lastName: "Owner",
      name: "Demo Owner",
    },
    create: {
      email: "demo.owner@qoovex.local",
      username: "demo-owner",
      firstName: "Demo",
      lastName: "Owner",
      name: "Demo Owner",
      emailVerified: new Date(),
    },
  });

  const organization = await prisma.organization.upsert({
    where: { code: "QOOVEX-DEMO" },
    update: { name: "Qoovex Demo" },
    create: {
      name: "Qoovex Demo",
      code: "QOOVEX-DEMO",
      createdById: owner.id,
    },
  });

  await prisma.organizationMembership.upsert({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: owner.id,
      },
    },
    update: { role: "OWNER", revokedAt: null },
    create: {
      organizationId: organization.id,
      userId: owner.id,
      role: "OWNER",
    },
  });

  const worker = await prisma.worker.findFirst({
    where: { organizationId: organization.id, displayName: "Mario Rossi" },
    select: { id: true },
  }) ?? await prisma.worker.create({
    data: {
      organizationId: organization.id,
      displayName: "Mario Rossi",
      roleLabel: "Operativo",
    },
    select: { id: true },
  });

  const jobSite = await prisma.jobSite.findFirst({
    where: { organizationId: organization.id, name: "Cantiere Demo" },
    select: { id: true },
  }) ?? await prisma.jobSite.create({
    data: {
      organizationId: organization.id,
      name: "Cantiere Demo",
      clientName: "Cliente Demo",
    },
    select: { id: true },
  });

  const documentType = await prisma.documentType.findFirst({
    where: { organizationId: organization.id, name: "Documento configurato" },
    select: { id: true },
  }) ?? await prisma.documentType.create({
    data: {
      organizationId: organization.id,
      name: "Documento configurato",
      appliesTo: "WORKER",
      requiresExpiryDate: true,
    },
    select: { id: true },
  });

  await prisma.document.findFirst({
    where: { organizationId: organization.id, title: "Documento da verificare" },
    select: { id: true },
  }) ?? await prisma.document.create({
    data: {
      organizationId: organization.id,
      documentTypeId: documentType.id,
      ownerType: "WORKER",
      workerId: worker.id,
      title: "Documento da verificare",
      status: "TO_REVIEW",
    },
  });

  await prisma.deadline.findFirst({
    where: { organizationId: organization.id, title: "Scadenza registrata" },
    select: { id: true },
  }) ?? await prisma.deadline.create({
    data: {
      organizationId: organization.id,
      title: "Scadenza registrata",
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      sourceType: "MANUAL",
      workerId: worker.id,
      jobSiteId: jobSite.id,
      status: "EXPIRING_SOON",
    },
  });

  console.log("Seed completed.");
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
