import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { PackageIcon, Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(200),
  code: z.string().max(50).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  unit: z.string().max(20).optional().or(z.literal('')),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Price must be a valid number'),
  isActive: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  isEditMode?: boolean;
  productId?: string;
  onComplete?: () => void;
}

export function ProductForm({
  initialData,
  isEditMode = false,
  productId,
  onComplete,
}: ProductFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProduct, setExistingProduct] = useState<any>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      unit: '',
      price: '',
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadProduct() {
      if (isEditMode && productId) {
        setIsLoading(true);
        try {
          const response = await api.get(`/products/${productId}`);
          if (response.data.success && response.data.result) {
            const productData = response.data.result;
            setExistingProduct(productData);
            form.reset({
              name: productData.name || '',
              code: productData.code || '',
              description: productData.description || '',
              unit: productData.unit || '',
              price: productData.price?.toString() || '',
              isActive: productData.isActive !== undefined ? productData.isActive : true,
            });
            if (productData.name) {
              setEntityLabel(productData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error.response?.data?.message || error.message || 'Failed to load product data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          code: initialData.code || '',
          description: initialData.description || '',
          unit: initialData.unit || '',
          price: initialData.price?.toString() || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadProduct();
    return () => setEntityLabel(null);
  }, [isEditMode, productId, setEntityLabel]);

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        code: data.code || undefined,
        description: data.description || undefined,
        unit: data.unit || undefined,
        price: parseFloat(data.price),
        isActive: data.isActive,
      };

      if (isEditMode) {
        if (!productId) throw new Error('Product ID is required');
        const response = await api.patch(`/products/${productId}`, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update product');
        }
      } else {
        const response = await api.post('/products', payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create product');
        }
      }

      toast({
        title: isEditMode ? 'Product Updated' : 'Product Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} product ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/purchase/products');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save product',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-primary" />
              Product Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update product details and pricing'
                : 'Add a new product with name, code, description, unit, and price'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Office Chair" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormDescription>The product name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code/SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PROD-001" {...field} data-testid="input-code" />
                    </FormControl>
                    <FormDescription>Product code or SKU</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., pcs, kg, liters"
                        {...field}
                        data-testid="input-unit"
                      />
                    </FormControl>
                    <FormDescription>Unit of measure</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      {...field}
                      data-testid="input-description"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Optional product description</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (SAR) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 100.00"
                      {...field}
                      data-testid="input-price"
                    />
                  </FormControl>
                  <FormDescription>Default price for this product</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>Enable or disable this product</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                setLocation('/purchase/products');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-product">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Product' : 'Create Product'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
