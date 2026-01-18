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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { ReceiptDollarIcon, Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export const taxFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100),
  rate: z
    .string()
    .min(1, 'Rate is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, 'Rate must be between 0 and 100'),
  isActive: z.boolean().default(true),
});

export type TaxFormValues = z.infer<typeof taxFormSchema>;

interface TaxFormProps {
  initialData?: Partial<TaxFormValues>;
  isEditMode?: boolean;
  taxId?: string;
  onComplete?: () => void;
}

export function TaxForm({ initialData, isEditMode = false, taxId, onComplete }: TaxFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingTax, setExistingTax] = useState<any>(null);

  const form = useForm<TaxFormValues>({
    resolver: zodResolver(taxFormSchema),
    defaultValues: {
      name: '',
      rate: '',
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadTax() {
      if (isEditMode && taxId) {
        setIsLoading(true);
        try {
          const response = await api.get(`/taxes/${taxId}`);
          if (response.data.success && response.data.result) {
            const taxData = response.data.result;
            setExistingTax(taxData);
            form.reset({
              name: taxData.name || '',
              rate: taxData.rate?.toString() || '',
              isActive: taxData.isActive !== undefined ? taxData.isActive : true,
            });
            if (taxData.name) {
              setEntityLabel(taxData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error.response?.data?.message || error.message || 'Failed to load tax data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          rate: initialData.rate?.toString() || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadTax();
    return () => setEntityLabel(null);
  }, [isEditMode, taxId, setEntityLabel]);

  async function onSubmit(data: TaxFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        rate: parseFloat(data.rate),
        isActive: data.isActive,
      };

      if (isEditMode) {
        if (!taxId) throw new Error('Tax ID is required');
        const response = await api.patch(`/taxes/${taxId}`, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update tax');
        }
      } else {
        const response = await api.post('/taxes', payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create tax');
        }
      }

      toast({
        title: isEditMode ? 'Tax Updated' : 'Tax Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} tax ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/purchase/taxes');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save tax',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ReceiptDollarIcon} className="h-5 w-5 text-primary" />
              Tax Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update tax name and rate'
                : 'Add a new tax with name and percentage rate'}
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
                    <Input placeholder="e.g., VAT" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormDescription>The tax name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate (%) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      placeholder="e.g., 15"
                      {...field}
                      data-testid="input-rate"
                    />
                  </FormControl>
                  <FormDescription>Tax rate as a percentage (0-100)</FormDescription>
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
                    <FormDescription>Enable or disable this tax</FormDescription>
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
                setLocation('/purchase/taxes');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-tax">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Orbit01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Tax' : 'Create Tax'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
