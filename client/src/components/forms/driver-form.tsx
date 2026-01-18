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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  IdentityCardIcon,
  Orbit01Icon,
  ShippingTruck02Icon,
  Call02Icon,
  Settings01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { fetchDriver, createDriver, updateDriver } from '@/lib/api-helpers';
import { usePaginatedVehicles } from '@/hooks/use-paginated-vehicles';
import { PaginatedCommand } from '@/components/ui/paginated-command';
import { MultiStepForm, type Step } from './multi-step-form';

const driverFormSchema = z
  .object({
    badgeNo: z.string().max(50).optional(),
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100),
    iqamaNumber: z
      .string()
      .min(1, 'Iqama number is required')
      .regex(/^\d{10}$/, 'Iqama number must be exactly 10 digits'),
    position: z.enum(['HeavyDutyDriver', 'MediumTruckDriver', 'BusDriver']).optional(),
    sponsorship: z.string().max(200).optional(),
    nationality: z.string().min(1, 'Nationality is required'),
    driverCardExpiry: z.string().optional(),
    mobile: z.string().max(20).optional(),
    preferredLanguage: z.string().optional(),
    ownershipType: z.enum(['CompanyOwned', 'Outsourced']).optional(),
    outsourcedCompanyName: z.string().max(200).optional(),
    status: z.enum(['Active', 'OnTrip', 'Vacation', 'Inactive']).optional(),
    taamId: z.string().max(50).optional(),
    vehicleId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.ownershipType === 'Outsourced' && !data.outsourcedCompanyName) {
        return false;
      }
      return true;
    },
    {
      message: 'Outsourced company name is required when ownership type is Outsourced',
      path: ['outsourcedCompanyName'],
    },
  );

type DriverFormValues = z.infer<typeof driverFormSchema>;

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Basic Information',
    icon: IdentityCardIcon,
    description: 'Driver name, identification and basic details',
    fields: ['badgeNo', 'name', 'iqamaNumber', 'nationality', 'position', 'sponsorship'],
  },
  {
    number: 2,
    title: 'Contact & Details',
    icon: Call02Icon,
    description: 'Contact information and ownership details',
    fields: ['mobile', 'preferredLanguage', 'driverCardExpiry', 'ownershipType', 'outsourcedCompanyName'],
  },
  {
    number: 3,
    title: 'Assignment & Status',
    icon: Settings01Icon,
    description: 'Vehicle assignment and driver status',
    fields: ['taamId', 'vehicleId', 'status'],
  },
];

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

