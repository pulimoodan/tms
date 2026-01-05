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
import { Building01Icon, Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/lib/api';

export const vendorFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface VendorFormProps {
  initialData?: Partial<VendorFormValues>;
  isEditMode?: boolean;
  vendorId?: string;
  onComplete?: () => void;
}

export function VendorForm({
  initialData,
  isEditMode = false,
  vendorId,
  onComplete,
}: VendorFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVendor, setExistingVendor] = useState<any>(null);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      isActive: true,
    },
  });

  useEffect(() => {
    async function loadVendor() {
      if (isEditMode && vendorId) {
        setIsLoading(true);
        try {
          const response = await api.get(`/vendors/${vendorId}`);
          if (response.data.success && response.data.result) {
            const vendorData = response.data.result;
            setExistingVendor(vendorData);
            form.reset({
              name: vendorData.name || '',
              email: vendorData.email || '',
              phone: vendorData.phone || '',
              address: vendorData.address || '',
              isActive: vendorData.isActive !== undefined ? vendorData.isActive : true,
            });
            if (vendorData.name) {
              setEntityLabel(vendorData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error.response?.data?.message || error.message || 'Failed to load vendor data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          address: initialData.address || '',
          isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadVendor();
    return () => setEntityLabel(null);
  }, [isEditMode, vendorId, setEntityLabel]);

  async function onSubmit(data: VendorFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        isActive: data.isActive,
      };

      if (isEditMode) {
        if (!vendorId) throw new Error('Vendor ID is required');
        const response = await api.patch(`/vendors/${vendorId}`, payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update vendor');
        }
      } else {
        const response = await api.post('/vendors', payload);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create vendor');
        }
      }

      toast({
        title: isEditMode ? 'Vendor Updated' : 'Vendor Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} vendor ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/purchase/vendors');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save vendor',
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
              <HugeiconsIcon icon={Building01Icon} className="h-5 w-5 text-primary" />
              Vendor Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update vendor details and contact information'
                : 'Add a new vendor with name, email, phone, and address'}
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
                    <Input placeholder="e.g., ABC Suppliers" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormDescription>The vendor name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="e.g., contact@vendor.com"
                        {...field}
                        data-testid="input-email"
                      />
                    </FormControl>
                    <FormDescription>Vendor email address</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., +966 50 123 4567"
                        {...field}
                        data-testid="input-phone"
                      />
                    </FormControl>
                    <FormDescription>Vendor phone number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Vendor address"
                      {...field}
                      data-testid="input-address"
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Optional vendor address</FormDescription>
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
                    <FormDescription>Enable or disable this vendor</FormDescription>
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
                setLocation('/purchase/vendors');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-vendor">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Vendor' : 'Create Vendor'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
