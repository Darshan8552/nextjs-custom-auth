import "server-only";

import { unstable_rethrow } from "next/navigation";
import z from "zod";
import type { ActionFailure, ActionResult } from "@/lib/types";
import { AuthError } from "./errors";

export function fail(
  code: ActionFailure["code"],
  message: string,
  extra: Pick<ActionFailure, "fieldErrors" | "retryAfter"> = {},
): ActionFailure {
  return { success: false, code, message, ...extra };
}

export async function runAction<S extends z.ZodType, T>(
  schema: S,
  input: unknown,
  handler: (data: z.output<S>) => Promise<T>,
): Promise<ActionResult<T>> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Please check the highlighted fields.", {
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    });
  }

  try {
    const data = await handler(parsed.data);
    return { success: true, data };
  } catch (err) {
    unstable_rethrow(err);

    if (err instanceof AuthError) {
      return fail(err.code, err.message, {
        fieldErrors: err.fieldErrors,
        retryAfter: err.retryAfter,
      });
    }

    console.error("[auth] unexpected error:", err);
    return fail("INTERNAL", "Something went wrong. Please try again.");
  }
}
