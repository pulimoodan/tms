import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CustomerForm } from '@/components/forms/customer-form';

export default function CustomerFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/sales/customers/:id/edit');
  const isEditMode = !!match;
  const customerId = params?.id;

  const handleComplete = () => {
    setLocation('/sales/customers');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/sales/customers')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Customer' : 'New Customer'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update customer profile and information'
                : 'Add a new customer with complete information'}
            </p>
          </div>
        </div>
      </div>

      <CustomerForm isEditMode={isEditMode} customerId={customerId} onComplete={handleComplete} />
    </div>
  );
}
