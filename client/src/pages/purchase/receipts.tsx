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
  Package01Icon,
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

type Receipt = {
  id: string;
  receiptNo: string;
  receiptDate: string;
  status: 'Pending' | 'Complete';
  purchaseOrder?: { poNo: string };
  createdAt: string;
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, 'default' | 'secondary'> = {
    Pending: 'secondary',
    Complete: 'default',
  };
  return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
};

const columns: ColumnDef<Receipt>[] = [
  {
    accessorKey: 'receiptNo',
    header: 'Receipt Number',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={Package01Icon} className="h-5 w-5 text-primary" />
        </div>
        <div className="font-medium">{row.getValue('receiptNo')}</div>
      </div>
    ),
  },
  {
    accessorKey: 'purchaseOrder',
    header: 'Purchase Order',
    cell: ({ row }) => {
      const po = row.getValue('purchaseOrder') as { poNo: string } | undefined;
      return <div className="text-sm">{po?.poNo || '—'}</div>;
    },
  },
  {
    accessorKey: 'receiptDate',
    header: 'Receipt Date',
    cell: ({ row }) => {
      const date = row.getValue('receiptDate') as string;
      return <div className="text-sm">{new Date(date).toLocaleDateString()}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const receipt = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(receipt.id)}>
              Copy Receipt ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {}}>View details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => {}}>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ReceiptsPage() {
  const [, setLocation] = useLocation();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Dummy data for now
  const dummyData: Receipt[] = [
    {
      id: '1',
      receiptNo: 'REC-001',
      receiptDate: new Date('2024-02-10').toISOString(),
      status: 'Complete',
      purchaseOrder: { poNo: 'PO-001' },
      createdAt: new Date('2024-02-10').toISOString(),
    },
    {
      id: '2',
      receiptNo: 'REC-002',
      receiptDate: new Date('2024-02-12').toISOString(),
      status: 'Pending',
      purchaseOrder: { poNo: 'PO-002' },
      createdAt: new Date('2024-02-12').toISOString(),
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['receipts'],
    queryFn: async () => {
      // Return dummy data instead of API call
      return dummyData;
      // const response = await api.get('/receipts?page=1&limit=100');
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
      const receipt = row.original;
      const search = filterValue.toLowerCase();
      return receipt.receiptNo?.toLowerCase().includes(search) || false;
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
        <PageTitle title="Receipts" description="Manage purchase receipts" icon={Package01Icon} />
        <Button onClick={() => setLocation('/purchase/receipts/new')}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
          New Receipt
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
                placeholder="Search receipts..."
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      No receipts found.
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
