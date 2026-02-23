import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import type { Application, ApplicationStatus } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { FilterBar } from '@/components/ui/filter-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from '@/components/ui/toast';
import { format, isAfter, subDays, subMonths } from 'date-fns';

// Extended application type with extra opportunity metadata from the API
interface ApplicationWithMeta extends Application {
  opportunity?: {
    id: string;
    title: string;
    status: string;
    budgetType?: string | null;
    budgetRange?: string | null;
    tags?: string[];
    publishedAt?: string | null;
    closedAt?: string | null;
    org?: { id: string; name: string } | null;
    _count?: { applications?: number };
  };
}

type DateFilter = '' | '7d' | '30d' | '90d';

export default function MyApplicationsPage(): JSX.Element {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [withdrawTarget, setWithdrawTarget] = useState<{ id: string; title: string } | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('');
  const [search, setSearch] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', 'me'],
    queryFn: async () => {
      const res = await api.get<{ data?: ApplicationWithMeta[] }>(
        endpoints.applications.me,
        { params: { limit: 100 } },
      );
      const body = res.data;
      return (body && typeof body === 'object' && 'data' in body ? body.data : body) ?? [];
    },
  });

  // Apply client-side filters
  const filtered = useMemo(() => {
    let list = applications as ApplicationWithMeta[];

    // Status filter
    if (statusFilter) {
      list = list.filter((a) => a.status === statusFilter);
    }

    // Date filter
    if (dateFilter) {
      const now = new Date();
      const cutoff =
        dateFilter === '7d'
          ? subDays(now, 7)
          : dateFilter === '30d'
            ? subDays(now, 30)
            : subMonths(now, 3);
      list = list.filter((a) => isAfter(new Date(a.createdAt), cutoff));
    }

    // Search filter (opportunity title or org name)
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.opportunity?.title?.toLowerCase().includes(q) ||
          a.opportunity?.org?.name?.toLowerCase().includes(q),
      );
    }

    return list;
  }, [applications, statusFilter, dateFilter, search]);

  const withdrawMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      await api.post(endpoints.applications.withdraw(applicationId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'me'] });
      setWithdrawTarget(null);
      toast.success('Application withdrawn');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to withdraw application');
    },
  });

  const columns: Column<ApplicationWithMeta & Record<string, unknown>>[] = [
    {
      key: 'opportunity',
      header: 'Opportunity',
      render: (row) => {
        const opp = row.opportunity;
        const title = opp?.title ?? '—';
        const opportunityId = row.opportunityId ?? opp?.id;
        return opportunityId ? (
          <button
            type="button"
            className="text-left text-zinc-300 underline underline-offset-2 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/opportunities/${opportunityId}`);
            }}
          >
            {title}
          </button>
        ) : (
          <span className="text-zinc-300">{title}</span>
        );
      },
    },
    {
      key: 'organization',
      header: 'Organization',
      render: (row) => {
        const org = row.opportunity?.org;
        return org ? (
          <button
            type="button"
            className="text-zinc-400 underline underline-offset-2 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/organizations/${org.id}`);
            }}
          >
            {org.name}
          </button>
        ) : (
          <span className="text-zinc-500">—</span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge>{row.status as ApplicationStatus}</Badge>,
    },
    {
      key: 'applicants',
      header: 'Applicants',
      render: (row) => (
        <span className="text-zinc-400">
          {row.opportunity?._count?.applications ?? '—'}
        </span>
      ),
    },
    {
      key: 'applied',
      header: 'Applied',
      render: (row) => (
        <span className="text-zinc-400">{format(new Date(row.createdAt), 'MMM d, yyyy')}</span>
      ),
    },
    {
      key: 'oppStatus',
      header: 'Opp. Status',
      render: (row) =>
        row.opportunity?.status ? (
          <Badge>{row.opportunity.status}</Badge>
        ) : (
          <span className="text-zinc-500">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'SUBMITTED' ? (
          <Button
            variant="ghost"
            className="text-xs text-red-400 hover:text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              const title = row.opportunity?.title ?? 'this opportunity';
              setWithdrawTarget({ id: row.id, title });
            }}
          >
            Withdraw
          </Button>
        ) : (
          <span className="text-zinc-500">—</span>
        ),
    },
  ];

  const tableData = filtered.map(
    (a) => ({ ...a }) as ApplicationWithMeta & Record<string, unknown>,
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Student</p>
        <h1 className="ef-heading-gradient mt-2 text-4xl font-semibold leading-tight md:text-5xl">
          My Applications
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-300 md:text-base">
          Track your applications to opportunities. Use filters to narrow results.
        </p>
      </header>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by opportunity or organization..."
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'SUBMITTED', label: 'Submitted' },
              { value: 'SHORTLISTED', label: 'Shortlisted' },
              { value: 'INTERVIEW', label: 'Interview' },
              { value: 'SELECTED', label: 'Selected' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'WITHDRAWN', label: 'Withdrawn' },
            ],
          },
          {
            key: 'date',
            label: 'Applied',
            value: dateFilter,
            onChange: (v: string) => setDateFilter(v as DateFilter),
            options: [
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 3 months' },
            ],
          },
        ]}
      />

      {isLoading ? (
        <TableSkeleton rows={5} cols={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={applications.length === 0 ? 'No applications' : 'No matching applications'}
          description={
            applications.length === 0
              ? "You haven't applied to any opportunities yet."
              : 'Try adjusting your filters.'
          }
        />
      ) : (
        <DataTable columns={columns} data={tableData} emptyMessage="No applications" />
      )}

      <ConfirmDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={() => withdrawTarget && withdrawMutation.mutate(withdrawTarget.id)}
        title={`Withdraw application to ${withdrawTarget?.title ?? 'this opportunity'}?`}
        description="This action cannot be undone. You may be able to reapply if the opportunity is still open."
        confirmLabel="Withdraw"
        loading={withdrawMutation.isPending}
      />
    </div>
  );
}
