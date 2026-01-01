import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { VehicleForm } from '@/components/forms/vehicle-form';

export default function VehicleFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/fleet/vehicles/:id/edit');
  const isEditMode = !!match;
  const vehicleId = params?.id;

  const handleComplete = () => {
    setLocation('/fleet/vehicles');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/fleet/vehicles')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Vehicle' : 'New Vehicle'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update vehicle details and specifications'
                : 'Add a new vehicle to your fleet with complete information'}
            </p>
          </div>
        </div>
      </div>

      <VehicleForm isEditMode={isEditMode} vehicleId={vehicleId} onComplete={handleComplete} />
    </div>
  );
}
