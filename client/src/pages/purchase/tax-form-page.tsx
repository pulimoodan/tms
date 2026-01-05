import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { TaxForm } from '@/components/forms/tax-form';

export default function TaxFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/purchase/taxes/:id/edit');
  const isEditMode = !!match;
  const taxId = params?.id;

  const handleComplete = () => {
    setLocation('/purchase/taxes');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/taxes')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Tax' : 'New Tax'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update tax name and rate'
                : 'Add a new tax with name and percentage rate'}
            </p>
          </div>
        </div>
      </div>

      <TaxForm isEditMode={isEditMode} taxId={taxId} onComplete={handleComplete} />
    </div>
  );
}
