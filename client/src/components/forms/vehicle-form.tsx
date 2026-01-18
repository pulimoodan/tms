import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
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
import {
  ShippingTruck02Icon,
  Settings01Icon,
  File01Icon,
  Orbit01Icon,
  Image01Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { fetchVehicle, createVehicle, updateVehicle, uploadDocument } from '@/lib/api-helpers';
import { MultiStepForm, type Step } from './multi-step-form';
import { Button } from '@/components/ui/button';

const VEHICLE_TYPES = ['Vehicle', 'Attachment', 'Equipment'] as const;

const VEHICLE_CATEGORIES = [
  'TractorHead',
  'FourXTwoTractorHead',
  'CraneMountedTruck',
  'LightDutyTruck',
  'BoomTruck',
  'DieselTanker',
  'MiniVan',
  'MiniVanFifteenSeater',
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
  'Trailer',
  'OneCarCarrier',
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
    MiniVanFifteenSeater: 'Mini Van 15 Seater',
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
    Trailer: 'Trailer',
    OneCarCarrier: 'One Car Carrier',
  };
  return labels[category] || category;
};

const vehicleFormSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters').max(200),
  type: z.enum(VEHICLE_TYPES),
  category: z.enum(VEHICLE_CATEGORIES),
  asset: z.string().optional(),
  doorNo: z.string().optional(),
  plateNumber: z.string().optional(),
  plateNumberArabic: z.string().optional(),
  chassisNo: z.string().optional(),
  sequenceNo: z.string().optional(),
  engineModel: z.string().optional(),
  equipmentNo: z.string().optional(),
  equipmentType: z.string().optional(),
  horsePower: z.string().optional(),
  manufacturingYear: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  engineSerialNo: z.string().optional(),
  status: z.enum(['Active', 'InMaintenance', 'Inactive', 'OnTrip']).optional(),
  capacity: z.string().optional(),
  tractorCategory: z.string().optional(),
  trailerCategory: z.string().optional(),
  agent: z.string().optional(),
  builtInTrailer: z.boolean().optional(),
  builtInReefer: z.boolean().optional(),
  image: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  initialData?: any;
  isEditMode?: boolean;
  vehicleId?: string;
  onComplete?: () => void;
}

const STEPS: Step[] = [
  {
    number: 1,
    title: 'Basic Info',
    icon: ShippingTruck02Icon,
    description: 'Vehicle name, type and category',
    fields: ['name', 'type', 'category', 'image'],
  },
  {
    number: 2,
    title: 'Identifiers',
    icon: File01Icon,
    description: 'Asset, door, plate and chassis numbers',
    fields: ['asset', 'doorNo', 'plateNumber', 'plateNumberArabic', 'chassisNo', 'sequenceNo'],
  },
  {
    number: 3,
    title: 'Engine Specs',
    icon: Settings01Icon,
    description: 'Engine and equipment details',
    fields: [
      'engineModel',
      'equipmentNo',
      'manufacturingYear',
      'equipmentType',
      'horsePower',
      'make',
      'model',
      'engineSerialNo',
      'capacity',
      'tractorCategory',
      'trailerCategory',
      'agent',
      'builtInTrailer',
      'builtInReefer',
      'status',
    ],
  },
];

