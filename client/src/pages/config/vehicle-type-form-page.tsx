import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon, ShippingTruck02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { VehicleTypeForm } from '@/components/forms/vehicle-type-form';
import { PageTitle } from '@/components/ui/page-title';

export default function VehicleTypeFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/config/vehicle-types/:id/edit');
  const isEditMode = !!match;
  const vehicleTypeId = params?.id;

  const handleComplete = () => {
    setLocation('/config/vehicle-types');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/config/vehicle-types')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <PageTitle
            title={isEditMode ? 'Edit Vehicle Type' : 'New Vehicle Type'}
            description={
              isEditMode
                ? 'Update vehicle type details and specifications'
                : 'Add a new vehicle type with name, capacity, and category'
            }
            icon={ShippingTruck02Icon}
          />
        </div>
      </div>

      <VehicleTypeForm
        isEditMode={isEditMode}
        vehicleTypeId={vehicleTypeId}
        onComplete={handleComplete}
      />
    </div>
  );
}
