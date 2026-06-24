import { LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/components/layout/nav-config";
import { signOutAction } from "@/lib/actions/auth-actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu({ name, email, role }: { name: string; email: string; role: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<button className="flex items-center gap-2 rounded-md p-1.5 hover:bg-accent" />}
      >
        <Avatar className="size-8">
          <AvatarFallback>{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left text-sm leading-tight md:block">
          <span className="block font-medium">{name}</span>
          <span className="block text-xs text-muted-foreground">
            {ROLE_LABELS[role] ?? role}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block font-medium">{name}</span>
            <span className="block text-xs font-normal text-muted-foreground">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User className="size-4" />
          {ROLE_LABELS[role] ?? role}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={<form action={signOutAction} className="w-full" />}
          variant="destructive"
        >
          <button type="submit" className="flex w-full items-center gap-2">
            <LogOut className="size-4" />
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
