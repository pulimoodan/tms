import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect, useRef } from 'react';
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
import {
  Delete01Icon,
  File01Icon,
  FolderAttachmentIcon,
  IdentityCardIcon,
  Orbit01Icon,
  Location03Icon,
  Task01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { translateToArabic } from '@/lib/translate';
import {
  fetchCustomer,
  createCustomer,
  updateCustomer,
  uploadDocument,
  fetchCustomerRoutes,
  fetchLocations,
  createCustomerRoute,
  deleteCustomerRoute,
} from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const GCC_COUNTRIES = ['Saudi Arabia', 'UAE', 'Qatar', 'Bahrain', 'Oman', 'Kuwait'];
const SAUDI_CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Medina', 'Mecca', 'Abha', 'Tabuk'];
const ACCEPTED_FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Basic Info',
    icon: IdentityCardIcon,
    description: 'Company name and details',
    fields: ['name'],
  },
  {
    number: 2,
    title: 'Address',
    icon: Location03Icon,
    description: 'Complete address information',
    fields: ['street', 'district', 'postalCode', 'country', 'city'],
  },
  {
    number: 3,
    title: 'Registration',
    icon: Task01Icon,
    description: 'CR and VAT details',
    fields: ['crNo'],
  },
  {
    number: 4,
    title: 'Documents',
    icon: FolderAttachmentIcon,
    description: 'Upload certificates and documents',
    fields: [],
  },
  {
    number: 5,
    title: 'Routes',
    icon: Location03Icon,
    description: 'Configure customer routes',
    fields: [],
  },
];

const DEFAULT_VALUES: CustomerFormValues = {
  name: '',
  nameArabic: '',
  buildingNo: '',
  secondaryNo: '',
  street: '',
  streetArabic: '',
  district: '',
  districtArabic: '',
  postalCode: undefined,
  city: '',
  country: 'Saudi Arabia',
  crNo: '',
  crExpiryDate: '',
  vatNo: '',
  nationalAddress: '',
  crCertificate: '',
  vatCertificate: '',
};

// Schema
export const customerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  nameArabic: z.string().max(100).optional().or(z.literal('')),
  buildingNo: z
    .string()
    .regex(/^\d{4}$/, 'Building number must be exactly 4 digits')
    .optional()
    .or(z.literal('')),
  secondaryNo: z
    .string()
    .regex(/^\d{4}$/, 'Secondary number must be exactly 4 digits')
    .optional()
    .or(z.literal('')),
  street: z.string().max(200).optional().or(z.literal('')),
  streetArabic: z.string().max(200).optional().or(z.literal('')),
  district: z.string().max(100).optional().or(z.literal('')),
  districtArabic: z.string().max(100).optional().or(z.literal('')),
  postalCode: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{6}$/.test(val), 'Postal code must be exactly 6 digits')
    .transform((val) => (val && val !== '' ? parseInt(val, 10) : undefined)),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  crNo: z.string().max(50).optional().or(z.literal('')),
  crExpiryDate: z.string().optional().or(z.literal('')),
  vatNo: z.string().max(50).optional().or(z.literal('')),
  nationalAddress: z.string().optional().or(z.literal('')),
  crCertificate: z.string().optional().or(z.literal('')),
  vatCertificate: z.string().optional().or(z.literal('')),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  initialData?: Partial<CustomerFormValues>;
  isEditMode?: boolean;
  customerId?: string;
  onComplete?: () => void;
}

type FileFieldName = 'nationalAddress' | 'crCertificate' | 'vatCertificate';
type ArabicFieldName = 'nameArabic' | 'streetArabic' | 'districtArabic';

