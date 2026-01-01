import { useLocation } from 'wouter';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import {
  MoreVerticalIcon,
  PlusSignIcon,
  FilterIcon,
  Download01Icon,
  ShippingTruck02Icon,
  PackageIcon,
  PrinterIcon,
  Search01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';
import { PageTitle } from '@/components/ui/page-title';
import { HugeiconsIcon } from '@hugeicons/react';

// --- Types ---
type Waybill = {
  id: string;
  waybill_number: string;
  customer_name: string;
  from_location: string;
  to_location: string;
  cargo_type: string;
  status: 'Draft' | 'Created' | 'In Transit' | 'Delivered' | 'Cancelled';
  created_date: string;
  reference_number?: string;
};

// --- Mock Data ---
const initialData: Waybill[] = [
  {
    id: 'WAY-001',
    waybill_number: 'WAY-001',
    customer_name: 'Acme Logistics Worldwide',
    from_location: 'Riyadh',
    to_location: 'Jeddah',
    cargo_type: 'General Freight',
    status: 'In Transit',
    created_date: '2024-12-20',
    reference_number: 'PO-12345',
  },
  {
    id: 'WAY-002',
    waybill_number: 'WAY-002',
    customer_name: 'Global Freight Solutions',
    from_location: 'Dubai',
    to_location: 'Riyadh',
    cargo_type: 'Perishables',
    status: 'Created',
    created_date: '2024-12-21',
    reference_number: 'PO-12346',
  },
  {
    id: 'WAY-003',
    waybill_number: 'WAY-003',
    customer_name: 'Pacific Rim Trading Co.',
    from_location: 'Jeddah',
    to_location: 'Dammam',
    cargo_type: 'Hazardous',
    status: 'Draft',
    created_date: '2024-12-22',
  },
];

const statusColors = {
  Draft: 'bg-slate-100 text-slate-800',
  Created: 'bg-blue-100 text-blue-800',
  'In Transit': 'bg-amber-100 text-amber-800',
  Delivered: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function WaybillsPage() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<Waybill[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(
    (waybill) =>
      waybill.waybill_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      waybill.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      waybill.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <div>
          <PageTitle
            title="Waybills"
            description="Create and manage shipping waybills and shipment tracking."
            icon={File01Icon}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setLocation('/ops/waybills/new')} data-testid="button-new-waybill">
            <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
            New Waybill
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 gap-2">
        <div className="relative w-full max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
          />
          <Input
            placeholder="Search waybills..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9 bg-card rounded-lg border shadow-sm"
            data-testid="input-search-waybills"
          />
        </div>
        <Button variant="outline" size="icon" className="bg-card rounded-lg border shadow-sm">
          <HugeiconsIcon icon={FilterIcon} className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.length ? (
          filteredData.map((waybill) => (
            <Card
              key={waybill.id}
              className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all overflow-visible border border-slate-200 dark:border-slate-700 shadow-md relative bg-card dark:bg-slate-900"
              onClick={() => setLocation(`/ops/waybills/${waybill.id}`)}
              data-testid={`card-waybill-${waybill.id}`}
            >
              <CardContent className="pt-5 pb-4 relative">
                <div className="space-y-4">
                  {/* Header with Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{waybill.waybill_number}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{waybill.customer_name}</p>
                    </div>
                    <Badge className={`whitespace-nowrap ${statusColors[waybill.status]}`}>
                      {waybill.status}
                    </Badge>
                  </div>

                  {/* Route Info */}
                  <div className="flex items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                    <HugeiconsIcon
                      icon={ShippingTruck02Icon}
                      className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Route</p>
                      <p className="font-mono text-sm font-medium truncate dark:text-slate-100">
                        {waybill.from_location} → {waybill.to_location}
                      </p>
                    </div>
                  </div>

                  {/* Cargo Info */}
                  <div className="flex items-start gap-2 text-sm border-t border-slate-200 dark:border-slate-700 pt-3">
                    <HugeiconsIcon
                      icon={PackageIcon}
                      className="h-4 w-4 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Cargo Type</p>
                      <p className="font-medium text-sm dark:text-slate-100">
                        {waybill.cargo_type}
                      </p>
                    </div>
                  </div>

                  {/* Footer with Dates and Reference */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-muted-foreground">
                    <span>{waybill.created_date}</span>
                    {waybill.reference_number && (
                      <span className="font-mono">{waybill.reference_number}</span>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Menu Trigger */}
              <div className="absolute top-2 right-2 z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/ops/waybills/${waybill.id}/edit`);
                      }}
                      data-testid={`menu-edit-${waybill.id}`}
                    >
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/ops/orders/${waybill.id}/print`);
                      }}
                      data-testid={`menu-print-${waybill.id}`}
                    >
                      <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
                      Print Waybill
                    </DropdownMenuItem>
                    <DropdownMenuItem data-testid={`menu-duplicate-${waybill.id}`}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      data-testid={`menu-delete-${waybill.id}`}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <HugeiconsIcon icon={PackageIcon} className="mx-auto h-12 w-12 mb-3 opacity-50" />
            <p>No waybills found</p>
          </div>
        )}
      </div>
    </div>
  );
}
