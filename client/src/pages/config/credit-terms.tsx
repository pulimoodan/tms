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
  CreditCardIcon,
  AlertCircleIcon,
  File01Icon,
  Search01Icon,
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

function CreditTermActions({ creditTermId }: { creditTermId: string }) {
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(creditTermId)}>
            Copy credit term ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLocation(`/config/credit-terms/${creditTermId}/edit`)}
          >
            Edit credit term
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete credit term</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type CreditTerm = {
  id: string;
  name: string;
  description?: string;
  paymentDays: number;
  createdAt: string;
};

const columns: ColumnDef<CreditTerm>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Name
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            {row.original.description && (
              <div className="text-xs text-muted-foreground line-clamp-1">
                {row.original.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentDays',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Payment Days
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const days = row.getValue('paymentDays') as number;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
          >
            {days} {days === 1 ? 'day' : 'days'}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string | undefined;
      return (
        <div className="max-w-md">
          <span className="text-sm text-muted-foreground">{description || '—'}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const creditTerm = row.original;
      return <CreditTermActions creditTermId={creditTerm.id} />;
    },
  },
];

export default function CreditTermsPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['credit-terms'],
    queryFn: async () => {
      const response = await api.get('/credit-terms?page=1&limit=100');
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

  const openNewTerm = () => {
    setLocation('/config/credit-terms/new');
  };

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
          <h2 className="text-2xl font-bold">Failed to load credit terms</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading credit terms.'}
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
            title="Credit Terms"
            description="Manage payment terms and credit conditions for contracts."
            icon={CreditCardIcon}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openNewTerm} data-testid="button-new-credit-term">
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            Add Credit Term
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
                placeholder="Search credit terms..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
            </Button>
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
                      onClick={() => setLocation(`/config/credit-terms/${row.original.id}/edit`)}
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
                        <p className="text-muted-foreground">No credit terms found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const creditTerm = row.original;
                  return (
                    <Card
                      key={creditTerm.id}
                      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md"
                      onClick={() => setLocation(`/config/credit-terms/${creditTerm.id}/edit`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={CreditCardIcon}
                                className="h-6 w-6 text-primary"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base line-clamp-2 leading-tight">
                                {creditTerm.name}
                              </h3>
                              {creditTerm.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {creditTerm.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">Payment Days</span>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                              >
                                {creditTerm.paymentDays}{' '}
                                {creditTerm.paymentDays === 1 ? 'day' : 'days'}
                              </Badge>
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
                  <p>No credit terms found</p>
                </div>
              )}
            </div>
          </CardContent>
        )}

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} credit term
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
