import { useForm, useFieldArray } from 'react-hook-form';
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
import {
  PlusSignIcon,
  Delete01Icon,
  File01Icon,
  Settings01Icon,
  ShippingTruck02Icon,
  Loading01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  fetchCustomers,
  fetchCreditTerms,
  fetchLocations,
  fetchContract,
  fetchContractRoutes,
  createContract,
  updateContract,
  createContractRoute,
  deleteContractRoute,
} from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';

const VEHICLE_CATEGORIES = [
  'TractorHead',
  'FourXTwoTractorHead',
  'CraneMountedTruck',
  'LightDutyTruck',
  'BoomTruck',
  'DieselTanker',
  'MiniVan',
  'Pickup',
  'SUV',
  'FlatBedTrailer',
  'LowBedTrailer',
  'DryBox',
  'CurtainSide',
  'Reefer',
  'HydraulicWinchWithBox',
  'Forklift',
  'BackhoLoader',
  'RoughTerrainCrane',
  'SkidLoader',
] as const;

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    TractorHead: 'Tractor Head',
    FourXTwoTractorHead: '4X2 Tractor Head',
    CraneMountedTruck: 'Crane Mounted Truck',
    LightDutyTruck: 'Light Duty Truck',
    BoomTruck: 'Boom Truck',
    DieselTanker: 'Diesel Tanker',
    MiniVan: 'Mini Van',
    Pickup: 'Pickup',
    SUV: 'SUV',
    FlatBedTrailer: 'Flat Bed Trailer',
    LowBedTrailer: 'Low Bed Trailer',
    DryBox: 'Dry Box',
    CurtainSide: 'Curtain Side',
    Reefer: 'Reefer',
    HydraulicWinchWithBox: 'Hydraulic Winch With Box',
    Forklift: 'Forklift',
    BackhoLoader: 'Backho Loader',
    RoughTerrainCrane: 'Rough Terrain Crane',
    SkidLoader: 'Skid Loader',
  };
  return labels[category] || category;
};

const routeSchema = z.object({
  fromId: z.string().min(1, 'From location is required'),
  toId: z.string().min(1, 'To location is required'),
  vehicleCategory: z.enum(VEHICLE_CATEGORIES),
  price: z
    .string()
    .min(1, 'Price is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Price must be a valid number',
    ),
});

export const contractFormSchema = z.object({
  contractNumber: z.string().min(1, 'Contract number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  creditTermId: z.string().min(1, 'Credit terms are required'),
  material: z.string().optional().or(z.literal('')),
  bankGuarantee: z.boolean().default(false),
  insurance: z.boolean().default(false),
  maxWaitingHours: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseInt(val)) && parseInt(val) >= 0),
      'Must be a valid number',
    ),
  waitingCharge: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0),
      'Must be a valid number',
    ),
  routes: z.array(routeSchema).optional().default([]),
  status: z.enum(['Draft', 'Active', 'Expired', 'Terminated']).default('Draft'),
});

export type ContractFormValues = z.infer<typeof contractFormSchema>;

interface ContractFormProps {
  initialData?: Partial<ContractFormValues>;
  isEditMode?: boolean;
  contractId?: string;
  onComplete?: () => void;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Contract Info',
    icon: File01Icon,
    description: 'Basic contract details',
    fields: ['contractNumber', 'customerId', 'startDate', 'endDate'],
  },
  {
    number: 2,
    title: 'Terms & Conditions',
    icon: Settings01Icon,
    description: 'Financials and requirements',
    fields: ['creditTermId'],
  },
  {
    number: 3,
    title: 'Routes',
    icon: ShippingTruck02Icon,
    description: 'Service routes and pricing',
    fields: [],
  },
];

