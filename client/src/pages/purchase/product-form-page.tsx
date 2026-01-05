import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { ProductForm } from '@/components/forms/product-form';

export default function ProductFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/purchase/products/:id/edit');
  const isEditMode = !!match;
  const productId = params?.id;

  const handleComplete = () => {
    setLocation('/purchase/products');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/products')}
            data-testid="button-back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Product' : 'New Product'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? 'Update product details and pricing'
                : 'Add a new product with name, code, description, unit, and price'}
            </p>
          </div>
        </div>
      </div>

      <ProductForm isEditMode={isEditMode} productId={productId} onComplete={handleComplete} />
    </div>
  );
}
