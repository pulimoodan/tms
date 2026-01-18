import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { DateTimePickerSingle } from '@/components/ui/datetime-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Clock01Icon,
  PackageIcon,
  FileVerifiedIcon,
  CheckmarkCircle02Icon,
  Orbit01Icon,
  Delete01Icon,
  File01Icon,
  AlertCircleIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { api } from '@/lib/api';
import { uploadDocument } from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';

const createWaybillClosingSchema = (startKms: number) =>
  z
    .object({
      arrivalAtLoadingDate: z.string().min(1, 'Arrival at Loading date is required'),
      arrivalAtLoadingTime: z.string().min(1, 'Arrival at Loading time is required'),
      dispatchFromLoadingDate: z.string().min(1, 'Loading Completed date is required'),
      dispatchFromLoadingTime: z.string().min(1, 'Loading Completed time is required'),
      arrivalAtOffloadingDate: z.string().min(1, 'Arrival at Offloading date is required'),
      arrivalAtOffloadingTime: z.string().min(1, 'Arrival at Offloading time is required'),
      completedUnloadingDate: z.string().min(1, 'Completed Unloading date is required'),
      completedUnloadingTime: z.string().min(1, 'Completed Unloading time is required'),
      kmIn: z
        .string()
        .min(1, 'Closing KMs is required')
        .refine(
          (val) => {
            const kmInNum = parseInt(val);
            return !isNaN(kmInNum) && kmInNum >= startKms;
          },
          {
            message: `Closing KMs must be greater than or equal to Start KMs (${startKms.toLocaleString()})`,
          },
        ),
      podNumber: z.string().min(1, 'POD Number is required'),
      podDocument: z.string().min(1, 'POD Document is required'),
      remarks: z.string().optional(),
      recipientAcknowledgment: z.enum(['Good', 'Fully Received', 'Broken', 'Partially']).optional(),
    })
    .superRefine((data, ctx) => {
      // Validate chronological order with specific field errors
      const getDateTime = (date: string | undefined, time: string | undefined) => {
        if (!date || !time) return null;
        try {
          return new Date(`${date}T${time}`);
        } catch {
          return null;
        }
      };

      const arrivalAtLoading = getDateTime(data.arrivalAtLoadingDate, data.arrivalAtLoadingTime);
      const dispatchFromLoading = getDateTime(
        data.dispatchFromLoadingDate,
        data.dispatchFromLoadingTime,
      );
      const arrivalAtOffloading = getDateTime(
        data.arrivalAtOffloadingDate,
        data.arrivalAtOffloadingTime,
      );
      const completedUnloading = getDateTime(
        data.completedUnloadingDate,
        data.completedUnloadingTime,
      );

      // Arrival at Loading <= Loading Completed
      if (arrivalAtLoading && dispatchFromLoading && arrivalAtLoading > dispatchFromLoading) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Loading Completed must be after Arrival at Loading',
          path: ['dispatchFromLoadingDate'], // Set error on date field since DateTimePickerSingle uses date field
        });
      }

      // Loading Completed <= Arrival at Offloading
      if (dispatchFromLoading && arrivalAtOffloading && dispatchFromLoading > arrivalAtOffloading) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Arrival at Offloading must be after Loading Completed',
          path: ['arrivalAtOffloadingDate'], // Set error on date field since DateTimePickerSingle uses date field
        });
      }

      // Arrival at Offloading <= Completed Unloading
      if (arrivalAtOffloading && completedUnloading && arrivalAtOffloading > completedUnloading) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Completed Unloading must be after Arrival at Offloading',
          path: ['completedUnloadingDate'], // Set error on date field since DateTimePickerSingle uses date field
        });
      }
    });

type WaybillClosingFormValues = z.infer<ReturnType<typeof createWaybillClosingSchema>>;

