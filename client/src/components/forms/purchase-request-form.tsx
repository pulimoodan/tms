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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import {
  File01Icon,
  Loading01Icon,
  PlusSignIcon,
  Delete01Icon,
  Upload01Icon,
  Location03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { uploadDocument, fetchLocations } from '@/lib/api-helpers';

const purchaseRequestItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  estimatedCost: z.string().min(1, 'Estimated cost is required'),
  description: z.string().optional().or(z.literal('')),
  proposedVendorId: z.string().optional().or(z.literal('')),
});

export const purchaseRequestFormSchema = z.object({
  description: z.string().optional().or(z.literal('')),
  sourceDocument: z.string().optional().or(z.literal('')),
  pickingWarehouseId: z.string().min(1, 'Picking warehouse is required'),
  termsAndConditions: z.string().optional().or(z.literal('')),
  items: z.array(purchaseRequestItemSchema).min(1, 'At least one item is required'),
});

export type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>;

interface PurchaseRequestFormProps {
  initialData?: Partial<PurchaseRequestFormValues>;
  isEditMode?: boolean;
  purchaseRequestId?: string;
  onComplete?: () => void;
}

// Dummy products data
const dummyProducts = [
  {
    id: '1',
    name: 'Office Chair',
    code: 'PROD-001',
    description: 'Ergonomic office chair with adjustable height',
    unit: 'pcs',
    price: 450.0,
    isActive: true,
  },
  {
    id: '2',
    name: 'Printer Paper A4',
    code: 'PROD-002',
    description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
    unit: 'ream',
    price: 25.0,
    isActive: true,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    code: 'PROD-003',
    description: 'Adjustable aluminum laptop stand',
    unit: 'pcs',
    price: 120.0,
    isActive: true,
  },
  {
    id: '4',
    name: 'Desk Organizer',
    code: 'PROD-004',
    description: 'Multi-compartment desk organizer',
    unit: 'pcs',
    price: 35.0,
    isActive: true,
  },
];

// Dummy vendors data
const dummyVendors = [
  {
    id: '1',
    name: 'ABC Suppliers',
    email: 'contact@abcsuppliers.com',
    phone: '+966 50 123 4567',
    address: 'Riyadh, Saudi Arabia',
    isActive: true,
  },
  {
    id: '2',
    name: 'XYZ Trading',
    email: 'info@xyztrading.com',
    phone: '+966 50 987 6543',
    address: 'Jeddah, Saudi Arabia',
    isActive: true,
  },
  {
    id: '3',
    name: 'Global Equipment Co.',
    email: 'sales@globalequip.com',
    phone: '+966 50 555 1234',
    address: 'Dammam, Saudi Arabia',
    isActive: true,
  },
];

