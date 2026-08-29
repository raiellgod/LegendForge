import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

async function main() {
  if (process.env.CONFIRM_TEST_DATA_CLEANUP !== "true") {
    throw new Error(
      [
        "Limpeza cancelada.",
        "Para confirmar, execute com:",
        "CONFIRM_TEST_DATA_CLEANUP=true",
      ].join(" "),
    );
  }

  const beforeCleanup = {
    campaigns: await prisma.campaign.count(),
    participants: await prisma.participant.count(),
    gameSessions: await prisma.gameSession.count(),
    campaignInvites: await prisma.campaignInvite.count(),
    campaignLogs: await prisma.campaignLog.count(),
    sceneTokens: await prisma.sceneToken.count(),
    campaignActors: await prisma.campaignActor.count(),
    characterSheets: await prisma.characterSheet.count(),
    users: await prisma.user.count(),
    gameSystems: await prisma.gameSystem.count(),
  };

  console.log("Dados antes da limpeza:");
  console.table(beforeCleanup);

  await prisma.$transaction(async (transaction) => {
    // GameSession pode apontar para CharacterSheet sem cascade.
    await transaction.gameSession.deleteMany();

    // Tokens dependem dos atores.
    await transaction.sceneToken.deleteMany();

    // As relações internas da ficha possuem onDelete: Cascade:
    // stats, skills, spells, languages, equipment e classes.
    await transaction.characterSheet.deleteMany();

    await transaction.campaignActor.deleteMany();
  });

  const afterCleanup = {
    campaigns: await prisma.campaign.count(),
    participants: await prisma.participant.count(),
    gameSessions: await prisma.gameSession.count(),
    campaignInvites: await prisma.campaignInvite.count(),
    campaignLogs: await prisma.campaignLog.count(),
    sceneTokens: await prisma.sceneToken.count(),
    campaignActors: await prisma.campaignActor.count(),
    characterSheets: await prisma.characterSheet.count(),
    users: await prisma.user.count(),
    sessions: await prisma.session.count(),
    accounts: await prisma.account.count(),
    gameSystems: await prisma.gameSystem.count(),
    classes: await prisma.characterClass.count(),
    subclasses: await prisma.characterSubclass.count(),
    spells: await prisma.spell.count(),
    equipment: await prisma.equipment.count(),
  };

  console.log("Dados depois da limpeza:");
  console.table(afterCleanup);

  console.log(
    "Limpeza concluída. Contas, autenticação e conteúdo dos sistemas foram preservados.",
  );
}

main()
  .catch((error) => {
    console.error("Erro ao limpar dados de teste:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });