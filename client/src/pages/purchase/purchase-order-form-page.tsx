import { useLocation, useRoute } from 'wouter';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PurchaseOrderForm } from '@/components/forms/purchase-order-form';

export default function PurchaseOrderFormPage() {
  const [, setLocation] = useLocation();
  const [matchEdit, paramsEdit] = useRoute('/purchase/purchase-orders/:id/edit');
  const [matchFromRfq, paramsFromRfq] = useRoute('/purchase/purchase-orders/new/:rfqId');
  
  const isEditMode = !!matchEdit;
  const purchaseOrderId = paramsEdit?.id;
  const rfqId = paramsFromRfq?.rfqId;
  
  // If trying to create new PO without RFQ, redirect to RFQs
  useEffect(() => {
    if (!isEditMode && !rfqId) {
      setLocation('/purchase/rfqs');
    }
  }, [isEditMode, rfqId, setLocation]);
  
  // Don't render if redirecting
  if (!isEditMode && !rfqId) {
    return null;
  }

  const handleComplete = () => {
    setLocation('/purchase/purchase-orders');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/purchase-orders')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update purchase order details and items'
                : rfqId
                  ? 'Create purchase order from RFQ'
                  : 'Create a new purchase order with items'}
            </p>
          </div>
        </div>
      </div>

      <PurchaseOrderForm
        isEditMode={isEditMode}
        purchaseOrderId={purchaseOrderId}
        rfqId={rfqId}
        onComplete={handleComplete}
      />
    </div>
  );
}

