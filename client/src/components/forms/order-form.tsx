import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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
  Orbit01Icon,
  File01Icon,
  PlusSignIcon,
  Delete01Icon,
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

const cargoItemSchema = z.object({
  description: z.string().min(1, 'Cargo description is required'),
  weight: z.string().min(1, 'Weight is required'),
  weightUom: z.string().optional(),
  volume: z.string().optional(),
  value: z.string().optional(),
});

const orderFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  contractId: z.string().optional(),
  fromId: z.string().min(1, 'From location is required'),
  toId: z.string().min(1, 'To location is required'),
  // Keep old fields for backward compatibility (optional)
  weight: z.string().optional(),
  volume: z.string().optional(),
  value: z.string().optional(),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  attachmentId: z.string().optional(),
  driverId: z.string().min(1, 'Driver is required'),
  cargoDescription: z.string().optional(), // Made optional, use cargoItems instead
  cargoItems: z.array(cargoItemSchema).min(1, 'At least one cargo item is required'),
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
  temperature: z.string().optional(),
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
    fields: ['cargoItems'],
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
  const queryClient = useQueryClient();
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
  // Pass orderId when editing to exclude currently assigned resources from "in use" check
  const vehiclesData = usePaginatedVehicles({ type: 'Vehicle', excludeOrderId: orderId });
  const attachmentsData = usePaginatedVehicles({ type: 'Attachment', excludeOrderId: orderId });
  const accessoriesData = usePaginatedVehicles({ type: 'Accessory' });
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [accessoryOpen, setAccessoryOpen] = useState(false);
  const [driverOpen, setDriverOpen] = useState(false);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  // Helper to format date in local timezone (avoid UTC shift)
  const formatLocalDate = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return '';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  // Helper to format time in local timezone
  const formatLocalTime = (dateValue: any): string => {
    if (!dateValue) return '';
    try {
      const d = new Date(dateValue);
      if (isNaN(d.getTime())) return '';
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

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
      cargoItems: [{ description: '', weight: '', weightUom: 'TON', volume: '', value: '' }],
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
      temperature: '',
      accessoryIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'cargoItems',
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [customersData, contractsData, locationsData, driversData] = await Promise.all([
          fetchCustomers(),
          fetchContracts(),
          fetchLocations(),
          fetchDrivers(orderId), // Pass orderId to exclude currently assigned driver from "in use" check
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
              cargoItems: (() => {
                // Ensure we always have at least one cargo item
                if (
                  orderData.cargoItems &&
                  Array.isArray(orderData.cargoItems) &&
                  orderData.cargoItems.length > 0
                ) {
                  return orderData.cargoItems.map((item: any) => ({
                    description: item.description || '',
                    weight: item.weight ? item.weight.toString() : '',
                    weightUom: item.weightUom || 'TON',
                    volume: item.volume ? item.volume.toString() : '',
                    value: item.value ? item.value.toString() : '',
                  }));
                }
                // Fallback to single cargo from old fields
                if (orderData.cargoDescription) {
                  return [
                    {
                      description: orderData.cargoDescription || '',
                      weight: orderData.weight ? orderData.weight.toString() : '',
                      weightUom: orderData.weightUom || 'TON',
                      volume: orderData.volume ? orderData.volume.toString() : '',
                      value: orderData.value ? orderData.value.toString() : '',
                    },
                  ];
                }
                // Default empty item
                return [{ description: '', weight: '', weightUom: 'TON', volume: '', value: '' }];
              })(),
              startKms: orderData.startKms?.toString() || '',
              etaDate: formatLocalDate(orderData.eta),
              etaTime: formatLocalTime(orderData.eta),
              requestedDate: formatLocalDate(orderData.requestedDate),
              requestedTime: orderData.requestedTime || formatLocalTime(orderData.requestedDate),
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
              temperature: orderData.temperature || '',
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

      const loadCustomerRoutes = async () => {
        try {
          const routes = await fetchCustomerRoutes(selectedCustomerId);
          setCustomerRoutes(routes);
        } catch (error: any) {
          console.error('Failed to load customer routes:', error);
          setCustomerRoutes([]);
        }
      };
      loadCustomerRoutes();
    } else {
      setContracts([]);
      setCustomerRoutes([]);
    }
  }, [selectedCustomerId, allContracts]);

  // Clear attachmentId when vehicle with built-in trailer/reefer is selected
  const vehicleId = form.watch('vehicleId');
  const driverId = form.watch('driverId');
  
  useEffect(() => {
    if (vehicleId) {
      const selectedVehicle = vehiclesData.vehicles.find((v: any) => v.id === vehicleId);
      const hasBuiltIn = selectedVehicle?.builtInTrailer || selectedVehicle?.builtInReefer;
      if (hasBuiltIn && form.getValues('attachmentId')) {
        form.setValue('attachmentId', '');
      }
      
      // Auto-select driver if vehicle has an assigned driver
      if (selectedVehicle?.driver?.id && !driverId) {
        form.setValue('driverId', selectedVehicle.driver.id);
      }
    }
  }, [vehicleId, vehiclesData.vehicles, driverId]);

  // Auto-select vehicle when driver is selected
  useEffect(() => {
    if (driverId) {
      const selectedDriver = drivers.find((d: any) => d.id === driverId);
      if (selectedDriver?.vehicle?.id && !vehicleId) {
        form.setValue('vehicleId', selectedDriver.vehicle.id);
      }
    }
  }, [driverId, drivers, vehicleId]);

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

    // For step 3 (Assignment), conditionally validate attachmentId
    if (step === 3) {
      const vehicleId = form.getValues('vehicleId');
      const selectedVehicle = vehiclesData.vehicles.find((v: any) => v.id === vehicleId);
      const hasBuiltIn = selectedVehicle?.builtInTrailer || selectedVehicle?.builtInReefer;

      // If vehicle has built-in trailer/reefer, attachmentId is not required
      const fieldsToValidate = hasBuiltIn
        ? currentStepData.fields.filter((field) => field !== 'attachmentId')
        : currentStepData.fields;

      const isValid = await form.trigger(fieldsToValidate as any);
      if (isValid && step < STEPS.length) {
        const nextStep = step + 1;
        setStep(nextStep);
        setMaxStepReached((prev) => Math.max(prev, nextStep));
      }
    } else {
      const isValid = await form.trigger(currentStepData.fields as any);
      if (isValid && step < STEPS.length) {
        const nextStep = step + 1;
        setStep(nextStep);
        setMaxStepReached((prev) => Math.max(prev, nextStep));
      }
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
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        // Send cargoItems array
        cargoItems: values.cargoItems.map((item) => ({
          description: item.description.trim(),
          weight: item.weight && item.weight.trim() ? parseFloat(item.weight) : undefined,
          weightUom: 'TON', // Always Ton
          volume: item.volume && item.volume.trim() ? parseFloat(item.volume) : undefined,
          value: item.value && item.value.trim() ? parseFloat(item.value) : undefined,
        })),
        // Keep old fields for backward compatibility (fallback if cargoItems is empty)
        cargoDescription:
          values.cargoItems.length > 0 && values.cargoItems[0].description
            ? values.cargoItems[0].description
            : values.cargoDescription?.trim() || undefined,
        weight:
          values.cargoItems.length > 0 && values.cargoItems[0].weight
            ? parseFloat(values.cargoItems[0].weight)
            : values.weight
              ? parseFloat(values.weight)
              : undefined,
        volume:
          values.cargoItems.length > 0 && values.cargoItems[0].volume
            ? values.cargoItems[0].volume && values.cargoItems[0].volume.trim()
              ? parseFloat(values.cargoItems[0].volume)
              : undefined
            : values.volume && values.volume.trim()
              ? parseFloat(values.volume)
              : undefined,
        value:
          values.cargoItems.length > 0 && values.cargoItems[0].value
            ? values.cargoItems[0].value && values.cargoItems[0].value.trim()
              ? parseFloat(values.cargoItems[0].value)
              : undefined
            : values.value && values.value.trim()
              ? parseFloat(values.value)
              : undefined,
        startKms: values.startKms ? parseInt(values.startKms) : undefined,
        eta:
          values.etaDate && values.etaTime
            ? (() => {
                // Create date in local timezone, then convert to ISO
                const [year, month, day] = values.etaDate.split('-').map(Number);
                const [hours, minutes] = values.etaTime.split(':').map(Number);
                const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
                return localDate.toISOString();
              })()
            : undefined,
        requestedDate: values.requestedDate
          ? (() => {
              // Create date in local timezone, then convert to ISO
              const [year, month, day] = values.requestedDate.split('-').map(Number);
              const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);
              return localDate.toISOString();
            })()
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
        temperature:
          values.temperature && values.temperature.trim() ? values.temperature : undefined,
        accessoryIds:
          values.accessoryIds && values.accessoryIds.length > 0 ? values.accessoryIds : undefined,
      };

      // Only include attachmentId if it's provided
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
        // Invalidate queries for both the list and the specific order
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      } else {
        await createOrder(payload);
        toast({
          title: 'Order Created',
          description: 'Successfully created order',
        });
        // Invalidate orders query to refresh the list
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
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
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cargo Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({ description: '', weight: '', weightUom: 'TON', volume: '', value: '' })
                  }
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                  Add Cargo Item
                </Button>
              </div>

              {fields && fields.length > 0 ? (
                fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Cargo Item {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`cargoItems.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo Description *</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="e.g., General cargo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`cargoItems.${index}.weight`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (Ton) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g., 1000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`cargoItems.${index}.volume`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Volume (m³)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="e.g., 50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`cargoItems.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value (SAR)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g., 50000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No cargo items. Click "Add Cargo Item" to add one.
                </div>
              )}
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
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {vehicle.name || 'Unnamed'} - {vehicle.plateNumber || 'N/A'}
                                      </span>
                                      {vehicle.isInUse && (
                                        <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                                          In Use
                                        </Badge>
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
                                onSelect={(vehicle) => {
                                  field.onChange(vehicle.id);
                                  // Auto-select driver if vehicle has assigned driver
                                  if (vehicle.driver?.id) {
                                    form.setValue('driverId', vehicle.driver.id);
                                  }
                                }}
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
                        {selectedVehicle?.isInUse && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            ⚠️ This vehicle is already assigned to an in-progress waybill.
                          </p>
                        )}
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
              {(() => {
                const selectedVehicleId = form.watch('vehicleId');
                const selectedVehicle = vehiclesData.vehicles.find(
                  (v: any) => v.id === selectedVehicleId,
                );
                const hasBuiltIn =
                  selectedVehicle?.builtInTrailer || selectedVehicle?.builtInReefer;

                // Hide attachment field if vehicle has built-in trailer or reefer
                if (hasBuiltIn) {
                  // Clear attachmentId when hiding the field
                  if (form.getValues('attachmentId')) {
                    form.setValue('attachmentId', '');
                  }
                  return null;
                }

                return (
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
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {attachment.name || 'Unnamed'} -{' '}
                                          {attachment.chassisNo || 'N/A'}
                                        </span>
                                        {attachment.isInUse && (
                                          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                                            In Use
                                          </Badge>
                                        )}
                                      </div>
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
                          {selectedAttachment?.isInUse && (
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                              ⚠️ This attachment is already assigned to an in-progress waybill.
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
                  />
                );
              })()}

              {/* Container Number and Temperature - shown when vehicle has built-in trailer/reefer OR attachment is selected */}
              {(() => {
                const selectedVehicleId = form.watch('vehicleId');
                const selectedAttachmentId = form.watch('attachmentId');
                const selectedVehicle = vehiclesData.vehicles.find(
                  (v: any) => v.id === selectedVehicleId,
                );
                const selectedAttachment = attachmentsData.vehicles.find(
                  (v: any) => v.id === selectedAttachmentId,
                );

                const hasBuiltInTrailer = selectedVehicle?.builtInTrailer;
                const hasBuiltInReefer = selectedVehicle?.builtInReefer;
                const hasAttachment = !!selectedAttachmentId;
                // Check trailerCategory instead of category for reefer detection
                const isReeferAttachment = selectedAttachment?.trailerCategory === 'Reefer';
                const isReeferVehicle = selectedVehicle?.trailerCategory === 'Reefer';

                // Show container number if: vehicle has built-in trailer OR attachment is selected
                const showContainerNumber = hasBuiltInTrailer || hasAttachment;
                // Show temperature if: vehicle has built-in reefer OR vehicle trailerCategory is Reefer OR (attachment is selected AND its trailerCategory is Reefer)
                const showTemperature =
                  hasBuiltInReefer || isReeferVehicle || (hasAttachment && isReeferAttachment);

                if (!showContainerNumber && !showTemperature) {
                  return null;
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showContainerNumber && (
                      <FormField
                        control={form.control}
                        name="containerNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Container Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter container number" {...field} />
                            </FormControl>
                            <FormDescription>
                              {hasBuiltInTrailer
                                ? 'Container number for the built-in trailer'
                                : 'Container number for the attachment/trailer'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    {showTemperature && (
                      <FormField
                        control={form.control}
                        name="temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperature (°C)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" placeholder="e.g., -18" {...field} />
                            </FormControl>
                            <FormDescription>
                              {hasBuiltInReefer
                                ? 'Required temperature in Celsius for built-in reefer'
                                : 'Required temperature in Celsius for Reefer attachment/trailer'}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                );
              })()}

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
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {accessory.name || 'Unnamed'} -{' '}
                                          {accessory.plateNumber || 'N/A'}
                                        </span>
                                        {accessory.isInUse && (
                                          <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                                            In Use
                                          </Badge>
                                        )}
                                      </div>
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
                      {selectedAccessories.some((a: any) => a.isInUse) && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          ⚠️ One or more selected accessories are already assigned to in-progress
                          waybills.
                        </p>
                      )}
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
                                        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs">
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
                                        // Auto-select vehicle if driver has assigned vehicle
                                        if (driver.vehicle?.id) {
                                          form.setValue('vehicleId', driver.vehicle.id);
                                        }
                                        setDriverOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                          <span>{driver.name}</span>
                                          {driver.ownershipType === 'Outsourced' && (
                                            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20 text-xs">
                                              Outsourced
                                            </Badge>
                                          )}
                                          {driver.isInUse && (
                                            <Badge className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20 text-xs">
                                              In Use
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
                      {selectedDriver?.isInUse && (
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          ⚠️ This driver is already assigned to an in-progress waybill.
                        </p>
                      )}
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
