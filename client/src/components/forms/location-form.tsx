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
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Location03Icon, Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchLocation, createLocation, updateLocation } from '@/lib/api-helpers';

export const locationFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters.').max(50),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

interface LocationFormProps {
  initialData?: Partial<LocationFormValues>;
  isEditMode?: boolean;
  locationId?: string;
  onComplete?: () => void;
}

export function LocationForm({
  initialData,
  isEditMode = false,
  locationId,
  onComplete,
}: LocationFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingLocation, setExistingLocation] = useState<any>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  useEffect(() => {
    async function loadLocation() {
      if (isEditMode && locationId) {
        setIsLoading(true);
        try {
          const locationData = await fetchLocation(locationId);
          if (locationData) {
            setExistingLocation(locationData);
            form.reset(locationData);
            if (locationData.name) {
              setEntityLabel(locationData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load location data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          code: initialData.code || '',
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadLocation();
    return () => setEntityLabel(null);
  }, [isEditMode, locationId, setEntityLabel]);

  async function onSubmit(data: LocationFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        code: data.code,
      };

      if (isEditMode) {
        if (!locationId) throw new Error('Location ID is required');
        await updateLocation(locationId, payload);
      } else {
        await createLocation(payload);
      }

      toast({
        title: isEditMode ? 'Location Updated' : 'Location Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} location ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/config/locations');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save location',
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
              <HugeiconsIcon icon={Location03Icon} className="h-5 w-5 text-primary" />
              Location Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update location details and code'
                : 'Add a new location with name and unique code'}
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
                    <Input
                      placeholder="e.g., Riyadh Central Warehouse"
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormDescription>The display name for this location</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RYD-CW-001" {...field} data-testid="input-code" />
                  </FormControl>
                  <FormDescription>Unique location code (2-50 characters)</FormDescription>
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
                setLocation('/config/locations');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-location">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Orbit01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Location' : 'Create Location'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
