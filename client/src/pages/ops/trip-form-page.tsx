import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TripForm } from '@/components/forms/trip-form';

export default function TripFormPage() {
  const [, setLocation] = useLocation();
  const [match] = useRoute('/ops/trips/:id/edit');
  const isEditMode = !!match;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/ops/trips')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Trip' : 'Create Trip'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode ? 'Update trip details' : 'Create a new trip for logistics operations'}
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardContent className="pt-6">
          <TripForm isEditMode={isEditMode} onComplete={() => setLocation('/ops/trips')} />
        </CardContent>
      </Card>
    </div>
  );
}
