import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import { IdentityCardIcon, Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { fetchDriver, createDriver, updateDriver } from '@/lib/api-helpers';

const driverFormSchema = z.object({
  badgeNo: z.string().max(50).optional(),
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(100),
  iqamaNumber: z.string().min(1, 'Iqama number is required').regex(/^\d{10}$/, 'Iqama number must be exactly 10 digits'),
  position: z.enum(['HeavyDutyDriver', 'MediumTruckDriver', 'BusDriver']).optional(),
  sponsorship: z.string().max(200).optional(),
  nationality: z.string().min(1, 'Nationality is required'),
  driverCardExpiry: z.string().optional(),
  mobile: z.string().max(20).optional(),
  preferredLanguage: z.string().optional(),
  status: z.enum(['Active', 'OnTrip', 'Vacation', 'Inactive']).optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

const NATIONALITIES = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Egypt',
  'Jordan',
  'Lebanon',
  'Syria',
  'Iraq',
  'Yemen',
  'Sudan',
  'Morocco',
  'Tunisia',
  'Algeria',
  'Libya',
  'Pakistan',
  'India',
  'Bangladesh',
  'Philippines',
  'Indonesia',
  'Sri Lanka',
  'Nepal',
  'Other',
];

const LANGUAGES = [
  'Arabic',
  'English',
  'Urdu',
  'Hindi',
  'Tagalog',
  'Bengali',
  'Tamil',
  'Sinhala',
  'Nepali',
  'Other',
];

interface DriverFormProps {
  initialData?: any;
  isEditMode?: boolean;
  driverId?: string;
  onComplete?: () => void;
}

export function DriverForm({ initialData, isEditMode = false, driverId, onComplete }: DriverFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDriver, setExistingDriver] = useState<any>(null);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      badgeNo: '',
      name: '',
      iqamaNumber: '',
      position: undefined,
      sponsorship: '',
      nationality: '',
      driverCardExpiry: '',
      mobile: '',
      preferredLanguage: '',
      status: 'Active',
    },
  });

  useEffect(() => {
    async function loadDriver() {
      if (isEditMode && driverId) {
        setIsLoading(true);
        try {
          const driverData = await fetchDriver(driverId);
          if (driverData) {
            setExistingDriver(driverData);
            form.reset(driverData);
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load driver data',
  });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset(initialData);
      }
    }
    loadDriver();
    return () => setEntityLabel(null);
  }, [isEditMode, driverId, setEntityLabel]);

  async function onSubmit(values: DriverFormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        badgeNo: values.badgeNo || undefined,
        name: values.name,
        iqamaNumber: values.iqamaNumber,
        position: values.position || undefined,
        sponsorship: values.sponsorship || undefined,
        nationality: values.nationality,
        driverCardExpiry: values.driverCardExpiry || undefined,
        mobile: values.mobile || undefined,
        preferredLanguage: values.preferredLanguage || undefined,
        status: values.status || 'Active',
      };

      if (isEditMode) {
        if (!driverId) throw new Error('Driver ID is required');
        await updateDriver(driverId, payload);
        toast({
          title: 'Driver Updated',
          description: `Successfully updated driver ${values.name}`,
        });
      } else {
        await createDriver(payload);
        toast({
          title: 'Driver Created',
          description: `Successfully created driver ${values.name}`,
        });
      }
      if (onComplete) onComplete();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <HugeiconsIcon icon={IdentityCardIcon} className="h-5 w-5 text-primary" />
              Driver Information
            </h2>
            <p className="text-muted-foreground mt-1">Enter driver details and contact information</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="badgeNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Badge Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 7706" {...field} data-testid="input-badge-no" />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ahmed Ali" {...field} data-testid="input-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="iqamaNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Iqama Number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      maxLength={10}
                      {...field}
                      data-testid="input-iqama-number"
                    />
                  </FormControl>
                  <FormDescription>Exactly 10 digits</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationality *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-nationality">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NATIONALITIES.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-position">
                        <SelectValue placeholder="Select position (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="HeavyDutyDriver">Heavy Duty Driver</SelectItem>
                      <SelectItem value="MediumTruckDriver">Medium Truck Driver</SelectItem>
                      <SelectItem value="BusDriver">Bus Driver</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sponsorship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsorship</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Company Name" {...field} data-testid="input-sponsorship" />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="driverCardExpiry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Driver Card Expiry Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-driver-card-expiry" />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+966501234567" {...field} data-testid="input-mobile" />
                  </FormControl>
                  <FormDescription>Optional - Include country code</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger data-testid="select-language">
                        <SelectValue placeholder="Select language (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LANGUAGES.map((language) => (
                        <SelectItem key={language} value={language}>
                          {language}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="OnTrip">On Trip</SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="submit"
            data-testid="button-save-driver"
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isEditMode ? 'Update Driver' : 'Create Driver'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
