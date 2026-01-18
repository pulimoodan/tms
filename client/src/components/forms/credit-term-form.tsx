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
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { CreditCardIcon, Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchCreditTerm, createCreditTerm, updateCreditTerm } from '@/lib/api-helpers';

export const creditTermFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  description: z.string().max(500).optional().or(z.literal('')),
  paymentDays: z
    .string()
    .min(1, 'Payment days is required')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 365;
    }, 'Payment days must be between 1 and 365'),
});

export type CreditTermFormValues = z.infer<typeof creditTermFormSchema>;

interface CreditTermFormProps {
  initialData?: Partial<CreditTermFormValues>;
  isEditMode?: boolean;
  creditTermId?: string;
  onComplete?: () => void;
}

export function CreditTermForm({
  initialData,
  isEditMode = false,
  creditTermId,
  onComplete,
}: CreditTermFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCreditTerm, setExistingCreditTerm] = useState<any>(null);

  const form = useForm<CreditTermFormValues>({
    resolver: zodResolver(creditTermFormSchema),
    defaultValues: {
      name: '',
      description: '',
      paymentDays: '',
    },
  });

  useEffect(() => {
    async function loadCreditTerm() {
      if (isEditMode && creditTermId) {
        setIsLoading(true);
        try {
          const creditTermData = await fetchCreditTerm(creditTermId);
          if (creditTermData) {
            setExistingCreditTerm(creditTermData);
            form.reset(creditTermData);
            if (creditTermData.name) {
              setEntityLabel(creditTermData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load credit term data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          description: initialData.description || '',
          paymentDays: initialData.paymentDays?.toString() || '',
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadCreditTerm();
    return () => setEntityLabel(null);
  }, [isEditMode, creditTermId, setEntityLabel]);

  async function onSubmit(data: CreditTermFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        paymentDays: parseInt(data.paymentDays, 10),
      };

      if (isEditMode) {
        if (!creditTermId) throw new Error('Credit term ID is required');
        await updateCreditTerm(creditTermId, payload);
      } else {
        await createCreditTerm(payload);
      }

      toast({
        title: isEditMode ? 'Credit Term Updated' : 'Credit Term Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} credit term ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/config/credit-terms');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save credit term',
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
              <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5 text-primary" />
              Credit Term Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update credit term details and payment conditions'
                : 'Add a new credit term with name, description, and payment days'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Net 30" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormDescription>The display name for this credit term</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Payment due within 30 days of invoice"
                      {...field}
                      data-testid="input-description"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Optional description of the credit term</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="365"
                      placeholder="e.g., 30"
                      {...field}
                      data-testid="input-payment-days"
                    />
                  </FormControl>
                  <FormDescription>Number of days for payment (1-365)</FormDescription>
                  <FormMessage />
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
                setLocation('/config/credit-terms');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-credit-term">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Orbit01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Credit Term' : 'Create Credit Term'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
