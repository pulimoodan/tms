import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowUpDownIcon,
  ArrowDown01Icon,
  MoreVerticalIcon,
  PlusSignIcon,
  Download01Icon,
  FilterIcon,
  GridIcon,
  TableIcon,
  Loading01Icon,
  File01Icon,
  Calendar01Icon,
  Building01Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Clock01Icon,
  AlertCircleIcon,
  Search01Icon,
  LegalDocument01Icon,
} from '@hugeicons/core-free-icons';
import { PageTitle } from '@/components/ui/page-title';
import { HugeiconsIcon } from '@hugeicons/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { format } from 'date-fns';

function ContractActions({ contractId }: { contractId: string }) {
  const [, setLocation] = useLocation();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(contractId)}>
            Copy contract ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/sales/contracts/${contractId}`)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation(`/sales/contracts/${contractId}/edit`)}>
            Edit contract
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete contract</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type Contract = {
  id: string;
  contractNumber: string;
  customer: {
    id: string;
    name: string;
  };
  creditTerm: {
    id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Active' | 'Expired' | 'Terminated';
  material?: string;
  bankGuarantee: boolean;
  insurance: boolean;
  maxWaitingHours?: number;
  waitingCharge?: number;
  _count: {
    routes: number;
  };
  createdAt: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case 'Draft':
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20"
        >
          <HugeiconsIcon icon={File01Icon} className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      );
    case 'Expired':
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20"
        >
          <HugeiconsIcon icon={Clock01Icon} className="mr-1 h-3 w-3" />
          Expired
        </Badge>
      );
    case 'Terminated':
      return (
        <Badge
          variant="destructive"
          className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
        >
          <HugeiconsIcon icon={CancelCircleIcon} className="mr-1 h-3 w-3" />
          Terminated
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
};

const isExpired = (endDate?: string) => {
  if (!endDate) return false;
  try {
    return new Date(endDate) < new Date();
  } catch {
    return false;
  }
};

const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: 'contractNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Contract Number
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={File01Icon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono font-medium">{row.getValue('contractNumber')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'customer',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Customer
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original.customer;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Building01Icon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{customer.name}</span>
        </div>
      );
    },
    sortingFn: (rowA, rowB) => {
      return rowA.original.customer.name.localeCompare(rowB.original.customer.name);
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Status
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return getStatusBadge(row.getValue('status'));
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: 'startDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Start Date
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(row.getValue('startDate'))}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'endDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          End Date
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const endDate = row.getValue('endDate') as string;
      const expired = isExpired(endDate);
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
          <span>{formatDate(endDate)}</span>
          {expired && (
            <Badge variant="outline" className="text-xs border-red-500 text-red-600">
              Expired
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'creditTerm',
    header: 'Credit Terms',
    cell: ({ row }) => {
      const creditTerm = row.original.creditTerm;
      return <span className="text-sm">{creditTerm.name}</span>;
    },
  },
  {
    accessorKey: 'material',
    header: 'Material',
    cell: ({ row }) => {
      const material = row.getValue('material') as string | undefined;
      return <span className="text-sm">{material || '—'}</span>;
    },
  },
  {
    accessorKey: '_count',
    header: 'Routes',
    cell: ({ row }) => {
      const routeCount = row.original._count.routes;
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium">{routeCount}</span>
          <span className="text-xs text-muted-foreground">routes</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const contract = row.original;
      return <ContractActions contractId={contract.id} />;
    },
  },
];

export default function ContractsPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [globalFilter, setGlobalFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const response = await api.get('/contracts?page=1&limit=100');
      const data = response.data;
      if (data.success && Array.isArray(data.results)) {
        return data.results;
      }
      return [];
    },
  });

  const table = useReactTable({
    data: data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Failed to load contracts</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'An error occurred while loading contracts.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle
            title="Contracts"
            description="Manage service agreements and project contracts."
            icon={LegalDocument01Icon}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setLocation('/sales/contracts/new')}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            New Contract
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative w-full max-w-sm">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search contracts..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['Active', 'Draft', 'Expired', 'Terminated'].map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={(table.getColumn('status')?.getFilterValue() as string[])?.includes(
                      status,
                    )}
                    onCheckedChange={(checked) => {
                      const currentFilter =
                        (table.getColumn('status')?.getFilterValue() as string[]) || [];
                      if (checked) {
                        table.getColumn('status')?.setFilterValue([...currentFilter, status]);
                      } else {
                        table
                          .getColumn('status')
                          ?.setFilterValue(currentFilter.filter((s) => s !== status));
                      }
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Columns <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('table')}
              >
                <HugeiconsIcon icon={TableIcon} className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('grid')}
              >
                <HugeiconsIcon icon={GridIcon} className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      className="cursor-pointer"
                      onClick={() => setLocation(`/sales/contracts/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <HugeiconsIcon
                          icon={File01Icon}
                          className="h-8 w-8 text-muted-foreground"
                        />
                        <p className="text-muted-foreground">No contracts found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const contract = row.original;
                  return (
                    <Card
                      key={contract.id}
                      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md"
                      onClick={() => setLocation(`/sales/contracts/${contract.id}`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                              <span className="font-mono font-semibold text-sm">
                                {contract.contractNumber}
                              </span>
                            </div>
                            {getStatusBadge(contract.status)}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Customer</p>
                            <p className="font-medium text-sm line-clamp-2">
                              {contract.customer.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">Credit Terms</span>
                              <p className="text-xs font-medium">{contract.creditTerm.name}</p>
                            </div>
                            {contract.material && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground text-xs">Material</span>
                                <p className="text-xs font-medium truncate ml-2">
                                  {contract.material}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">Routes</span>
                              <p className="text-xs font-medium">{contract._count.routes}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={File01Icon} className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No contracts found</p>
                </div>
              )}
            </div>
          </CardContent>
        )}

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} contract
            {table.getFilteredRowModel().rows.length !== 1 ? 's' : ''} found
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
