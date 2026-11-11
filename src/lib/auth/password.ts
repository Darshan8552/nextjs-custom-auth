import "server-only";

import bcrypt from "bcryptjs";
import { authConfig } from "./config";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, authConfig.password.bcryptCost);
}

export function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const DUMMY_HASH =
  "$2b$12$rFamVeT7KPWsyF99NDEzeOdMOKe6xq7AfgZhLSvzhhzcmVd4247OC";

export async function verifyPasswordOrDummy(
  password: string,
  hash: string | null,
): Promise<boolean> {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash !== null && ok;
}
