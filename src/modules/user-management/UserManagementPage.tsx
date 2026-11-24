import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { MailPlus, Pencil, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/DataTable";
import { LoadingPage } from "@/components/ui/loading";
import { useUserAuth } from "@/modules/authentication/providers/context/useAuthContext";
import { ROLE_DISPLAY_NAMES, normalizeRole } from "@/lib/roles";

import { InviteUserDialog } from "./components/InviteUserDialog";
import { EditUserDialog } from "./components/EditUserDialog";
import {
  useInvitations,
  useResendInvitation,
  useRevokeInvitation,
  type Invitation,
} from "./hooks/useInvitations";
import {
  useDeleteUser,
  useUsers,
  type ManagedUser,
} from "./hooks/useUsers";

const INVITE_ROLE_OPTIONS = [
  { value: "Admin_L1", label: "Admin L1" },
  { value: "Admin_L2", label: "Admin L2" },
  { value: "Super_Admin", label: "Super Admin" },
  { value: "Mechanic", label: "Mechanic" },
  { value: "Driver", label: "Driver" },
];

const TEAM_INVITE_ROLE_OPTIONS = [
  { value: "Admin_L2", label: "Admin L2" },
  { value: "Mechanic", label: "Mechanic" },
  { value: "Driver", label: "Driver" },
];

const EDIT_ROLE_OPTIONS_SUPER_ADMIN = INVITE_ROLE_OPTIONS;
const EDIT_ROLE_OPTIONS_ADMIN_L1 = TEAM_INVITE_ROLE_OPTIONS;

const statusBadgeVariant = (status: string) => {
  const s = status.toLowerCase();
  if (s === "active" || s === "accepted") return "success" as const;
  if (s === "invited" || s === "pending") return "warning" as const;
  if (s === "expired" || s === "revoked") return "secondary" as const;
  return "outline" as const;
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
};

const roleLabel = (role: string) => {
  const normalized = normalizeRole(role);
  return normalized ? ROLE_DISPLAY_NAMES[normalized] : role;
};

const UserManagementPage = () => {
  const { role: actorRole, user: actor } = useUserAuth();
  const isSuperAdmin = actorRole === "Super_Admin";
  const canAccess = actorRole === "Super_Admin" || actorRole === "Admin_L1";

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    error: invitationsError,
  } = useInvitations();

  const deleteUser = useDeleteUser();
  const revokeInvitation = useRevokeInvitation();
  const resendInvitation = useResendInvitation();

  const inviteRoleOptions = isSuperAdmin
    ? INVITE_ROLE_OPTIONS
    : TEAM_INVITE_ROLE_OPTIONS;
  const editRoleOptions = isSuperAdmin
    ? EDIT_ROLE_OPTIONS_SUPER_ADMIN
    : EDIT_ROLE_OPTIONS_ADMIN_L1;

  const canManageUser = (target: ManagedUser) => {
    if (target.id === actor?.id) return false;
    if (!isSuperAdmin) {
      // Admin_L1 can only manage Admin_L2, Mechanic, Driver.
      const manageable = ["Admin_L2", "Mechanic", "Driver"];
      const normalized = normalizeRole(target.role);
      return !!normalized && manageable.includes(normalized);
    }
    return true;
  };

  const userColumns = useMemo<ColumnDef<ManagedUser>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) =>
          `${row.original.first_name} ${row.original.last_name}`.trim() || "—",
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ row }) => row.original.phone_number || "—",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => roleLabel(row.original.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Joined",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const manageable = canManageUser(row.original);
          if (!manageable)
            return <span className="text-muted-foreground text-sm">—</span>;
          return (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingUser(row.original);
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                disabled={deleteUser.isPending}
                onClick={async () => {
                  if (
                    !window.confirm(
                      `Delete ${row.original.first_name} ${row.original.last_name}? This will revoke their access.`
                    )
                  )
                    return;
                  try {
                    await deleteUser.mutateAsync(row.original.id);
                    toast.success("User deleted");
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to delete user");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSuperAdmin, actor?.id, deleteUser.isPending]
  );

  const invitationColumns = useMemo<ColumnDef<Invitation>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) =>
          `${row.original.first_name} ${row.original.last_name}`.trim() || "—",
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "phone_number",
        header: "Phone",
        cell: ({ row }) => row.original.phone_number || "—",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => roleLabel(row.original.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusBadgeVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "inviter_name",
        header: "Invited By",
        cell: ({ row }) => row.original.inviter_name || "—",
      },
      {
        accessorKey: "expires_at",
        header: "Expires",
        cell: ({ row }) => formatDate(row.original.expires_at),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (row.original.status !== "PENDING")
            return <span className="text-muted-foreground text-sm">—</span>;

          const isAdminRoleInvite = [
            "Super_Admin",
            "Admin_L1",
            "Admin_L2",
          ].includes(normalizeRole(row.original.role) ?? "");
          const canResend = isSuperAdmin || !isAdminRoleInvite;

          return (
            <div className="flex items-center gap-1">
              {canResend && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={resendInvitation.isPending}
                  onClick={async () => {
                    try {
                      await resendInvitation.mutateAsync(row.original.id);
                      toast.success("Invitation email resent");
                    } catch (e: any) {
                      toast.error(e?.message || "Failed to resend invitation");
                    }
                  }}
                >
                  <MailPlus className="h-4 w-4 mr-1" /> Resend
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                disabled={revokeInvitation.isPending}
                onClick={async () => {
                  try {
                    await revokeInvitation.mutateAsync(row.original.id);
                    toast.success("Invitation revoked");
                  } catch (e: any) {
                    toast.error(e?.message || "Failed to revoke invitation");
                  }
                }}
              >
                <UserX className="h-4 w-4 mr-1" /> Revoke
              </Button>
            </div>
          );
        },
      },
    ],
    [
      isSuperAdmin,
      resendInvitation.isPending,
      revokeInvitation.isPending,
    ]
  );

  if (!canAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Access Denied
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            You do not have permission to manage users.
          </p>
        </div>
      </div>
    );
  }

  if (usersLoading || invitationsLoading) {
    return <LoadingPage message="Loading user management..." />;
  }

  if (usersError || invitationsError) {
    return (
      <div className="p-8">
        <p className="text-red-600">
          Failed to load user management data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-card-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage users and track invitations across the platform.
          </p>
        </div>
        <InviteUserDialog roleOptions={inviteRoleOptions} />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <DataTable
            title="Users"
            columns={userColumns}
            data={users}
            loading={usersLoading}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <DataTable
            title="Invitations"
            columns={invitationColumns}
            data={invitations}
            loading={invitationsLoading}
          />
        </TabsContent>
      </Tabs>

      <EditUserDialog
        user={editingUser}
        open={editOpen}
        onOpenChange={setEditOpen}
        roleOptions={editRoleOptions}
      />
    </div>
  );
};

export default UserManagementPage;
