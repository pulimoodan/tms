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
  Loading01Icon,
  File01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  fetchCustomers,
  fetchContracts,
  fetchLocations,
  fetchVehicles,
  fetchDrivers,
  fetchOrder,
  createOrder,
  updateOrder,
  fetchCustomerRoutes,
} from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';

const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  contractId: z.string().optional(),
  fromId: z.string().min(1, 'From location is required'),
  toId: z.string().min(1, 'To location is required'),
  weight: z.string().optional(),
  volume: z.string().optional(),
  value: z.string().optional(),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  attachmentId: z.string().optional(),
  driverId: z.string().min(1, 'Driver is required'),
  cargoDescription: z.string().optional(),
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
    fields: ['weight', 'volume', 'cargoDescription'],
  },
  {
    number: 3,
    title: 'Assignment',
    icon: ShippingTruck02Icon,
    description: 'Assign driver, vehicle, and status',
    fields: ['vehicleId', 'driverId', 'startKms'],
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [customerRoutes, setCustomerRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [existingOrder, setExistingOrder] = useState<any>(null);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
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
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [customersData, contractsData, locationsData, vehiclesData, driversData] =
          await Promise.all([
            fetchCustomers(),
            fetchContracts(),
            fetchLocations(),
            fetchVehicles(),
            fetchDrivers(),
          ]);
        setCustomers(customersData);
        setAllContracts(contractsData);
        setLocations(locationsData);
        setVehicles(vehiclesData);
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
              attachmentId: (orderData as any).attachmentId || '',
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
            });
            if (orderData.orderNo) {
              setEntityLabel(orderData.orderNo);
            }
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
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
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
        weight: values.weight ? parseFloat(values.weight) : undefined,
        volume: values.volume ? parseFloat(values.volume) : undefined,
        value: values.value ? parseFloat(values.value) : undefined,
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        cargoDescription:
          values.cargoDescription && values.cargoDescription.trim()
            ? values.cargoDescription
            : undefined,
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
      };

      if (values.attachmentId && values.attachmentId.trim()) {
        payload.attachmentId = values.attachmentId.trim();
      }

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
          onNext={handleNextStep}
          onPrev={handlePrevStep}
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
                    <FormLabel>Cargo Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the cargo" {...field} />
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
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
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1000"
                          {...field}
                          data-testid="input-weight"
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (m³)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50"
                          {...field}
                          data-testid="input-volume"
                        />
                      </FormControl>
                      <FormDescription>Optional</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Value (SAR)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50000"
                          {...field}
                          data-testid="input-value"
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

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => {
                    const selectedVehicle = vehicles.find((v: any) => v.id === field.value);
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
                                    ? `${selectedVehicle.name || 'Unnamed'} - ${selectedVehicle.plateNumber}`
                                    : 'Select vehicle'}
                                  <HugeiconsIcon
                                    icon={ShippingTruck02Icon}
                                    className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                  />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search vehicles by door no, asset no, name, or chassis no..." />
                                <CommandList>
                                  <CommandEmpty>No vehicles found.</CommandEmpty>
                                  <CommandGroup>
                                    {vehicles
                                      .filter(
                                        (v: any) => v.type === 'Vehicle' || v.type === 'Equipment',
                                      )
                                      .map((vehicle: any) => (
                                        <CommandItem
                                          key={vehicle.id}
                                          value={`${vehicle.doorNo || ''} ${vehicle.asset || ''} ${vehicle.name || ''} ${vehicle.chassisNo || ''}`}
                                          onSelect={() => {
                                            field.onChange(vehicle.id);
                                            setVehicleOpen(false);
                                          }}
                                        >
                                          <div className="flex flex-col">
                                            <span>
                                              {vehicle.name || 'Unnamed'} - {vehicle.plateNumber || 'N/A'}
                                            </span>
                                            {(vehicle.doorNo || vehicle.asset) && (
                                              <span className="text-xs text-muted-foreground">
                                                {[vehicle.doorNo, vehicle.asset].filter(Boolean).join(' / ')}
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
                  const selectedAttachment = vehicles.find((v: any) => v.id === field.value);
                  return (
                    <FormItem>
                      <FormLabel>Attachment</FormLabel>
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
                                  : 'Select attachment (optional)'}
                                <HugeiconsIcon
                                  icon={ShippingTruck02Icon}
                                  className="ml-2 h-4 w-4 shrink-0 opacity-50"
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search attachments by door no, asset no, name, or chassis no..." />
                              <CommandList>
                                <CommandEmpty>No attachments found.</CommandEmpty>
                                <CommandGroup>
                                  {vehicles
                                    .filter((v: any) => v.type === 'Attachment')
                                    .map((attachment: any) => (
                                      <CommandItem
                                        key={attachment.id}
                                        value={`${attachment.doorNo || ''} ${attachment.asset || ''} ${attachment.name || ''} ${attachment.chassisNo || ''}`}
                                        onSelect={() => {
                                          field.onChange(attachment.id);
                                          setAttachmentOpen(false);
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span>
                                            {attachment.name || 'Unnamed'} -{' '}
                                            {attachment.chassisNo || 'N/A'}
                                          </span>
                                          {(attachment.doorNo || attachment.asset) && (
                                            <span className="text-xs text-muted-foreground">
                                              {[attachment.doorNo, attachment.asset].filter(Boolean).join(' / ')}
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
                      <FormDescription>Optional</FormDescription>
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
                                {selectedDriver
                                  ? `${selectedDriver.name}${selectedDriver.mobile ? ` (${selectedDriver.mobile})` : ''}`
                                  : 'Select driver'}
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
                                      <div className="flex flex-col">
                                        <span>{driver.name}</span>
                                        {driver.mobile && (
                                          <span className="text-xs text-muted-foreground">
                                            {driver.mobile}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestedTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">ETA (Estimated Time of Arrival)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="etaDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ETA Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="etaTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ETA Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormDescription>Optional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
