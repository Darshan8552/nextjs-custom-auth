import type { Metadata } from "next";
// import { ChangePasswordForm } from "@/components/auth/change-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth/guards";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}

async function SettingsContent() {
  await requireUser();

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Other devices will be logged out after you change it
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* <ChangePasswordForm /> */}
      </CardContent>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Other devices will be logged out after you change it
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-24 animate-pulse rounded-md bg-muted" />
      </CardContent>
    </Card>
  );
}
