import { useState, useMemo } from 'react';
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
  Download01Icon,
  FilterIcon,
  Loading01Icon,
  Search01Icon,
  File01Icon,
  Calendar01Icon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { api } from '@/lib/api';

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
    doorNo?: string;
    asset?: string;
  };
  attachment?: {
    id: string;
    name: string;
    doorNo?: string;
    plateNumber?: string;
  };
  driver?: {
    id: string;
    name: string;
    badgeNumber?: string;
    iqamaNumber?: string;
  };
  tripNumber?: string;
  startKms?: number;
  kmOut?: number;
  kmIn?: number;
  runKm?: number;
  arrivalAtLoading?: string;
  completedLoading?: string;
  dispatchFromLoading?: string;
  arrivalAtOffloading?: string;
  completedUnloading?: string;
  createdAt: string;
};

type WaybillReport = {
  id: string;
  srNumber: number;
  customerName: string;
  jobNumber: string;
  plateNumber: string;
  doorNumber: string;
  attachment: string;
  kmStart: number;
  driverName: string;
  badgeNumber: string;
  departureDate: string;
  tripNumber: number;
  tripMonth: string;
  from: string;
  loadingTime: string;
  to: string;
  arrivalDate: string;
  arrivalTime: string;
  offloadingDate: string;
  offloadingTime: string;
  kmClosing: number;
  kmsRun: number;
  allowance: number;
  backLoadAllowance: number;
  totalTripAllowance: number;
  podNumber: string;
  podSubmitted: boolean;
};

function mapOrderToReport(order: Order, index: number): WaybillReport {
  const departureDate = order.createdAt ? new Date(order.createdAt) : new Date();
  const tripMonth = departureDate.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });

  const getTimeFromDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const getDateFromDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return {
    id: order.id,
    srNumber: index + 1,
    customerName: order.customer?.name || '—',
    jobNumber: order.contract?.contractNumber || order.orderNo || '—',
    plateNumber: order.vehicle?.plateNumber || '—',
    doorNumber: order.vehicle?.doorNo || order.attachment?.doorNo || '—',
    attachment: order.attachment?.name || order.attachment?.plateNumber || '—',
    kmStart: order.startKms || order.kmOut || 0,
    driverName: order.driver?.name || '—',
    badgeNumber: order.driver?.badgeNo || order.driver?.iqamaNumber || '—',
    departureDate: departureDate.toISOString().split('T')[0],
    tripNumber: order.tripNumber ? parseInt(order.tripNumber) || index + 1 : index + 1,
    tripMonth: tripMonth,
    from: order.from?.name || '—',
    loadingTime: getTimeFromDate(order.arrivalAtLoading),
    to: order.to?.name || '—',
    arrivalDate: getDateFromDateTime(order.arrivalAtOffloading),
    arrivalTime: getTimeFromDate(order.arrivalAtOffloading),
    offloadingDate: getDateFromDateTime(order.completedUnloading),
    offloadingTime: getTimeFromDate(order.completedUnloading),
    kmClosing: order.kmIn || order.startKms || 0,
    kmsRun: order.runKm || (order.kmIn && order.startKms ? order.kmIn - order.startKms : 0),
    allowance: 0,
    backLoadAllowance: 0,
    totalTripAllowance: 0,
    podNumber: '',
    podSubmitted: false,
  };
}

