import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  FileVerifiedIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  InProgress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  Closed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  ClosedAccident: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  ClosedBreakdown: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showClosingTypeDialog, setShowClosingTypeDialog] = useState(false);

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

  const hasWaybillClosing =
    order.arrivalAtOffloading || order.completedUnloading || order.podNumber || order.podDocument;

  const hasTimeline =
    order.requestedDate ||
    order.eta ||
    order.arrivalAtLoading ||
    order.completedLoading ||
    order.startKms ||
    order.kmOut ||
    order.kmIn ||
    order.runKm;

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Link href="/ops/orders">
            <Button variant="ghost" size="icon">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Order {order.orderNo}</h1>
            <p className="text-muted-foreground text-sm">
              Created on {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={
              statusColors[order.status] ||
              statusColors[order.status === 'Pending' ? 'InProgress' : order.status] ||
              'bg-gray-100 text-gray-800'
            }
          >
            {order.status === 'ClosedAccident'
              ? 'Closed (Accident)'
              : order.status === 'ClosedBreakdown'
                ? 'Closed (Breakdown)'
                : order.status === 'InProgress' || order.status === 'Pending'
                  ? 'In Progress'
                  : order.status === 'Delivered' || order.status === 'Closed'
                    ? 'Closed'
                    : order.status}
          </Badge>
          {order.hasDuplicatedResources && (
            <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20">
              Duplicated Resources
            </Badge>
          )}
          <Button variant="outline" onClick={() => setLocation(`/ops/orders/${id}/print`)}>
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
            Print
          </Button>
          {order.status !== 'Closed' &&
            order.status !== 'ClosedAccident' &&
            order.status !== 'ClosedBreakdown' &&
            !(order.completedUnloading && order.kmIn) && (
              <Button variant="outline" onClick={() => setShowClosingTypeDialog(true)}>
                <HugeiconsIcon icon={FileVerifiedIcon} className="mr-2 h-4 w-4" />
                Close Waybill
              </Button>
            )}
          <Button onClick={() => setLocation(`/ops/orders/${id}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Duplication Warning */}
      {order.hasDuplicatedResources && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Warning: Duplicated Resources</p>
              <p className="text-sm">
                {order.duplicationNotes ||
                  'This waybill has resources that are already assigned to other in-progress waybills.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="text-lg font-semibold mt-1">
                  {order.customer?.name || 'Not assigned'}
                </p>
              </div>
              <HugeiconsIcon icon={Building01Icon} className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="text-lg font-semibold mt-1">
                  {order.from?.name || 'N/A'} → {order.to?.name || 'N/A'}
                </p>
              </div>
              <HugeiconsIcon icon={Location03Icon} className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="text-lg font-semibold mt-1">
                  {order.vehicle?.plateNumber || 'Not assigned'}
                </p>
              </div>
              <HugeiconsIcon icon={ShippingTruck02Icon} className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="text-lg font-semibold mt-1">{order.driver?.name || 'Not assigned'}</p>
              </div>
              <HugeiconsIcon icon={UserIcon} className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="route">Route & Cargo</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          {hasTimeline && <TabsTrigger value="timeline">Timeline</TabsTrigger>}
          {hasWaybillClosing && <TabsTrigger value="closing">Waybill Closing</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
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
                  <span className="font-medium font-mono">{order.orderNo}</span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">{format(new Date(order.createdAt), 'PPP')}</span>
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
                    {order.status === 'ClosedAccident'
                      ? 'Closed (Accident/Breakdown)'
                      : order.status === 'InProgress'
                        ? 'In Progress'
                        : order.status}
                  </Badge>
                </div>
                {order.createdBy && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Created By</span>
                    <span className="font-medium">{order.createdBy.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-sm">
                    {format(new Date(order.updatedAt), 'PPP p')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

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
        </TabsContent>

        {/* Route & Cargo Tab */}
        <TabsContent value="route" className="space-y-6 mt-6">
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Code: {order.from.code}
                          </p>
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Code: {order.to.code}
                          </p>
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
                    <span className="font-medium text-right max-w-xs">
                      {order.cargoDescription}
                    </span>
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
                {order.value && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-medium">{Number(order.value).toLocaleString()} SAR</span>
                  </div>
                )}
                {!order.weight && !order.volume && !order.cargoDescription && !order.tripNumber && (
                  <p className="text-muted-foreground">No cargo details specified</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Assignment Tab */}
        <TabsContent value="assignment" className="space-y-6 mt-6">
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
                      <div className="flex justify-between">
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
                      <div className="flex justify-between">
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

          {order.accessories && order.accessories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={ShippingTruck02Icon} className="h-5 w-5" />
                  Accessories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.accessories.map((accessory: any) => (
                  <div key={accessory.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{accessory.name || 'Unnamed Accessory'}</span>
                      {accessory.plateNumber && (
                        <span className="text-muted-foreground font-mono text-sm">
                          {accessory.plateNumber}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {accessory.doorNo && (
                        <div>
                          <span className="text-muted-foreground">Door No: </span>
                          <span>{accessory.doorNo}</span>
                        </div>
                      )}
                      {accessory.category && (
                        <div>
                          <span className="text-muted-foreground">Category: </span>
                          <span>{accessory.category}</span>
                        </div>
                      )}
                      {accessory.plateNumberArabic && (
                        <div className="col-span-2 text-right" dir="rtl">
                          <span className="text-muted-foreground">Plate (Arabic): </span>
                          <span>{accessory.plateNumberArabic}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Timeline Tab */}
        {hasTimeline && (
          <TabsContent value="timeline" className="space-y-6 mt-6">
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
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
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
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="font-medium">{format(new Date(order.eta), 'PPP p')}</span>
                      </div>
                    </div>
                  )}
                  {order.arrivalAtLoading && (
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-muted-foreground">Arrival at Loading</span>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <span className="font-medium">
                          {format(new Date(order.arrivalAtLoading), 'PPP p')}
                        </span>
                      </div>
                    </div>
                  )}
                  {order.completedLoading && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed Loading</span>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Clock01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Run KM</span>
                      <span className="font-medium">{order.runKm} km</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {/* Waybill Closing Tab */}
        {hasWaybillClosing && (
          <TabsContent value="closing" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={FileVerifiedIcon} className="h-5 w-5" />
                  Waybill Closing Details
                </CardTitle>
                <CardDescription>Unloading and delivery completion information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.arrivalAtOffloading && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Arrival at Offloading</span>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(order.arrivalAtOffloading), 'PPP p')}
                      </span>
                    </div>
                  </div>
                )}
                {order.completedUnloading && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">Completed Unloading</span>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(order.completedUnloading), 'PPP p')}
                      </span>
                    </div>
                  </div>
                )}
                {order.podNumber && (
                  <div className="flex justify-between border-b pb-3">
                    <span className="text-muted-foreground">POD Number</span>
                    <span className="font-medium font-mono">{order.podNumber}</span>
                  </div>
                )}
                {order.podDocument && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">POD Document</span>
                    <a
                      href={
                        order.podDocument.startsWith('http')
                          ? order.podDocument
                          : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${order.podDocument}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {order.podDocument.split('/').pop()}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Waybill Closing Type Dialog */}
      <Dialog open={showClosingTypeDialog} onOpenChange={setShowClosingTypeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Waybill Closing Type</DialogTitle>
            <DialogDescription>
              Choose how you want to close this waybill. This will determine the closing process.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-6"
              onClick={() => {
                setShowClosingTypeDialog(false);
                setLocation(`/ops/orders/${id}/waybill-closing`);
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={FileVerifiedIcon} className="h-5 w-5" />
                  <span className="font-semibold">Normal Closing</span>
                </div>
                <span className="text-sm text-muted-foreground text-left">
                  Complete the waybill with standard closing details
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-6 border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/10"
              onClick={async () => {
                setShowClosingTypeDialog(false);
                try {
                  // Close waybill immediately for accident
                  const payload = {
                    status: 'ClosedAccident',
                    remarks: 'Waybill closed due to accident',
                    completedUnloading: new Date().toISOString(),
                    kmIn: order?.startKms || 0, // Use start KMs if available, otherwise 0
                  };

                  const response = await api.patch(`/orders/${id}`, payload);

                  if (response.data.success) {
                    // Invalidate queries to refresh the order data
                    await queryClient.invalidateQueries({ queryKey: ['order', id] });
                    await queryClient.invalidateQueries({ queryKey: ['orders'] });

                    toast({
                      title: 'Waybill Closed',
                      description: 'Waybill has been closed due to accident.',
                    });

                    // Refresh the page to show updated status
                    window.location.reload();
                  }
                } catch (error: any) {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to close waybill',
                  });
                }
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold">Accident</span>
                </div>
                <span className="text-sm text-muted-foreground text-left">
                  Close waybill due to an accident
                </span>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-6 border-red-500/50 hover:border-red-500 hover:bg-red-500/10"
              onClick={async () => {
                setShowClosingTypeDialog(false);
                try {
                  // Close waybill immediately for breakdown
                  const payload = {
                    status: 'ClosedBreakdown',
                    remarks: 'Waybill closed due to breakdown',
                    completedUnloading: new Date().toISOString(),
                    kmIn: order?.startKms || 0, // Use start KMs if available, otherwise 0
                  };

                  const response = await api.patch(`/orders/${id}`, payload);

                  if (response.data.success) {
                    // Invalidate queries to refresh the order data
                    await queryClient.invalidateQueries({ queryKey: ['order', id] });
                    await queryClient.invalidateQueries({ queryKey: ['orders'] });

                    toast({
                      title: 'Waybill Closed',
                      description: 'Waybill has been closed due to breakdown.',
                    });

                    // Refresh the page to show updated status
                    window.location.reload();
                  }
                } catch (error: any) {
                  toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to close waybill',
                  });
                }
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-red-600" />
                  <span className="font-semibold">Breakdown</span>
                </div>
                <span className="text-sm text-muted-foreground text-left">
                  Close waybill due to vehicle breakdown
                </span>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClosingTypeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
