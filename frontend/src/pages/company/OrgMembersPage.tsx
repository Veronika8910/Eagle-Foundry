import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { AddOrgMemberPayload, UserRole } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/toast';
import { ApiError, parseApiError } from '@/lib/api/errors';

interface OrgMember {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const inviteSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['COMPANY_ADMIN', 'COMPANY_MEMBER']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function OrgMembersPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; email: string } | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['orgs', 'me', 'members'],
    queryFn: async () => {
      const res = await api.get<{ data?: OrgMember[] } | OrgMember[]>(endpoints.orgs.members);
      const body = res.data;
      return (body && typeof body === 'object' && 'data' in body ? body.data : body) ?? [];
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'COMPANY_MEMBER' },
  });

  const inviteMutation = useMutation({
    mutationFn: async (payload: AddOrgMemberPayload) => {
      await api.post(endpoints.orgs.members, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs', 'me', 'members'] });
      setInviteOpen(false);
      reset();
      toast.success('Invitation sent');
    },
    onError: (err) => {
      const apiErr = err instanceof ApiError ? err : parseApiError(err);
      toast.error(apiErr.message);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(endpoints.orgs.removeMember(memberId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgs', 'me', 'members'] });
      setRemoveTarget(null);
      toast.success('Member removed');
    },
    onError: (err) => {
      const apiErr = err instanceof ApiError ? err : parseApiError(err);
      toast.error(apiErr.message);
    },
  });

  const onInvite = (values: InviteFormValues) => {
    inviteMutation.mutate({ email: values.email, role: values.role });
  };

  const columns: Column<OrgMember & Record<string, unknown>>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (row) => <span className="text-zinc-300">{row.email}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <Badge>{row.role}</Badge>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          variant="ghost"
          className="text-xs text-red-400 hover:text-red-300"
          onClick={(e) => {
            e.stopPropagation();
            setRemoveTarget({ id: row.id, email: row.email });
          }}
        >
          Remove
        </Button>
      ),
    },
  ];

  const tableData = members.map((m) => ({ ...m } as OrgMember & Record<string, unknown>));

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Company</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="ef-heading-gradient text-4xl font-semibold leading-tight md:text-5xl">
            Organization Members
          </h1>
          <Button variant="primary" withBorderEffect={false} onClick={() => setInviteOpen(true)}>
            Invite Member
          </Button>
        </div>
        <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
          Manage who has access to your organization.
        </p>
      </header>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
      ) : (
        <DataTable columns={columns} data={tableData} emptyMessage="No members yet" />
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Member">
        <form onSubmit={handleSubmit(onInvite)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Select
            label="Role"
            options={[
              { value: 'COMPANY_ADMIN', label: 'Company Admin' },
              { value: 'COMPANY_MEMBER', label: 'Company Member' },
            ]}
            {...register('role')}
            error={errors.role?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" withBorderEffect={false} disabled={inviteMutation.isPending}>
              {inviteMutation.isPending ? 'Sending...' : 'Invite'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && removeMutation.mutate(removeTarget.id)}
        title={`Remove ${removeTarget?.email ?? 'this member'}?`}
        description="They will lose access to the organization."
        confirmLabel="Remove"
        loading={removeMutation.isPending}
      />
    </div>
  );
}
