import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import {
  IdentityCardIcon,
  Location03Icon,
  PackageIcon,
  ShippingTruck02Icon,
  Wrench01Icon,
  Loading01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import {
  fetchCustomers,
  fetchContracts,
  fetchLocations,
  fetchDrivers,
  fetchOrder,
  createOrder,
  updateOrder,
  fetchCustomerRoutes,
} from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';
import { usePaginatedVehicles } from '@/hooks/use-paginated-vehicles';
import { PaginatedCommand } from '@/components/ui/paginated-command';

const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  contractId: z.string().optional(),
  fromId: z.string().min(1, 'From location is required'),
  toId: z.string().min(1, 'To location is required'),
  weight: z.string().min(1, 'Weight is required'),
  volume: z.string().min(1, 'Volume is required'),
  value: z.string().min(1, 'Value is required'),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  attachmentId: z.string().min(1, 'Attachment is required'),
  driverId: z.string().min(1, 'Driver is required'),
  cargoDescription: z.string().min(1, 'Cargo description is required'),
  startKms: z.string().min(1, 'Start KMs is required'),
  etaDate: z.string().optional(),
  etaTime: z.string().optional(),
  requestedDate: z.string().optional(),
  requestedTime: z.string().optional(),
  arrivalAtLoading: z.string().optional(),
  completedLoading: z.string().optional(),
  dispatchFromLoading: z.string().optional(),
  arrivalAtOffloading: z.string().optional(),
  completedUnloading: z.string().optional(),
  remarks: z.string().optional(),
  recipientAcknowledgment: z.enum(['Good', 'Fully Received', 'Broken', 'Partially']).optional(),
  bookingNumber: z.string().optional(),
  vesselName: z.string().optional(),
  croNumber: z.string().optional(),
  customerContact: z.string().optional(),
  transporter: z.string().optional(),
  portOfLoading: z.string().optional(),
  shippingLine: z.string().optional(),
  containerNumber: z.string().optional(),
  containerSize: z.string().optional(),
  weightUom: z.string().optional(),
  tareWeight: z.string().optional(),
  trailerNumber: z.string().optional(),
  accessoryIds: z.array(z.string()).optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  initialData?: any;
  isEditMode?: boolean;
  orderId?: string;
  onComplete?: () => void;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Customer & Route',
    icon: IdentityCardIcon,
    description: 'Select customer and route',
    fields: ['customerId', 'fromId', 'toId'],
  },
  {
    number: 2,
    title: 'Cargo Details',
    icon: PackageIcon,
    description: 'Cargo information and tracking',
    fields: ['weight', 'volume', 'value', 'cargoDescription'],
  },
  {
    number: 3,
    title: 'Assignment',
    icon: ShippingTruck02Icon,
    description: 'Assign driver, vehicle, and status',
    fields: ['vehicleId', 'attachmentId', 'driverId', 'startKms'],
  },
  {
    number: 4,
    title: 'Additional Details',
    icon: File01Icon,
    description: 'Requested dates and remarks',
    fields: [],
  },
];

