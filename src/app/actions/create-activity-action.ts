"use server";

import { createActivitySchema } from "@/app/schemas/create-activity-schema";
import { createActivity } from "@/lib/services/create-activity";
import { parseZodErrors, createZodError } from "@/lib/utils/form";
import { auth } from "@/lib/auth";
import type { Activity } from "@prisma/client";
import { transformPrismaErrorToZodError } from "@/lib/utils/prisma-error-handler";
import type { ActionResult } from "@/types";

export async function createActivityAction(
  formData: FormData
): Promise<ActionResult<Activity>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      errors: parseZodErrors(
        createZodError("User not authenticated", ["root"])
      ),
    };
  }

  const result = createActivitySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!result.success) {
    return { success: false, errors: parseZodErrors(result) };
  }
  try {
    const activity = await createActivity({
      name: result.data.name,
      description: result.data.description,
      userId: session.user.id,
    });
    return { success: true, data: activity };
  } catch (error) {
    console.error("Error creating activity:", error);
    const zodError =
      transformPrismaErrorToZodError(error) ||
      createZodError("An unexpected error occurred. Please try again.", [
        "root",
      ]);
    return {
      success: false,
      errors: parseZodErrors(zodError),
    };
  }
}