export function DriverForm({
  initialData,
  isEditMode = false,
  driverId,
  onComplete,
}: DriverFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDriver, setExistingDriver] = useState<any>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const vehiclesData = usePaginatedVehicles({ type: 'Vehicle' });

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
      ownershipType: 'CompanyOwned',
      outsourcedCompanyName: '',
      status: 'Active',
      taamId: '',
      vehicleId: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (isEditMode && driverId) {
          console.log('Loading driver data for ID:', driverId);
          const driverData = await fetchDriver(driverId);
          console.log('Fetched driver data:', driverData);
          if (driverData) {
            setExistingDriver(driverData);
            const formData = {
              badgeNo: driverData.badgeNo || '',
              name: driverData.name || '',
              iqamaNumber: driverData.iqamaNumber || '',
              position: driverData.position || undefined,
              sponsorship: driverData.sponsorship || '',
              nationality: driverData.nationality || '',
              driverCardExpiry: driverData.driverCardExpiry || '',
              mobile: driverData.mobile || '',
              preferredLanguage: driverData.preferredLanguage || '',
              ownershipType: driverData.ownershipType || 'CompanyOwned',
              outsourcedCompanyName: driverData.outsourcedCompanyName || '',
              status: driverData.status || 'Active',
              taamId: driverData.taamId || '',
              vehicleId: driverData.vehicleId || '',
            };
            console.log('Resetting form with data:', formData);
            form.reset(formData);
            // Log form values after reset to verify
            setTimeout(() => {
              console.log('Form values after reset:', form.getValues());
            }, 100);
            // Ensure the selected vehicle is loaded
            if (driverData.vehicleId) {
              vehiclesData.ensureVehicleLoaded(driverData.vehicleId);
            }
            if (driverData.name) {
              setEntityLabel(driverData.name);
            }
          } else {
            console.warn('No driver data returned from API');
          }
        } else if (initialData) {
          form.reset({
            badgeNo: initialData.badgeNo || '',
            name: initialData.name || '',
            iqamaNumber: initialData.iqamaNumber || '',
            position: initialData.position || undefined,
            sponsorship: initialData.sponsorship || '',
            nationality: initialData.nationality || '',
            driverCardExpiry: initialData.driverCardExpiry || '',
            mobile: initialData.mobile || '',
            preferredLanguage: initialData.preferredLanguage || '',
            ownershipType: initialData.ownershipType || 'CompanyOwned',
            outsourcedCompanyName: initialData.outsourcedCompanyName || '',
            status: initialData.status || 'Active',
            taamId: initialData.taamId || '',
            vehicleId: initialData.vehicleId || '',
          });
          if (initialData.vehicleId) {
            vehiclesData.ensureVehicleLoaded(initialData.vehicleId);
          }
          if (initialData.name) {
            setEntityLabel(initialData.name);
          }
        } else {
          setEntityLabel(null);
        }
      } catch (error: any) {
        console.error('Error loading driver data:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Failed to load data',
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
    return () => setEntityLabel(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, driverId, setEntityLabel, toast]);

  // Ensure selected vehicle is loaded when form value changes
  const vehicleId = form.watch('vehicleId');
  useEffect(() => {
    if (vehicleId && !vehiclesData.vehicles.some((v) => v.id === vehicleId)) {
      vehiclesData.ensureVehicleLoaded(vehicleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentStepData = STEPS[step - 1];
    if (!currentStepData?.fields) return;
    const isValid = await form.trigger(currentStepData.fields as any);
    if (isValid && step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

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
        ownershipType: values.ownershipType || 'CompanyOwned',
        outsourcedCompanyName: values.outsourcedCompanyName || undefined,
        status: values.status || 'Active',
        taamId: values.taamId || undefined,
        vehicleId: values.vehicleId || undefined,
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
        description:
          error.response?.data?.message || error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MultiStepForm
          steps={STEPS}
          currentStep={step}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Update Driver' : 'Add Driver'}
          submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
        >
          {step === 1 && (
            <div className="space-y-6">
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
                    <Input
                      placeholder="e.g., Company Name"
                      {...field}
                      data-testid="input-sponsorship"
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ownershipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'CompanyOwned'}>
                    <FormControl>
                      <SelectTrigger data-testid="select-ownership-type">
                        <SelectValue placeholder="Select ownership type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CompanyOwned">Company Owned</SelectItem>
                      <SelectItem value="Outsourced">Outsourced</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outsourcedCompanyName"
              render={({ field }) => {
                const ownershipType = form.watch('ownershipType');
                return (
                  <FormItem>
                    <FormLabel>
                      Outsourced Company Name
                      {ownershipType === 'Outsourced' && (
                        <span className="text-destructive"> *</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., MASADAAR HUMAN RESOURCE SERVICES COMPANY"
                        {...field}
                        disabled={ownershipType !== 'Outsourced'}
                        data-testid="input-outsourced-company"
                      />
                    </FormControl>
                    <FormDescription>
                      {ownershipType === 'Outsourced'
                        ? 'Required for outsourced drivers'
                        : 'Only required for outsourced drivers'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TAAM ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., TAAM123456789"
                          {...field}
                          data-testid="input-taam-id"
                        />
                      </FormControl>
                      <FormDescription>Optional - For tracking traffic violations</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehicleId"
              render={({ field }) => {
                const selectedVehicle = vehiclesData.vehicles.find(
                  (v: any) => v.id === field.value,
                );
                return (
                  <FormItem>
                    <FormLabel>Assigned Vehicle</FormLabel>
                    <div className="flex gap-2">
                      <Popover open={vehicleOpen} onOpenChange={setVehicleOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="flex-1 justify-between"
                              data-testid="select-vehicle"
                            >
                              {selectedVehicle
                                ? `${selectedVehicle.name || 'Unnamed'}${selectedVehicle.plateNumber ? ` - ${selectedVehicle.plateNumber}` : ''}`
                                : 'Select vehicle (optional)'}
                              <HugeiconsIcon
                                icon={ShippingTruck02Icon}
                                className="ml-2 h-4 w-4 shrink-0 opacity-50"
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <PaginatedCommand
                            items={vehiclesData.vehicles}
                            isLoading={vehiclesData.isLoading}
                            hasMore={vehiclesData.hasMore}
                            onLoadMore={vehiclesData.loadMore}
                            onSelect={(vehicle) => {
                              field.onChange(vehicle.id);
                              setVehicleOpen(false);
                            }}
                            searchValue={vehiclesData.searchQuery}
                            onSearchChange={vehiclesData.setSearchQuery}
                            placeholder="Search vehicles by door no, asset no, name, or chassis no..."
                            emptyMessage="No vehicles found."
                            renderItem={(vehicle) => (
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span>
                                    {vehicle.name || 'Unnamed'}{vehicle.plateNumber ? ` - ${vehicle.plateNumber}` : ''}
                                  </span>
                                  {vehicle.isInUse && (
                                    <span className="text-xs bg-red-500/15 text-red-700 dark:text-red-400 px-2 py-0.5 rounded">
                                      In Use
                                    </span>
                                  )}
                                </div>
                                {(vehicle.doorNo || vehicle.asset) && (
                                  <span className="text-xs text-muted-foreground">
                                    {[vehicle.doorNo, vehicle.asset]
                                      .filter(Boolean)
                                      .join(' / ')}
                                  </span>
                                )}
                              </div>
                            )}
                            getItemValue={(vehicle) =>
                              `${vehicle.doorNo || ''} ${vehicle.asset || ''} ${vehicle.name || ''} ${vehicle.chassisNo || ''}`
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            field.onChange('');
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <FormDescription>Optional - Only Vehicle type (not attachments/accessories)</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
          )}
        </MultiStepForm>
      </form>
    </Form>
  );
}
