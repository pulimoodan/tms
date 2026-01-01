import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft01Icon,
  File01Icon,
  Location03Icon,
  Calendar01Icon,
  ShippingTruck02Icon,
  PrinterIcon,
  Edit01Icon,
  Loading01Icon,
  UserIcon,
  Building01Icon,
  PackageIcon,
  AlertCircleIcon,
  Clock01Icon,
  Route02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Dispatched: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Invoiced: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
};

const formatAddress = (location: any) => {
  if (!location) return 'N/A';
  const parts = [];
  if (location.street) parts.push(location.street);
  if (location.district) parts.push(location.district);
  if (location.city) parts.push(location.city);
  if (location.country) parts.push(location.country);
  return parts.length > 0 ? parts.join(', ') : location.name || 'N/A';
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const { setEntityLabel } = useBreadcrumb();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) throw new Error('Order ID is required');
      const response = await api.get(`/orders/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error('Order not found');
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order?.orderNo) {
      setEntityLabel(order.orderNo);
    }
    return () => setEntityLabel(null);
  }, [order, setEntityLabel]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Order Not Found</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : 'The order you are looking for does not exist.'}
          </p>
          <Button className="mt-4" onClick={() => setLocation('/ops/orders')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/ops/orders">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNo}</h1>
          <p className="text-muted-foreground">
            Created on {format(new Date(order.createdAt), 'PPP')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
            {order.status}
          </Badge>
          <Button variant="outline" onClick={() => setLocation(`/ops/orders/${id}/print`)}>
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
            Print Waybill
          </Button>
          <Button onClick={() => setLocation(`/ops/orders/${id}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit Order
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Building01Icon} className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.customer ? (
              <>
                <div className="flex justify-between items-start border-b pb-3">
                  <span className="text-muted-foreground">Customer Name</span>
                  <div className="text-right">
                    <span className="font-medium">{order.customer.name}</span>
                    {order.customer.nameArabic && (
                      <p className="text-sm text-muted-foreground text-right" dir="rtl">
                        {order.customer.nameArabic}
                      </p>
                    )}
                  </div>
                </div>
                {formatAddress(order.customer) !== 'N/A' && (
                  <div className="flex justify-between items-start border-b pb-3">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-xs">
                      {formatAddress(order.customer)}
                    </span>
                  </div>
                )}
                {order.customer.crNo && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">CR No</span>
                    <span className="font-medium">{order.customer.crNo}</span>
                  </div>
                )}
                {order.customer.vatNo && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">VAT No</span>
                    <span className="font-medium">{order.customer.vatNo}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No customer assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Order Number</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium font-mono">{order.orderNo}</span>
              </div>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Order Date</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{format(new Date(order.createdAt), 'PPP')}</span>
              </div>
            </div>
            {order.contract && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Contract</span>
                <span className="font-medium">{order.contract.contractNumber}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-3">
              <span className="text-muted-foreground">Status</span>
              <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                {order.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Location03Icon} className="h-5 w-5" />
              Route Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <div className="h-12 w-0.5 bg-border" />
                <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex flex-col gap-6 flex-1">
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Origin</span>
                  <div className="mt-1">
                    <p className="font-medium">{order.from?.name || 'N/A'}</p>
                    {order.from?.nameArabic && (
                      <p className="text-sm text-muted-foreground text-right" dir="rtl">
                        {order.from.nameArabic}
                      </p>
                    )}
                    {formatAddress(order.from) !== 'N/A' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatAddress(order.from)}
                      </p>
                    )}
                    {order.from?.code && (
                      <p className="text-xs text-muted-foreground mt-1">Code: {order.from.code}</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase">Destination</span>
                  <div className="mt-1">
                    <p className="font-medium">{order.to?.name || 'N/A'}</p>
                    {order.to?.nameArabic && (
                      <p className="text-sm text-muted-foreground text-right" dir="rtl">
                        {order.to.nameArabic}
                      </p>
                    )}
                    {formatAddress(order.to) !== 'N/A' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatAddress(order.to)}
                      </p>
                    )}
                    {order.to?.code && (
                      <p className="text-xs text-muted-foreground mt-1">Code: {order.to.code}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PackageIcon} className="h-5 w-5" />
              Cargo Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.tripNumber && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Trip Number</span>
                <span className="font-medium font-mono">{order.tripNumber}</span>
              </div>
            )}
            {order.cargoDescription && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Cargo Description</span>
                <span className="font-medium text-right max-w-xs">{order.cargoDescription}</span>
              </div>
            )}
            {order.sealNumber && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Seal Number</span>
                <span className="font-medium font-mono">{order.sealNumber}</span>
              </div>
            )}
            {order.weight && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Weight</span>
                <span className="font-medium">{Number(order.weight)} kg</span>
              </div>
            )}
            {order.volume && (
              <div className="flex justify-between border-b pb-3">
                <span className="text-muted-foreground">Volume</span>
                <span className="font-medium">{Number(order.volume)} m³</span>
              </div>
            )}
            {!order.weight && !order.volume && !order.cargoDescription && !order.tripNumber && (
              <p className="text-muted-foreground">No cargo details specified</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShippingTruck02Icon} className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.vehicle ? (
              <>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Plate Number</span>
                  <div className="text-right">
                    <span className="font-medium font-mono">{order.vehicle.plateNumber}</span>
                    {order.vehicle.plateNumberArabic && (
                      <p className="text-sm text-muted-foreground text-right" dir="rtl">
                        {order.vehicle.plateNumberArabic}
                      </p>
                    )}
                  </div>
                </div>
                {order.vehicle.type && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{order.vehicle.type}</span>
                  </div>
                )}
                {order.vehicle.category && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{order.vehicle.category}</span>
                  </div>
                )}
                {order.vehicle.name && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Vehicle Name</span>
                    <span className="font-medium">{order.vehicle.name}</span>
                  </div>
                )}
                {order.vehicle.make && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Make</span>
                    <span className="font-medium">{order.vehicle.make}</span>
                  </div>
                )}
                {order.vehicle.model && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium">{order.vehicle.model}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No vehicle assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} className="h-5 w-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.driver ? (
              <>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Driver Name</span>
                  <span className="font-medium">{order.driver.name}</span>
                </div>
                {order.driver.mobile && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Mobile</span>
                    <span className="font-medium">{order.driver.mobile}</span>
                  </div>
                )}
                {order.driver.nationality && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Nationality</span>
                    <span className="font-medium">{order.driver.nationality}</span>
                  </div>
                )}
                {order.driver.iqamaNumber && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Iqama Number</span>
                    <span className="font-medium font-mono">{order.driver.iqamaNumber}</span>
                  </div>
                )}
                {order.driver.badgeNo && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Badge Number</span>
                    <span className="font-medium font-mono">{order.driver.badgeNo}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">No driver assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {(order.requestedDate ||
        order.eta ||
        order.arrivalAtLoading ||
        order.completedLoading ||
        order.startKms ||
        order.kmOut ||
        order.kmIn ||
        order.runKm) && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
                Dates & Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.requestedDate && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Requested Date</span>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(order.requestedDate), 'PPP')}
                    </span>
                  </div>
                </div>
              )}
              {order.eta && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">ETA</span>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(order.eta), 'PPP p')}
                    </span>
                  </div>
                </div>
              )}
              {order.arrivalAtLoading && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Arrival at Loading</span>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(order.arrivalAtLoading), 'PPP p')}
                    </span>
                  </div>
                </div>
              )}
              {order.completedLoading && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Completed Loading</span>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(order.completedLoading), 'PPP p')}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Route02Icon} className="h-5 w-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.startKms !== null && order.startKms !== undefined && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Start KMs</span>
                  <span className="font-medium">{order.startKms} km</span>
                </div>
              )}
              {order.kmOut !== null && order.kmOut !== undefined && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">KM Out</span>
                  <span className="font-medium">{order.kmOut} km</span>
                </div>
              )}
              {order.kmIn !== null && order.kmIn !== undefined && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">KM In</span>
                  <span className="font-medium">{order.kmIn} km</span>
                </div>
              )}
              {order.runKm !== null && order.runKm !== undefined && (
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Run KM</span>
                  <span className="font-medium">{order.runKm} km</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {(order.remarks || order.recipientAcknowledgment) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={File01Icon} className="h-5 w-5" />
              Additional Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.recipientAcknowledgment && (
              <div className="flex flex-col gap-2 border-b pb-3">
                <span className="text-muted-foreground">Recipient Acknowledgment</span>
                <span className="font-medium">{order.recipientAcknowledgment}</span>
              </div>
            )}
            {order.remarks && (
              <div className="flex flex-col gap-2">
                <span className="text-muted-foreground">Remarks</span>
                <p className="font-medium whitespace-pre-wrap">{order.remarks}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Order metadata and timestamps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Created At</span>
              <span className="font-medium">{format(new Date(order.createdAt), 'PPP p')}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{format(new Date(order.updatedAt), 'PPP p')}</span>
            </div>
            {order.createdBy && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Created By</span>
                <span className="font-medium">{order.createdBy.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