interface WaybillClosingFormProps {
  orderId: string;
  orderData?: {
    startKms?: number;
    createdAt?: string;
    requestedDate?: string;
    requestedTime?: string;
    eta?: string;
    arrivalAtLoading?: string;
    dispatchFromLoading?: string;
    arrivalAtOffloading?: string;
    completedUnloading?: string;
    kmIn?: number;
    podNumber?: string;
    podDocument?: string;
    remarks?: string;
    recipientAcknowledgment?: string;
  };
  onComplete?: () => void;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'POD Timeline',
    icon: Clock01Icon,
    description: 'Record loading, arrival, and unloading times',
    fields: [
      'arrivalAtLoadingDate',
      'arrivalAtLoadingTime',
      'dispatchFromLoadingDate',
      'dispatchFromLoadingTime',
      'arrivalAtOffloadingDate',
      'arrivalAtOffloadingTime',
      'completedUnloadingDate',
      'completedUnloadingTime',
    ],
  },
  {
    number: 2,
    title: 'Kilometers',
    icon: PackageIcon,
    description: 'Record closing kilometers',
    fields: ['kmIn'],
  },
  {
    number: 3,
    title: 'Proof of Delivery',
    icon: FileVerifiedIcon,
    description: 'POD number and document upload',
    fields: ['podNumber', 'podDocument'],
  },
  {
    number: 4,
    title: 'Additional Info',
    icon: CheckmarkCircle02Icon,
    description: 'Recipient acknowledgment and remarks',
    fields: ['recipientAcknowledgment', 'remarks'],
  },
];

