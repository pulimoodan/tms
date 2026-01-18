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
  MoreVerticalIcon,
  PlusSignIcon,
  GridIcon,
  TableIcon,
  Orbit01Icon,
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

function PurchaseRequestActions({ prId }: { prId: string }) {
  const [, setLocation] = useLocation();

  return (
    <div onClick={(e) => e.stopPropagation()} className="z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(prId)}>
            Copy PR ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/purchase/purchase-requests/${prId}`)}>
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation(`/purchase/purchase-requests/${prId}/edit`)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type PurchaseRequest = {
  id: string;
  requestNo: string;
  description?: string;
  requestedDate: string;
  createdAt: string;
};

const columns: ColumnDef<PurchaseRequest>[] = [
  {
    accessorKey: 'requestNo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          PR Number
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
          </div>
          <div className="font-medium">{row.getValue('requestNo')}</div>
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
          <span className="text-sm text-muted-foreground line-clamp-2">{description || '—'}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'requestedDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Requested Date
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('requestedDate') as string;
      return <div className="text-sm">{date ? new Date(date).toLocaleDateString() : '—'}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const pr = row.original;
      return <PurchaseRequestActions prId={pr.id} />;
    },
  },
];

export default function PurchaseRequestsPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Dummy data for now
  const dummyData: PurchaseRequest[] = [
    {
      id: '1',
      requestNo: 'PR-001',
      description:
        'Office supplies for first quarter including stationery, printer paper, and cleaning supplies',
      requestedDate: new Date('2024-01-15').toISOString(),
      createdAt: new Date('2024-01-15').toISOString(),
    },
    {
      id: '2',
      requestNo: 'PR-002',
      description: 'New laptops and monitors for the development team',
      requestedDate: new Date('2024-01-20').toISOString(),
      createdAt: new Date('2024-01-20').toISOString(),
    },
    {
      id: '3',
      requestNo: 'PR-003',
      description: 'Desks, chairs, and meeting room furniture',
      requestedDate: new Date('2024-01-25').toISOString(),
      createdAt: new Date('2024-01-25').toISOString(),
    },
    {
      id: '4',
      requestNo: 'PR-004',
      description: 'Cleaning supplies and maintenance tools',
      requestedDate: new Date('2024-01-10').toISOString(),
      createdAt: new Date('2024-01-10').toISOString(),
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-requests'],
    queryFn: async () => {
      // Return dummy data instead of API call
      return dummyData;
      // const response = await api.get('/purchase-requests?page=1&limit=100');
      // const data = response.data;
      // if (data.success && Array.isArray(data.results)) {
      //   return data.results;
      // }
      // return [];
    },
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const pr = row.original;
      const search = filterValue.toLowerCase();
      return (
        pr.requestNo?.toLowerCase().includes(search) ||
        pr.description?.toLowerCase().includes(search) ||
        false
      );
    },
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
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load purchase requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Purchase Requests"
          description="Manage purchase requests and approvals"
          icon={File01Icon}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            <HugeiconsIcon icon={viewMode === 'table' ? GridIcon : TableIcon} className="h-4 w-4" />
          </Button>
          <Button onClick={() => setLocation('/purchase/purchase-requests/new')}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            New Purchase Request
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search purchase requests..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Columns</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {viewMode === 'table' ? (
            <div className="rounded-md border">
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
                    table.getRowModel().rows.map((row) => {
                      const pr = row.original;
                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setLocation(`/purchase/purchase-requests/${pr.id}`)}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No purchase requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const pr = row.original;
                  return (
                    <Card
                      key={pr.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setLocation(`/purchase/purchase-requests/${pr.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                            </div>
                            <div className="font-medium">{pr.requestNo}</div>
                          </div>
                          <PurchaseRequestActions prId={pr.id} />
                        </div>
                        {pr.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {pr.description}
                          </p>
                        )}
                        <div className="text-sm text-muted-foreground">
                          {new Date(pr.requestedDate).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No purchase requests found.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length}{' '}
              purchase request(s)
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
