import "dotenv/config";

import { prisma } from "../src/lib/prisma.js";

async function main() {
  const characterSheets = await prisma.characterSheet.findMany({
    where: {
      classId: {
        not: null,
      },
    },
    select: {
      id: true,
      classId: true,
      subclassId: true,
      level: true,
    },
  });

  let createdOrUpdatedCount = 0;

  for (const characterSheet of characterSheets) {
    if (!characterSheet.classId) {
      continue;
    }

    await prisma.$transaction([
      prisma.characterSheetClass.updateMany({
        where: {
          characterSheetId: characterSheet.id,
          isPrimary: true,
          classId: {
            not: characterSheet.classId,
          },
        },
        data: {
          isPrimary: false,
        },
      }),

      prisma.characterSheetClass.upsert({
        where: {
          characterSheetId_classId: {
            characterSheetId: characterSheet.id,
            classId: characterSheet.classId,
          },
        },
        create: {
          characterSheetId: characterSheet.id,
          classId: characterSheet.classId,
          subclassId: characterSheet.subclassId,
          level: characterSheet.level,
          isPrimary: true,
          order: 1,
        },
        update: {
          subclassId: characterSheet.subclassId,
          level: characterSheet.level,
          isPrimary: true,
          order: 1,
        },
      }),
    ]);

    createdOrUpdatedCount += 1;
  }

  console.log(
    `Backfill concluído. ${createdOrUpdatedCount} ficha(s) sincronizada(s) em CharacterSheetClass.`,
  );
}

main()
  .catch((error) => {
    console.error("Erro no backfill de CharacterSheetClass:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });