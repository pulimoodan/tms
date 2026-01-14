import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon, Loading01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'wouter';
import { api } from '@/lib/api';
import { WaybillClosingForm } from '@/components/forms/waybill-closing-form';
import { PageTitle } from '@/components/ui/page-title';
import { FileVerifiedIcon } from '@hugeicons/core-free-icons';

export default function WaybillClosingPage() {
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
      setEntityLabel(`Waybill Closing - ${order.orderNo}`);
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

  // Check if waybill is already closed
  const isWaybillClosed =
    order.status === 'Closed' ||
    order.status === 'ClosedAccident' ||
    order.status === 'ClosedBreakdown' ||
    (order.completedUnloading && order.kmIn);

  if (isWaybillClosed) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 shrink">
            <PageTitle
              title="Waybill Already Closed"
              description={`Waybill for order ${order.orderNo} has already been closed`}
              icon={FileVerifiedIcon}
            />
          </div>
          <Link href={`/ops/orders/${id}`}>
            <Button variant="outline">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
              Back to Order Details
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 p-8 border rounded-lg bg-muted/50">
          <HugeiconsIcon icon={FileVerifiedIcon} className="h-16 w-16 text-green-600" />
          <div className="text-center">
            <h2 className="text-2xl font-bold">Waybill Already Closed</h2>
            <p className="text-muted-foreground mt-2">
              This waybill has already been closed and cannot be modified.
            </p>
            {(order.status === 'Closed' ||
              order.status === 'ClosedAccident' ||
              order.status === 'ClosedBreakdown') && (
              <p className="text-sm text-muted-foreground mt-1">
                Order status:{' '}
                <span className="font-semibold">
                  {order.status === 'ClosedAccident'
                    ? 'Closed (Accident)'
                    : order.status === 'ClosedBreakdown'
                      ? 'Closed (Breakdown)'
                      : 'Closed'}
                </span>
              </p>
            )}
          </div>
          <Link href={`/ops/orders/${id}`}>
            <Button>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
              View Order Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 shrink">
          <PageTitle
            title="Waybill Closing"
            description={`Complete waybill closing details for order ${order.orderNo}`}
            icon={FileVerifiedIcon}
          />
        </div>
        <Link href={`/ops/orders/${id}`}>
          <Button variant="outline">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Order Details
          </Button>
        </Link>
      </div>

      <WaybillClosingForm
        orderId={id!}
        orderData={{
          startKms: order.startKms || undefined,
          arrivalAtLoading: order.arrivalAtLoading || undefined,
          dispatchFromLoading: order.dispatchFromLoading || undefined,
          arrivalAtOffloading: order.arrivalAtOffloading || undefined,
          completedUnloading: order.completedUnloading || undefined,
          kmIn: order.kmIn || undefined,
          podNumber: order.podNumber || undefined,
          podDocument: order.podDocument || undefined,
          remarks: order.remarks || undefined,
          recipientAcknowledgment: order.recipientAcknowledgment || undefined,
        }}
        onComplete={() => {
          setLocation(`/ops/orders/${id}`);
        }}
      />
    </div>
  );
}
