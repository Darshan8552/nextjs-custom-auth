import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/landing-page";

export const metadata: Metadata = {
  description:
    "A custom authentication system with email verification, one-time codes, password recovery, and server-side sessions.",
};

export default function Home() {
  return <LandingPage />;
}
