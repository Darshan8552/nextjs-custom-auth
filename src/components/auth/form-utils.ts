import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import type { ActionFailure, ActionResult } from "@/lib/types";

export const GENERIC_ERROR = "Something went wrong. Please try again.";

export async function callAction<T>(
  fn: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T> | null> {
  try {
    return await fn();
  } catch {
    toast.error(GENERIC_ERROR);
    return null;
  }
}

export function showFailure<T extends FieldValues>(
  result: ActionFailure,
  setError?: UseFormSetError<T>,
) {
  const entries = Object.entries(result.fieldErrors ?? {});
  if (setError) {
    for (const [field, messages] of entries) {
      if (messages?.[0]) {
        setError(field as Path<T>, { type: "server", message: messages[0] });
      }
    }
  }
  if (result.code !== "VALIDATION_ERROR" || entries.length === 0) {
    toast.error(result.message);
  }
}
