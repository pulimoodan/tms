import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { OrderForm } from '@/components/forms/order-form';

export default function OrderFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/ops/orders/:id/edit');
  const isEditMode = !!match;
  const orderId = params?.id;

  const handleComplete = () => {
    setLocation('/ops/orders');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/ops/orders')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Order' : 'New Order'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update order details and assignments'
                : 'Create a new order/waybill with customer, route, and assignment information'}
            </p>
          </div>
        </div>
      </div>

      <OrderForm isEditMode={isEditMode} orderId={orderId} onComplete={handleComplete} />
    </div>
  );
}
