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
  Orbit01Icon,
  FileSearchIcon,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

type RFQ = {
  id: string;
  rfqNo: string;
  supplierName?: string;
  status: 'Draft' | 'Sent' | 'Received' | 'Closed';
  sentDate?: string;
  dueDate?: string;
  purchaseRequest?: { requestNo: string; title: string };
  createdAt: string;
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    Draft: 'secondary',
    Sent: 'outline',
    Received: 'default',
    Closed: 'secondary',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

const columns: ColumnDef<RFQ>[] = [
  {
    accessorKey: 'rfqNo',
    header: 'RFQ Number',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={FileSearchIcon} className="h-5 w-5 text-primary" />
        </div>
        <div className="font-medium">{row.getValue('rfqNo')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'purchaseRequest',
    header: 'Purchase Request',
    cell: ({ row }) => {
      const pr = row.getValue('purchaseRequest') as
        | { requestNo: string; title: string }
        | undefined;
      return pr ? (
        <div>
          <div className="font-medium">{pr.requestNo}</div>
          <div className="text-xs text-muted-foreground">{pr.title}</div>
        </div>
      ) : (
        '—'
      );
    },
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => <div className="text-sm">{row.getValue('supplierName') || '—'}</div>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    accessorKey: 'dueDate',
    header: 'Due Date',
    cell: ({ row }) => {
      const date = row.getValue('dueDate') as string | undefined;
      return <div className="text-sm">{date ? new Date(date).toLocaleDateString() : '—'}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const rfq = row.original;
      return (
        <div onClick={(e) => e.stopPropagation()} className="z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rfq.id)}>
                Copy RFQ ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation(`/purchase/rfqs/${rfq.id}`)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation(`/purchase/rfqs/${rfq.id}/print`)}>
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export default function RFQsPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Dummy data for now
  const dummyData: RFQ[] = [
    {
      id: '1',
      rfqNo: 'RFQ-001',
      supplierName: 'ABC Suppliers',
      supplierEmail: 'contact@abcsuppliers.com',
      status: 'Received',
      sentDate: new Date('2024-01-16').toISOString(),
      dueDate: new Date('2024-01-30').toISOString(),
      purchaseRequest: { requestNo: 'PR-001', title: 'Office Supplies Q1 2024' },
      createdAt: new Date('2024-01-16').toISOString(),
    },
    {
      id: '2',
      rfqNo: 'RFQ-002',
      supplierName: 'XYZ Trading',
      supplierEmail: 'info@xyztrading.com',
      status: 'Sent',
      sentDate: new Date('2024-01-21').toISOString(),
      dueDate: new Date('2024-02-05').toISOString(),
      purchaseRequest: { requestNo: 'PR-002', title: 'IT Equipment Purchase' },
      createdAt: new Date('2024-01-21').toISOString(),
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['rfqs'],
    queryFn: async () => {
      // Return dummy data instead of API call
      return dummyData;
      // const response = await api.get('/rfqs?page=1&limit=100');
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
      const rfq = row.original;
      const search = filterValue.toLowerCase();
      return (
        rfq.rfqNo?.toLowerCase().includes(search) ||
        rfq.supplierName?.toLowerCase().includes(search) ||
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle title="RFQs" description="Request for Quotations" icon={FileSearchIcon} />
        <Button onClick={() => setLocation('/purchase/rfqs/new')}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
          New RFQ
        </Button>
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
                placeholder="Search RFQs..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-md border">
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
                  table.getRowModel().rows.map((row) => {
                    const rfq = row.original;
                    return (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/purchase/rfqs/${rfq.id}`)}
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
                      No RFQs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
