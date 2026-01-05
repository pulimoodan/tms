import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft01Icon, Loading01Icon, PrinterIcon } from '@hugeicons/core-free-icons';
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
  Issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  PartiallyReceived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  FullyReceived: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

export default function PurchaseOrderDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const { setEntityLabel } = useBreadcrumb();

  const dummyPO = {
    id: id || '1',
    poNo: `PO-${id || '001'}`,
    supplierName: 'ABC Suppliers',
    supplierEmail: 'contact@abcsuppliers.com',
    status: 'Issued',
    issueDate: new Date().toISOString(),
    expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 12500.0,
    rfq: { rfqNo: 'RFQ-001' },
    pickingWarehouse: { name: 'Riyadh warehouse', code: 'RYD-WH' },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        unitPrice: 450.0,
        totalPrice: 4500.0,
        description: 'Ergonomic office chair with adjustable height',
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        unitPrice: 25.0,
        totalPrice: 1250.0,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const { data: purchaseOrder, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      if (!id) throw new Error('Purchase Order ID is required');
      return { ...dummyPO, id };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (purchaseOrder?.poNo) {
      setEntityLabel(purchaseOrder.poNo);
    }
    return () => setEntityLabel(null);
  }, [purchaseOrder, setEntityLabel]);

  const getProductName = (productId: string) => {
    const product = dummyProducts.find((p) => p.id === productId);
    return product
      ? `${product.name} ${product.code ? `(${product.code})` : ''}`
      : 'Unknown Product';
  };

  if (isLoading || !purchaseOrder) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/purchase-orders')}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{purchaseOrder.poNo}</h1>
              <Badge className={statusColors[purchaseOrder.status] || statusColors.Draft}>
                {purchaseOrder.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Purchase Order Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/purchase/purchase-orders/${id}/print`)}
          >
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
              <CardDescription>Details about this purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {purchaseOrder.rfq && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">RFQ</label>
                  <p className="mt-1">{purchaseOrder.rfq.rfqNo}</p>
                </div>
              )}
              {purchaseOrder.supplierName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Supplier</label>
                  <p className="mt-1">{purchaseOrder.supplierName}</p>
                </div>
              )}
              {purchaseOrder.pickingWarehouse && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Picking Warehouse
                  </label>
                  <p className="mt-1">
                    {purchaseOrder.pickingWarehouse.name}{' '}
                    {purchaseOrder.pickingWarehouse.code &&
                      `(${purchaseOrder.pickingWarehouse.code})`}
                  </p>
                </div>
              )}
              {purchaseOrder.issueDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                  <p className="mt-1">{format(new Date(purchaseOrder.issueDate), 'PPP')}</p>
                </div>
              )}
              {purchaseOrder.expectedDeliveryDate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expected Delivery Date
                  </label>
                  <p className="mt-1">
                    {format(new Date(purchaseOrder.expectedDeliveryDate), 'PPP')}
                  </p>
                </div>
              )}
              {purchaseOrder.totalAmount && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <p className="mt-1 font-semibold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR',
                      minimumFractionDigits: 2,
                    }).format(purchaseOrder.totalAmount)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Items in this purchase order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Product</TableHead>
                      <TableHead className="w-[35%]">Description</TableHead>
                      <TableHead className="w-[10%] text-right">Quantity</TableHead>
                      <TableHead className="w-[17.5%] text-right">Unit Price (SAR)</TableHead>
                      <TableHead className="w-[17.5%] text-right">Total Price (SAR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                      purchaseOrder.items.map((item: any) => (
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
              {purchaseOrder.supplierName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="mt-1">{purchaseOrder.supplierName}</p>
                </div>
              )}
              {purchaseOrder.supplierEmail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1">{purchaseOrder.supplierEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
