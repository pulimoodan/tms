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
  Orbit01Icon,
  ShippingTruck02Icon,
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

function VehicleTypeActions({ vehicleTypeId }: { vehicleTypeId: string }) {
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(vehicleTypeId)}>
            Copy vehicle type ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLocation(`/config/vehicle-types/${vehicleTypeId}/edit`)}
          >
            Edit vehicle type
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete vehicle type</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

type VehicleType = {
  id: string;
  name: string;
  capacity: number;
  type: 'FlatBed' | 'LowBed' | 'CurtainSide' | 'Reefer' | 'CarCarrier' | 'DryBox';
  createdAt: string;
};

const getTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    FlatBed: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
    LowBed: 'bg-primary/10 text-primary dark:text-primary border-primary/20',
    CurtainSide: 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20',
    Reefer: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/20',
    CarCarrier: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20',
    DryBox: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20',
  };
  return (
    <Badge variant="outline" className={colors[type] || ''}>
      {type}
    </Badge>
  );
};

const columns: ColumnDef<VehicleType>[] = [
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
            <HugeiconsIcon icon={ShippingTruck02Icon} className="h-5 w-5 text-primary" />
          </div>
          <div className="font-medium">{row.getValue('name')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Type
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return getTypeBadge(row.getValue('type'));
    },
  },
  {
    accessorKey: 'capacity',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Capacity
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const capacity = row.getValue('capacity') as number;
      return (
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
            {capacity}T
          </Badge>
        </div>
      );
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const vehicleType = row.original;
      return <VehicleTypeActions vehicleTypeId={vehicleType.id} />;
    },
  },
];

export default function VehicleTypesPage() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async () => {
      const response = await api.get('/vehicle-types?page=1&limit=100');
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

  const openNewType = () => {
    setLocation('/config/vehicle-types/new');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Failed to load vehicle types</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : 'An error occurred while loading vehicle types.'}
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
            title="Vehicle Types"
            description="Manage available vehicle types and capacities."
            icon={ShippingTruck02Icon}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={openNewType} data-testid="button-new-vehicle-type">
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            Add Vehicle Type
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
                placeholder="Search vehicle types..."
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
                      onClick={() => setLocation(`/config/vehicle-types/${row.original.id}/edit`)}
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
                        <p className="text-muted-foreground">No vehicle types found.</p>
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
                  const vehicleType = row.original;
                  return (
                    <Card
                      key={vehicleType.id}
                      className="cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md"
                      onClick={() => setLocation(`/config/vehicle-types/${vehicleType.id}/edit`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <HugeiconsIcon
                                icon={ShippingTruck02Icon}
                                className="h-6 w-6 text-primary"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base line-clamp-2 leading-tight">
                                {vehicleType.name}
                              </h3>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">Type</span>
                              {getTypeBadge(vehicleType.type)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground text-xs">Capacity</span>
                              <Badge className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary">
                                {vehicleType.capacity}T
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
                  <p>No vehicle types found</p>
                </div>
              )}
            </div>
          </CardContent>
        )}

        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} vehicle type
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