export function ContractForm({
  initialData,
  isEditMode = false,
  contractId,
  onComplete,
}: ContractFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [creditTerms, setCreditTerms] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [existingContract, setExistingContract] = useState<any>(null);
  const [existingRoutes, setExistingRoutes] = useState<any[]>([]);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    defaultValues: {
      contractNumber: '',
      customerId: '',
      startDate: '',
      endDate: '',
      creditTermId: '',
      material: '',
      bankGuarantee: false,
      insurance: false,
      maxWaitingHours: '',
      waitingCharge: '',
      routes: [],
      status: 'Draft',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'routes',
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [customersData, creditTermsData, locationsData] = await Promise.all([
          fetchCustomers(),
          fetchCreditTerms(),
          fetchLocations(),
        ]);
        setCustomers(customersData);
        setCreditTerms(creditTermsData);
        setLocations(locationsData);

        if (isEditMode && contractId) {
          const [contractData, routesData] = await Promise.all([
            fetchContract(contractId),
            fetchContractRoutes(contractId),
          ]);
          setExistingContract(contractData);
          setExistingRoutes(routesData);
          if (contractData) {
            form.reset({
              ...contractData,
              routes: routesData || [],
            });
            if (contractData.contractNumber) {
              setEntityLabel(contractData.contractNumber);
            }
            // In edit mode, allow navigation to all steps
            setMaxStepReached(STEPS.length);
          }
        } else if (initialData) {
          form.reset(initialData);
          if (initialData.contractNumber) {
            setEntityLabel(initialData.contractNumber);
          }
        } else {
          setEntityLabel(null);
        }
      } catch (error: any) {
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
  }, [isEditMode, contractId, setEntityLabel]);

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

  const handleStepClick = (stepNumber: number) => {
    // Allow clicking on any step up to the maximum step reached
    if (stepNumber >= 1 && stepNumber <= STEPS.length && stepNumber <= maxStepReached) {
      setStep(stepNumber);
    }
  };

  async function onSubmit(data: ContractFormValues) {
    setIsSubmitting(true);
    try {
      const routes = data.routes || [];
      let createdContractId = contractId;

      const payload = {
        contractNumber: data.contractNumber,
        customerId: data.customerId,
        startDate: data.startDate,
        endDate: data.endDate,
        creditTermId: data.creditTermId,
        material: data.material || undefined,
        bankGuarantee: data.bankGuarantee,
        insurance: data.insurance,
        maxWaitingHours: data.maxWaitingHours ? parseInt(data.maxWaitingHours) : undefined,
        waitingCharge: data.waitingCharge ? parseFloat(data.waitingCharge) : undefined,
        status: data.status,
      };

      if (isEditMode) {
        if (!contractId) throw new Error('Contract ID is required');
        await updateContract(contractId, payload);

        // In edit mode, delete all existing routes first, then create new ones
        if (existingRoutes && existingRoutes.length > 0) {
          // Delete all existing routes
          for (const existingRoute of existingRoutes) {
            try {
              // existingRoute should have an id from the API
              if (existingRoute.id) {
                await deleteContractRoute(contractId, existingRoute.id);
              }
            } catch (error: any) {
              // Log error but continue - route might already be deleted
              console.warn('Failed to delete route:', error);
            }
          }
        }

        // Create new routes from form data
        if (routes.length > 0) {
          for (const route of routes) {
            await createContractRoute(contractId, {
              fromId: route.fromId,
              toId: route.toId,
              vehicleCategory: route.vehicleCategory,
              price: parseFloat(route.price),
            });
          }
        }
      } else {
        const contract = await createContract(payload);
        createdContractId = contract.id;

        // For new contracts, just create routes
        if (routes.length > 0 && createdContractId) {
          for (const route of routes) {
            await createContractRoute(createdContractId, {
              fromId: route.fromId,
              toId: route.toId,
              vehicleCategory: route.vehicleCategory,
              price: parseFloat(route.price),
            });
          }
        }
      }

      toast({
        title: isEditMode ? 'Contract Updated' : 'Contract Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} contract ${data.contractNumber}`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/sales/contracts');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save contract',
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <MultiStepForm
          steps={STEPS}
          currentStep={step}
          maxStepReached={maxStepReached}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          onStepClick={handleStepClick}
          isSubmitting={isSubmitting}
          submitLabel="Save Contract"
          submittingLabel="Saving..."
        >
          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="contractNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Number</FormLabel>
                    <FormControl>
                      <Input placeholder="CNT-001" {...field} data-testid="input-contract-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-customer">
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="creditTermId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Credit Terms *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-credit-terms">
                          <SelectValue placeholder="Select credit terms" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creditTerms?.map((term: any) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="material"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., General Freight"
                        {...field}
                        data-testid="input-material"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxWaitingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Waiting Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 48"
                          {...field}
                          data-testid="input-max-waiting-hours"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waitingCharge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waiting Charge per Hour</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100"
                          {...field}
                          data-testid="input-waiting-charge"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankGuarantee"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel>Bank Guarantee Required</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-bank-guarantee"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insurance"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <FormLabel>Insurance Required</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-insurance"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Define service routes and agreed pricing
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ fromId: '', toId: '', vehicleCategory: 'TractorHead', price: '' })
                  }
                  data-testid="button-add-route"
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                  Add Route
                </Button>
              </div>

              {fields.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Vehicle Type</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-8"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`routes.${index}.fromId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || undefined}
                                    >
                                      <SelectTrigger
                                        data-testid={`select-route-from-${index}`}
                                        className="h-8 text-xs"
                                      >
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {locations?.map((loc: any) => (
                                          <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`routes.${index}.toId`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || undefined}
                                    >
                                      <SelectTrigger
                                        data-testid={`select-route-to-${index}`}
                                        className="h-8 text-xs"
                                      >
                                        <SelectValue placeholder="Select location" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {locations?.map((loc: any) => (
                                          <SelectItem key={loc.id} value={loc.id}>
                                            {loc.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`routes.${index}.vehicleCategory`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value || undefined}
                                    >
                                      <SelectTrigger
                                        data-testid={`select-vehicle-category-${index}`}
                                        className="h-8 text-xs"
                                      >
                                        <SelectValue placeholder="Select category" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {VEHICLE_CATEGORIES.map((category) => (
                                          <SelectItem key={category} value={category}>
                                            {getCategoryLabel(category)}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`routes.${index}.price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="0"
                                      {...field}
                                      data-testid={`input-price-${index}`}
                                      className="h-8 text-xs"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              data-testid={`button-remove-route-${index}`}
                              className="h-8 w-8 p-0"
                            >
                              <HugeiconsIcon
                                icon={Delete01Icon}
                                className="h-4 w-4 text-destructive"
                              />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                  No routes added yet. Click "Add Route" to get started.
                </div>
              )}
            </div>
          )}
        </MultiStepForm>
      </form>
    </Form>
  );
}
