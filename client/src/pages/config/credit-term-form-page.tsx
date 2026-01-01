import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CreditTermForm } from '@/components/forms/credit-term-form';

export default function CreditTermFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/config/credit-terms/:id/edit');
  const isEditMode = !!match;
  const creditTermId = params?.id;

  const handleComplete = () => {
    setLocation('/config/credit-terms');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/config/credit-terms')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Credit Term' : 'New Credit Term'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update credit term details and payment conditions'
                : 'Add a new credit term with name, description, and payment days'}
            </p>
          </div>
        </div>
      </div>

      <CreditTermForm
        isEditMode={isEditMode}
        creditTermId={creditTermId}
        onComplete={handleComplete}
      />
    </div>
  );
}
