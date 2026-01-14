import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
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
  PackageIcon,
  AlertCircleIcon,
  EyeIcon,
  Edit01Icon,
  Delete01Icon,
  ShippingTruck02Icon,
  Location03Icon,
  Calendar01Icon,
  Search01Icon,
  DeliveryBox01Icon,
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
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/use-permissions';

type Order = {
  id: string;
  orderNo: string;
  customer?: {
    id: string;
    name: string;
  };
  contract?: {
    id: string;
    contractNumber: string;
  };
  from?: {
    id: string;
    name: string;
    code: string;
  };
  to?: {
    id: string;
    name: string;
    code: string;
  };
  vehicle?: {
    id: string;
    plateNumber: string;
    name?: string;
  };
  driver?: {
    id: string;
    name: string;
    mobile?: string;
  };
  weight?: number;
  volume?: number;
  status: 'InProgress' | 'Closed' | 'ClosedAccident' | 'ClosedBreakdown';
  hasDuplicatedResources?: boolean;
  duplicationNotes?: string;
  tripNumber?: string;
  cargoDescription?: string;
  createdAt: string;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'InProgress':
    case 'Pending': // Fallback for old data that might not have been migrated
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
          In Progress
        </Badge>
      );
    case 'Closed':
    case 'Delivered': // Fallback for old data that might not have been migrated
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Closed
        </Badge>
      );
    case 'ClosedAccident':
      return (
        <Badge className="bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20">
          Closed (Accident)
        </Badge>
      );
    case 'ClosedBreakdown':
      return (
        <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">
          Closed (Breakdown)
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function OrderActions({ orderId }: { orderId: string }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasUpdatePermission, hasDeletePermission } = usePermissions();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order deleted',
        description: 'The order has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.response?.data?.message || 'Failed to delete order. Please try again.',
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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(orderId)}>
            Copy order ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setLocation(`/ops/orders/${orderId}`)}>
            <HugeiconsIcon icon={EyeIcon} className="mr-2 h-4 w-4" />
            View details
          </DropdownMenuItem>
          {hasUpdatePermission('Orders') && (
            <DropdownMenuItem onClick={() => setLocation(`/ops/orders/${orderId}/edit`)}>
              <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
              Edit order
            </DropdownMenuItem>
          )}
          {hasUpdatePermission('Orders') && hasDeletePermission('Orders') && (
            <DropdownMenuSeparator />
          )}
          {hasDeletePermission('Orders') && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to delete this order?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <HugeiconsIcon icon={Delete01Icon} className="mr-2 h-4 w-4" />
              Delete order
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNo',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order Number
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={PackageIcon} className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="font-medium font-mono">{order.orderNo}</div>
              {order.hasDuplicatedResources && (
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  className="h-4 w-4 text-orange-600 dark:text-orange-400"
                  title={order.duplicationNotes || 'This waybill has duplicated resources'}
                />
              )}
            </div>
            {order.customer && (
              <div className="text-xs text-muted-foreground">{order.customer.name}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'from',
    header: 'From',
    cell: ({ row }) => {
      const from = row.original.from;
      return from ? (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{from.name}</div>
            {from.code && (
              <div className="text-xs text-muted-foreground font-mono">{from.code}</div>
            )}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'to',
    header: 'To',
    cell: ({ row }) => {
      const to = row.original.to;
      return to ? (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{to.name}</div>
            {to.code && <div className="text-xs text-muted-foreground font-mono">{to.code}</div>}
          </div>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'vehicle',
    header: 'Vehicle',
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return vehicle ? (
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={ShippingTruck02Icon} className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{vehicle.plateNumber}</span>
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'driver',
    header: 'Driver',
    cell: ({ row }) => {
      const driver = row.original.driver;
      return driver ? (
        <div>
          <div className="font-medium">{driver.name}</div>
          {driver.mobile && <div className="text-xs text-muted-foreground">{driver.mobile}</div>}
        </div>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: 'cargoDescription',
    header: 'Cargo',
    cell: ({ row }) => {
      const cargo = row.original.cargoDescription;
      return cargo ? (
        <span className="text-sm">{cargo}</span>
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
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
          {order.hasDuplicatedResources && (
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="h-4 w-4 text-orange-600 dark:text-orange-400"
              title={order.duplicationNotes || 'This waybill has duplicated resources'}
            />
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <OrderActions orderId={row.original.id} />,
  },
];

export default function OrdersPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const { hasWritePermission } = usePermissions();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', pagination.pageIndex, pagination.pageSize],
    queryFn: async () => {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/orders?${params.toString()}`);
      if (response.data.success) {
        return {
          results: Array.isArray(response.data.results) ? response.data.results : [],
          pagination: response.data.pagination || {
            page: page,
            limit: limit,
            total: 0,
            totalPages: 0,
          },
        };
      }
      return { results: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    },
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const orders = data?.results || [];
  const paginationInfo = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: paginationInfo.totalPages || 0,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
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
          <h2 className="text-2xl font-bold">Error loading orders</h2>
          <p className="text-muted-foreground mt-2">Failed to load orders. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle
            title="Orders / Waybills"
            description="Manage shipment orders and assignments."
            icon={DeliveryBox01Icon}
          />
        </div>
        <div className="flex items-center gap-2">
          {hasWritePermission('Orders') && (
            <Button variant="default" onClick={() => setLocation('/ops/orders/new')}>
              <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
              New Order
            </Button>
          )}
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
                placeholder="Search orders..."
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
                          {column.id === 'orderNo'
                            ? 'Order Number'
                            : column.id === 'from'
                              ? 'From'
                              : column.id === 'to'
                                ? 'To'
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
                        onClick={() => setLocation(`/ops/orders/${row.original.id}`)}
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
                        No orders found.
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
                  const order = row.original;
                  return (
                    <Card
                      key={order.id}
                      className="group cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => setLocation(`/ops/orders/${order.id}`)}
                    >
                      <CardContent className="pt-5 pb-4">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base font-mono">{order.orderNo}</h3>
                              {order.customer && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {order.customer.name}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              {order.hasDuplicatedResources && (
                                <HugeiconsIcon
                                  icon={AlertCircleIcon}
                                  className="h-4 w-4 text-orange-600 dark:text-orange-400"
                                  title={
                                    order.duplicationNotes ||
                                    'This waybill has duplicated resources'
                                  }
                                />
                              )}
                            </div>
                          </div>

                          {(order.from || order.to) && (
                            <div className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-lg">
                              <HugeiconsIcon
                                icon={ShippingTruck02Icon}
                                className="h-4 w-4 text-muted-foreground shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground">Route</p>
                                <p className="font-mono text-sm font-medium truncate">
                                  {order.from?.name || '—'} → {order.to?.name || '—'}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 text-sm border-t pt-3">
                            {order.vehicle && (
                              <div className="flex justify-between items-start">
                                <span className="text-muted-foreground text-xs">Vehicle</span>
                                <span className="font-mono text-xs font-medium">
                                  {order.vehicle.plateNumber}
                                </span>
                              </div>
                            )}
                            {order.driver && (
                              <div className="flex justify-between items-start">
                                <span className="text-muted-foreground text-xs">Driver</span>
                                <span className="font-medium text-xs">{order.driver.name}</span>
                              </div>
                            )}
                            {order.cargoDescription && (
                              <div className="flex justify-between items-start">
                                <span className="text-muted-foreground text-xs">Cargo</span>
                                <span className="font-medium text-xs text-right max-w-[120px] truncate">
                                  {order.cargoDescription}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} className="h-3 w-3" />
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <OrderActions orderId={order.id} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <HugeiconsIcon icon={PackageIcon} className="mx-auto h-12 w-12 mb-3 opacity-50" />
                  <p>No orders found matching your search.</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {paginationInfo.total} order{paginationInfo.total !== 1 ? 's' : ''} found
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
                Page {paginationInfo.page} of {paginationInfo.totalPages || 1}
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
