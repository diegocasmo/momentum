import { type Activity } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateActivityParams = {
  durationMs: number;
  name: string;
  userId: string;
};

export async function createActivity({
  durationMs,
  name,
  userId,
}: CreateActivityParams): Promise<Activity> {
  try {
    return await prisma.$transaction(async (tx) => {
      const teamMembership = await tx.teamMembership.findFirstOrThrow({
        where: { userId, role: "OWNER" },
        select: { teamId: true },
      });

      return tx.activity.create({
        data: {
          durationMs,
          name,
          teamId: teamMembership.teamId,
          userId,
        },
      });
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}
