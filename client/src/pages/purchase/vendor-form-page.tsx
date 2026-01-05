import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { VendorForm } from '@/components/forms/vendor-form';

export default function VendorFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/purchase/vendors/:id/edit');
  const isEditMode = !!match;
  const vendorId = params?.id;

  const handleComplete = () => {
    setLocation('/purchase/vendors');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/vendors')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Vendor' : 'New Vendor'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update vendor details and contact information'
                : 'Add a new vendor with name, email, phone, and address'}
            </p>
          </div>
        </div>
      </div>

      <VendorForm isEditMode={isEditMode} vendorId={vendorId} onComplete={handleComplete} />
    </div>
  );
}