const columns: ColumnDef<WaybillReport>[] = [
  {
    accessorKey: 'srNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          SR#
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="text-center">{row.getValue('srNumber')}</div>,
  },
  {
    accessorKey: 'customerName',
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
  },
  {
    accessorKey: 'jobNumber',
    header: 'Job#',
  },
  {
    accessorKey: 'plateNumber',
    header: 'Plate#',
  },
  {
    accessorKey: 'doorNumber',
    header: 'Door#',
  },
  {
    accessorKey: 'attachment',
    header: 'Attachment',
  },
  {
    accessorKey: 'kmStart',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          KM Start
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const value = row.getValue('kmStart') as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'driverName',
    header: 'Driver',
  },
  {
    accessorKey: 'badgeNumber',
    header: 'Badge#',
  },
  {
    accessorKey: 'departureDate',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Departure Date
          <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('departureDate') as string;
      return date ? new Date(date).toLocaleDateString('en-GB') : '—';
    },
  },
  {
    accessorKey: 'tripNumber',
    header: 'Trip#',
    cell: ({ row }) => <div className="text-center">{row.getValue('tripNumber')}</div>,
  },
  {
    accessorKey: 'tripMonth',
    header: 'Month',
  },
  {
    accessorKey: 'from',
    header: 'From',
  },
  {
    accessorKey: 'loadingTime',
    header: 'Loading Time',
  },
  {
    accessorKey: 'to',
    header: 'To',
  },
  {
    accessorKey: 'arrivalDate',
    header: 'Arrival Date',
    cell: ({ row }) => {
      const date = row.getValue('arrivalDate') as string;
      return date ? new Date(date).toLocaleDateString('en-GB') : '—';
    },
  },
  {
    accessorKey: 'arrivalTime',
    header: 'Arrival Time',
  },
  {
    accessorKey: 'offloadingDate',
    header: 'Offloading Date',
    cell: ({ row }) => {
      const date = row.getValue('offloadingDate') as string;
      return date ? new Date(date).toLocaleDateString('en-GB') : '—';
    },
  },
  {
    accessorKey: 'offloadingTime',
    header: 'Offloading Time',
  },
  {
    accessorKey: 'kmClosing',
    header: 'KM Closing',
    cell: ({ row }) => {
      const value = row.getValue('kmClosing') as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'kmsRun',
    header: 'KMs Run',
    cell: ({ row }) => {
      const value = row.getValue('kmsRun') as number;
      return <div className="text-right">{value.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'allowance',
    header: 'Allowance',
    cell: ({ row }) => {
      const value = row.getValue('allowance') as number;
      return value > 0 ? (
        <div className="text-right">{value.toFixed(2)}</div>
      ) : (
        <div className="text-right text-muted-foreground">—</div>
      );
    },
  },
  {
    accessorKey: 'backLoadAllowance',
    header: 'Back Load Allowance',
    cell: ({ row }) => {
      const value = row.getValue('backLoadAllowance') as number;
      return value > 0 ? (
        <div className="text-right">{value.toFixed(2)}</div>
      ) : (
        <div className="text-right text-muted-foreground">—</div>
      );
    },
  },
  {
    accessorKey: 'totalTripAllowance',
    header: 'Total Allowance',
    cell: ({ row }) => {
      const value = row.getValue('totalTripAllowance') as number;
      return <div className="text-right font-medium">{value.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: 'podNumber',
    header: 'POD#',
  },
  {
    accessorKey: 'podSubmitted',
    header: 'POD Submitted',
    cell: ({ row }) => {
      const submitted = row.getValue('podSubmitted') as boolean;
      return (
        <Badge variant={submitted ? 'default' : 'secondary'}>{submitted ? 'Yes' : 'No'}</Badge>
      );
    },
  },
];

export default function WaybillReportPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>();

  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['orders-report'],
    queryFn: async () => {
      // Fetch orders with a reasonable limit for reports
      // For better performance, we'll fetch up to 200 orders (2 pages)
      let allOrders: any[] = [];
      const limit = 100;
      const maxPages = 2; // Limit to 200 orders for performance

      for (let page = 1; page <= maxPages; page++) {
        try {
          const response = await api.get(`/orders?page=${page}&limit=${limit}`);
          if (response.data.success && Array.isArray(response.data.results)) {
            allOrders = [...allOrders, ...response.data.results];
            // Stop if we got fewer results than the limit (last page)
            if (response.data.results.length < limit) {
              break;
            }
          } else {
            break;
          }
        } catch (err) {
          // If there's an error, return what we have so far
          break;
        }
      }

      return allOrders;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const allData = useMemo(() => {
    if (!ordersData) return [];
    return ordersData.map((order: Order, index: number) => mapOrderToReport(order, index));
  }, [ordersData]);

  const data = useMemo(() => {
    return allData.filter((item) => {
      if (dateRange?.from) {
        const itemDate = new Date(item.departureDate);
        if (itemDate < dateRange.from) return false;
      }
      if (dateRange?.to) {
        const itemDate = new Date(item.departureDate);
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (itemDate > toDate) return false;
      }
      if (selectedMonth && item.tripMonth !== selectedMonth) return false;
      if (selectedCustomer && item.customerName !== selectedCustomer) return false;
      return true;
    });
  }, [allData, dateRange, selectedMonth, selectedCustomer]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel({
      pageSize: 50, // Limit page size for better performance
    }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const report = row.original;
      const search = filterValue.toLowerCase();
      return (
        report.customerName?.toLowerCase().includes(search) ||
        report.driverName?.toLowerCase().includes(search) ||
        report.plateNumber?.toLowerCase().includes(search) ||
        report.jobNumber?.toLowerCase().includes(search) ||
        report.podNumber?.toLowerCase().includes(search) ||
        false
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    enableColumnResizing: false,
    enableRowSelection: false,
  });

  const handleExport = () => {
    const csvContent = [
      [
        'SR#',
        'Customer Name',
        'Job#',
        'Plate#',
        'Door#',
        'Attachment',
        'KM Start',
        'Driver Name',
        'Badge#',
        'Departure Date',
        'Trip#',
        'Trip Month',
        'From',
        'Loading Time',
        'To',
        'Arrival Date',
        'Arrival Time',
        'Offloading Date',
        'Offloading Time',
        'KM Closing',
        'KMs Run',
        'Allowance',
        'Back Load Allowance',
        'Total Trip Allowance',
        'POD#',
        'POD Submitted',
      ],
      ...(data || []).map((row) => [
        row.srNumber,
        row.customerName,
        row.jobNumber,
        row.plateNumber,
        row.doorNumber,
        row.attachment,
        row.kmStart,
        row.driverName,
        row.badgeNumber,
        row.departureDate,
        row.tripNumber,
        row.tripMonth,
        row.from,
        row.loadingTime,
        row.to,
        row.arrivalDate,
        row.arrivalTime,
        row.offloadingDate,
        row.offloadingTime,
        row.kmClosing,
        row.kmsRun,
        row.allowance,
        row.backLoadAllowance,
        row.totalTripAllowance,
        row.podNumber,
        row.podSubmitted ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueMonths = useMemo(
    () => Array.from(new Set(allData.map((d) => d.tripMonth))).sort(),
    [allData],
  );
  const uniqueCustomers = useMemo(
    () => Array.from(new Set(allData.map((d) => d.customerName))).sort(),
    [allData],
  );

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
        <HugeiconsIcon icon={File01Icon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error Loading Report</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Failed to load waybill data.'}
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const handleExportExcel = () => {
    // Create CSV content (Excel can open CSV files)
    const csvContent = [
      [
        'SR#',
        'Customer Name',
        'Job#',
        'Plate#',
        'Door#',
        'Attachment',
        'KM Start',
        'Driver Name',
        'Badge#',
        'Departure Date',
        'Trip#',
        'Trip Month',
        'From',
        'Loading Time',
        'To',
        'Arrival Date',
        'Arrival Time',
        'Offloading Date',
        'Offloading Time',
        'KM Closing',
        'KMs Run',
        'Allowance',
        'Back Load Allowance',
        'Total Trip Allowance',
        'POD#',
        'POD Submitted',
      ],
      ...(data || []).map((row) => [
        row.srNumber,
        row.customerName,
        row.jobNumber,
        row.plateNumber,
        row.doorNumber,
        row.attachment,
        row.kmStart,
        row.driverName,
        row.badgeNumber,
        row.departureDate,
        row.tripNumber,
        row.tripMonth,
        row.from,
        row.loadingTime,
        row.to,
        row.arrivalDate,
        row.arrivalTime,
        row.offloadingDate,
        row.offloadingTime,
        row.kmClosing,
        row.kmsRun,
        row.allowance,
        row.backLoadAllowance,
        row.totalTripAllowance,
        row.podNumber,
        row.podSubmitted ? 'Yes' : 'No',
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    // Add BOM for Excel UTF-8 support
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 p-4 w-full min-w-0 overflow-x-hidden">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-shrink">
          <PageTitle
            title="Order Report"
            description="Comprehensive trip and order report with detailed information"
            icon={File01Icon}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select date range"
            className="w-[280px]"
          />
          <Button variant="outline" onClick={handleExport}>
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card className="w-full overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder="Search by customer, driver, plate, job, or POD..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedMonth || undefined}
              onValueChange={(value) => setSelectedMonth(value || '')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                {uniqueMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedCustomer || undefined}
              onValueChange={(value) => setSelectedCustomer(value || '')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCustomers.map((customer) => (
                  <SelectItem key={customer} value={customer}>
                    {customer}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <HugeiconsIcon icon={FilterIcon} className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
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
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[1200px] w-full">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
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
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No order reports found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {data?.length || 0} waybills
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
              <div className="text-sm">
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
