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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { ShippingTruck02Icon, Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fetchVehicleType, createVehicleType, updateVehicleType } from '@/lib/api-helpers';

const VEHICLE_TYPE_OPTIONS = [
  { value: 'FlatBed', label: 'Flat Bed' },
  { value: 'LowBed', label: 'Low Bed' },
  { value: 'CurtainSide', label: 'Curtain Side' },
  { value: 'Reefer', label: 'Reefer' },
  { value: 'CarCarrier', label: 'Car Carrier' },
  { value: 'DryBox', label: 'Dry Box' },
] as const;

export const vehicleTypeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  capacity: z
    .string()
    .min(1, 'Capacity is required')
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, 'Capacity must be a valid number greater than 0'),
  type: z.enum(['FlatBed', 'LowBed', 'CurtainSide', 'Reefer', 'CarCarrier', 'DryBox']),
});

export type VehicleTypeFormValues = z.infer<typeof vehicleTypeFormSchema>;

interface VehicleTypeFormProps {
  initialData?: Partial<VehicleTypeFormValues>;
  isEditMode?: boolean;
  vehicleTypeId?: string;
  onComplete?: () => void;
}

export function VehicleTypeForm({
  initialData,
  isEditMode = false,
  vehicleTypeId,
  onComplete,
}: VehicleTypeFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVehicleType, setExistingVehicleType] = useState<any>(null);

  const form = useForm<VehicleTypeFormValues>({
    resolver: zodResolver(vehicleTypeFormSchema),
    defaultValues: {
      name: '',
      capacity: '',
      type: 'FlatBed',
    },
  });

  useEffect(() => {
    async function loadVehicleType() {
      if (isEditMode && vehicleTypeId) {
        setIsLoading(true);
        try {
          const vehicleTypeData = await fetchVehicleType(vehicleTypeId);
          if (vehicleTypeData) {
            setExistingVehicleType(vehicleTypeData);
            form.reset(vehicleTypeData);
            if (vehicleTypeData.name) {
              setEntityLabel(vehicleTypeData.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load vehicle type data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          name: initialData.name || '',
          capacity: initialData.capacity?.toString() || '',
          type: initialData.type || 'FlatBed',
        });
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadVehicleType();
    return () => setEntityLabel(null);
  }, [isEditMode, vehicleTypeId, setEntityLabel]);

  async function onSubmit(data: VehicleTypeFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        capacity: parseFloat(data.capacity),
        type: data.type,
      };

      if (isEditMode) {
        if (!vehicleTypeId) throw new Error('Vehicle type ID is required');
        await updateVehicleType(vehicleTypeId, payload);
      } else {
        await createVehicleType(payload);
      }

      toast({
        title: isEditMode ? 'Vehicle Type Updated' : 'Vehicle Type Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} vehicle type ${data.name}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/config/vehicle-types');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save vehicle type',
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
              <HugeiconsIcon icon={ShippingTruck02Icon} className="h-5 w-5 text-primary" />
              Vehicle Type Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update vehicle type details and specifications'
                : 'Add a new vehicle type with name, capacity, and category'}
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
                    <Input placeholder="e.g., 4T Flat Bed" {...field} data-testid="input-name" />
                  </FormControl>
                  <FormDescription>The display name for this vehicle type</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity (Tons)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 4.5"
                        {...field}
                        value={field.value || ''}
                        data-testid="input-capacity"
                      />
                    </FormControl>
                    <FormDescription>Vehicle capacity in tons</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-type">
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {VEHICLE_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Vehicle type category</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                setLocation('/config/vehicle-types');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="button-save-vehicle-type">
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {isEditMode ? 'Update Vehicle Type' : 'Create Vehicle Type'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