export function PurchaseRequestForm({
  initialData,
  isEditMode = false,
  purchaseRequestId,
  onComplete,
}: PurchaseRequestFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: {
      description: '',
      sourceDocument: '',
      pickingWarehouseId: '',
      termsAndConditions: '',
      items: [
        { productId: '', quantity: '', estimatedCost: '', description: '', proposedVendorId: '' },
      ],
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  useEffect(() => {
    async function loadPurchaseRequest() {
      if (isEditMode && purchaseRequestId) {
        setIsLoading(true);
        try {
          // Dummy data for now
          const prData = {
            description: 'Sample purchase request description',
            sourceDocument: '',
            items: [
              {
                productId: '1',
                quantity: '10',
                estimatedCost: '4500.00',
                description: 'Ergonomic office chair with adjustable height',
                proposedVendorId: '1',
              },
            ],
          };
          const items = prData.items || [];
          form.reset({
            description: prData.description || '',
            sourceDocument: prData.sourceDocument || '',
            pickingWarehouseId: prData.pickingWarehouseId || '',
            termsAndConditions: prData.termsAndConditions || '',
            items:
              items.length > 0
                ? items.map((item: any) => ({
                    productId: item.productId || '',
                    quantity: item.quantity?.toString() || '',
                    estimatedCost:
                      item.estimatedCost?.toString() || item.unitPrice?.toString() || '',
                    description: item.description || '',
                    proposedVendorId: item.proposedVendorId || '',
                  }))
                : [
                    {
                      productId: '',
                      quantity: '',
                      estimatedCost: '',
                      description: '',
                      proposedVendorId: '',
                    },
                  ],
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error.response?.data?.message || error.message || 'Failed to load purchase request',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          description: initialData.description || '',
          sourceDocument: initialData.sourceDocument || '',
          pickingWarehouseId: initialData.pickingWarehouseId || '',
          termsAndConditions: initialData.termsAndConditions || '',
          items: initialData.items || [
            {
              productId: '',
              quantity: '',
              estimatedCost: '',
              description: '',
              proposedVendorId: '',
            },
          ],
        });
      } else {
        setEntityLabel(null);
      }
    }
    loadPurchaseRequest();
    return () => setEntityLabel(null);
  }, [isEditMode, purchaseRequestId, setEntityLabel]);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadDocument(file);
      form.setValue('sourceDocument', url);
      toast({
        title: 'File uploaded',
        description: 'Source document has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const removeFile = () => {
    form.setValue('sourceDocument', '');
  };

  const getFileUrl = (url: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  };

  async function onSubmit(data: PurchaseRequestFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        description: data.description || undefined,
        sourceDocument: data.sourceDocument || undefined,
        pickingWarehouseId: data.pickingWarehouseId,
        termsAndConditions: data.termsAndConditions || undefined,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          estimatedCost: parseFloat(item.estimatedCost),
          description: item.description || undefined,
          proposedVendorId: item.proposedVendorId || undefined,
        })),
      };

      // For now, just show success message
      toast({
        title: isEditMode ? 'Purchase Request Updated' : 'Purchase Request Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} purchase request`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/purchase/purchase-requests');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || error.message || 'Failed to save purchase request',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getSelectedProduct = (productId: string) => {
    return dummyProducts.find((p) => p.id === productId);
  };

  const getSelectedVendor = (vendorId: string) => {
    return dummyVendors.find((v) => v.id === vendorId);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
              Purchase Request Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update purchase request details and items'
                : 'Create a new purchase request with items'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Purchase request description..." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Description of the purchase request</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sourceDocument"
              render={({ field }) => {
                const hasFile = !!field.value;
                return (
                  <FormItem>
                    <FormLabel>Source Document</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {hasFile ? (
                          <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                            <HugeiconsIcon
                              icon={File01Icon}
                              className="h-4 w-4 text-muted-foreground"
                            />
                            <a
                              href={getFileUrl(field.value || '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex-1 truncate"
                            >
                              {(field.value || '').split('/').pop()}
                            </a>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile()}
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
                              disabled={isUploading}
                              className="flex-1"
                            />
                            {isUploading && (
                              <HugeiconsIcon
                                icon={Loading01Icon}
                                className="h-4 w-4 animate-spin"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Optional source document (PDF, images, or documents)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="pickingWarehouseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Picking Warehouse *</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 opacity-50" />
                          <SelectValue placeholder="Select picking warehouse" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location: any) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name} {location.code && `(${location.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Warehouse where items will be picked from</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms and Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter terms and conditions for this purchase request..."
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional terms and conditions that will apply to this purchase request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Items</CardTitle>
                <CardDescription>Add products to this purchase request</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productId: '',
                    quantity: '',
                    estimatedCost: '',
                    description: '',
                    proposedVendorId: '',
                  })
                }
              >
                <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Product *</TableHead>
                    <TableHead className="w-[28%]">Description</TableHead>
                    <TableHead className="w-[12%]">Quantity *</TableHead>
                    <TableHead className="w-[18%]">
                      Estimated Cost (SAR) *
                    </TableHead>
                    <TableHead className="w-[18%]">Proposed Vendor</TableHead>
                    <TableHead className="w-[6%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const productId = form.watch(`items.${index}.productId`) || '';
                    const selectedProduct = getSelectedProduct(productId);
                    return (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    const product = getSelectedProduct(value);
                                    if (product?.description) {
                                      form.setValue(
                                        `items.${index}.description`,
                                        product.description,
                                      );
                                    }
                                  }}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {dummyProducts.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name} {product.code && `(${product.code})`}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Product description"
                                    {...field}
                                    className="h-10 resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0"
                                    {...field}
                                    className="w-full h-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.estimatedCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    {...field}
                                    className="w-full h-10"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.proposedVendorId`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                  }}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Select vendor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {dummyVendors
                                      .filter((v) => v.isActive)
                                      .map((vendor) => (
                                        <SelectItem key={vendor.id} value={vendor.id}>
                                          {vendor.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0"
                            >
                              <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {form.formState.errors.items && (
              <p className="text-sm text-destructive mt-2">{form.formState.errors.items.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                setLocation('/purchase/purchase-requests');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Purchase Request' : 'Create Purchase Request'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
