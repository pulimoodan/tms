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
  MoreVerticalIcon,
  PlusSignIcon,
  Loading01Icon,
  ShoppingCartIcon,
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

type PurchaseOrder = {
  id: string;
  poNo: string;
  supplierName?: string;
  status: 'Draft' | 'Issued' | 'PartiallyReceived' | 'FullyReceived';
  issueDate: string;
  expectedDeliveryDate?: string;
  totalAmount?: number;
  rfq?: { rfqNo: string };
  createdAt: string;
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
    Draft: 'secondary',
    Issued: 'outline',
    PartiallyReceived: 'default',
    FullyReceived: 'default',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: 'poNo',
    header: 'PO Number',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5 text-primary" />
        </div>
        <div className="font-medium">{row.getValue('poNo')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'rfq',
    header: 'RFQ',
    cell: ({ row }) => {
      const rfq = row.getValue('rfq') as { rfqNo: string } | undefined;
      return <div className="text-sm">{rfq?.rfqNo || '—'}</div>;
    },
  },
  {
    accessorKey: 'supplierName',
    header: 'Supplier',
    cell: ({ row }) => <div className="text-sm">{row.getValue('supplierName') || '—'}</div>,
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const amount = row.getValue('totalAmount') as number | undefined;
      return amount ? (
        <div className="font-medium">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2,
          }).format(amount)}
        </div>
      ) : (
        '—'
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    accessorKey: 'issueDate',
    header: 'Issue Date',
    cell: ({ row }) => {
      const date = row.getValue('issueDate') as string;
      return <div className="text-sm">{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const po = row.original;
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(po.id)}>
              Copy PO ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLocation(`/purchase/purchase-orders/${po.id}`)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(`/purchase/purchase-orders/${po.id}/edit`)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocation(`/purchase/purchase-orders/${po.id}/print`)}>
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      );
    },
  },
];

export default function PurchaseOrdersPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Dummy data for now
  const dummyData: PurchaseOrder[] = [
    {
      id: '1',
      poNo: 'PO-001',
      supplierName: 'ABC Suppliers',
      supplierEmail: 'contact@abcsuppliers.com',
      status: 'Issued',
      issueDate: new Date('2024-02-01').toISOString(),
      expectedDeliveryDate: new Date('2024-02-15').toISOString(),
      totalAmount: 12500.0,
      rfq: { rfqNo: 'RFQ-001' },
      createdAt: new Date('2024-02-01').toISOString(),
    },
    {
      id: '2',
      poNo: 'PO-002',
      supplierName: 'XYZ Trading',
      supplierEmail: 'info@xyztrading.com',
      status: 'PartiallyReceived',
      issueDate: new Date('2024-02-05').toISOString(),
      expectedDeliveryDate: new Date('2024-02-20').toISOString(),
      totalAmount: 8500.0,
      rfq: { rfqNo: 'RFQ-002' },
      createdAt: new Date('2024-02-05').toISOString(),
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      // Return dummy data instead of API call
      return dummyData;
      // const response = await api.get('/purchase-orders?page=1&limit=100');
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
      const po = row.original;
      const search = filterValue.toLowerCase();
      return (
        po.poNo?.toLowerCase().includes(search) ||
        po.supplierName?.toLowerCase().includes(search) ||
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Purchase Orders"
          description="Manage purchase orders created from RFQs"
          icon={ShoppingCartIcon}
        />
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
                placeholder="Search purchase orders..."
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
                    const po = row.original;
                    return (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setLocation(`/purchase/purchase-orders/${po.id}`)}
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
                      No purchase orders found.
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
