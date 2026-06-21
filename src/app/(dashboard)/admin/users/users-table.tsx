"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import { EditUserDialog } from "@/app/(dashboard)/admin/users/edit-user-dialog";
import { UserFormDialog } from "@/app/(dashboard)/admin/users/user-form-dialog";
import { ROLE_LABELS } from "@/components/layout/nav-config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { formatDate } from "@/lib/utils";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
};

export function UsersTable({ users, canWrite }: { users: User[]; canWrite: boolean }) {
  const [editing, setEditing] = useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => ROLE_LABELS[row.original.role] ?? row.original.role,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "secondary" : "outline"}>
          {row.original.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: User } }) => (
              <div className="flex justify-end">
                <Button variant="ghost" size="icon-sm" onClick={() => setEditing(row.original)}>
                  <Pencil className="size-4" />
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        description="Manage staff accounts and role assignments."
        actions={
          canWrite ? (
            <UserFormDialog
              trigger={
                <Button>
                  <Plus className="size-4" /> New User
                </Button>
              }
            />
          ) : undefined
        }
      />
      <DataTable columns={columns} data={users} searchPlaceholder="Search users…" emptyMessage="No users yet." />
      {editing && (
        <EditUserDialog user={editing} open={!!editing} onOpenChange={(open) => !open && setEditing(null)} />
      )}
    </div>
  );
}
