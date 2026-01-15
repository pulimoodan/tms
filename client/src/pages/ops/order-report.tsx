import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx-js-style';
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
  Download01Icon,
  FilterIcon,
  Loading01Icon,
  File01Icon,
  PackageIcon,
  MoneyIcon,
  DashboardSpeed01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  TruckIcon,
  UserIcon,
  CalendarIcon,
  TradeUpIcon,
} from '@hugeicons/core-free-icons';
import { PageTitle } from '@/components/ui/page-title';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
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
  podNumber?: string;
  podDocument?: string;
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
    badgeNumber: order.driver?.badgeNumber || order.driver?.iqamaNumber || '—',
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
    podNumber: order.podNumber || '—',
    podSubmitted: !!(order.podNumber && order.podDocument), // POD is submitted if both number and document exist
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

export default function OrderReportPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  // Set default to today
  const getTodayRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    return { from: today, to: todayEnd };
  };

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | undefined>(
    getTodayRange(),
  );
  const [selectedRangeLabel, setSelectedRangeLabel] = useState<string>('Today');
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(undefined);

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
      if (selectedCustomer && item.customerName !== selectedCustomer) return false;
      return true;
    });
  }, [allData, dateRange, selectedCustomer]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalWaybills = data.length;
    const totalAllowance = data.reduce((sum, item) => sum + item.allowance, 0);
    const totalBackLoadAllowance = data.reduce((sum, item) => sum + item.backLoadAllowance, 0);
    const totalTripAllowance = data.reduce((sum, item) => sum + item.totalTripAllowance, 0);
    const totalKmsRun = data.reduce((sum, item) => sum + item.kmsRun, 0);
    const podSubmittedCount = data.filter((item) => item.podSubmitted).length;
    const podNotSubmittedCount = totalWaybills - podSubmittedCount;
    const avgKmsPerTrip = totalWaybills > 0 ? totalKmsRun / totalWaybills : 0;
    const podSubmissionRate = totalWaybills > 0 ? (podSubmittedCount / totalWaybills) * 100 : 0;
    const uniqueDrivers = new Set(data.map((item) => item.driverName).filter(Boolean)).size;
    const uniqueVehicles = new Set(data.map((item) => item.plateNumber).filter(Boolean)).size;
    const completedTrips = data.filter((item) => item.kmClosing > 0).length;
    const completionRate = totalWaybills > 0 ? (completedTrips / totalWaybills) * 100 : 0;

    return {
      totalWaybills,
      totalAllowance,
      totalBackLoadAllowance,
      totalTripAllowance,
      totalKmsRun,
      podSubmittedCount,
      podNotSubmittedCount,
      avgKmsPerTrip,
      podSubmissionRate,
      uniqueDrivers,
      uniqueVehicles,
      completedTrips,
      completionRate,
    };
  }, [data]);

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    enableColumnResizing: false,
    enableRowSelection: false,
  });

  const formatDateForFilename = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}_${month}_${year}`;
  };

  const getFilename = (extension: string) => {
    if (dateRange?.from && dateRange?.to) {
      const fromFormatted = formatDateForFilename(dateRange.from);
      const toFormatted = formatDateForFilename(dateRange.to);

      // Check if from and to dates are the same (same day)
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(dateRange.to);
      toDate.setHours(0, 0, 0, 0);

      if (fromDate.getTime() === toDate.getTime()) {
        return `daily-report-${fromFormatted}.${extension}`;
      }

      return `daily-report-${fromFormatted}_to_${toFormatted}.${extension}`;
    }
    const today = new Date();
    const todayFormatted = formatDateForFilename(today);
    return `daily-report-${todayFormatted}.${extension}`;
  };

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
    link.setAttribute('download', getFilename('csv'));
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    // Prepare data for Excel export
    const excelData = [
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
    ];

    // Create a workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 8 }, // SR#
      { wch: 20 }, // Customer Name
      { wch: 15 }, // Job#
      { wch: 12 }, // Plate#
      { wch: 12 }, // Door#
      { wch: 15 }, // Attachment
      { wch: 12 }, // KM Start
      { wch: 20 }, // Driver Name
      { wch: 12 }, // Badge#
      { wch: 15 }, // Departure Date
      { wch: 12 }, // Trip#
      { wch: 12 }, // Trip Month
      { wch: 20 }, // From
      { wch: 15 }, // Loading Time
      { wch: 20 }, // To
      { wch: 15 }, // Arrival Date
      { wch: 15 }, // Arrival Time
      { wch: 15 }, // Offloading Date
      { wch: 15 }, // Offloading Time
      { wch: 12 }, // KM Closing
      { wch: 12 }, // KMs Run
      { wch: 12 }, // Allowance
      { wch: 18 }, // Back Load Allowance
      { wch: 20 }, // Total Trip Allowance
      { wch: 15 }, // POD#
      { wch: 15 }, // POD Submitted
    ];
    ws['!cols'] = colWidths;

    // Define column indices for blue columns (JOB#, DOOR#, BADGE#, Allowance columns)
    // Column indices: 0=SR#, 1=Customer, 2=JOB#, 3=Plate#, 4=DOOR#, 5=Attachment, 6=KM Start,
    // 7=Driver Name, 8=BADGE#, 9=Departure Date, 10=Trip#, 11=Trip Month, 12=From,
    // 13=Loading Time, 14=To, 15=Arrival Date, 16=Arrival Time, 17=Offloading Date,
    // 18=Offloading Time, 19=KM Closing, 20=KMs Run, 21=Allowance, 22=Back Load Allowance,
    // 23=Total Trip Allowance, 24=POD#, 25=POD Submitted
    const blueColumns = [2, 4, 8, 21, 22, 23]; // JOB#, DOOR#, BADGE#, Allowance columns

    // Green header style (default)
    const greenHeaderStyle = {
      font: { bold: true, color: { rgb: '000000' }, sz: 11 },
      fill: { fgColor: { rgb: 'C6EFCE' } }, // Light green background
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true, indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Blue header style (for specific columns)
    const blueHeaderStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 },
      fill: { fgColor: { rgb: '4472C4' } }, // Blue background
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true, indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Blue data cell style (for entire columns)
    const blueDataStyle = {
      font: { color: { rgb: '000000' }, sz: 11 },
      fill: { fgColor: { rgb: 'D9E1F2' } }, // Light blue background for data cells
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true, indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Default data cell style
    const defaultDataStyle = {
      font: { color: { rgb: '000000' }, sz: 11 },
      fill: { fgColor: { rgb: 'FFFFFF' } }, // White background
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true, indent: 1 },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } },
      },
    };

    // Get the range of the worksheet
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');

    // Apply styling to all cells
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!ws[cellAddress]) continue;

        const isBlueColumn = blueColumns.includes(col);
        const isHeaderRow = row === 0;

        if (isHeaderRow) {
          // Header row: blue or green based on column
          ws[cellAddress].s = isBlueColumn ? blueHeaderStyle : greenHeaderStyle;
        } else {
          // Data rows: blue background for blue columns, white for others
          ws[cellAddress].s = isBlueColumn ? blueDataStyle : defaultDataStyle;
        }
      }
    }

    // Set row heights for better padding appearance
    if (!ws['!rows']) ws['!rows'] = [];
    for (let row = range.s.r; row <= range.e.r; row++) {
      ws['!rows'][row] = { hpt: row === 0 ? 30 : 25 }; // Header row taller, data rows with padding
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');

    // Generate Excel file
    XLSX.writeFile(wb, getFilename('xlsx'));
  };

  return (
    <div className="flex flex-col gap-6 p-4 min-w-0 w-full max-w-full overflow-x-hidden">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 shrink">
          <PageTitle
            title="Daily Sales Report"
            description="Comprehensive trip and order report with detailed information"
            icon={File01Icon}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-between">
                {selectedRangeLabel ||
                  (dateRange?.from && dateRange?.to
                    ? `${dateRange.from.toLocaleDateString('en-GB')} - ${dateRange.to.toLocaleDateString('en-GB')}`
                    : 'Select date range')}
                <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-auto p-0"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <div className="p-2">
                <DropdownMenuLabel className="px-2 py-1.5">Quick Select</DropdownMenuLabel>
                <div className="space-y-0.5">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const todayEnd = new Date(today);
                      todayEnd.setHours(23, 59, 59, 999);
                      setDateRange({ from: today, to: todayEnd });
                      setSelectedRangeLabel('Today');
                      setInternalRange(undefined);
                    }}
                  >
                    Today
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      yesterday.setHours(0, 0, 0, 0);
                      const yesterdayEnd = new Date(yesterday);
                      yesterdayEnd.setHours(23, 59, 59, 999);
                      setDateRange({ from: yesterday, to: yesterdayEnd });
                      setSelectedRangeLabel('Yesterday');
                      setInternalRange(undefined);
                    }}
                  >
                    Yesterday
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const today = new Date();
                      const startOfWeek = new Date(today);
                      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
                      startOfWeek.setHours(0, 0, 0, 0);
                      const endOfWeek = new Date(today);
                      endOfWeek.setHours(23, 59, 59, 999);
                      setDateRange({ from: startOfWeek, to: endOfWeek });
                      setSelectedRangeLabel('This Week');
                      setInternalRange(undefined);
                    }}
                  >
                    This Week
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const today = new Date();
                      const startOfLastWeek = new Date(today);
                      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7); // Last Sunday
                      startOfLastWeek.setHours(0, 0, 0, 0);
                      const endOfLastWeek = new Date(today);
                      endOfLastWeek.setDate(today.getDate() - today.getDay() - 1); // Last Saturday
                      endOfLastWeek.setHours(23, 59, 59, 999);
                      setDateRange({ from: startOfLastWeek, to: endOfLastWeek });
                      setSelectedRangeLabel('Last Week');
                      setInternalRange(undefined);
                    }}
                  >
                    Last Week
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const today = new Date();
                      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                      startOfMonth.setHours(0, 0, 0, 0);
                      const endOfMonth = new Date(today);
                      endOfMonth.setHours(23, 59, 59, 999);
                      setDateRange({ from: startOfMonth, to: endOfMonth });
                      setSelectedRangeLabel('This Month');
                      setInternalRange(undefined);
                    }}
                  >
                    This Month
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      const today = new Date();
                      const startOfLastMonth = new Date(
                        today.getFullYear(),
                        today.getMonth() - 1,
                        1,
                      );
                      startOfLastMonth.setHours(0, 0, 0, 0);
                      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                      endOfLastMonth.setHours(23, 59, 59, 999);
                      setDateRange({ from: startOfLastMonth, to: endOfLastMonth });
                      setSelectedRangeLabel('Last Month');
                      setInternalRange(undefined);
                    }}
                  >
                    Last Month
                  </DropdownMenuItem>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <DropdownMenuLabel className="px-2 py-1.5">Custom Range</DropdownMenuLabel>
                <div
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Calendar
                    mode="range"
                    defaultMonth={internalRange?.from || dateRange?.from || new Date()}
                    selected={
                      internalRange !== undefined
                        ? internalRange
                        : dateRange?.from && dateRange?.to
                          ? { from: dateRange.from, to: dateRange.to }
                          : undefined
                    }
                    onSelect={(range) => {
                      if (range) {
                        const isSameDate =
                          range.from && range.to && range.from.getTime() === range.to.getTime();
                        if (isSameDate) {
                          setInternalRange({ from: range.from, to: undefined });
                          return;
                        }
                        if (range.from && range.to) {
                          setDateRange({ from: range.from, to: range.to });
                          setSelectedRangeLabel('');
                          setInternalRange(undefined);
                        } else if (range.from) {
                          setInternalRange(range);
                        }
                      } else {
                        setInternalRange(undefined);
                        setDateRange(undefined);
                        setSelectedRangeLabel('');
                      }
                    }}
                    numberOfMonths={2}
                  />
                </div>
                {(internalRange?.from || dateRange?.from) && (
                  <div className="p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInternalRange(undefined);
                        setDateRange(undefined);
                        setSelectedRangeLabel('');
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 max-w-full">
        {/* Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <HugeiconsIcon
                  icon={PackageIcon}
                  className="h-5 w-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-lg font-semibold">Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Waybills</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {analytics.totalWaybills}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completedTrips} completed ({analytics.completionRate.toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allowance & Financial Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                <HugeiconsIcon
                  icon={MoneyIcon}
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h3 className="text-lg font-semibold">Allowance & Financial</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Allowance</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {analytics.totalAllowance.toFixed(2)} SAR
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Trip Allowance</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {analytics.totalTripAllowance.toFixed(2)} SAR
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Back Load</p>
                  <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                    {analytics.totalBackLoadAllowance.toFixed(2)} SAR
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                <HugeiconsIcon
                  icon={DashboardSpeed01Icon}
                  className="h-5 w-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="text-lg font-semibold">Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total KMs Run</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {analytics.totalKmsRun.toLocaleString()} km
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Average per Trip</p>
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {analytics.avgKmsPerTrip.toFixed(0)} km
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* POD Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-orange-500/10 dark:bg-orange-500/20">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="h-5 w-5 text-orange-600 dark:text-orange-400"
                />
              </div>
              <h3 className="text-lg font-semibold">POD Status</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.podSubmittedCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {analytics.podSubmissionRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                    {analytics.podNotSubmittedCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(100 - analytics.podSubmissionRate).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20">
                <HugeiconsIcon
                  icon={TruckIcon}
                  className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="text-lg font-semibold">Resources</h3>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <HugeiconsIcon
                      icon={TruckIcon}
                      className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                    />
                    <p className="text-xs text-muted-foreground">Vehicles</p>
                  </div>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {analytics.uniqueVehicles}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <HugeiconsIcon
                      icon={UserIcon}
                      className="h-4 w-4 text-teal-600 dark:text-teal-400"
                    />
                    <p className="text-xs text-muted-foreground">Drivers</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                    {analytics.uniqueDrivers}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table Section */}
      <div className="space-y-4 min-w-0 max-w-full">
        <h2 className="text-lg font-semibold text-foreground">Order Details</h2>
        <Card className="overflow-hidden w-full max-w-full min-w-0">
          <CardContent className="p-6 w-full max-w-full min-w-0">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
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

            <div className="rounded-md border overflow-x-auto w-full min-w-0">
              <table className="caption-bottom text-sm" style={{ minWidth: 'max-content' }}>
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
              </table>
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
    </div>
  );
}
