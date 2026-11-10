import { redirect } from "next/navigation";

// This route only redirects, so there is no UI to validate for instant
// navigation. Without this, validation trips over the NEXT_REDIRECT error.
export const instant = false;

export default function Home() {
  redirect("/dashboard");
}