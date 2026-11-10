import "server-only";
import bcrypt from "bcryptjs";
import { BCRYPT_COST } from "./constants";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing-only", BCRYPT_COST);

export async function verifyPasswordOrDummy(password: string, hash: string | null): Promise<boolean> {
  const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
  return hash !== null && ok;
}

