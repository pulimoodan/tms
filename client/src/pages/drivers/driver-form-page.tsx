import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { DriverForm } from '@/components/forms/driver-form';

export default function DriverFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/drivers/list/:id/edit');
  const isEditMode = !!match;
  const driverId = params?.id;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/drivers/list')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Driver' : 'Add Driver'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Update driver information' : 'Add a new driver to the system'}
            </p>
          </div>
        </div>
      </div>

      <DriverForm isEditMode={isEditMode} driverId={driverId} onComplete={() => setLocation('/drivers/list')} />
    </div>
  );
}
