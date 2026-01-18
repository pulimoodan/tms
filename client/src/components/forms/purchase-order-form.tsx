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
  ShoppingCartIcon,
  Orbit01Icon,
  PlusSignIcon,
  Delete01Icon,
  Location03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { fetchLocations } from '@/lib/api-helpers';

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.string().min(1, 'Quantity is required'),
  unitPrice: z.string().min(1, 'Unit price is required'),
  description: z.string().optional().or(z.literal('')),
});

// Schema factory to handle edit vs create mode
const createPurchaseOrderFormSchema = (isEditMode: boolean) =>
  z.object({
    rfqId: isEditMode
      ? z.string().optional().or(z.literal(''))
      : z.string().min(1, 'RFQ is required when creating a new purchase order'),
    supplierId: z.string().min(1, 'Supplier is required'),
    pickingWarehouseId: z.string().min(1, 'Picking warehouse is required'),
    issueDate: z.string().min(1, 'Issue date is required'),
    expectedDeliveryDate: z.string().optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  });

export type PurchaseOrderFormValues = z.infer<ReturnType<typeof createPurchaseOrderFormSchema>>;

interface PurchaseOrderFormProps {
  initialData?: Partial<PurchaseOrderFormValues>;
  isEditMode?: boolean;
  purchaseOrderId?: string;
  rfqId?: string;
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

// Dummy vendors/suppliers data
const dummySuppliers = [
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

export function PurchaseOrderForm({
  initialData,
  isEditMode = false,
  purchaseOrderId,
  rfqId,
  onComplete,
}: PurchaseOrderFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(createPurchaseOrderFormSchema(isEditMode)),
    defaultValues: {
      rfqId: rfqId || '',
      supplierId: '',
      pickingWarehouseId: '',
      issueDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: '',
      description: '',
      items: [{ productId: '', quantity: '', unitPrice: '', description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  useEffect(() => {
    async function loadPurchaseOrder() {
      if (isEditMode && purchaseOrderId) {
        setIsLoading(true);
        try {
          // Dummy data for now
          const poData = {
            rfqId: '',
            supplierId: '1',
            pickingWarehouseId: locations[0]?.id || '',
            issueDate: new Date().toISOString().split('T')[0],
            expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            description: 'Sample purchase order description',
            items: [
              {
                productId: '1',
                quantity: '10',
                unitPrice: '450.00',
                description: 'Ergonomic office chair with adjustable height',
              },
            ],
          };
          const items = poData.items || [];
          form.reset({
            rfqId: poData.rfqId || '',
            supplierId: poData.supplierId || '',
            pickingWarehouseId: poData.pickingWarehouseId || '',
            issueDate: poData.issueDate || new Date().toISOString().split('T')[0],
            expectedDeliveryDate: poData.expectedDeliveryDate || '',
            description: poData.description || '',
            items:
              items.length > 0
                ? items.map((item: any) => ({
                    productId: item.productId || '',
                    quantity: item.quantity?.toString() || '',
                    unitPrice: item.unitPrice?.toString() || '',
                    description: item.description || '',
                  }))
                : [
                    {
                      productId: '',
                      quantity: '',
                      unitPrice: '',
                      description: '',
                    },
                  ],
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description:
              error.response?.data?.message || error.message || 'Failed to load purchase order',
          });
        } finally {
          setIsLoading(false);
        }
      } else if (initialData) {
        form.reset({
          rfqId: initialData.rfqId || rfqId || '',
          supplierId: initialData.supplierId || '',
          pickingWarehouseId: initialData.pickingWarehouseId || '',
          issueDate: initialData.issueDate || new Date().toISOString().split('T')[0],
          expectedDeliveryDate: initialData.expectedDeliveryDate || '',
          description: initialData.description || '',
          items: initialData.items || [
            {
              productId: '',
              quantity: '',
              unitPrice: '',
              description: '',
            },
          ],
        });
      } else if (rfqId) {
        // Load RFQ data to populate form
        setIsLoading(true);
        try {
          // In a real app, fetch RFQ data here
          // For now, use dummy data
          const rfqData = {
            supplierId: '1', // Would come from RFQ
            items: [
              {
                productId: '1',
                quantity: '10',
                unitPrice: '450.00',
                description: 'Ergonomic office chair with adjustable height',
              },
            ],
          };
          form.reset({
            rfqId: rfqId,
            supplierId: rfqData.supplierId || '',
            pickingWarehouseId: locations[0]?.id || '',
            issueDate: new Date().toISOString().split('T')[0],
            expectedDeliveryDate: '',
            description: '',
            items: rfqData.items || [
              {
                productId: '',
                quantity: '',
                unitPrice: '',
                description: '',
              },
            ],
          });
        } catch (error: any) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Failed to load RFQ data',
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setEntityLabel(null);
      }
    }
    loadPurchaseOrder();
    return () => setEntityLabel(null);
  }, [isEditMode, purchaseOrderId, rfqId, setEntityLabel, locations]);

  async function onSubmit(data: PurchaseOrderFormValues) {
    setIsSubmitting(true);
    try {
      const payload = {
        rfqId: data.rfqId || undefined,
        supplierId: data.supplierId,
        pickingWarehouseId: data.pickingWarehouseId,
        issueDate: data.issueDate,
        expectedDeliveryDate: data.expectedDeliveryDate || undefined,
        description: data.description || undefined,
        items: data.items.map((item) => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          description: item.description || undefined,
        })),
      };

      // For now, just show success message
      toast({
        title: isEditMode ? 'Purchase Order Updated' : 'Purchase Order Created',
        description: `Successfully ${isEditMode ? 'updated' : 'created'} purchase order`,
      });

      if (onComplete) {
        onComplete();
      } else {
        setLocation('/purchase/purchase-orders');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || error.message || 'Failed to save purchase order',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const getSelectedProduct = (productId: string) => {
    return dummyProducts.find((p) => p.id === productId);
  };

  const calculateTotal = () => {
    const items = form.watch('items');
    return items.reduce((total, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return total + quantity * unitPrice;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5 text-primary" />
              Purchase Order Information
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update purchase order details and items'
                : 'Create a new purchase order with items'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {rfqId && (
              <FormField
                control={form.control}
                name="rfqId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFQ *</FormLabel>
                    <FormControl>
                      <Input value={rfqId} disabled />
                    </FormControl>
                    <FormDescription>
                      This purchase order is created from RFQ {rfqId}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {dummySuppliers
                            .filter((s) => s.isActive)
                            .map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Purchase order description..." {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Description of the purchase order</FormDescription>
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
                <CardDescription>Add products to this purchase order</CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productId: '',
                    quantity: '',
                    unitPrice: '',
                    description: '',
                  })
                }
              >
                <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px] min-w-[250px]">Product *</TableHead>
                    <TableHead className="w-[300px] min-w-[300px]">Description</TableHead>
                    <TableHead className="w-[120px] min-w-[120px]">Quantity *</TableHead>
                    <TableHead className="w-[150px] min-w-[150px]">Unit Price (SAR) *</TableHead>
                    <TableHead className="w-[150px] min-w-[150px]">Total (SAR)</TableHead>
                    <TableHead className="w-[80px] min-w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const productId = form.watch(`items.${index}.productId`) || '';
                    const quantity = form.watch(`items.${index}.quantity`) || '0';
                    const unitPrice = form.watch(`items.${index}.unitPrice`) || '0';
                    const selectedProduct = getSelectedProduct(productId);
                    const total = (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
                    return (
                      <TableRow key={field.id}>
                        <TableCell className="whitespace-nowrap">
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
                                    if (product?.price) {
                                      form.setValue(
                                        `items.${index}.unitPrice`,
                                        product.price.toString(),
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
                        <TableCell className="whitespace-nowrap">
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Product description"
                                    {...field}
                                    className="min-w-[300px] h-10 resize-none"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
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
                        <TableCell className="whitespace-nowrap">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitPrice`}
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
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">
                            {total.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
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
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4} className="text-right">
                      Total Amount:
                    </TableHead>
                    <TableHead className="font-semibold">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'SAR',
                        minimumFractionDigits: 2,
                      }).format(calculateTotal())}
                    </TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
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
                setLocation('/purchase/purchase-orders');
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <HugeiconsIcon icon={Orbit01Icon} className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>{isEditMode ? 'Update Purchase Order' : 'Create Purchase Order'}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
