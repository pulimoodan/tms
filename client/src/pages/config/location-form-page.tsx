import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { LocationForm } from '@/components/forms/location-form';

export default function LocationFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/config/locations/:id/edit');
  const isEditMode = !!match;
  const locationId = params?.id;

  const handleComplete = () => {
    setLocation('/config/locations');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/config/locations')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Location' : 'New Location'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update location details and code'
                : 'Add a new location with name and unique code'}
            </p>
          </div>
        </div>
      </div>

      <LocationForm isEditMode={isEditMode} locationId={locationId} onComplete={handleComplete} />
    </div>
  );
}
