import { useState, useMemo, useCallback } from 'react';
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
  Loading01Icon,
  ShippingTruck02Icon,
  AlertCircleIcon,
  EyeIcon,
  Edit01Icon,
  Delete01Icon,
  Search01Icon,
  Location01Icon,
  UserIcon,
  WaveTriangleIcon,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/use-permissions';

type Vehicle = {
  id: string;
  name: string;
  type: 'Vehicle' | 'Attachment' | 'Equipment' | 'Accessory';
  category: string;
  asset?: string;
  doorNo?: string;
  plateNumber?: string;
  plateNumberArabic?: string;
  chassisNo?: string;
  sequenceNo?: string;
  engineModel?: string;
  equipmentNo?: string;
  equipmentType?: string;
  horsePower?: number;
  manufacturingYear?: number;
  make?: string;
  model?: string;
  engineSerialNo?: string;
  status: 'Active' | 'InMaintenance' | 'Inactive' | 'OnTrip';
  isInUse?: boolean; // Indicates if vehicle is assigned to an InProgress order
  createdAt: string;
};

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    TractorHead: 'Tractor Head',
    FourXTwoTractorHead: '4X2 Tractor Head',
    CraneMountedTruck: 'Crane Mounted Truck',
    LightDutyTruck: 'Light Duty Truck',
    BoomTruck: 'Boom Truck',
    DieselTanker: 'Diesel Tanker',
    MiniVan: 'Mini Van',
    Pickup: 'Pickup',
    SUV: 'SUV',
    FlatBedTrailer: 'Flat Bed Trailer',
    LowBedTrailer: 'Low Bed Trailer',
    DryBox: 'Dry Box',
    CurtainSide: 'Curtain Side',
    HydraulicWinchWithBox: 'Hydraulic Winch With Box',
    Forklift: 'Forklift',
    BackhoLoader: 'Backho Loader',
    RoughTerrainCrane: 'Rough Terrain Crane',
    SkidLoader: 'Skid Loader',
  };
  return labels[category] || category;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Active
        </Badge>
      );
    case 'InMaintenance':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
          In Maintenance
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
    case 'OnTrip':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
          On Trip
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function VehicleActions({ vehicleId }: { vehicleId: string }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasUpdatePermission, hasDeletePermission } = usePermissions();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: 'Vehicle deleted',
        description: 'The vehicle has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.response?.data?.message || 'Failed to delete vehicle. Please try again.',
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(vehicleId)}>
            Copy vehicle ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/fleet/vehicles/${vehicleId}`)}>
            <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          {hasUpdatePermission('Vehicles') && (
            <DropdownMenuItem onClick={() => setLocation(`/fleet/vehicles/${vehicleId}/edit`)}>
              <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
              Edit vehicle
            </DropdownMenuItem>
          )}
          {hasUpdatePermission('Vehicles') && hasDeletePermission('Vehicles') && (
            <DropdownMenuSeparator />
          )}
          {hasDeletePermission('Vehicles') && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this vehicle?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
              Delete vehicle
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columns: ColumnDef<Vehicle>[] = [
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
      const vehicle = row.original;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShippingTruck02Icon} className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{vehicle.name}</div>
            {vehicle.asset && (
              <div className="text-xs text-muted-foreground font-mono">Asset: {vehicle.asset}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      return <Badge variant="outline">{type}</Badge>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.original.category;
      return <span>{getCategoryLabel(category)}</span>;
    },
  },
  {
    accessorKey: 'plateNumber',
    header: 'Plate Number',
    cell: ({ row }) => {
      const vehicle = row.original;
      return vehicle.plateNumber ? (
        <div>
          <div className="font-medium">{vehicle.plateNumber}</div>
          {vehicle.plateNumberArabic && (
            <div className="text-xs text-muted-foreground">{vehicle.plateNumberArabic}</div>
          )}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'make',
    header: 'Make / Model',
    cell: ({ row }) => {
      const vehicle = row.original;
      return vehicle.make || vehicle.model ? (
        <div>
          {vehicle.make && <div className="font-medium">{vehicle.make}</div>}
          {vehicle.model && <div className="text-xs text-muted-foreground">{vehicle.model}</div>}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'manufacturingYear',
    header: 'Year',
    cell: ({ row }) => {
      const year = row.original.manufacturingYear;
      return year ? <span>{year}</span> : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: 'engineModel',
    header: 'Engine',
    cell: ({ row }) => {
      const engine = row.original.engineModel;
      return engine ? (
        <span className="font-mono text-sm">{engine}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
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
    cell: ({ row }) => <VehicleActions vehicleId={row.original.id} />,
  },
];

export default function VehiclesPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const { hasWritePermission } = usePermissions();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Vehicle' | 'Attachment' | 'Equipment' | 'Accessory'>('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const response = await api.get('/vehicles?limit=100');
      if (response.data.success && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    },
  });

  // Filter data based on selected type - memoized for performance
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (typeFilter === 'all') return data;
    return data.filter((vehicle: Vehicle) => {
      return vehicle.type === typeFilter;
    });
  }, [data, typeFilter]);

  // Calculate status counts based on filtered data - memoized for performance
  // OnTrip is calculated based on isInUse flag (vehicle assigned to InProgress order)
  // MUST be called before any early returns to follow Rules of Hooks
  const statusCounts = useMemo(() => {
    return {
      Active: filteredData.filter((v: Vehicle) => v.status === 'Active').length || 0,
      OnTrip: filteredData.filter((v: Vehicle) => v.isInUse === true).length || 0,
      InMaintenance: filteredData.filter((v: Vehicle) => v.status === 'InMaintenance').length || 0,
      Inactive: filteredData.filter((v: Vehicle) => v.status === 'Inactive').length || 0,
    };
  }, [filteredData]);

  const table = useReactTable({
    data: filteredData,
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
      const vehicle = row.original;
      const search = filterValue.toLowerCase();
      return (
        vehicle.name?.toLowerCase().includes(search) ||
        vehicle.asset?.toLowerCase().includes(search) ||
        vehicle.plateNumber?.toLowerCase().includes(search) ||
        vehicle.plateNumberArabic?.toLowerCase().includes(search) ||
        vehicle.type?.toLowerCase().includes(search) ||
        vehicle.category?.toLowerCase().includes(search) ||
        vehicle.make?.toLowerCase().includes(search) ||
        vehicle.model?.toLowerCase().includes(search) ||
        vehicle.engineModel?.toLowerCase().includes(search) ||
        vehicle.equipmentNo?.toLowerCase().includes(search) ||
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
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading vehicles</h2>
          <p className="text-muted-foreground mt-2">Failed to load vehicles. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fleet Vehicles</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your vehicle fleet</p>
        </div>
        {hasWritePermission('Vehicles') && (
          <Button onClick={() => setLocation('/fleet/vehicles/new')}>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {statusCounts.Active}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                <HugeiconsIcon
                  icon={WaveTriangleIcon}
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">On Trip</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {statusCounts.OnTrip}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Maintenance</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {statusCounts.InMaintenance}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <HugeiconsIcon
                  icon={WaveTriangleIcon}
                  className="h-6 w-6 text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-500"></div>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Inactive</p>
                <p className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {statusCounts.Inactive}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-500/10 dark:bg-slate-500/20">
                <HugeiconsIcon
                  icon={ShippingTruck02Icon}
                  className="h-6 w-6 text-slate-600 dark:text-slate-400"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Filter Tabs */}
      <Tabs 
        value={typeFilter} 
        onValueChange={(value) => {
          if (value === 'all' || value === 'Vehicle' || value === 'Attachment' || value === 'Equipment' || value === 'Accessory') {
            setTypeFilter(value);
          }
        }}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Vehicle">Vehicles</TabsTrigger>
          <TabsTrigger value="Attachment">Attachments</TabsTrigger>
          <TabsTrigger value="Equipment">Equipment</TabsTrigger>
          <TabsTrigger value="Accessory">Accessories</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          />
          <Input
            type="search"
            placeholder="Search vehicles by ID or model..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <HugeiconsIcon icon={FilterIcon} className="mr-2 h-4 w-4" />
          Filter
        </Button>
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

      {/* Content Section */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <HugeiconsIcon icon={FilterIcon} className="mr-2 h-4 w-4" />
                    Columns
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
                          {column.id === 'vehicleType'
                            ? 'Vehicle Type'
                            : column.id === 'plateNumber'
                              ? 'Plate Number'
                              : column.id === 'manufacturingYear'
                                ? 'Year'
                                : column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
                        onClick={() => setLocation(`/fleet/vehicles/${row.original.id}`)}
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
                        No vehicles found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {table.getFilteredRowModel().rows.length} vehicle
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const vehicle = row.original;
              return (
                <Card
                  key={vehicle.id}
                  className="group cursor-pointer hover:shadow-lg transition-all overflow-hidden"
                  onClick={() => setLocation(`/fleet/vehicles/${vehicle.id}`)}
                >
                  {/* Vehicle Image Placeholder */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ShippingTruck02Icon}
                      className="h-24 w-24 text-slate-400 dark:text-slate-600"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">{getStatusBadge(vehicle.status)}</div>
                    {/* Efficiency Badge (placeholder) */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                        Efficiency 94%
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      {/* Vehicle ID */}
                      <div>
                        <h3 className="text-xl font-bold font-mono">
                          {vehicle.asset || vehicle.doorNo || vehicle.plateNumber || vehicle.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {vehicle.make && vehicle.model
                            ? `${vehicle.make} ${vehicle.model}`
                            : getCategoryLabel(vehicle.category)}
                        </p>
                      </div>

                      {/* Driver/Assignment */}
                      {vehicle.isInUse ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <HugeiconsIcon
                              icon={UserIcon}
                              className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">On Trip</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                          <HugeiconsIcon
                            icon={AlertCircleIcon}
                            className="h-4 w-4 text-muted-foreground"
                          />
                          <span className="text-sm text-muted-foreground">Unassigned</span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <HugeiconsIcon icon={Location01Icon} className="h-4 w-4" />
                        <span>
                          {vehicle.isInUse
                            ? 'On Route'
                            : vehicle.status === 'InMaintenance'
                              ? 'Workshop'
                              : vehicle.status === 'Active'
                                ? 'Available'
                                : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div
                        className="flex justify-end pt-2 border-t"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <VehicleActions vehicleId={vehicle.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No vehicles found matching your search.
            </div>
          )}
        </div>
      )}

      {/* Pagination for Grid View */}
      {viewMode === 'grid' && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredRowModel().rows.length} vehicle
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
      )}
    </div>
  );
}
