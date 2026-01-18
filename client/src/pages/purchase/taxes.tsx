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
  ReceiptDollarIcon,
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

function TaxActions({ taxId }: { taxId: string }) {
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(taxId)}>
            Copy tax ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/purchase/taxes/${taxId}/edit`)}>
            Edit tax
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete tax</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type Tax = {
  id: string;
  name: string;
  rate: number;
  isActive: boolean;
  createdAt: string;
};

const columns: ColumnDef<Tax>[] = [
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
            <HugeiconsIcon icon={ReceiptDollarIcon} className="h-5 w-5 text-primary" />
          </div>
          <div className="font-medium">{row.getValue('name')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'rate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Rate
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const rate = row.getValue('rate') as number;
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
          >
            {rate}%
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const tax = row.original;
      return <TaxActions taxId={tax.id} />;
    },
  },
];

export default function TaxesPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Dummy data for now
  const dummyData: Tax[] = [
    {
      id: '1',
      name: 'VAT',
      rate: 15,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Sales Tax',
      rate: 5,
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['taxes'],
    queryFn: async () => {
      // Return dummy data instead of API call
      return dummyData;
      // const response = await api.get('/taxes?page=1&limit=100');
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
      const tax = row.original;
      const search = filterValue.toLowerCase();
      return tax.name?.toLowerCase().includes(search) || false;
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
          <p className="text-destructive">Failed to load taxes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Taxes"
          description="Manage tax rates for purchase orders"
          icon={ReceiptDollarIcon}
        />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
          >
            <HugeiconsIcon icon={viewMode === 'table' ? GridIcon : TableIcon} className="h-4 w-4" />
          </Button>
          <Button onClick={() => setLocation('/purchase/taxes/new')}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            New Tax
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
                placeholder="Search taxes..."
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
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
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
                        No taxes found.
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
                  const tax = row.original;
                  return (
                    <Card key={tax.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={ReceiptDollarIcon}
                                className="h-5 w-5 text-primary"
                              />
                            </div>
                            <div className="font-medium">{tax.name}</div>
                          </div>
                          <TaxActions taxId={tax.id} />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Rate: </span>
                            <span className="font-medium">{tax.rate}%</span>
                          </div>
                          <Badge variant={tax.isActive ? 'default' : 'secondary'}>
                            {tax.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No taxes found.
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length}{' '}
              tax(es)
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
