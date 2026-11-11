"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { logout } from "@/actions/auth";
import { useSession } from "@/components/providers/session-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authConfig } from "@/lib/auth/config";

function initialsFor(email: string) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return local.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const { user } = useSession();
  const [pending, startTransition] = useTransition();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 items-center gap-1.5 rounded-[4px] border border-border pr-1.5 pl-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Open account menu"
      >
        <span className="grid size-6 place-items-center rounded-[2px] bg-foreground font-mono text-[10px] font-medium text-background">
          {initialsFor(user.email)}
        </span>
        <ChevronDown
          className="size-3 text-muted-foreground"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-1.5 py-2">
            <span className="block font-mono text-[9px] tracking-[0.14em] text-muted-foreground uppercase">
              Signed in
            </span>
            <span className="mt-0.5 block max-w-52 truncate text-[12px] font-normal text-foreground">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer py-1.5"
          render={<Link href={authConfig.routes.settings} />}
        >
          <Settings className="size-4" /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer py-1.5"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await logout();
            })
          }
        >
          <LogOut className="size-4" /> {pending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
