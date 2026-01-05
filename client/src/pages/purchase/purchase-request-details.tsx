import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft01Icon,
  File01Icon,
  Calendar01Icon,
  Loading01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  ShoppingCart02Icon,
  Edit01Icon,
  Building01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PrinterIcon } from '@hugeicons/core-free-icons';

const statusColors: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  Approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const getFileUrl = (url: string) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
};

// Dummy data for products and vendors
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

export default function PurchaseRequestDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const { setEntityLabel } = useBreadcrumb();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateRFQDialog, setShowCreateRFQDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<
    Record<string, { selected: boolean; quantity: number }>
  >({});

  // Get status from localStorage to persist across page refreshes
  const getStoredStatus = (prId: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pr-status-${prId}`);
      return stored || 'Pending';
    }
    return 'Pending';
  };

  // Dummy data for now
  const dummyPR = {
    id: id || '1',
    prNumber: `PR-${id || '001'}`,
    requestNo: `PR-${id || '001'}`,
    description: 'Sample purchase request description for office supplies',
    sourceDocument: '',
    status: getStoredStatus(id || '1'),
    requestedDate: new Date().toISOString(),
    requestedBy: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        estimatedCost: 4500.0,
        description: 'Ergonomic office chair with adjustable height',
        proposedVendorId: '1',
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        estimatedCost: 1250.0,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
        proposedVendorId: '2',
      },
    ],
  };

  const {
    data: purchaseRequest,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['purchase-request', id],
    queryFn: async () => {
      if (!id) throw new Error('Purchase Request ID is required');
      // Return dummy data for now
      return { ...dummyPR, id };
      // const response = await api.get(`/purchase-requests/${id}`);
      // if (response.data.success && response.data.result) {
      //   return response.data.result;
      // }
      // throw new Error('Purchase Request not found');
    },
    enabled: !!id,
  });

  // Fetch RFQs created from this purchase request
  const { data: rfqs } = useQuery({
    queryKey: ['rfqs', id],
    queryFn: async () => {
      // Get RFQs from cache and filter by purchaseRequestId
      const cachedData = queryClient.getQueryData(['rfqs']);
      if (Array.isArray(cachedData)) {
        return cachedData.filter((rfq: any) => rfq.purchaseRequestId === id);
      }
      return [];
    },
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!id || !purchaseRequest) throw new Error('Purchase Request ID is required');
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Store status in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pr-status-${id}`, 'Approved');
      }
      // Update the purchase request status in the cache
      const updatedPR = {
        ...purchaseRequest,
        status: 'Approved',
        approvedDate: new Date().toISOString(),
        approvedBy: {
          id: 'current-user',
          name: 'Current User',
          email: 'user@example.com',
        },
      };
      queryClient.setQueryData(['purchase-request', id], updatedPR);
      // Also update in the list cache
      queryClient.setQueriesData({ queryKey: ['purchase-requests'] }, (old: any) => {
        if (!old) return old;
        // Handle both array and object with results property
        if (Array.isArray(old)) {
          return old.map((pr: any) => (pr.id === id ? { ...pr, status: 'Approved' } : pr));
        }
        if (old.results && Array.isArray(old.results)) {
          return {
            ...old,
            results: old.results.map((pr: any) =>
              pr.id === id ? { ...pr, status: 'Approved' } : pr,
            ),
          };
        }
        return old;
      });
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Purchase Request Approved',
        description: 'The purchase request has been approved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to approve purchase request',
      });
    },
  });

  // Initialize selected items when dialog opens
  useEffect(() => {
    if (showCreateRFQDialog && purchaseRequest?.items) {
      const initialItems: Record<string, { selected: boolean; quantity: number }> = {};
      purchaseRequest.items.forEach((item: any) => {
        initialItems[item.id] = {
          selected: true,
          quantity: item.quantity || 1,
        };
      });
      setSelectedItems(initialItems);
      setSelectedVendor('');
    }
  }, [showCreateRFQDialog, purchaseRequest]);

  const createRFQMutation = useMutation({
    mutationFn: async () => {
      if (!id || !purchaseRequest) throw new Error('Purchase Request ID is required');
      if (!selectedVendor) throw new Error('Please select a vendor');
      const selectedItemsList = Object.entries(selectedItems)
        .filter(([_, data]) => data.selected && data.quantity > 0)
        .map(([itemId, data]) => {
          const originalItem = purchaseRequest.items.find((item: any) => item.id === itemId);
          return {
            ...originalItem,
            quantity: data.quantity,
          };
        });
      if (selectedItemsList.length === 0)
        throw new Error('Please select at least one item with quantity greater than 0');
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Generate a new RFQ number
      const rfqNumber = `RFQ-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      const rfqId = `rfq-${Date.now()}`;
      const vendor = dummyVendors.find((v) => v.id === selectedVendor);
      // Create RFQ from purchase request items
      const rfqData = {
        id: rfqId,
        rfqNumber,
        rfqNo: rfqNumber,
        purchaseRequestId: id,
        purchaseRequest: {
          requestNo: purchaseRequest.prNumber,
          title: purchaseRequest.description,
        },
        items: selectedItemsList.map((item: any) => ({
          ...item,
          unitPrice: null,
          totalPrice: null,
        })),
        status: 'Draft',
        supplierName: vendor?.name,
        vendorId: selectedVendor,
        sentDate: undefined,
        dueDate: undefined,
        createdAt: new Date().toISOString(),
      };
      // Add RFQ to the RFQs list cache
      queryClient.setQueriesData({ queryKey: ['rfqs'] }, (old: any) => {
        if (!old || !Array.isArray(old)) return [rfqData];
        return [rfqData, ...old];
      });
      return { success: true, result: rfqData };
    },
    onSuccess: (data) => {
      toast({
        title: 'RFQ Created',
        description: `RFQ ${data.result?.rfqNumber || ''} has been created successfully.`,
      });
      setShowCreateRFQDialog(false);
      setSelectedVendor('');
      setSelectedItems({});
      if (data.result?.id) {
        // Navigate to RFQs list page
        setLocation('/purchase/rfqs');
      }
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create RFQ',
      });
    },
  });

  useEffect(() => {
    if (purchaseRequest?.prNumber) {
      setEntityLabel(purchaseRequest.prNumber);
    }
    return () => setEntityLabel(null);
  }, [purchaseRequest, setEntityLabel]);

  const getProductName = (productId: string) => {
    const product = dummyProducts.find((p) => p.id === productId);
    return product
      ? `${product.name} ${product.code ? `(${product.code})` : ''}`
      : 'Unknown Product';
  };

  const getVendorName = (vendorId: string) => {
    const vendor = dummyVendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : 'No vendor selected';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !purchaseRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Purchase Request Not Found</h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : 'The purchase request you are looking for does not exist.'}
          </p>
          <Button className="mt-4" onClick={() => setLocation('/purchase/purchase-requests')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
            Back to Purchase Requests
          </Button>
        </div>
      </div>
    );
  }

  const canApprove = purchaseRequest.status === 'Pending';
  const canCreateRFQ = purchaseRequest.status === 'Approved';

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation('/purchase/purchase-requests')}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{purchaseRequest.prNumber}</h1>
              <Badge className={statusColors[purchaseRequest.status] || statusColors.Draft}>
                {purchaseRequest.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Purchase Request Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setLocation(`/purchase/purchase-requests/${id}/edit`)}
          >
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {canApprove && (
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          )}
          {canCreateRFQ && (
            <Button onClick={() => setShowCreateRFQDialog(true)}>
              <HugeiconsIcon icon={ShoppingCart02Icon} className="mr-2 h-4 w-4" />
              Create RFQ
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setLocation(`/purchase/purchase-requests/${id}/print`)}
          >
            <HugeiconsIcon icon={PrinterIcon} className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Request Information</CardTitle>
              <CardDescription>Details about this purchase request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{purchaseRequest.description || '—'}</p>
              </div>
              {purchaseRequest.sourceDocument && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Source Document
                  </label>
                  <div className="mt-1">
                    <a
                      href={getFileUrl(purchaseRequest.sourceDocument)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
                      {purchaseRequest.sourceDocument.split('/').pop()}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Products requested in this purchase request</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[18%]">Product</TableHead>
                      <TableHead className="w-[32%]">Description</TableHead>
                      <TableHead className="w-[10%] text-right">Quantity</TableHead>
                      <TableHead className="w-[20%] text-right">Estimated Cost (SAR)</TableHead>
                      <TableHead className="w-[20%]">Proposed Vendor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseRequest.items && purchaseRequest.items.length > 0 ? (
                      purchaseRequest.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {getProductName(item.productId)}
                          </TableCell>
                          <TableCell className="max-w-md">
                            {item.description || '—'}
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {item.estimatedCost?.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || '0.00'}
                          </TableCell>
                          <TableCell>
                            {item.proposedVendorId ? (
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon
                                  icon={Building01Icon}
                                  className="h-4 w-4 text-muted-foreground shrink-0"
                                />
                                <span className="truncate">{getVendorName(item.proposedVendorId)}</span>
                              </div>
                            ) : (
                              '—'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {rfqs && rfqs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>RFQs Created ({rfqs.length})</CardTitle>
                <CardDescription>
                  RFQs (Request for Quotation) created from this purchase request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rfqs.map((rfq: any) => (
                    <div key={rfq.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon
                              icon={ShoppingCart02Icon}
                              className="h-5 w-5 text-primary"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{rfq.rfqNumber || rfq.rfqNo}</p>
                            <p className="text-sm text-muted-foreground">
                              Vendor: {rfq.supplierName || '—'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={rfq.status === 'Draft' ? 'secondary' : 'default'}>
                          {rfq.status}
                        </Badge>
                      </div>
                      {rfq.items && rfq.items.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Items ({rfq.items.length}):</p>
                          <div className="space-y-1">
                            {rfq.items.map((item: any, idx: number) => (
                              <div
                                key={item.id || idx}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <span className="w-6">•</span>
                                <span>
                                  {getProductName(item.productId)} - Qty: {item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/purchase/rfqs/${rfq.id}`)}
                        >
                          View RFQ
                        </Button>
                        {rfq.createdAt && (
                          <span className="text-xs text-muted-foreground">
                            Created: {format(new Date(rfq.createdAt), 'PPp')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">PR Number</label>
                <p className="mt-1 font-medium">{purchaseRequest.prNumber}</p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Requested Date</label>
                <div className="mt-1 flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                  <p>
                    {purchaseRequest.requestedDate
                      ? format(new Date(purchaseRequest.requestedDate), 'PPP')
                      : '—'}
                  </p>
                </div>
              </div>
              <Separator />
              {purchaseRequest.requestedBy && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Requested By</label>
                  <p className="mt-1">{purchaseRequest.requestedBy.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {purchaseRequest.requestedBy.email}
                  </p>
                </div>
              )}
              {rfqs && rfqs.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      RFQs Created
                    </label>
                    <p className="mt-1 font-medium">{rfqs.length}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCreateRFQDialog} onOpenChange={setShowCreateRFQDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create RFQ from Purchase Request</DialogTitle>
            <DialogDescription>
              Select a vendor and choose items with quantities to create a new RFQ (Request for
              Quotation).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="vendor" className="text-sm font-medium">
                Select Vendor *
              </Label>
              <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                <SelectTrigger id="vendor" className="mt-2">
                  <SelectValue placeholder="Select a vendor" />
                </SelectTrigger>
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
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">Select Items and Quantities</Label>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={
                            purchaseRequest.items?.every(
                              (item: any) => selectedItems[item.id]?.selected,
                            ) || false
                          }
                          onCheckedChange={(checked) => {
                            const newSelectedItems: Record<
                              string,
                              { selected: boolean; quantity: number }
                            > = {};
                            purchaseRequest.items?.forEach((item: any) => {
                              newSelectedItems[item.id] = {
                                selected: checked as boolean,
                                quantity: selectedItems[item.id]?.quantity || item.quantity || 1,
                              };
                            });
                            setSelectedItems(newSelectedItems);
                          }}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">Product</TableHead>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                      <TableHead className="min-w-[100px]">Original Qty</TableHead>
                      <TableHead className="min-w-[120px]">RFQ Quantity *</TableHead>
                      <TableHead className="min-w-[150px]">Estimated Cost (SAR)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseRequest.items && purchaseRequest.items.length > 0 ? (
                      purchaseRequest.items.map((item: any) => {
                        const itemData = selectedItems[item.id] || {
                          selected: false,
                          quantity: item.quantity || 1,
                        };
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Checkbox
                                checked={itemData.selected}
                                onCheckedChange={(checked) => {
                                  setSelectedItems({
                                    ...selectedItems,
                                    [item.id]: {
                                      selected: checked as boolean,
                                      quantity: itemData.quantity,
                                    },
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {getProductName(item.productId)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.description || '—'}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={itemData.quantity}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 0;
                                  setSelectedItems({
                                    ...selectedItems,
                                    [item.id]: {
                                      ...itemData,
                                      quantity: Math.max(0, qty),
                                    },
                                  });
                                }}
                                disabled={!itemData.selected}
                                className="w-full h-9"
                              />
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {item.estimatedCost?.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || '0.00'}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateRFQDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createRFQMutation.mutate()}
              disabled={createRFQMutation.isPending || !selectedVendor}
            >
              {createRFQMutation.isPending ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create RFQ'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
