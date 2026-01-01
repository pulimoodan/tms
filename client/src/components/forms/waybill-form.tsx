import { useState, useEffect, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import {
  FloppyDiskIcon,
  PackageIcon,
  Location03Icon,
  File01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ShippingTruck02Icon,
  UserIcon,
  Loading01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  fetchCustomers,
  fetchCustomerRoutes,
  fetchVehicles,
  fetchDrivers,
  createOrder,
  updateOrder,
  fetchOrder,
} from '@/lib/api-helpers';

const waybillFormSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  fromId: z.string().min(1, 'From location is required'),
  toId: z.string().min(1, 'To location is required'),
  cargoDescription: z.string().optional(),
  weight: z.string().optional(),
  sealNumber: z.string().optional(),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  startKms: z.string().optional(),
  tripNumber: z.string().optional(),
  eta: z.string().optional(),
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

export type WaybillFormValues = z.infer<typeof waybillFormSchema>;

const STEPS = [
  {
    number: 1,
    title: 'Customer & Route',
    icon: Location03Icon,
    description: 'Select customer and route',
  },
  {
    number: 2,
    title: 'Vehicle & Driver',
    icon: ShippingTruck02Icon,
    description: 'Assign vehicle and driver',
  },
  {
    number: 3,
    title: 'Cargo Details',
    icon: PackageIcon,
    description: 'Cargo information and tracking',
  },
  {
    number: 4,
    title: 'Activities',
    icon: File01Icon,
    description: 'Loading and unloading times',
  },
];

interface WaybillFormProps {
  initialData?: Partial<WaybillFormValues>;
  isEditMode?: boolean;
  orderId?: string;
  onComplete?: () => void;
}

export function WaybillForm({
  initialData,
  isEditMode = false,
  orderId,
  onComplete,
}: WaybillFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerRoutes, setCustomerRoutes] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const form = useForm<WaybillFormValues>({
    resolver: zodResolver(waybillFormSchema),
    defaultValues: initialData || {
      customerId: '',
      fromId: '',
      toId: '',
      cargoDescription: '',
      weight: '',
      sealNumber: '',
      vehicleId: '',
      driverId: '',
      startKms: '',
      tripNumber: '',
      eta: '',
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
        const [customersData, vehiclesData, driversData] = await Promise.all([
          fetchCustomers(),
          fetchVehicles(),
          fetchDrivers(),
        ]);
        setCustomers(customersData);
        setVehicles(vehiclesData);
        setDrivers(driversData);

        if (isEditMode && orderId) {
          const orderData = await fetchOrder(orderId);
          if (orderData) {
            setSelectedCustomerId(orderData.customerId);
            form.reset({
              customerId: orderData.customerId,
              fromId: orderData.fromId,
              toId: orderData.toId,
              cargoDescription: orderData.cargoDescription || '',
              weight: orderData.weight?.toString() || '',
              sealNumber: orderData.sealNumber || '',
              vehicleId: orderData.vehicleId || '',
              driverId: orderData.driverId || '',
              startKms: orderData.startKms?.toString() || '',
              tripNumber: orderData.tripNumber || '',
              eta: orderData.eta ? new Date(orderData.eta).toISOString().slice(0, 16) : '',
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
          }
        } else if (initialData) {
          form.reset(initialData);
          if (initialData.customerId) {
            setSelectedCustomerId(initialData.customerId);
          }
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
  }, [isEditMode, orderId]);

  useEffect(() => {
    if (selectedCustomerId) {
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
      setCustomerRoutes([]);
    }
  }, [selectedCustomerId]);

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    form.setValue('customerId', customerId);
    form.setValue('fromId', '');
    form.setValue('toId', '');
  };

  const availableFromLocations = useMemo(() => {
    const uniqueFromIds = new Set(customerRoutes.map((route: any) => route.fromId));
    return customerRoutes
      .map((route: any) => route.from)
      .filter((loc: any, index: number, self: any[]) => {
        const firstIndex = self.findIndex((l: any) => l.id === loc.id);
        return firstIndex === index && uniqueFromIds.has(loc.id);
      });
  }, [customerRoutes]);

  const availableToLocations = useMemo(() => {
    const fromId = form.watch('fromId');
    if (!fromId || customerRoutes.length === 0) {
      return [];
    }
    const uniqueToIds = new Set(
      customerRoutes
        .filter((route: any) => route.fromId === fromId)
        .map((route: any) => route.toId),
    );
    return customerRoutes
      .filter((route: any) => route.fromId === fromId)
      .map((route: any) => route.to)
      .filter((loc: any, index: number, self: any[]) => {
        const firstIndex = self.findIndex((l: any) => l.id === loc.id);
        return firstIndex === index && uniqueToIds.has(loc.id);
      });
  }, [customerRoutes, form.watch('fromId')]);

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (step === 1) {
      const isValid = await form.trigger(['customerId', 'fromId', 'toId']);
      if (isValid && step < STEPS.length) {
        setStep(step + 1);
      }
    } else if (step === 2) {
      if (step < STEPS.length) {
        setStep(step + 1);
      }
    } else if (step < STEPS.length) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  async function onSubmit(data: WaybillFormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        customerId: data.customerId,
        fromId: data.fromId,
        toId: data.toId,
        cargoDescription: data.cargoDescription,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        sealNumber: data.sealNumber,
        vehicleId: data.vehicleId || undefined,
        driverId: data.driverId || undefined,
        startKms: data.startKms ? parseInt(data.startKms) : undefined,
        tripNumber: data.tripNumber,
        eta: data.eta ? new Date(data.eta).toISOString() : undefined,
        requestedDate: data.requestedDate ? new Date(data.requestedDate).toISOString() : undefined,
        requestedTime: data.requestedTime,
        arrivalAtLoading: data.arrivalAtLoading
          ? new Date(data.arrivalAtLoading).toISOString()
          : undefined,
        completedLoading: data.completedLoading
          ? new Date(data.completedLoading).toISOString()
          : undefined,
        dispatchFromLoading: data.dispatchFromLoading
          ? new Date(data.dispatchFromLoading).toISOString()
          : undefined,
        arrivalAtOffloading: data.arrivalAtOffloading
          ? new Date(data.arrivalAtOffloading).toISOString()
          : undefined,
        completedUnloading: data.completedUnloading
          ? new Date(data.completedUnloading).toISOString()
          : undefined,
        remarks: data.remarks,
        recipientAcknowledgment: data.recipientAcknowledgment,
        bookingNumber: data.bookingNumber,
        vesselName: data.vesselName,
        croNumber: data.croNumber,
        customerContact: data.customerContact,
        transporter: data.transporter,
        portOfLoading: data.portOfLoading,
        shippingLine: data.shippingLine,
        containerNumber: data.containerNumber,
        containerSize: data.containerSize,
        weightUom: data.weightUom,
        tareWeight: data.tareWeight ? parseFloat(data.tareWeight) : undefined,
        trailerNumber: data.trailerNumber,
        status: 'Pending',
      };

      if (isEditMode) {
        if (!orderId) throw new Error('Order ID is required');
        await updateOrder(orderId, payload);
        toast({
          title: 'Waybill Updated',
          description: 'Successfully updated waybill',
        });
      } else {
        await createOrder(payload);
    toast({
          title: 'Waybill Created',
          description: 'Successfully created waybill',
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
      <div className="flex items-center justify-center py-12">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-center gap-2 px-4">
          {STEPS.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
          <button
            type="button"
                onClick={() => {
                  if (stepItem.number <= step) {
                    setStep(stepItem.number);
                  }
                }}
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                  step >= stepItem.number ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
                {stepItem.number}
          </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 w-16 ${step > stepItem.number ? 'bg-primary' : 'bg-slate-200'}`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                <HugeiconsIcon icon={Location03Icon} className="h-5 w-5 text-primary" />
                  <div>
                  <CardTitle>Customer & Route</CardTitle>
                  <CardDescription>Select customer and delivery route</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer *</FormLabel>
                      <Select onValueChange={handleCustomerChange} value={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {customers.map((customer: any) => (
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

              {selectedCustomerId && customerRoutes.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm">
                  No routes configured for this customer. Please configure routes first.
                </div>
              )}

              {selectedCustomerId && customerRoutes.length > 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="fromId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Location *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableFromLocations.map((location: any) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name} {location.code && `(${location.code})`}
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
                    name="toId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Location *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!form.watch('fromId')}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  form.watch('fromId')
                                    ? 'Select destination'
                                    : 'Select origin first'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableToLocations.map((location: any) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name} {location.code && `(${location.code})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={ShippingTruck02Icon} className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Vehicle & Driver</CardTitle>
                  <CardDescription>Assign vehicle and driver for this waybill</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id}>
                            {vehicle.plateNumber} {vehicle.name && `- ${vehicle.name}`}
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
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Driver</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select driver (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drivers.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.name} {driver.mobile && `- ${driver.mobile}`}
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
                name="startKms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start KMs</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={PackageIcon} className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Cargo Details</CardTitle>
                  <CardDescription>Cargo information and tracking details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="cargoDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the cargo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sealNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seal Number</FormLabel>
                      <FormControl>
                        <Input placeholder="SEAL123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tripNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Number</FormLabel>
                    <FormControl>
                      <Input placeholder="CW/002652/1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="eta"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ETA</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Shipping & Container Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bookingNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Booking Number</FormLabel>
                        <FormControl>
                          <Input placeholder="808697556" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vesselName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vessel Name</FormLabel>
                        <FormControl>
                          <Input placeholder="TBN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="croNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CRO Number</FormLabel>
                        <FormControl>
                          <Input placeholder="JED500366300" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customerContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transporter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transporter</FormLabel>
                        <FormControl>
                          <Input placeholder="Transporter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portOfLoading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port Of Loading</FormLabel>
                        <FormControl>
                          <Input placeholder="JEDDAH" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingLine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Line</FormLabel>
                        <FormControl>
                          <Input placeholder="PCIU" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trailerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trailer Number</FormLabel>
                        <FormControl>
                          <Input placeholder="TRAILER123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="containerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Container Number</FormLabel>
                        <FormControl>
                          <Input placeholder="CONTAINER123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="containerSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Container Size</FormLabel>
                        <FormControl>
                          <Input placeholder="40 Ft" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightUom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight UOM</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TON">TON</SelectItem>
                            <SelectItem value="KG">KG</SelectItem>
                            <SelectItem value="LB">LB</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tareWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tare Weight</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Activities & Acknowledgment</CardTitle>
                  <CardDescription>
                    Loading, unloading times and recipient acknowledgment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Loading Activities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="arrivalAtLoading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival at Loading</FormLabel>
                          <FormControl>
                          <Input type="datetime-local" {...field} />
                          </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="completedLoading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed Loading</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dispatchFromLoading"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dispatch from Loading</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Unloading Activities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="arrivalAtOffloading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arrival at Offloading</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="completedUnloading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completed Unloading</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="recipientAcknowledgment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Acknowledgment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select acknowledgment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fully Received">Fully Received</SelectItem>
                        <SelectItem value="Broken">Broken</SelectItem>
                        <SelectItem value="Partially">Partially</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remarks</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Additional notes or exceptions" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between gap-2 pt-6 border-t">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevStep}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
              Previous
            </Button>
          )}

          <div className="flex-1" />

          {step < STEPS.length ? (
            <Button type="button" onClick={handleNextStep}>
              Next
              <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Waybill' : 'Create Waybill'}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
