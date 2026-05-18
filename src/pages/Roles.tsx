import { useState } from 'react';
import {
  useRoles,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  useSyncSystemRoles,
} from '@/hooks/useRoles';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Button,
  Card,
  ConfirmModal,
  Input,
  Modal,
  Table,
  Pagination,
} from '@/components/ui';
import { PermissionGate } from '@/components/shared/PermissionGate';
import { PERMISSIONS, Role, Permission } from '@/types';
import { tableText } from '@/lib/tableStyles';

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

export function RolesPage() {
  const { isSuperAdmin } = useAuth();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    permissions: [] as string[],
  });

  const { data, isLoading } = useRoles(page, 20);
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const syncMutation = useSyncSystemRoles();

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', displayName: '', permissions: [] });
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({
      name: role.name,
      displayName: role.displayName,
      permissions: [...role.permissions],
    });
    setModalOpen(true);
  };

  const togglePermission = (perm: string) => {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter((p) => p !== perm)
        : [...f.permissions, perm],
    }));
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) return;
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: { displayName: form.displayName, permissions: form.permissions },
        });
      } else {
        if (!form.name.trim()) return;
        await createMutation.mutateAsync({
          name: form.name.trim(),
          displayName: form.displayName.trim(),
          permissions: form.permissions,
        });
      }
      setModalOpen(false);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId);
        setDeleteId(null);
      } catch {
        // Error toast is handled by the mutation hook.
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Role',
      render: (role: Role) => (
        <div>
          <p className={tableText.primary}>{role.displayName}</p>
          <p className={tableText.secondary}>{role.name}</p>
        </div>
      ),
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (role: Role) => (
        <span className={tableText.muted}>{role.permissions.length} permissions</span>
      ),
    },
    {
      key: 'system',
      header: 'Type',
      render: (role: Role) => (
        <span className={tableText.muted}>{role.isSystem ? 'System' : 'Custom'}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (role: Role) => (
        <div className="flex gap-2">
          {(!role.isSystem || isSuperAdmin) && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(role)}>
              Edit
            </Button>
          )}
          {!role.isSystem && (
            <Button size="sm" variant="ghost" onClick={() => setDeleteId(role.id)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles"
        description="Manage roles and permissions"
        action={
          <PermissionGate permission={PERMISSIONS.MANAGE_ROLES}>
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin && (
                <Button
                  variant="secondary"
                  icon="ri-refresh-line"
                  onClick={() => syncMutation.mutate()}
                  loading={syncMutation.isPending}
                >
                  Sync system roles
                </Button>
              )}
              <Button icon="ri-add-line" onClick={openCreate}>
                Add role
              </Button>
            </div>
          </PermissionGate>
        }
      />

      <Card padding="none">
        <Table data={data?.data || []} columns={columns} loading={isLoading} />
        {data && data.totalPages > 1 && (
          <div className="px-6 pb-6">
            <Pagination
              currentPage={page}
              totalPages={data.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit role' : 'Create role'}
        size="xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {!editing && (
            <Input
              label="Internal name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="editor"
            />
          )}
          <Input
            label="Display name"
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Permissions
            </p>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <div className="grid gap-2 sm:grid-cols-2">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{perm}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete role"
        message="Delete this role? Users assigned to it may lose access."
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
