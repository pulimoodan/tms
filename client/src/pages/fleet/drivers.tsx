import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  UserIcon,
  AlertCircleIcon,
  EyeIcon,
  Edit01Icon,
  Delete01Icon,
  CallIcon,
  GlobeIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';
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
import { useToast } from '@/hooks/use-toast';

type Driver = {
  id: string;
  badgeNo?: string;
  name: string;
  iqamaNumber: string;
  position?: 'HeavyDutyDriver' | 'MediumTruckDriver' | 'BusDriver';
  sponsorship?: string;
  nationality: string;
  driverCardExpiry?: string;
  mobile?: string;
  preferredLanguage?: string;
  status: 'Active' | 'OnTrip' | 'Vacation' | 'Inactive';
  createdAt: string;
};

const getPositionLabel = (position?: string) => {
  switch (position) {
    case 'HeavyDutyDriver':
      return 'Heavy Duty Driver';
    case 'MediumTruckDriver':
      return 'Medium Truck Driver';
    case 'BusDriver':
      return 'Bus Driver';
    default:
      return '—';
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Active
        </Badge>
      );
    case 'OnTrip':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
          On Trip
        </Badge>
      );
    case 'Vacation':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
          Vacation
        </Badge>
      );
    case 'Inactive':
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20"
        >
          Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function DriverActions({ driverId }: { driverId: string }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/drivers/${driverId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      toast({
        title: 'Driver deleted',
        description: 'The driver has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.response?.data?.message || 'Failed to delete driver. Please try again.',
      });
    },
  });

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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driverId)}>
            Copy driver ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/fleet/drivers/${driverId}`)}>
            <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setLocation(`/fleet/drivers/${driverId}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit driver
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              if (confirm('Are you sure you want to delete this driver?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
          >
            <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
            Delete driver
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columns: ColumnDef<Driver>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const driver = row.original;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{driver.name}</div>
            <div className="text-xs text-muted-foreground">
              {driver.badgeNo && <span className="font-mono mr-2">Badge: {driver.badgeNo}</span>}
              <span className="font-mono">{driver.iqamaNumber}</span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ row }) => {
      const position = row.original.position;
      return <span>{getPositionLabel(position)}</span>;
    },
  },
  {
    accessorKey: 'nationality',
    header: 'Nationality',
    cell: ({ row }) => {
      const nationality = row.original.nationality;
      return nationality ? (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4 text-muted-foreground" />
          <span>{nationality}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'sponsorship',
    header: 'Sponsorship',
    cell: ({ row }) => {
      const sponsorship = row.original.sponsorship;
      return sponsorship ? (
        <span>{sponsorship}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'mobile',
    header: 'Mobile',
    cell: ({ row }) => {
      const mobile = row.original.mobile;
      return mobile ? (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CallIcon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{mobile}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'preferredLanguage',
    header: 'Language',
    cell: ({ row }) => {
      const language = row.original.preferredLanguage;
      return language ? <span>{language}</span> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    id: 'actions',
    cell: ({ row }) => <DriverActions driverId={row.original.id} />,
  },
];

export default function DriversPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const { data, isLoading, error } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const response = await api.get('/drivers?limit=100');
      if (response.data.success && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
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
      const driver = row.original;
      const search = filterValue.toLowerCase();
      return (
        driver.name?.toLowerCase().includes(search) ||
        driver.badgeNo?.toLowerCase().includes(search) ||
        driver.iqamaNumber?.toLowerCase().includes(search) ||
        driver.nationality?.toLowerCase().includes(search) ||
        driver.sponsorship?.toLowerCase().includes(search) ||
        driver.mobile?.toLowerCase().includes(search) ||
        driver.preferredLanguage?.toLowerCase().includes(search) ||
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
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading drivers</h2>
          <p className="text-muted-foreground mt-2">Failed to load drivers. Please try again.</p>
          <p className="text-xs text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground">Manage your fleet drivers and assignments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLocation('/fleet/drivers/new')}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="relative flex-1 max-w-sm">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              />
              <Input
                type="search"
                placeholder="Search drivers..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={FilterIcon} className="mr-2 h-4 w-4" />
                    View
                    <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                          {column.id === 'preferredLanguage'
                            ? 'Language'
                            : column.id === 'iqamaNumber'
                              ? 'Iqama Number'
                              : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none border-r"
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
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/fleet/drivers/${row.original.id}`)}
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
                        <div>
                          <p>No drivers found.</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Data: {data ? `${data.length} items` : 'null'}, Filtered:{' '}
                            {table.getFilteredRowModel().rows.length} rows
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  const driver = row.original;
                  return (
                    <Card
                      key={driver.id}
                      className="group cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => setLocation(`/fleet/drivers/${driver.id}`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <h3 className="font-semibold text-base leading-tight flex items-center gap-2">
                                <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-primary" />
                                {driver.name}
                              </h3>
                              {getStatusBadge(driver.status)}
                            </div>
                            <p className="text-sm text-muted-foreground font-mono mb-3">
                              {driver.iqamaNumber}
                            </p>

                            <div className="space-y-2 text-sm border-t pt-3">
                              {driver.nationality && (
                                <div className="flex justify-between items-start">
                                  <span className="text-muted-foreground text-xs">Nationality</span>
                                  <span className="font-medium text-right">
                                    {driver.nationality}
                                  </span>
                                </div>
                              )}
                              {driver.mobile && (
                                <div className="flex justify-between items-start">
                                  <span className="text-muted-foreground text-xs">Mobile</span>
                                  <span className="font-mono text-xs font-medium">
                                    {driver.mobile}
                                  </span>
                                </div>
                              )}
                              {driver.preferredLanguage && (
                                <div className="flex justify-between items-start">
                                  <span className="text-muted-foreground text-xs">Language</span>
                                  <span className="font-medium">{driver.preferredLanguage}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <DriverActions driverId={driver.id} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={UserIcon} className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No drivers found matching your search.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} driver
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
              <div className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
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
