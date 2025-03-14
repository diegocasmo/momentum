"use server";

import { createTaskSchema } from "@/app/schemas/create-task-schema";
import { createTask } from "@/lib/services/create-task";
import { parseZodErrors, createZodError } from "@/lib/utils/form";
import { auth } from "@/lib/auth";
import type { Task } from "@prisma/client";
import { transformPrismaErrorToZodError } from "@/lib/utils/prisma-error-handler";
import type { ActionResult } from "@/types";

export async function createTaskAction(
  formData: FormData
): Promise<ActionResult<Task>> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      success: false,
      errors: parseZodErrors(
        createZodError("User not authenticated", ["root"])
      ),
    };
  }

  const result = createTaskSchema.safeParse({
    name: formData.get("name"),
    activityId: formData.get("activityId"),
    durationMs: Number(formData.get("durationMs")),
  });

  if (!result.success) {
    return { success: false, errors: parseZodErrors(result) };
  }

  try {
    const task = await createTask({
      name: result.data.name,
      activityId: result.data.activityId,
      userId: session.user.id,
      durationMs: result.data.durationMs,
    });
    return { success: true, data: task };
  } catch (error) {
    console.error("Error creating task:", error);
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