export function OrderForm({
  initialData,
  isEditMode = false,
  orderId,
  onComplete,
}: OrderFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [customerRoutes, setCustomerRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [existingOrder, setExistingOrder] = useState<any>(null);

  // Paginated vehicle hooks
  const vehiclesData = usePaginatedVehicles({ type: 'Vehicle' });
  const attachmentsData = usePaginatedVehicles({ type: 'Attachment' });
  const accessoriesData = usePaginatedVehicles({ type: 'Accessory' });
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [accessoryOpen, setAccessoryOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerId: '',
      contractId: '',
      fromId: '',
      toId: '',
      weight: '',
      volume: '',
      value: '',
      vehicleId: '',
      attachmentId: '',
      driverId: '',
      cargoDescription: '',
      startKms: '',
      etaDate: '',
      etaTime: '',
      requestedDate: '',
      requestedTime: '',
      arrivalAtLoading: '',
      completedLoading: '',
      dispatchFromLoading: '',
      arrivalAtOffloading: '',
      completedUnloading: '',
      remarks: '',
      recipientAcknowledgment: undefined,
      bookingNumber: '',
      vesselName: '',
      croNumber: '',
      customerContact: '',
      transporter: '',
      portOfLoading: '',
      shippingLine: '',
      containerNumber: '',
      containerSize: '',
      weightUom: '',
      tareWeight: '',
      trailerNumber: '',
      accessoryIds: [],
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [customersData, contractsData, locationsData, driversData] = await Promise.all([
          fetchCustomers(),
          fetchContracts(),
          fetchLocations(),
          fetchDrivers(),
        ]);
        setCustomers(customersData);
        setAllContracts(contractsData);
        setLocations(locationsData);
        setDrivers(driversData);

        if (isEditMode && orderId) {
          const orderData = await fetchOrder(orderId);
          if (orderData) {
            setExistingOrder(orderData);
            setSelectedCustomerId(orderData.customerId);
            form.reset({
              customerId: orderData.customerId || '',
              contractId: orderData.contractId || '',
              fromId: orderData.fromId || '',
              toId: orderData.toId || '',
              weight: orderData.weight?.toString() || '',
              volume: orderData.volume?.toString() || '',
              value: orderData.value?.toString() || '',
              vehicleId: orderData.vehicleId || '',
              attachmentId: orderData.attachmentId || '',
              driverId: orderData.driverId || '',
              cargoDescription: orderData.cargoDescription || '',
              startKms: orderData.startKms?.toString() || '',
              etaDate: orderData.eta ? new Date(orderData.eta).toISOString().slice(0, 10) : '',
              etaTime: orderData.eta ? new Date(orderData.eta).toTimeString().slice(0, 5) : '',
              requestedDate: orderData.requestedDate
                ? new Date(orderData.requestedDate).toISOString().slice(0, 10)
                : '',
              requestedTime: orderData.requestedTime || '',
              arrivalAtLoading: orderData.arrivalAtLoading
                ? new Date(orderData.arrivalAtLoading).toISOString().slice(0, 16)
                : '',
              completedLoading: orderData.completedLoading
                ? new Date(orderData.completedLoading).toISOString().slice(0, 16)
                : '',
              dispatchFromLoading: orderData.dispatchFromLoading
                ? new Date(orderData.dispatchFromLoading).toISOString().slice(0, 16)
                : '',
              arrivalAtOffloading: orderData.arrivalAtOffloading
                ? new Date(orderData.arrivalAtOffloading).toISOString().slice(0, 16)
                : '',
              completedUnloading: orderData.completedUnloading
                ? new Date(orderData.completedUnloading).toISOString().slice(0, 16)
                : '',
              remarks: orderData.remarks || '',
              recipientAcknowledgment: orderData.recipientAcknowledgment || undefined,
              bookingNumber: orderData.bookingNumber || '',
              vesselName: orderData.vesselName || '',
              croNumber: orderData.croNumber || '',
              customerContact: orderData.customerContact || '',
              transporter: orderData.transporter || '',
              portOfLoading: orderData.portOfLoading || '',
              shippingLine: orderData.shippingLine || '',
              containerNumber: orderData.containerNumber || '',
              containerSize: orderData.containerSize || '',
              weightUom: orderData.weightUom || '',
              tareWeight: orderData.tareWeight?.toString() || '',
              trailerNumber: orderData.trailerNumber || '',
              accessoryIds: (orderData.accessories || []).map((a: any) => a.id) || [],
            });

            // Ensure selected vehicles/attachments/accessories are loaded
            if (orderData.vehicleId) {
              vehiclesData.ensureVehicleLoaded(orderData.vehicleId);
            }
            if ((orderData as any).attachmentId) {
              attachmentsData.ensureVehicleLoaded((orderData as any).attachmentId);
            }
            if (orderData.accessories && Array.isArray(orderData.accessories)) {
              orderData.accessories.forEach((acc: any) => {
                accessoriesData.ensureVehicleLoaded(acc.id);
              });
            }

            if (orderData.orderNo) {
              setEntityLabel(orderData.orderNo);
            }
            // In edit mode, allow navigation to all steps
            setMaxStepReached(STEPS.length);
          }
        } else if (initialData) {
          form.reset({
            ...initialData,
            weight: initialData.weight?.toString() || '',
            volume: initialData.volume?.toString() || '',
          });
          if (initialData.customerId) {
            setSelectedCustomerId(initialData.customerId);
          }
          if (initialData.orderNo) {
            setEntityLabel(initialData.orderNo);
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
  }, [isEditMode, orderId, setEntityLabel]);

  useEffect(() => {
    if (selectedCustomerId) {
      const filtered = allContracts.filter((c: any) => c.customerId === selectedCustomerId);
      setContracts(filtered);

      async function loadCustomerRoutes() {
        try {
          const routes = await fetchCustomerRoutes(selectedCustomerId);
          setCustomerRoutes(routes);
        } catch (error: any) {
          console.error('Failed to load customer routes:', error);
          setCustomerRoutes([]);
        }
      }
      loadCustomerRoutes();
    } else {
      setContracts([]);
      setCustomerRoutes([]);
    }
  }, [selectedCustomerId, allContracts]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    form.setValue('customerId', customerId);
    form.setValue('contractId', '');
    form.setValue('fromId', '');
    form.setValue('toId', '');
  };

  const availableFromLocations =
    customerRoutes.length > 0
      ? locations.filter((loc: any) => customerRoutes.some((route: any) => route.fromId === loc.id))
      : locations;

  const availableToLocations = (() => {
    const fromId = form.watch('fromId');
    if (!fromId || customerRoutes.length === 0) {
      return locations;
    }
    return locations.filter((loc: any) =>
      customerRoutes.some((route: any) => route.fromId === fromId && route.toId === loc.id),
    );
  })();

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentStepData = STEPS[step - 1];
    if (!currentStepData?.fields) return;
    const isValid = await form.trigger(currentStepData.fields as any);
    if (isValid && step < STEPS.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      setMaxStepReached((prev) => Math.max(prev, nextStep));
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

  async function onSubmit(values: OrderFormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        customerId: values.customerId,
        fromId: values.fromId,
        toId: values.toId,
        contractId: values.contractId && values.contractId.trim() ? values.contractId : undefined,
        weight: parseFloat(values.weight),
        volume: parseFloat(values.volume),
        value: parseFloat(values.value),
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        cargoDescription: values.cargoDescription.trim(),
        startKms: values.startKms ? parseInt(values.startKms) : undefined,
        eta:
          values.etaDate && values.etaTime
            ? new Date(`${values.etaDate}T${values.etaTime}`).toISOString()
            : undefined,
        requestedDate: values.requestedDate
          ? new Date(values.requestedDate).toISOString()
          : undefined,
        requestedTime:
          values.requestedTime && values.requestedTime.trim() ? values.requestedTime : undefined,
        arrivalAtLoading: values.arrivalAtLoading
          ? new Date(values.arrivalAtLoading).toISOString()
          : undefined,
        completedLoading: values.completedLoading
          ? new Date(values.completedLoading).toISOString()
          : undefined,
        dispatchFromLoading: values.dispatchFromLoading
          ? new Date(values.dispatchFromLoading).toISOString()
          : undefined,
        arrivalAtOffloading: values.arrivalAtOffloading
          ? new Date(values.arrivalAtOffloading).toISOString()
          : undefined,
        completedUnloading: values.completedUnloading
          ? new Date(values.completedUnloading).toISOString()
          : undefined,
        remarks: values.remarks && values.remarks.trim() ? values.remarks : undefined,
        recipientAcknowledgment:
          values.recipientAcknowledgment && values.recipientAcknowledgment.trim()
            ? values.recipientAcknowledgment
            : undefined,
        bookingNumber:
          values.bookingNumber && values.bookingNumber.trim() ? values.bookingNumber : undefined,
        vesselName: values.vesselName && values.vesselName.trim() ? values.vesselName : undefined,
        croNumber: values.croNumber && values.croNumber.trim() ? values.croNumber : undefined,
        customerContact:
          values.customerContact && values.customerContact.trim()
            ? values.customerContact
            : undefined,
        transporter:
          values.transporter && values.transporter.trim() ? values.transporter : undefined,
        portOfLoading:
          values.portOfLoading && values.portOfLoading.trim() ? values.portOfLoading : undefined,
        shippingLine:
          values.shippingLine && values.shippingLine.trim() ? values.shippingLine : undefined,
        containerNumber:
          values.containerNumber && values.containerNumber.trim()
            ? values.containerNumber
            : undefined,
        containerSize:
          values.containerSize && values.containerSize.trim() ? values.containerSize : undefined,
        weightUom: values.weightUom && values.weightUom.trim() ? values.weightUom : undefined,
        tareWeight: values.tareWeight ? parseFloat(values.tareWeight) : undefined,
        trailerNumber:
          values.trailerNumber && values.trailerNumber.trim() ? values.trailerNumber : undefined,
        accessoryIds:
          values.accessoryIds && values.accessoryIds.length > 0 ? values.accessoryIds : undefined,
      };

      payload.attachmentId = values.attachmentId.trim();

      if ('status' in payload) {
        delete payload.status;
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined || payload[key] === '' || payload[key] === null) {
          delete payload[key];
        }
      });

      if (isEditMode) {
        if (!orderId) throw new Error('Order ID is required');
        await updateOrder(orderId, payload);
        toast({
          title: 'Order Updated',
          description: 'Successfully updated order',
        });
      } else {
        await createOrder(payload);
        toast({
          title: 'Order Created',
          description: 'Successfully created order',
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
          submitLabel={isEditMode ? 'Update Order' : 'Create Order'}
          submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
        >
          {step === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => {
                  const selectedCustomer = customers.find((c: any) => c.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                              data-testid="select-customer"
                            >
                              {selectedCustomer ? selectedCustomer.name : 'Select customer'}
                              <HugeiconsIcon
                                icon={IdentityCardIcon}
                                className="ml-2 h-4 w-4 shrink-0 opacity-50"
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search customers by name, CR number, or VAT number..." />
                            <CommandList>
                              <CommandEmpty>No customers found.</CommandEmpty>
                              <CommandGroup>
                                {customers.map((customer: any) => (
                                  <CommandItem
                                    key={customer.id}
                                    value={`${customer.name || ''} ${customer.crNo || ''} ${customer.vatNo || ''}`}
                                    onSelect={() => {
                                      handleCustomerChange(customer.id);
                                      setCustomerOpen(false);
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span>{customer.name}</span>
                                      {(customer.crNo || customer.vatNo) && (
                                        <span className="text-xs text-muted-foreground">
                                          {customer.crNo && `CR: ${customer.crNo}`}
                                          {customer.crNo && customer.vatNo && ' • '}
                                          {customer.vatNo && `VAT: ${customer.vatNo}`}
                                        </span>
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {selectedCustomerId && customerRoutes.length === 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  No specific routes configured for this customer. You can select any location from
                  the database.
                </div>
              )}

              {selectedCustomerId && customerRoutes.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                  {customerRoutes.length} route{customerRoutes.length !== 1 ? 's' : ''} available
                  for this customer
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromId"
                  render={({ field }) => {
                    const selectedFromLocation = availableFromLocations.find(
                      (loc: any) => loc.id === field.value,
                    );
                    return (
                      <FormItem>
                        <FormLabel>From *</FormLabel>
                        <Popover open={fromOpen} onOpenChange={setFromOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                disabled={!selectedCustomerId}
                                data-testid="select-from-location"
                              >
                                {selectedFromLocation
                                  ? `${selectedFromLocation.name}${selectedFromLocation.code ? ` (${selectedFromLocation.code})` : ''}`
                                  : 'Select origin'}
                                <HugeiconsIcon
                                  icon={Location03Icon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search locations by name or code..." />
                              <CommandList>
                                <CommandEmpty>No locations found.</CommandEmpty>
                                <CommandGroup>
                                  {availableFromLocations.map((location: any) => (
                                    <CommandItem
                                      key={location.id}
                                      value={`${location.name || ''} ${location.code || ''}`}
                                      onSelect={() => {
                                        field.onChange(location.id);
                                        form.setValue('toId', '');
                                        setFromOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span>
                                          {location.name}
                                          {location.code && ` (${location.code})`}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="toId"
                  render={({ field }) => {
                    const selectedToLocation = availableToLocations.find(
                      (loc: any) => loc.id === field.value,
                    );
                    return (
                      <FormItem>
                        <FormLabel>To *</FormLabel>
                        <Popover open={toOpen} onOpenChange={setToOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                                disabled={!form.watch('fromId')}
                                data-testid="select-to-location"
                              >
                                {selectedToLocation
                                  ? `${selectedToLocation.name}${selectedToLocation.code ? ` (${selectedToLocation.code})` : ''}`
                                  : !form.watch('fromId')
                                    ? 'Select origin first'
                                    : 'Select destination'}
                                <HugeiconsIcon
                                  icon={Location03Icon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search locations by name or code..." />
                              <CommandList>
                                <CommandEmpty>No locations found.</CommandEmpty>
                                <CommandGroup>
                                  {availableToLocations.map((location: any) => (
                                    <CommandItem
                                      key={location.id}
                                      value={`${location.name || ''} ${location.code || ''}`}
                                      onSelect={() => {
                                        field.onChange(location.id);
                                        setToOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span>
                                          {location.name}
                                          {location.code && ` (${location.code})`}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="cargoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Description *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the cargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1000"
                          {...field}
                          data-testid="input-weight"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (m³) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50"
                          {...field}
                          data-testid="input-volume"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value (SAR) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50000"
                          {...field}
                          data-testid="input-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => {
                    const selectedVehicle = vehiclesData.vehicles.find(
                      (v: any) => v.id === field.value,
                    );
                    return (
                      <FormItem>
                        <FormLabel>Vehicle *</FormLabel>
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
                                    ? `${selectedVehicle.name || 'Unnamed'} - ${selectedVehicle.plateNumber || 'N/A'}`
                                    : 'Select vehicle'}
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
                                    <span>
                                      {vehicle.name || 'Unnamed'} - {vehicle.plateNumber || 'N/A'}
                                    </span>
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
                                form.setValue(field.name as any, '');
                              }}
                            >
                              ×
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="startKms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start KMs *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="attachmentId"
                render={({ field }) => {
                  const selectedAttachment = attachmentsData.vehicles.find(
                    (v: any) => v.id === field.value,
                  );
                  return (
                    <FormItem>
                      <FormLabel>Attachment *</FormLabel>
                      <div className="flex gap-2">
                        <Popover open={attachmentOpen} onOpenChange={setAttachmentOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="flex-1 justify-between"
                                data-testid="select-attachment"
                              >
                                {selectedAttachment
                                  ? `${selectedAttachment.name || 'Unnamed'} - ${selectedAttachment.chassisNo || 'N/A'}`
                                  : 'Select attachment'}
                                <HugeiconsIcon
                                  icon={ShippingTruck02Icon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <PaginatedCommand
                              items={attachmentsData.vehicles}
                              isLoading={attachmentsData.isLoading}
                              hasMore={attachmentsData.hasMore}
                              onLoadMore={attachmentsData.loadMore}
                              onSelect={(attachment) => {
                                field.onChange(attachment.id);
                                setAttachmentOpen(false);
                              }}
                              searchValue={attachmentsData.searchQuery}
                              onSearchChange={attachmentsData.setSearchQuery}
                              placeholder="Search attachments by door no, asset no, name, or chassis no..."
                              emptyMessage="No attachments found."
                              renderItem={(attachment) => (
                                <div className="flex flex-col">
                                  <span>
                                    {attachment.name || 'Unnamed'} - {attachment.chassisNo || 'N/A'}
                                  </span>
                                  {(attachment.doorNo || attachment.asset) && (
                                    <span className="text-xs text-muted-foreground">
                                      {[attachment.doorNo, attachment.asset]
                                        .filter(Boolean)
                                        .join(' / ')}
                                    </span>
                                  )}
                                </div>
                              )}
                              getItemValue={(attachment) =>
                                `${attachment.doorNo || ''} ${attachment.asset || ''} ${attachment.name || ''} ${attachment.chassisNo || ''}`
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
                              form.setValue(field.name as any, '');
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="accessoryIds"
                render={({ field }) => {
                  const selectedAccessories = accessoriesData.vehicles.filter((v: any) =>
                    field.value?.includes(v.id),
                  );
                  return (
                    <FormItem>
                      <FormLabel>Accessories</FormLabel>
                      <div className="flex gap-2">
                        <Popover open={accessoryOpen} onOpenChange={setAccessoryOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="flex-1 justify-between"
                                data-testid="select-accessories"
                              >
                                {selectedAccessories.length > 0
                                  ? `${selectedAccessories.length} accessory${selectedAccessories.length !== 1 ? 'ies' : ''} selected`
                                  : 'Select accessories (optional)'}
                                <HugeiconsIcon
                                  icon={Wrench01Icon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <PaginatedCommand
                              items={accessoriesData.vehicles}
                              isLoading={accessoriesData.isLoading}
                              hasMore={accessoriesData.hasMore}
                              onLoadMore={accessoriesData.loadMore}
                              onSelect={(accessory) => {
                                const currentValue = field.value || [];
                                const isSelected = currentValue.includes(accessory.id);
                                const newValue = isSelected
                                  ? currentValue.filter((id: string) => id !== accessory.id)
                                  : [...currentValue, accessory.id];
                                field.onChange(newValue);
                              }}
                              searchValue={accessoriesData.searchQuery}
                              onSearchChange={accessoriesData.setSearchQuery}
                              placeholder="Search accessories by name, door no, or plate number..."
                              emptyMessage="No accessories found."
                              renderItem={(accessory) => {
                                const isSelected = field.value?.includes(accessory.id);
                                return (
                                  <div className="flex items-center gap-2 flex-1">
                                    <div
                                      className={`h-4 w-4 border rounded flex items-center justify-center ${
                                        isSelected ? 'bg-primary border-primary' : ''
                                      }`}
                                    >
                                      {isSelected && <span className="text-white text-xs">✓</span>}
                                    </div>
                                    <div className="flex flex-col flex-1">
                                      <span>
                                        {accessory.name || 'Unnamed'} -{' '}
                                        {accessory.plateNumber || 'N/A'}
                                      </span>
                                      {(accessory.doorNo || accessory.asset) && (
                                        <span className="text-xs text-muted-foreground">
                                          {[accessory.doorNo, accessory.asset]
                                            .filter(Boolean)
                                            .join(' / ')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              }}
                              getItemValue={(accessory) =>
                                `${accessory.doorNo || ''} ${accessory.name || ''} ${accessory.plateNumber || ''}`
                              }
                            />
                          </PopoverContent>
                        </Popover>
                        {field.value && field.value.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              field.onChange([]);
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      {selectedAccessories.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedAccessories.map((accessory: any) => (
                            <Badge key={accessory.id} variant="secondary" className="text-xs">
                              {accessory.name || 'Unnamed'}
                              {accessory.plateNumber && ` - ${accessory.plateNumber}`}
                              <button
                                type="button"
                                onClick={() => {
                                  const newValue =
                                    field.value?.filter((id: string) => id !== accessory.id) || [];
                                  field.onChange(newValue);
                                }}
                                className="ml-2 hover:text-destructive"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormDescription>Optional - Select multiple accessories</FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => {
                  const selectedDriver = drivers.find((d: any) => d.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Driver *</FormLabel>
                      <div className="flex gap-2">
                        <Popover open={driverOpen} onOpenChange={setDriverOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="flex-1 justify-between"
                                data-testid="select-driver"
                              >
                                <span className="flex items-center gap-2 flex-1 justify-start">
                                  {selectedDriver ? (
                                    <>
                                      <span>{selectedDriver.name}</span>
                                      {selectedDriver.ownershipType === 'Outsourced' && (
                                        <Badge variant="destructive" className="text-xs">
                                          Outsourced
                                        </Badge>
                                      )}
                                      {selectedDriver.mobile && (
                                        <span className="text-muted-foreground text-sm">
                                          ({selectedDriver.mobile})
                                        </span>
                                      )}
                                    </>
                                  ) : (
                                    'Select driver'
                                  )}
                                </span>
                                <HugeiconsIcon
                                  icon={IdentityCardIcon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search drivers by name, mobile, or iqama number..." />
                              <CommandList>
                                <CommandEmpty>No drivers found.</CommandEmpty>
                                <CommandGroup>
                                  {drivers.map((driver: any) => (
                                    <CommandItem
                                      key={driver.id}
                                      value={`${driver.name || ''} ${driver.mobile || ''} ${driver.iqamaNumber || ''}`}
                                      onSelect={() => {
                                        field.onChange(driver.id);
                                        setDriverOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span>{driver.name}</span>
                                          {driver.ownershipType === 'Outsourced' && (
                                            <Badge variant="destructive" className="text-xs">
                                              Outsourced
                                            </Badge>
                                          )}
                                        </div>
                                        {driver.mobile && (
                                          <span className="text-xs text-muted-foreground">
                                            {driver.mobile}
                                          </span>
                                        )}
                                        {driver.ownershipType === 'Outsourced' &&
                                          driver.outsourcedCompanyName && (
                                            <span className="text-xs text-muted-foreground">
                                              {driver.outsourcedCompanyName}
                                            </span>
                                          )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              field.onChange('');
                              form.setValue(field.name as any, '');
                            }}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Requested Details</h4>
                <FormField
                  control={form.control}
                  name="requestedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          dateValue={field.value}
                          timeValue={form.watch('requestedTime')}
                          onDateChange={(value) => {
                            field.onChange(value);
                          }}
                          onTimeChange={(value) => {
                            form.setValue('requestedTime', value);
                          }}
                          datePlaceholder="Pick a date"
                          timePlaceholder="HH:mm"
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">ETA (Estimated Time of Arrival)</h4>
                <FormField
                  control={form.control}
                  name="etaDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ETA Date & Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          dateValue={field.value}
                          timeValue={form.watch('etaTime')}
                          onDateChange={(value) => {
                            field.onChange(value);
                          }}
                          onTimeChange={(value) => {
                            form.setValue('etaTime', value);
                          }}
                          datePlaceholder="Pick a date"
                          timePlaceholder="HH:mm"
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes or exceptions" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
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