export function VehicleForm({
  initialData,
  isEditMode = false,
  vehicleId,
  onComplete,
}: VehicleFormProps) {
  const { toast } = useToast();
  const { setEntityLabel } = useBreadcrumb();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVehicle, setExistingVehicle] = useState<any>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: '',
      type: 'Vehicle',
      category: 'TractorHead',
      asset: '',
      doorNo: '',
      plateNumber: '',
      plateNumberArabic: '',
      chassisNo: '',
      sequenceNo: '',
      engineModel: '',
      equipmentNo: '',
      equipmentType: '',
      horsePower: '',
      manufacturingYear: '',
      make: '',
      model: '',
      engineSerialNo: '',
      status: 'Active',
      capacity: '',
      tractorCategory: '',
      trailerCategory: '',
      agent: '',
      builtInTrailer: false,
      builtInReefer: false,
      image: '',
    },
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        if (isEditMode && vehicleId) {
          const vehicleData = await fetchVehicle(vehicleId);
          if (vehicleData) {
            setExistingVehicle(vehicleData);
            form.reset({
              name: vehicleData.name || '',
              type: vehicleData.type || 'Vehicle',
              category: vehicleData.category || 'TractorHead',
              asset: vehicleData.asset || '',
              doorNo: vehicleData.doorNo || '',
              plateNumber: vehicleData.plateNumber || '',
              plateNumberArabic: vehicleData.plateNumberArabic || '',
              chassisNo: vehicleData.chassisNo || '',
              sequenceNo: vehicleData.sequenceNo || '',
              engineModel: vehicleData.engineModel || '',
              equipmentNo: vehicleData.equipmentNo || '',
              equipmentType: vehicleData.equipmentType || '',
              horsePower: vehicleData.horsePower?.toString() || '',
              manufacturingYear: vehicleData.manufacturingYear?.toString() || '',
              make: vehicleData.make || '',
              model: vehicleData.model || '',
              engineSerialNo: vehicleData.engineSerialNo || '',
              status: vehicleData.status || 'Active',
              capacity: vehicleData.capacity || '',
              tractorCategory: vehicleData.tractorCategory || '',
              trailerCategory: vehicleData.trailerCategory || '',
              agent: vehicleData.agent || '',
              builtInTrailer: vehicleData.builtInTrailer ?? false,
              builtInReefer: vehicleData.builtInReefer ?? false,
              image: vehicleData.image || '',
            });
            if (vehicleData.name) {
              setEntityLabel(vehicleData.name);
            }
          }
        } else if (initialData) {
          form.reset(initialData);
          if (initialData.name) {
            setEntityLabel(initialData.name);
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
  }, [isEditMode, vehicleId, setEntityLabel]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload a JPEG, PNG, or WebP image.',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const url = await uploadDocument(file);
      form.setValue('image', url);
      toast({
        title: 'Image uploaded',
        description: 'Vehicle image has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Please try again.',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeImage = () => {
    form.setValue('image', '');
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${API_BASE_URL}${url}`;
  };

  async function onSubmit(values: VehicleFormValues) {
    setIsSubmitting(true);
    try {
      const payload: any = {
        name: values.name,
        type: values.type,
        category: values.category,
        status: values.status || 'Active',
      };
      if (values.asset) payload.asset = values.asset;
      if (values.doorNo) payload.doorNo = values.doorNo;
      if (values.plateNumber) payload.plateNumber = values.plateNumber;
      if (values.plateNumberArabic) payload.plateNumberArabic = values.plateNumberArabic;
      if (values.chassisNo) payload.chassisNo = values.chassisNo;
      if (values.sequenceNo) payload.sequenceNo = values.sequenceNo;
      if (values.engineModel) payload.engineModel = values.engineModel;
      if (values.equipmentNo) payload.equipmentNo = values.equipmentNo;
      if (values.equipmentType) payload.equipmentType = values.equipmentType;
      if (values.horsePower) payload.horsePower = parseInt(values.horsePower, 10);
      if (values.manufacturingYear)
        payload.manufacturingYear = parseInt(values.manufacturingYear, 10);
      if (values.make) payload.make = values.make;
      if (values.model) payload.model = values.model;
      if (values.engineSerialNo) payload.engineSerialNo = values.engineSerialNo;
      if (values.capacity) payload.capacity = values.capacity;
      if (values.tractorCategory) payload.tractorCategory = values.tractorCategory;
      if (values.trailerCategory) payload.trailerCategory = values.trailerCategory;
      if (values.agent) payload.agent = values.agent;
      if (values.builtInTrailer !== undefined) payload.builtInTrailer = values.builtInTrailer;
      if (values.builtInReefer !== undefined) payload.builtInReefer = values.builtInReefer;
      if (values.image) payload.image = values.image;

      if (isEditMode) {
        if (!vehicleId) throw new Error('Vehicle ID is required');
        await updateVehicle(vehicleId, payload);
        toast({
          title: 'Vehicle Updated',
          description: `Successfully updated vehicle ${values.name}`,
        });
      } else {
        await createVehicle(payload);
        toast({
          title: 'Vehicle Created',
          description: `Successfully created vehicle ${values.name}`,
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
          submitLabel={isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
          submittingLabel={isEditMode ? 'Updating...' : 'Creating...'}
        >
          {step === 1 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name / Description *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 4X2 MAN TRACTOR HEAD MOD"
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VEHICLE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {getCategoryLabel(category)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => {
                  const hasImage = !!field.value;
                  return (
                    <FormItem>
                      <FormLabel>Vehicle Image</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {hasImage ? (
                            <div className="space-y-2">
                              <div className="relative w-full h-48 border rounded-md overflow-hidden">
                                <img
                                  src={getImageUrl(field.value)}
                                  alt="Vehicle"
                                  className="w-full h-full object-cover"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={removeImage}
                                  className="absolute top-2 right-2"
                                >
                                  <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                onChange={handleImageUpload}
                                disabled={isUploadingImage}
                                className="flex-1"
                              />
                              {isUploadingImage && (
                                <HugeiconsIcon
                                  icon={Orbit01Icon}
                                  className="h-4 w-4 animate-spin"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a vehicle image (JPEG, PNG, or WebP, max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="asset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., MH0162" {...field} data-testid="input-asset" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doorNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Door Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., FF16013" {...field} data-testid="input-door-no" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number (English)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., ABC-1234"
                        {...field}
                        data-testid="input-plate-number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="plateNumberArabic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number (Arabic)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="رقم اللوحة"
                        {...field}
                        data-testid="input-plate-number-ar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="chassisNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chassis Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., WMAH06ZZ38W104968"
                          {...field}
                          data-testid="input-chassis-no"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sequenceNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sequence Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 731708210"
                          {...field}
                          data-testid="input-sequence-no"
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
                  name="engineModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Model</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., D2866"
                          {...field}
                          data-testid="input-engine-model"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipmentNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment No.</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., EQ-001"
                          {...field}
                          data-testid="input-equipment-no"
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
                  name="manufacturingYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2022"
                          {...field}
                          data-testid="input-manufacturing-year"
                        />
                      </FormControl>
                      <FormDescription>Year between 1900 and 2100</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="equipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipment Type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Truck"
                          {...field}
                          data-testid="input-equipment-type"
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
                  name="horsePower"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horse Power</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 400"
                          {...field}
                          data-testid="input-horse-power"
                        />
                      </FormControl>
                      <FormDescription>Between 1 and 10000</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Mercedes" {...field} data-testid="input-make" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Actros" {...field} data-testid="input-model" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="engineSerialNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Engine Serial Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., ENG-123456"
                          {...field}
                          data-testid="input-engine-serial"
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
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 25 TON" {...field} data-testid="input-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent / Dealer</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Omatra Group"
                          {...field}
                          data-testid="input-agent"
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
                  name="tractorCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tractor Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 4X2, 6X2, 6X4"
                          {...field}
                          data-testid="input-tractor-category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trailerCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trailer Category</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Flat Bed, Low Bed, Reefer"
                          {...field}
                          data-testid="input-trailer-category"
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
                  name="builtInTrailer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Built-in Trailer</FormLabel>
                        <FormDescription>Vehicle has a built-in trailer</FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="builtInReefer"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Built-in Reefer</FormLabel>
                        <FormDescription>Vehicle has a built-in reefer unit</FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value || false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
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
                        <SelectItem value="InMaintenance">In Maintenance</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="OnTrip">On Trip</SelectItem>
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
