import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ContractForm } from '@/components/forms/contract-form';

export default function ContractFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/sales/contracts/:id/edit');
  const isEditMode = !!match;
  const contractId = params?.id;

  const handleComplete = () => {
    setLocation('/sales/contracts');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/sales/contracts')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Contract' : 'New Contract'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update contract details, terms, and routes'
                : 'Create a new service agreement and define routes'}
            </p>
          </div>
        </div>
      </div>

      <ContractForm isEditMode={isEditMode} contractId={contractId} onComplete={handleComplete} />
    </div>
  );
}