export function WaybillClosingForm({ orderId, orderData, onComplete }: WaybillClosingFormProps) {
  const [step, setStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPod, setIsUploadingPod] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startKms = orderData?.startKms || 0;
  const waybillClosingSchema = createWaybillClosingSchema(startKms);

  const form = useForm<WaybillClosingFormValues>({
    resolver: zodResolver(waybillClosingSchema),
    defaultValues: {
      arrivalAtLoadingDate: orderData?.arrivalAtLoading
        ? new Date(orderData.arrivalAtLoading).toISOString().split('T')[0]
        : '',
      arrivalAtLoadingTime: orderData?.arrivalAtLoading
        ? new Date(orderData.arrivalAtLoading).toTimeString().slice(0, 5)
        : '',
      dispatchFromLoadingDate: orderData?.dispatchFromLoading
        ? new Date(orderData.dispatchFromLoading).toISOString().split('T')[0]
        : '',
      dispatchFromLoadingTime: orderData?.dispatchFromLoading
        ? new Date(orderData.dispatchFromLoading).toTimeString().slice(0, 5)
        : '',
      arrivalAtOffloadingDate: orderData?.arrivalAtOffloading
        ? new Date(orderData.arrivalAtOffloading).toISOString().split('T')[0]
        : '',
      arrivalAtOffloadingTime: orderData?.arrivalAtOffloading
        ? new Date(orderData.arrivalAtOffloading).toTimeString().slice(0, 5)
        : '',
      completedUnloadingDate: orderData?.completedUnloading
        ? new Date(orderData.completedUnloading).toISOString().split('T')[0]
        : '',
      completedUnloadingTime: orderData?.completedUnloading
        ? new Date(orderData.completedUnloading).toTimeString().slice(0, 5)
        : '',
      kmIn: orderData?.kmIn?.toString() || '',
      podNumber: orderData?.podNumber || '',
      podDocument: orderData?.podDocument || '',
      remarks: orderData?.remarks || '',
      recipientAcknowledgment:
        (orderData?.recipientAcknowledgment as
          | 'Good'
          | 'Fully Received'
          | 'Broken'
          | 'Partially'
          | undefined) || undefined,
    },
  });

  useEffect(() => {
    async function loadOrderData() {
      if (!orderData && orderId) {
        setIsLoading(true);
        try {
          const response = await api.get(`/orders/${orderId}`);
          if (response.data.success && response.data.result) {
            const order = response.data.result;
            form.reset({
              arrivalAtLoadingDate: order.arrivalAtLoading
                ? new Date(order.arrivalAtLoading).toISOString().split('T')[0]
                : '',
              arrivalAtLoadingTime: order.arrivalAtLoading
                ? new Date(order.arrivalAtLoading).toTimeString().slice(0, 5)
                : '',
              dispatchFromLoadingDate: order.dispatchFromLoading
                ? new Date(order.dispatchFromLoading).toISOString().split('T')[0]
                : '',
              dispatchFromLoadingTime: order.dispatchFromLoading
                ? new Date(order.dispatchFromLoading).toTimeString().slice(0, 5)
                : '',
              arrivalAtOffloadingDate: order.arrivalAtOffloading
                ? new Date(order.arrivalAtOffloading).toISOString().split('T')[0]
                : '',
              arrivalAtOffloadingTime: order.arrivalAtOffloading
                ? new Date(order.arrivalAtOffloading).toTimeString().slice(0, 5)
                : '',
              completedUnloadingDate: order.completedUnloading
                ? new Date(order.completedUnloading).toISOString().split('T')[0]
                : '',
              completedUnloadingTime: order.completedUnloading
                ? new Date(order.completedUnloading).toTimeString().slice(0, 5)
                : '',
              kmIn: order.kmIn?.toString() || '',
              podNumber: order.podNumber || '',
              podDocument: order.podDocument || '',
              remarks: order.remarks || '',
              recipientAcknowledgment:
                (order.recipientAcknowledgment as
                  | 'Good'
                  | 'Fully Received'
                  | 'Broken'
                  | 'Partially'
                  | undefined) || undefined,
            });
            // If order has existing data, allow navigation to all steps
            if (
              order.dispatchFromLoading ||
              order.arrivalAtOffloading ||
              order.completedUnloading ||
              order.kmIn ||
              order.podNumber
            ) {
              setMaxStepReached(STEPS.length);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load order data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (orderData) {
        // If orderData is provided, allow navigation to all steps
        if (
          orderData.arrivalAtOffloading ||
          orderData.completedUnloading ||
          orderData.kmIn ||
          orderData.podNumber
        ) {
          setMaxStepReached(STEPS.length);
        }
      }
    }
    loadOrderData();
  }, [orderId, orderData, form, toast]);

  // Calculate run kilometers when kmIn or startKms changes
  const kmIn = form.watch('kmIn');
  const runKm = kmIn && startKms ? parseInt(kmIn) - startKms : undefined;

  // Watch timestamp values for validation and delay calculation
  const arrivalAtLoadingDate = form.watch('arrivalAtLoadingDate');
  const arrivalAtLoadingTime = form.watch('arrivalAtLoadingTime');
  const dispatchFromLoadingDate = form.watch('dispatchFromLoadingDate');
  const dispatchFromLoadingTime = form.watch('dispatchFromLoadingTime');
  const arrivalAtOffloadingDate = form.watch('arrivalAtOffloadingDate');
  const arrivalAtOffloadingTime = form.watch('arrivalAtOffloadingTime');
  const completedUnloadingDate = form.watch('completedUnloadingDate');
  const completedUnloadingTime = form.watch('completedUnloadingTime');

  // Helper function to format duration
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  // Calculate loading duration (time between arrival at loading and loading completed)
  const loadingDuration = useMemo(() => {
    if (
      !arrivalAtLoadingDate ||
      !arrivalAtLoadingTime ||
      !dispatchFromLoadingDate ||
      !dispatchFromLoadingTime
    ) {
      return null;
    }
    try {
      const arrivalAtLoading = new Date(`${arrivalAtLoadingDate}T${arrivalAtLoadingTime}`);
      const loadingCompleted = new Date(`${dispatchFromLoadingDate}T${dispatchFromLoadingTime}`);

      if (isNaN(arrivalAtLoading.getTime()) || isNaN(loadingCompleted.getTime())) {
        return null;
      }

      const durationMinutes = Math.round(
        (loadingCompleted.getTime() - arrivalAtLoading.getTime()) / (1000 * 60),
      );

      return durationMinutes > 0 ? durationMinutes : null;
    } catch {
      return null;
    }
  }, [
    arrivalAtLoadingDate,
    arrivalAtLoadingTime,
    dispatchFromLoadingDate,
    dispatchFromLoadingTime,
  ]);

  // Calculate unloading duration (time between arrival at offloading and offloading completed)
  const unloadingDuration = useMemo(() => {
    if (
      !arrivalAtOffloadingDate ||
      !arrivalAtOffloadingTime ||
      !completedUnloadingDate ||
      !completedUnloadingTime
    ) {
      return null;
    }
    try {
      const arrivalAtOffloading = new Date(`${arrivalAtOffloadingDate}T${arrivalAtOffloadingTime}`);
      const unloadingCompleted = new Date(`${completedUnloadingDate}T${completedUnloadingTime}`);

      if (isNaN(arrivalAtOffloading.getTime()) || isNaN(unloadingCompleted.getTime())) {
        return null;
      }

      const durationMinutes = Math.round(
        (unloadingCompleted.getTime() - arrivalAtOffloading.getTime()) / (1000 * 60),
      );

      return durationMinutes > 0 ? durationMinutes : null;
    } catch {
      return null;
    }
  }, [
    arrivalAtOffloadingDate,
    arrivalAtOffloadingTime,
    completedUnloadingDate,
    completedUnloadingTime,
  ]);

  // Helper to combine date and time into ISO datetime string
  const combineDateTime = (
    date: string | undefined,
    time: string | undefined,
  ): string | undefined => {
    if (!date || !time) return undefined;
    try {
      return new Date(`${date}T${time}`).toISOString();
    } catch {
      return undefined;
    }
  };

  // Helper to split ISO datetime string into date and time
  const splitDateTime = (
    isoString: string | undefined,
  ): { date: string; time: string } | undefined => {
    if (!isoString) return undefined;
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return undefined;
      return {
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
      };
    } catch {
      return undefined;
    }
  };

  // Get minimum datetime for each timestamp field (for datetime picker restriction)
  const getMinDateTimeForField = (fieldName: string): string | undefined => {
    if (fieldName === 'dispatchFromLoadingDate') {
      return combineDateTime(arrivalAtLoadingDate, arrivalAtLoadingTime);
    }
    if (fieldName === 'arrivalAtOffloadingDate') {
      return (
        combineDateTime(dispatchFromLoadingDate, dispatchFromLoadingTime) ||
        combineDateTime(arrivalAtLoadingDate, arrivalAtLoadingTime)
      );
    }
    if (fieldName === 'completedUnloadingDate') {
      return (
        combineDateTime(arrivalAtOffloadingDate, arrivalAtOffloadingTime) ||
        combineDateTime(dispatchFromLoadingDate, dispatchFromLoadingTime) ||
        combineDateTime(arrivalAtLoadingDate, arrivalAtLoadingTime)
      );
    }
    return undefined;
  };

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentStepData = STEPS[step - 1];
    if (!currentStepData?.fields) return;

    let isValid = false;

    // For step 1, validate all timestamp fields together to trigger chronological order validation
    if (step === 1) {
      const timestampFields = [
        'arrivalAtLoadingDate',
        'arrivalAtLoadingTime',
        'dispatchFromLoadingDate',
        'dispatchFromLoadingTime',
        'arrivalAtOffloadingDate',
        'arrivalAtOffloadingTime',
        'completedUnloadingDate',
        'completedUnloadingTime',
      ];
      // Validate all timestamp fields together - this will trigger superRefine for chronological order
      isValid = await form.trigger(timestampFields as any);
    }
    // For step 2, validate kmIn field (which includes the >= startKms check via refine)
    else if (step === 2) {
      isValid = await form.trigger('kmIn');
    }
    // For other steps, validate current step fields
    else {
      isValid = await form.trigger(currentStepData.fields as any);
    }

    if (isValid && step < STEPS.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      setMaxStepReached(nextStep);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStepClick = (stepNumber: number) => {
    if (stepNumber >= 1 && stepNumber <= STEPS.length && stepNumber <= maxStepReached) {
      setStep(stepNumber);
    }
  };

  async function onSubmit() {
    setIsSubmitting(true);
    try {
      const values = form.getValues();

      // Combine date and time for arrivalAtLoading
      const arrivalAtLoading =
        values.arrivalAtLoadingDate && values.arrivalAtLoadingTime
          ? new Date(`${values.arrivalAtLoadingDate}T${values.arrivalAtLoadingTime}`).toISOString()
          : undefined;

      // Combine date and time for dispatchFromLoading (Loading Completed)
      const dispatchFromLoading =
        values.dispatchFromLoadingDate && values.dispatchFromLoadingTime
          ? new Date(
              `${values.dispatchFromLoadingDate}T${values.dispatchFromLoadingTime}`,
            ).toISOString()
          : undefined;

      // Combine date and time for arrivalAtOffloading
      const arrivalAtOffloading =
        values.arrivalAtOffloadingDate && values.arrivalAtOffloadingTime
          ? new Date(
              `${values.arrivalAtOffloadingDate}T${values.arrivalAtOffloadingTime}`,
            ).toISOString()
          : undefined;

      // Combine date and time for completedUnloading
      const completedUnloading =
        values.completedUnloadingDate && values.completedUnloadingTime
          ? new Date(
              `${values.completedUnloadingDate}T${values.completedUnloadingTime}`,
            ).toISOString()
          : undefined;

      // Determine if waybill is being closed (has completedUnloading and kmIn)
      const isClosingWaybill = completedUnloading && values.kmIn;

      const payload: any = {
        arrivalAtLoading,
        dispatchFromLoading,
        arrivalAtOffloading,
        completedUnloading,
        kmIn: values.kmIn ? parseInt(values.kmIn) : undefined,
        runKm: runKm && runKm > 0 ? runKm : undefined,
        podNumber:
          values.podNumber && values.podNumber.trim() ? values.podNumber.trim() : undefined,
        podDocument:
          values.podDocument && values.podDocument.trim() ? values.podDocument.trim() : undefined,
        remarks: values.remarks && values.remarks.trim() ? values.remarks.trim() : undefined,
        recipientAcknowledgment: values.recipientAcknowledgment || undefined,
        // Update status to Closed when waybill is closed
        ...(isClosingWaybill ? { status: 'Closed' } : {}),
      };

      // Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });

      const response = await api.patch(`/orders/${orderId}`, payload);

      if (response.data.success) {
        // Invalidate and refetch queries to refresh the status and waybill closing details
        // Use exact match to ensure we're targeting the right queries
        queryClient.invalidateQueries({ queryKey: ['order', orderId], exact: true });
        queryClient.invalidateQueries({ queryKey: ['orders'], exact: false });

        // Explicitly refetch to ensure immediate update
        await queryClient.refetchQueries({
          queryKey: ['orders'],
          exact: false,
          type: 'active', // Only refetch active queries
        });

        toast({
          title: 'Success',
          description: isClosingWaybill
            ? 'Waybill closed successfully. Order status updated to Closed.'
            : 'Waybill closing details updated successfully',
        });
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error(response.data.message || 'Failed to update waybill closing');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || error.message || 'Failed to update waybill closing',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <MultiStepForm
          steps={STEPS}
          currentStep={step}
          maxStepReached={maxStepReached}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          onStepClick={handleStepClick}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Save Waybill Closing"
          submittingLabel="Saving..."
        >
          {step === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="arrivalAtLoadingDate"
                render={({ field }) => {
                  const currentValue = combineDateTime(
                    field.value,
                    form.watch('arrivalAtLoadingTime'),
                  );
                  return (
                    <FormItem>
                      <FormLabel>Arrival at Loading</FormLabel>
                      <FormControl>
                        <DateTimePickerSingle
                          value={currentValue}
                          onChange={(isoString) => {
                            const split = splitDateTime(isoString);
                            if (split) {
                              field.onChange(split.date);
                              form.setValue('arrivalAtLoadingTime', split.time);
                              form.trigger([
                                'dispatchFromLoadingDate',
                                'arrivalAtOffloadingDate',
                                'completedUnloadingDate',
                                'dispatchFromLoadingTime',
                                'arrivalAtOffloadingTime',
                                'completedUnloadingTime',
                              ]);
                            }
                          }}
                          placeholder="Select arrival date and time"
                        />
                      </FormControl>
                      <FormDescription>
                        Time when the vehicle arrived at the loading location
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="dispatchFromLoadingDate"
                render={({ field }) => {
                  const currentValue = combineDateTime(
                    field.value,
                    form.watch('dispatchFromLoadingTime'),
                  );
                  return (
                    <FormItem>
                      <FormLabel>Loading Completed</FormLabel>
                      <FormControl>
                        <DateTimePickerSingle
                          value={currentValue}
                          onChange={(isoString) => {
                            const split = splitDateTime(isoString);
                            if (split) {
                              field.onChange(split.date);
                              form.setValue('dispatchFromLoadingTime', split.time);
                              form.trigger([
                                'arrivalAtOffloadingDate',
                                'completedUnloadingDate',
                                'arrivalAtOffloadingTime',
                                'completedUnloadingTime',
                              ]);
                            }
                          }}
                          minDateTime={getMinDateTimeForField('dispatchFromLoadingDate')}
                          placeholder="Select loading date and time"
                        />
                      </FormControl>
                      <FormDescription>
                        Time when the waybill was loaded / departed from loading
                      </FormDescription>
                      {loadingDuration !== null && (
                        <div className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <HugeiconsIcon icon={InformationCircleIcon} className="h-3.5 w-3.5" />
                          <span>{formatDuration(loadingDuration)} at loading location</span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="arrivalAtOffloadingDate"
                render={({ field }) => {
                  const currentValue = combineDateTime(
                    field.value,
                    form.watch('arrivalAtOffloadingTime'),
                  );
                  return (
                    <FormItem>
                      <FormLabel>Arrival at Offloading</FormLabel>
                      <FormControl>
                        <DateTimePickerSingle
                          value={currentValue}
                          onChange={(isoString) => {
                            const split = splitDateTime(isoString);
                            if (split) {
                              field.onChange(split.date);
                              form.setValue('arrivalAtOffloadingTime', split.time);
                              form.trigger(['completedUnloadingDate', 'completedUnloadingTime']);
                            }
                          }}
                          minDateTime={getMinDateTimeForField('arrivalAtOffloadingDate')}
                          placeholder="Select arrival date and time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="completedUnloadingDate"
                render={({ field }) => {
                  const currentValue = combineDateTime(
                    field.value,
                    form.watch('completedUnloadingTime'),
                  );
                  return (
                    <FormItem>
                      <FormLabel>Completed Unloading</FormLabel>
                      <FormControl>
                        <DateTimePickerSingle
                          value={currentValue}
                          onChange={(isoString) => {
                            const split = splitDateTime(isoString);
                            if (split) {
                              field.onChange(split.date);
                              form.setValue('completedUnloadingTime', split.time);
                            }
                          }}
                          minDateTime={getMinDateTimeForField('completedUnloadingDate')}
                          placeholder="Select completion date and time"
                        />
                      </FormControl>
                      <FormDescription>Time when unloading was completed</FormDescription>
                      {unloadingDuration !== null && (
                        <div className="mt-1.5 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                          <HugeiconsIcon icon={InformationCircleIcon} className="h-3.5 w-3.5" />
                          <span>{formatDuration(unloadingDuration)} at offloading location</span>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start KMs</label>
                  <div className="mt-1 text-lg font-semibold">{startKms.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Initial reading</p>
                </div>

                <FormField
                  control={form.control}
                  name="kmIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing KMs</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter closing kilometers"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Run KMs</label>
                  <div className="mt-1 text-lg font-semibold">
                    {runKm !== undefined && runKm > 0 ? runKm.toLocaleString() : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Auto-calculated</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="podNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>POD Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter POD number" {...field} />
                    </FormControl>
                    <FormDescription>Proof of Delivery document number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="podDocument"
                render={({ field }) => {
                  const hasFile = !!field.value;
                  const getFileUrl = (url: string) => {
                    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
                  };

                  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setIsUploadingPod(true);
                      try {
                        const url = await uploadDocument(file);
                        field.onChange(url);
                        toast({
                          title: 'File uploaded',
                          description: 'POD document has been uploaded successfully.',
                        });
                      } catch (error: any) {
                        toast({
                          variant: 'destructive',
                          title: 'Upload failed',
                          description: error.message || 'Failed to upload file. Please try again.',
                        });
                      } finally {
                        setIsUploadingPod(false);
                      }
                    }
                  };

                  const removeFile = () => {
                    field.onChange('');
                  };

                  return (
                    <FormItem>
                      <FormLabel>POD Document *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {hasFile ? (
                            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                              <HugeiconsIcon
                                icon={File01Icon}
                                className="h-4 w-4 text-muted-foreground"
                              />
                              <a
                                href={getFileUrl(field.value)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex-1 truncate"
                              >
                                {field.value.split('/').pop()}
                              </a>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={removeFile}
                                className="h-8 w-8 p-0"
                              >
                                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={handleFileChange}
                                disabled={isUploadingPod}
                                className="flex-1"
                              />
                              {isUploadingPod && (
                                <HugeiconsIcon
                                  icon={Orbit01Icon}
                                  className="h-4 w-4 animate-spin text-primary"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload the Proof of Delivery document (PDF, JPG, PNG, DOC, DOCX)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="recipientAcknowledgment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Acknowledgment</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select acknowledgment status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fully Received">Fully Received</SelectItem>
                        <SelectItem value="Broken">Broken</SelectItem>
                        <SelectItem value="Partially">Partially</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Status of goods upon delivery</FormDescription>
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
                      <Textarea
                        placeholder="Enter any additional remarks or notes"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
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
