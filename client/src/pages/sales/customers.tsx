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
  FilterIcon,
  GridIcon,
  TableIcon,
  Loading01Icon,
  Building01Icon,
  Location03Icon,
  File01Icon,
  Search01Icon,
  UserGroupIcon,
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
import { usePermissions } from '@/hooks/use-permissions';

function CustomerActions({ customerId }: { customerId: string }) {
  const [, setLocation] = useLocation();
  const { hasUpdatePermission, hasDeletePermission } = usePermissions();

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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(customerId)}>
            Copy customer ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/sales/customers/${customerId}`)}>
            View details
          </DropdownMenuItem>
          {hasUpdatePermission('Customers') && (
            <DropdownMenuItem onClick={() => setLocation(`/sales/customers/${customerId}/edit`)}>
              Edit customer
            </DropdownMenuItem>
          )}
          {hasUpdatePermission('Customers') && hasDeletePermission('Customers') && <DropdownMenuSeparator />}
          {hasDeletePermission('Customers') && (
            <DropdownMenuItem className="text-destructive">Delete customer</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type Customer = {
  id: string;
  name: string;
  nameArabic?: string;
  street?: string;
  district?: string;
  city?: string;
  country?: string;
  crNo?: string;
  crExpiryDate?: string;
  vatNo?: string;
  routeCount?: number;
  createdAt: string;
};

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Customer Name
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon icon={Building01Icon} className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium">{customer.name}</div>
            {customer.nameArabic && (
              <div className="text-xs text-muted-foreground">{customer.nameArabic}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'city',
    header: 'Location',
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
          <div>
            {customer.city && customer.country ? (
              <>
                <div className="text-sm">{customer.city}</div>
                <div className="text-xs text-muted-foreground">{customer.country}</div>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'crNo',
    header: 'CR Number',
    cell: ({ row }) => {
      const crNo = row.getValue('crNo') as string;
      return crNo ? (
        <div className="font-mono text-sm">{crNo}</div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'vatNo',
    header: 'VAT Number',
    cell: ({ row }) => {
      const vatNo = row.getValue('vatNo') as string;
      return vatNo ? (
        <div className="font-mono text-sm">{vatNo}</div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'routeCount',
    header: 'Routes',
    cell: ({ row }) => {
      const routeCount = row.getValue('routeCount') as number | undefined;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{routeCount ?? 0}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'crExpiryDate',
    header: 'CR Expiry',
    cell: ({ row }) => {
      const date = row.getValue('crExpiryDate') as string;
      if (!date) return <span className="text-muted-foreground">—</span>;
      const expiryDate = new Date(date);
      const isExpired = expiryDate < new Date();
      const isExpiringSoon = expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      return (
        <div className="flex items-center gap-2">
          <span className={isExpired ? 'text-destructive' : isExpiringSoon ? 'text-amber-600' : ''}>
            {expiryDate.toLocaleDateString()}
          </span>
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
          {!isExpired && isExpiringSoon && (
            <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
              Soon
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const customer = row.original;
      return <CustomerActions customerId={customer.id} />;
    },
  },
];

export default function CustomersPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const { hasWritePermission } = usePermissions();

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/customers?page=1&limit=100');
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

  const openNewCustomerForm = () => {
    setLocation('/sales/customers/new');
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
        <div className="text-destructive">Failed to load customers</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle
            title="Customers"
            description="Manage your shippers, consignees, and billing parties."
            icon={UserGroupIcon}
          />
        </div>
        <div className="flex items-center gap-2">
          {hasWritePermission('Customers') && (
            <Button onClick={openNewCustomerForm} data-testid="button-new-customer">
              <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative w-full max-w-sm">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                />
                <Input
                  placeholder="Search customers..."
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
            <div className="border rounded-lg overflow-x-auto">
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
                        onClick={() => setLocation(`/sales/customers/${row.original.id}`)}
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
                          <p className="text-muted-foreground">No customers found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const customer = row.original;
                  return (
                    <Card
                      key={customer.id}
                      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md"
                      onClick={() => setLocation(`/sales/customers/${customer.id}`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={Building01Icon}
                                className="h-6 w-6 text-primary"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base line-clamp-2 leading-tight">
                                {customer.name}
                              </h3>
                              {customer.nameArabic && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                  {customer.nameArabic}
                                </p>
                              )}
                            </div>
                          </div>
                          {customer.city && customer.country && (
                            <div className="flex items-center gap-2 text-sm">
                              <HugeiconsIcon
                                icon={Location03Icon}
                                className="h-4 w-4 text-muted-foreground shrink-0"
                              />
                              <span className="text-muted-foreground truncate">
                                {customer.city}, {customer.country}
                              </span>
                            </div>
                          )}
                          <div className="space-y-2 text-sm border-t pt-3">
                            {customer.crNo && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground text-xs">CR No</span>
                                <p className="font-mono text-xs font-medium">{customer.crNo}</p>
                              </div>
                            )}
                            {customer.vatNo && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground text-xs">VAT</span>
                                <p className="font-mono text-xs font-medium">{customer.vatNo}</p>
                              </div>
                            )}
                            {customer.crExpiryDate && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground text-xs">CR Expiry</span>
                                <p className="text-xs">
                                  {new Date(customer.crExpiryDate).toLocaleDateString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={File01Icon} className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No customers found</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between py-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} customer
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
        </CardContent>
      </Card>
    </div>
  );
}
