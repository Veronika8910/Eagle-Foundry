import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Org, OrgStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { TableSkeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';

interface OrgWithCount extends Org {
  _count?: { members?: number };
}

export default function OrgManagementPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrgWithCount | null>(null);
  const [newStatus, setNewStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: orgsData = [], isLoading } = useQuery({
    queryKey: ['admin', 'orgs', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const url = `${endpoints.admin.orgs}${params.toString() ? `?${params}` : ''}`;
      const res = await api.get<{ data?: OrgWithCount[] }>(url, { params: { limit: 100 } });
      const body = res.data;
      const items = body?.data ?? (Array.isArray(body) ? body : []);
      return Array.isArray(items) ? items : [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return orgsData;
    const q = search.toLowerCase();
    return orgsData.filter((o) => o.name?.toLowerCase().includes(q));
  }, [orgsData, search]);

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrg) throw new Error('No organization selected');
      await api.patch(endpoints.admin.updateOrgStatus(selectedOrg.id), { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orgs'] });
      toast.success('Organization status updated');
      setManageModalOpen(false);
      setSelectedOrg(null);
      setConfirmOpen(false);
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Failed to update status');
    },
  });

  const openManage = (org: OrgWithCount) => {
    setSelectedOrg(org);
    setNewStatus(org.status === 'SUSPENDED' ? 'ACTIVE' : org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE');
    setManageModalOpen(true);
  };

  const handleSaveStatus = () => {
    setConfirmOpen(true);
  };

  const confirmSave = () => {
    updateStatusMutation.mutate();
  };

  const columns: Column<OrgWithCount & Record<string, unknown>>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium text-zinc-200">{row.name}</span>,
    },
    {
      key: 'members',
      header: 'Members',
      render: (row) => (
        <span className="text-zinc-400">{row._count?.members ?? 0}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge>{row.status as OrgStatus}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          className="h-8 px-3 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            openManage(row);
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  const tableData = filtered.map((o) => ({ ...o } as OrgWithCount & Record<string, unknown>));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Admin</p>
        <h1 className="ef-heading-gradient mt-2 text-4xl font-semibold leading-tight md:text-5xl">
          Organization Management
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
          Search and manage organizations and their status.
        </p>
      </header>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search organizations..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'SUSPENDED', label: 'Suspended' },
              { value: 'PENDING_OTP', label: 'Pending OTP' },
            ],
          },
        ]}
      />

      {isLoading ? (
        <TableSkeleton rows={8} cols={4} />
      ) : (
        <DataTable columns={columns} data={tableData} emptyMessage="No organizations found" />
      )}

      <Modal
        open={manageModalOpen}
        onClose={() => {
          setManageModalOpen(false);
          setSelectedOrg(null);
        }}
        title={selectedOrg ? `Manage ${selectedOrg.name}` : 'Manage Organization'}
      >
        {selectedOrg && (
          <div className="space-y-4">
            <Select
              label="Status"
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setManageModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" withBorderEffect={false} onClick={handleSaveStatus} disabled={updateStatusMutation.isPending}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmSave}
        title="Confirm status change"
        description={`Are you sure you want to change this organization's status to ${newStatus}?`}
        confirmLabel="Confirm"
        loading={updateStatusMutation.isPending}
      />
    </div>
  );
}
