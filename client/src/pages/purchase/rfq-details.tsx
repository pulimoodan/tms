import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft01Icon,
  Calendar01Icon,
  Orbit01Icon,
  Building01Icon,
  PrinterIcon,
  Edit01Icon,
  ShoppingCartIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const dummyProducts = [
  {
    id: '1',
    name: 'Office Chair',
    code: 'PROD-001',
    description: 'Ergonomic office chair with adjustable height',
    unit: 'pcs',
    price: 450.0,
    isActive: true,
  },
  {
    id: '2',
    name: 'Printer Paper A4',
    code: 'PROD-002',
    description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
    unit: 'ream',
    price: 25.0,
    isActive: true,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    code: 'PROD-003',
    description: 'Adjustable aluminum laptop stand',
    unit: 'pcs',
    price: 120.0,
    isActive: true,
  },
];

const dummyVendors = [
  {
    id: '1',
    name: 'ABC Suppliers',
    email: 'contact@abcsuppliers.com',
    phone: '+966 50 123 4567',
    address: 'Riyadh, Saudi Arabia',
    isActive: true,
  },
  {
    id: '2',
    name: 'XYZ Trading',
    email: 'info@xyztrading.com',
    phone: '+966 50 987 6543',
    address: 'Jeddah, Saudi Arabia',
    isActive: true,
  },
];

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Received: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
};

export default function RFQDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const { setEntityLabel } = useBreadcrumb();

  const dummyRFQ = {
    id: id || '1',
    rfqNumber: `RFQ-${id || '001'}`,
    rfqNo: `RFQ-${id || '001'}`,
    purchaseRequestId: '1',
    purchaseRequest: {
      requestNo: 'PR-001',
      title: 'Office Supplies Q1 2024',
    },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        description: 'Ergonomic office chair with adjustable height',
        unitPrice: null,
        totalPrice: null,
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
        unitPrice: null,
        totalPrice: null,
      },
    ],
    status: 'Draft',
    supplierName: 'ABC Suppliers',
    vendorId: '1',
    sentDate: undefined,
    dueDate: undefined,
    createdAt: new Date().toISOString(),
  };

  const queryClient = useQueryClient();

  const { data: rfq, isLoading } = useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      if (!id) throw new Error('RFQ ID is required');
      const cachedData = queryClient.getQueryData(['rfqs']);
      if (Array.isArray(cachedData)) {
        const found = cachedData.find((r: any) => r.id === id);
        if (found) return found;
      }
      return { ...dummyRFQ, id };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (rfq?.rfqNumber) {
      setEntityLabel(rfq.rfqNumber);
    }
    return () => setEntityLabel(null);
  }, [rfq, setEntityLabel]);

  const getProductName = (productId: string) => {
    const product = dummyProducts.find((p) => p.id === productId);
    return product
      ? `${product.name} ${product.code ? `(${product.code})` : ''}`
      : 'Unknown Product';
  };

  const getVendorName = (vendorId: string) => {
    const vendor = dummyVendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  if (isLoading || !rfq) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/purchase/rfqs')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{rfq.rfqNumber || rfq.rfqNo}</h1>
              <Badge className={statusColors[rfq.status] || statusColors.Draft}>{rfq.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Request for Quotation Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rfq.status === 'Received' && (
            <Button onClick={() => setLocation(`/purchase/purchase-orders/new/${id}`)}>
              <HugeiconsIcon icon={ShoppingCartIcon} className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          )}
          <Button variant="outline" onClick={() => setLocation(`/purchase/rfqs/${id}/print`)}>
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Information</CardTitle>
              <CardDescription>Details about this request for quotation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfq.purchaseRequest && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Purchase Request
                  </label>
                  <p className="mt-1">{rfq.purchaseRequest.requestNo}</p>
                </div>
              )}
              {rfq.supplierName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p className="mt-1">{rfq.supplierName}</p>
                </div>
              )}
              {rfq.sentDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sent Date</label>
                  <p className="mt-1">{format(new Date(rfq.sentDate), 'PPP')}</p>
                </div>
              )}
              {rfq.dueDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <p className="mt-1">{format(new Date(rfq.dueDate), 'PPP')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Items requested in this RFQ</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Product</TableHead>
                      <TableHead className="w-[35%]">Description</TableHead>
                      <TableHead className="w-[10%] text-right">Quantity</TableHead>
                      <TableHead className="w-[17.5%] text-right">Unit Price</TableHead>
                      <TableHead className="w-[17.5%] text-right">Total Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rfq.items && rfq.items.length > 0 ? (
                      rfq.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {getProductName(item.productId)}
                          </TableCell>
                          <TableCell className="max-w-md">{item.description || '—'}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice
                              ? item.unitPrice.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.totalPrice
                              ? item.totalPrice.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rfq.vendorId && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{getVendorName(rfq.vendorId)}</p>
                  </div>
                  {dummyVendors.find((v) => v.id === rfq.vendorId)?.email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1">
                        {dummyVendors.find((v) => v.id === rfq.vendorId)?.email}
                      </p>
                    </div>
                  )}
                  {dummyVendors.find((v) => v.id === rfq.vendorId)?.phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="mt-1">
                        {dummyVendors.find((v) => v.id === rfq.vendorId)?.phone}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