// Helper function
const getFileUrl = (url: string) => {
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

// Components
const LoadingSpinner = ({ className }: { className?: string }) => (
  <HugeiconsIcon
    icon={Orbit01Icon}
    className={`h-4 w-4 animate-spin text-muted-foreground ${className || ''}`}
  />
);

const TranslationLoader = ({ isTranslating }: { isTranslating: boolean }) => {
  if (!isTranslating) return null;
  return <LoadingSpinner className="absolute left-2 top-1/2 -translate-y-1/2" />;
};

const FileUploadField = ({
  field,
  fieldName,
  label,
  description,
  isUploading,
  onFileChange,
  onRemove,
}: {
  field: any;
  fieldName: FileFieldName;
  label: string;
  description: string;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: FileFieldName) => void;
  onRemove: (field: FileFieldName) => void;
}) => {
  const hasFile = !!field.value;

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          {hasFile ? (
            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
              <HugeiconsIcon icon={File01Icon} className="h-4 w-4 text-muted-foreground" />
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
                onClick={() => onRemove(fieldName)}
                className="h-8 w-8 p-0"
              >
                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                onChange={(e) => onFileChange(e, fieldName)}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && <LoadingSpinner />}
            </div>
          )}
        </div>
      </FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export function CustomerForm({
  initialData,
  isEditMode = false,
  customerId,
  onComplete,
}: CustomerFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    initialData?.country || 'Saudi Arabia',
  );
  const [cityInput, setCityInput] = useState<string>(initialData?.city || '');
  const [uploadingFiles, setUploadingFiles] = useState<Record<FileFieldName, boolean>>({
    nationalAddress: false,
    crCertificate: false,
    vatCertificate: false,
  });
  const [translatingFields, setTranslatingFields] = useState<Record<ArabicFieldName, boolean>>({
    nameArabic: false,
    streetArabic: false,
    districtArabic: false,
  });
  const translationTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const [newRouteFrom, setNewRouteFrom] = useState<string>('');
  const [newRouteTo, setNewRouteTo] = useState<string>('');
  const queryClient = useQueryClient();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    enabled: step === 5 && (isEditMode ? !!customerId : true),
  });

  const { data: routes = [], refetch: refetchRoutes } = useQuery({
    queryKey: ['customer-routes', customerId],
    queryFn: () => fetchCustomerRoutes(customerId!),
    enabled: step === 5 && isEditMode && !!customerId,
  });

  const createRouteMutation = useMutation({
    mutationFn: (data: { fromId: string; toId: string }) => createCustomerRoute(customerId!, data),
    onSuccess: () => {
      refetchRoutes();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setNewRouteFrom('');
      setNewRouteTo('');
      toast({
        title: 'Route added',
        description: 'Route has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to add route',
        description: error.response?.data?.message || error.message || 'Failed to add route.',
      });
    },
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (routeId: string) => deleteCustomerRoute(customerId!, routeId),
    onSuccess: () => {
      refetchRoutes();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Route deleted',
        description: 'Route has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Failed to delete route',
        description: error.response?.data?.message || error.message || 'Failed to delete route.',
      });
    },
  });

  useEffect(() => {
    async function loadCustomer() {
      if (isEditMode && customerId) {
        setIsLoading(true);
        try {
          const customer = await fetchCustomer(customerId);
          if (customer) {
            form.reset(customer);
            setSelectedCountry(customer.country || 'Saudi Arabia');
            setCityInput(customer.city || '');
            if (customer.name) {
              setEntityLabel(customer.name);
            }
          }
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load customer data',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset(initialData);
        setSelectedCountry(initialData.country || 'Saudi Arabia');
        setCityInput(initialData.city || '');
        if (initialData.name) {
          setEntityLabel(initialData.name);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadCustomer();
    return () => setEntityLabel(null);
  }, [isEditMode, customerId, setEntityLabel]);

  useEffect(() => {
    return () => {
      Object.values(translationTimeouts.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const handleSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        if (!customerId) throw new Error('Customer ID is required');
        await updateCustomer(customerId, data);
        toast({
          title: 'Customer Updated',
          description: 'Customer has been updated successfully.',
        });
      } else {
        await createCustomer(data);
        toast({
          title: 'Customer Created',
          description: 'Customer has been created successfully.',
        });
      }
      if (onComplete) {
        onComplete();
      } else {
        setLocation('/sales/customers');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message ||
          error.message ||
          'Failed to save customer. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
    if (step > 1) setStep(step - 1);
  };

  const handleFileUpload = async (file: File, fieldName: FileFieldName) => {
    setUploadingFiles((prev) => ({ ...prev, [fieldName]: true }));
    try {
      const url = await uploadDocument(file);
      form.setValue(fieldName, url);
      toast({
        title: 'File uploaded',
        description: 'File has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
      });
    } finally {
      setUploadingFiles((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: FileFieldName) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file, fieldName);
  };

  const removeFile = (fieldName: FileFieldName) => {
    form.setValue(fieldName, '');
  };

  const handleEnglishFieldChange = async (
    englishValue: string,
    arabicFieldName: ArabicFieldName,
  ) => {
    if (translationTimeouts.current[arabicFieldName]) {
      clearTimeout(translationTimeouts.current[arabicFieldName]);
    }

    if (!englishValue?.trim()) {
      form.setValue(arabicFieldName, '');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setTranslatingFields((prev) => ({ ...prev, [arabicFieldName]: true }));
      try {
        const translated = await translateToArabic(englishValue);
        if (translated) form.setValue(arabicFieldName, translated);
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setTranslatingFields((prev) => ({ ...prev, [arabicFieldName]: false }));
      }
    }, 500);

    translationTimeouts.current[arabicFieldName] = timeoutId;
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <MultiStepForm
          steps={STEPS}
          currentStep={step}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? 'Update Customer' : 'Save Customer'}
          submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
        >
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (English) *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Company name"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleEnglishFieldChange(e.target.value, 'nameArabic');
                        }}
                        data-testid="input-company-name-en"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Arabic)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="اسم الشركة"
                          {...field}
                          className="text-right"
                          dir="rtl"
                          data-testid="input-company-name-ar"
                        />
                        <TranslationLoader isTranslating={translatingFields.nameArabic} />
                      </div>
                    </FormControl>
                    <FormDescription>Optional</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Address */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="buildingNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234"
                          maxLength={4}
                          {...field}
                          data-testid="input-building-no"
                        />
                      </FormControl>
                      <FormDescription>Exactly 4 digits</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="secondaryNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary No</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="5678"
                          maxLength={4}
                          {...field}
                          data-testid="input-secondary-no"
                        />
                      </FormControl>
                      <FormDescription>Exactly 4 digits</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleEnglishFieldChange(e.target.value, 'streetArabic');
                          }}
                          data-testid="input-street-en"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="streetArabic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street (Arabic)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="اسم الشارع"
                            {...field}
                            className="text-right"
                            dir="rtl"
                            data-testid="input-street-ar"
                          />
                          <TranslationLoader isTranslating={translatingFields.streetArabic} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="District name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleEnglishFieldChange(e.target.value, 'districtArabic');
                          }}
                          data-testid="input-district-en"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="districtArabic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District (Arabic)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="اسم الحي"
                            {...field}
                            className="text-right"
                            dir="rtl"
                            data-testid="input-district-ar"
                          />
                          <TranslationLoader isTranslating={translatingFields.districtArabic} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        maxLength={6}
                        {...field}
                        value={field.value?.toString() || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d{0,6}$/.test(value)) {
                            field.onChange(value === '' ? undefined : value);
                          }
                        }}
                        data-testid="input-postal-code"
                      />
                    </FormControl>
                    <FormDescription>Exactly 6 digits</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCountry(value);
                          form.setValue('city', '');
                          setCityInput('');
                        }}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GCC_COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      {selectedCountry === 'Saudi Arabia' ? (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SAUDI_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input
                            placeholder="Enter city"
                            value={cityInput}
                            onChange={(e) => {
                              setCityInput(e.target.value);
                              field.onChange(e.target.value);
                            }}
                            data-testid="input-city"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </>
          )}

          {/* Step 3: Registration */}
          {step === 3 && (
            <>
              <FormField
                control={form.control}
                name="crNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CR No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="CR1234567890"
                        maxLength={50}
                        {...field}
                        data-testid="input-cr-no"
                      />
                    </FormControl>
                    <FormDescription>Commercial Registration number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="crExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CR Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-cr-expiry-date" />
                    </FormControl>
                    <FormDescription>Commercial Registration expiry date</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vatNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VAT No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VAT123456789"
                        maxLength={50}
                        {...field}
                        data-testid="input-vat-no"
                      />
                    </FormControl>
                    <FormDescription>VAT number (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nationalAddress"
                render={({ field }) => (
                  <FileUploadField
                    field={field}
                    fieldName="nationalAddress"
                    label="National Address Document"
                    description="Upload national address document (PDF, Image, or DOC)"
                    isUploading={uploadingFiles.nationalAddress}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="crCertificate"
                render={({ field }) => (
                  <FileUploadField
                    field={field}
                    fieldName="crCertificate"
                    label="CR Certificate"
                    description="Upload CR certificate document (PDF, Image, or DOC)"
                    isUploading={uploadingFiles.crCertificate}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="vatCertificate"
                render={({ field }) => (
                  <FileUploadField
                    field={field}
                    fieldName="vatCertificate"
                    label="VAT Certificate"
                    description="Upload VAT certificate document (PDF, Image, or DOC)"
                    isUploading={uploadingFiles.vatCertificate}
                    onFileChange={handleFileChange}
                    onRemove={removeFile}
                  />
                )}
              />
            </div>
          )}

          {/* Step 5: Routes */}
          {step === 5 && (
            <div className="space-y-6">
              {!isEditMode && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                  Please save the customer first before adding routes.
                </div>
              )}

              {isEditMode && customerId && (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Add New Route</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            From Location
                          </label>
                          <Select value={newRouteFrom} onValueChange={setNewRouteFrom}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select origin" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location: any) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} {location.code && `(${location.code})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            To Location
                          </label>
                          <Select value={newRouteTo} onValueChange={setNewRouteTo}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location: any) => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name} {location.code && `(${location.code})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          if (newRouteFrom && newRouteTo && newRouteFrom !== newRouteTo) {
                            createRouteMutation.mutate({ fromId: newRouteFrom, toId: newRouteTo });
                          } else {
                            toast({
                              variant: 'destructive',
                              title: 'Invalid route',
                              description: 'Please select different from and to locations.',
                            });
                          }
                        }}
                        disabled={
                          !newRouteFrom ||
                          !newRouteTo ||
                          newRouteFrom === newRouteTo ||
                          createRouteMutation.isPending
                        }
                        className="mt-4"
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                        Add Route
                      </Button>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-lg font-semibold mb-4">Existing Routes</h3>
                      {routes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                          <HugeiconsIcon
                            icon={Location03Icon}
                            className="h-8 w-8 mx-auto mb-2 opacity-50"
                          />
                          <p>No routes configured</p>
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>To</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {routes.map((route: any) => (
                                <TableRow key={route.id}>
                                  <TableCell>
                                    <div className="font-medium">{route.from.name}</div>
                                    {route.from.code && (
                                      <div className="text-xs text-muted-foreground">
                                        {route.from.code}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{route.to.name}</div>
                                    {route.to.code && (
                                      <div className="text-xs text-muted-foreground">
                                        {route.to.code}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        if (
                                          confirm('Are you sure you want to delete this route?')
                                        ) {
                                          deleteRouteMutation.mutate(route.id);
                                        }
                                      }}
                                      disabled={deleteRouteMutation.isPending}
                                    >
                                      <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </MultiStepForm>
      </form>
    </Form>
  );
}
