import { useState } from 'react';
import {
  useUsers,
  useCreateUser,
  useUpdateUserRole,
  useDeactivateUser,
  useReactivateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import { useAuth } from '@/context/AuthContext';
import { useRoles } from '@/hooks/useRoles';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Card,
  Input,
  Modal,
  Select,
  Table,
  Pagination,
  ConfirmModal,
} from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PERMISSIONS, Role, UserMeta } from '@/types';
import { tableText, statusBadge } from '@/lib/tableStyles';
import { formatRoleLabel, getRoleDescription, roleBadgeClass } from '@/lib/roleLabels';
import { isSuperAdminRole } from '@/lib/roles';

const SYSTEM_ROLE_ORDER = ['SUPER_ADMIN', 'IT_TEAM', 'MEDIA', 'super_admin', 'ict_team', 'media_team'];

function sortSystemRoles(a: Role, b: Role) {
  const ai = SYSTEM_ROLE_ORDER.indexOf(a.name);
  const bi = SYSTEM_ROLE_ORDER.indexOf(b.name);
  return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
}

function findRole(roles: Role[], roleId: string) {
  return roles.find((r) => r.id === roleId);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getInviteErrorMessage(error: unknown) {
  const message = getErrorMessage(error, 'Could not send the invitation right now.');
  if (/already exists/i.test(message)) {
    return 'A dashboard user already exists with this email.';
  }
  return message;
}

export function UsersPage() {
  const { authUser } = useAuth();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleEdit, setRoleEdit] = useState<UserMeta | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserMeta | null>(null);
  const [form, setForm] = useState({
    email: '',
    displayName: '',
    roleId: '',
  });
  const [createError, setCreateError] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');

  const { data, isLoading } = useUsers(page, 20);
  const { data: rolesData } = useRoles(1, 100);
  const createMutation = useCreateUser();
  const updateRoleMutation = useUpdateUserRole();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const deleteMutation = useDeleteUser();

  const roles = rolesData?.data ?? [];
  const systemRoleNames = new Set(SYSTEM_ROLE_ORDER);
  const systemRoles = roles.filter((r) => systemRoleNames.has(r.name)).sort(sortSystemRoles);
  const roleOptions = [
    { value: '', label: 'Select a role...' },
    ...systemRoles.map((r) => ({ value: r.id, label: formatRoleLabel(r) })),
  ];
  const selectedInviteRole = form.roleId ? findRole(roles, form.roleId) : null;
  const selectedEditRole = selectedRoleId ? findRole(roles, selectedRoleId) : null;

  const closeCreateModal = () => {
    setCreateOpen(false);
    setCreateError('');
  };

  const openCreateModal = () => {
    setCreateError('');
    setCreateOpen(true);
  };

  const updateCreateForm = (patch: Partial<typeof form>) => {
    setCreateError('');
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleCreate = async () => {
    const email = form.email.trim();
    const displayName = form.displayName.trim();
    setCreateError('');

    if (!email) {
      setCreateError('Enter an email address.');
      return;
    }

    if (!form.roleId) {
      setCreateError('Select a role for this user.');
      return;
    }

    const role = findRole(roles, form.roleId);
    try {
      await createMutation.mutateAsync({
        email,
        displayName: displayName || email,
        roleId: form.roleId,
        roleLabel: role ? formatRoleLabel(role) : undefined,
      });
      closeCreateModal();
      setForm({ email: '', displayName: '', roleId: '' });
    } catch (error) {
      setCreateError(getInviteErrorMessage(error));
    }
  };

  const saveRole = async () => {
    if (!roleEdit || !selectedRoleId) return;
    try {
      await updateRoleMutation.mutateAsync({ uid: roleEdit.uid, roleId: selectedRoleId });
      setRoleEdit(null);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const sessionRole = authUser ? findRole(roles, authUser.roleId) : null;

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (u: UserMeta) => (
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className={tableText.primary}>{u.displayName || u.email}</p>
            {authUser?.uid === u.uid && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Your session
              </span>
            )}
          </div>
          <p className={tableText.secondary}>{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u: UserMeta) => {
        const role = findRole(roles, u.roleId);
        if (!role) {
          return <span className={tableText.muted}>{u.roleId}</span>;
        }
        return (
          <div className="space-y-1">
            <span className={roleBadgeClass(role.name)}>{formatRoleLabel(role)}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (u: UserMeta) => (
        <span
          className={
            u.status === 'active'
              ? statusBadge.success
              : u.status === 'pending'
                ? statusBadge.warning
                : statusBadge.neutral
          }
        >
          {u.status === 'pending' ? 'pending invite' : u.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (u: UserMeta) => (
        <div className="flex gap-2">
          <PermissionGate permission={PERMISSIONS.EDIT_USER}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRoleEdit(u);
                setSelectedRoleId(u.roleId);
              }}
            >
              Change role
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.DEACTIVATE_USER}>
            {u.status === 'active' ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deactivateMutation.mutate(u.uid)}
                loading={deactivateMutation.isPending}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => reactivateMutation.mutate(u.uid)}
                loading={reactivateMutation.isPending}
              >
                Reactivate
              </Button>
            )}
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.MANAGE_USERS}>
            {authUser?.uid !== u.uid && (
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => setDeleteTarget(u)}
              >
                Delete
              </Button>
            )}
          </PermissionGate>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage dashboard users and roles"
        action={
          <PermissionGate permission={PERMISSIONS.CREATE_USER}>
            <Button icon="ri-user-add-line" onClick={openCreateModal}>
              Add user
            </Button>
          </PermissionGate>
        }
      />

      {authUser && (
        <Card className="border-indigo-200/80 bg-indigo-50/50 dark:border-indigo-500/30 dark:bg-indigo-950/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white">
                {authUser.displayName?.charAt(0).toUpperCase() ||
                  authUser.email?.charAt(0).toUpperCase() ||
                  'A'}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Your session
                </p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {authUser.displayName || authUser.email || 'Admin user'}
                </p>
                {authUser.email && (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{authUser.email}</p>
                )}
                {sessionRole ? (
                  <span className={`mt-2 inline-flex ${roleBadgeClass(sessionRole.name)}`}>
                    {formatRoleLabel(sessionRole)}
                  </span>
                ) : authUser.roleName ? (
                  <span className={`mt-2 inline-flex ${roleBadgeClass(authUser.roleName)}`}>
                    {authUser.roleName.replace(/_/g, ' ')}
                  </span>
                ) : null}
              </div>
            </div>
            {isSuperAdminRole(authUser.roleName) && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Signed in as platform administrator
              </span>
            )}
          </div>
        </Card>
      )}

      <Card padding="none">
        <Table
          data={data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
        />
        {data && data.totalPages > 1 && (
          <div className="px-6 pb-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
              loading={isLoading}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={createOpen}
        onClose={closeCreateModal}
        title="Invite user"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              Send invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {createError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300"
            >
              {createError}
            </div>
          )}
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => updateCreateForm({ email: e.target.value })}
            required
          />
          <Input
            label="Full name"
            value={form.displayName}
            onChange={(e) => updateCreateForm({ displayName: e.target.value })}
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            An email invitation will be sent so they can set their own password. The link expires in
            24 hours.
          </p>
          <Select
            label="Role"
            value={form.roleId}
            onChange={(e) => updateCreateForm({ roleId: e.target.value })}
            options={roleOptions}
            required
          />
          {selectedInviteRole && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/40">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Assigned role:{' '}
                <span className={roleBadgeClass(selectedInviteRole.name)}>
                  {formatRoleLabel(selectedInviteRole)}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {getRoleDescription(selectedInviteRole)}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                The invitation email will state this role.
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!roleEdit}
        onClose={() => setRoleEdit(null)}
        title="Change role"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRoleEdit(null)}>
              Cancel
            </Button>
            <Button onClick={saveRole} loading={updateRoleMutation.isPending}>
              Save
            </Button>
          </>
        }
      >
        <Select
          label="Role"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          options={roleOptions.filter((o) => o.value !== '')}
        />
        {selectedEditRole && roleEdit && (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {roleEdit.displayName || roleEdit.email} {'->'}{' '}
            <span className={roleBadgeClass(selectedEditRole.name)}>
              {formatRoleLabel(selectedEditRole)}
            </span>
          </p>
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteMutation.mutateAsync(deleteTarget.uid);
            setDeleteTarget(null);
          } catch {
            // Error toast is handled by the mutation hook.
          }
        }}
        title="Delete user permanently?"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.displayName || deleteTarget.email} from Firebase and the dashboard. This cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
