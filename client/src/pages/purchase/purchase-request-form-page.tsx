import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PurchaseRequestForm } from '@/components/forms/purchase-request-form';

export default function PurchaseRequestFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/purchase/purchase-requests/:id/edit');
  const isEditMode = !!match;
  const purchaseRequestId = params?.id;

  const handleComplete = () => {
    setLocation('/purchase/purchase-requests');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/purchase-requests')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Purchase Request' : 'New Purchase Request'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update purchase request description and items'
                : 'Create a new purchase request with description and items'}
            </p>
          </div>
        </div>
      </div>

      <PurchaseRequestForm
        isEditMode={isEditMode}
        purchaseRequestId={purchaseRequestId}
        onComplete={handleComplete}
      />
    </div>
  );
}
