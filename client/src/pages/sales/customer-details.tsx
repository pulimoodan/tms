import { useRoute, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useBreadcrumb } from '@/context/breadcrumb-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft01Icon,
  Edit01Icon,
  Location03Icon,
  Building01Icon,
  File01Icon,
  Calendar01Icon,
  Download01Icon,
  LinkSquare01Icon,
  Orbit01Icon,
  AlertCircleIcon,
  Delete01Icon,
  ArrowLeft02Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { fetchCustomerRoutes, deleteCustomerRoute } from '@/lib/api-helpers';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function CustomerDetailsPage() {
  const [match, params] = useRoute('/sales/customers/:id');
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const id = params?.id;

  const {
    data: customer,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await api.get(`/customers/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error('Customer not found');
    },
    enabled: !!id,
  });

  const {
    data: routes = [],
    isLoading: routesLoading,
    refetch: refetchRoutes,
  } = useQuery({
    queryKey: ['customer-routes', id],
    queryFn: () => fetchCustomerRoutes(id!),
    enabled: !!id,
  });

  const deleteRouteMutation = useMutation({
    mutationFn: (routeId: string) => deleteCustomerRoute(id!, routeId),
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
    if (customer?.name) {
      setEntityLabel(customer.name);
    }
    return () => setEntityLabel(null);
  }, [customer, setEntityLabel]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Customer not found</h2>
          <p className="text-muted-foreground mt-2">
            The customer you're looking for doesn't exist or has been deleted.
          </p>
        </div>
        <Button onClick={() => setLocation('/sales/customers')}>
          <HugeiconsIcon icon={ArrowLeft02Icon} className="mr-2 h-4 w-4" />
          Back to Customers
        </Button>
      </div>
    );
  }

  const getFileUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const isExpired = (dateString?: string) => {
    if (!dateString) return false;
    try {
      return new Date(dateString) < new Date();
    } catch {
      return false;
    }
  };

  const isExpiringSoon = (dateString?: string) => {
    if (!dateString) return false;
    try {
      const expiryDate = new Date(dateString);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate < thirtyDaysFromNow && expiryDate >= new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/sales/customers')}>
            <HugeiconsIcon icon={ArrowLeft02Icon} className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
              {customer.nameArabic && (
                <p className="text-lg text-muted-foreground">({customer.nameArabic})</p>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-mono text-xs">{customer.id}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/sales/customers/${id}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit Customer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Building01Icon} className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customer.crNo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CR Number</p>
                  <p className="font-mono text-sm font-medium">{customer.crNo}</p>
                </div>
              )}
              {customer.crExpiryDate && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">CR Expiry Date</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{formatDate(customer.crExpiryDate)}</p>
                    {isExpired(customer.crExpiryDate) && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                    {!isExpired(customer.crExpiryDate) && isExpiringSoon(customer.crExpiryDate) && (
                      <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              {customer.vatNo && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">VAT Number</p>
                  <p className="font-mono text-sm font-medium">{customer.vatNo}</p>
                </div>
              )}
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(customer.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(customer.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Location03Icon} className="h-5 w-5 text-primary" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.street || customer.district || customer.city || customer.country ? (
                <>
                  {customer.buildingNo && customer.secondaryNo && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Building</p>
                      <p className="text-sm font-medium">
                        {customer.buildingNo} / {customer.secondaryNo}
                      </p>
                    </div>
                  )}
                  {customer.street && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Street</p>
                      <p className="text-sm font-medium">{customer.street}</p>
                      {customer.streetArabic && (
                        <p className="text-xs text-muted-foreground">{customer.streetArabic}</p>
                      )}
                    </div>
                  )}
                  {customer.district && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="text-sm font-medium">{customer.district}</p>
                      {customer.districtArabic && (
                        <p className="text-xs text-muted-foreground">{customer.districtArabic}</p>
                      )}
                    </div>
                  )}
                  {(customer.city || customer.country) && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">
                        {customer.city && customer.country
                          ? `${customer.city}, ${customer.country}`
                          : customer.city || customer.country}
                      </p>
                    </div>
                  )}
                  {customer.postalCode && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Postal Code</p>
                      <p className="text-sm font-medium">{customer.postalCode}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No address information available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="routes">Routes ({routes.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Complete business and registration information</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  {customer.crNo && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Commercial Registration</p>
                      <p className="font-mono text-sm font-medium">{customer.crNo}</p>
                    </div>
                  )}
                  {customer.crExpiryDate && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CR Expiry Date</p>
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Calendar01Icon}
                          className="h-4 w-4 text-muted-foreground"
                        />
                        <p className="font-medium text-sm">{formatDate(customer.crExpiryDate)}</p>
                        {isExpired(customer.crExpiryDate) && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                        {!isExpired(customer.crExpiryDate) &&
                          isExpiringSoon(customer.crExpiryDate) && (
                            <Badge
                              variant="outline"
                              className="text-xs border-amber-500 text-amber-600"
                            >
                              Expiring Soon
                            </Badge>
                          )}
                      </div>
                    </div>
                  )}
                  {customer.vatNo && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">VAT Number</p>
                      <p className="font-mono text-sm font-medium">{customer.vatNo}</p>
                    </div>
                  )}
                  {customer.buildingNo && customer.secondaryNo && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Building Number</p>
                      <p className="font-medium text-sm">
                        {customer.buildingNo} / {customer.secondaryNo}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Routes</CardTitle>
                      <CardDescription>Configured routes for this customer</CardDescription>
                    </div>
                    <Button onClick={() => setLocation(`/sales/customers/${id}/edit`)}>
                      <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                      Manage Routes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {routesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <HugeiconsIcon
                        icon={Orbit01Icon}
                        className="h-6 w-6 animate-spin text-primary"
                      />
                    </div>
                  ) : routes.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                      <HugeiconsIcon icon={Location03Icon} className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No routes configured</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setLocation(`/sales/customers/${id}/edit`)}
                      >
                        <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" />
                        Add Routes
                      </Button>
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
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this route?')) {
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Customer registration and certification documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customer.nationalAddress || customer.crCertificate || customer.vatCertificate ? (
                    <>
                      {customer.nationalAddress && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">National Address</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.nationalAddress.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={getFileUrl(customer.nationalAddress) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={getFileUrl(customer.nationalAddress) || '#'} download>
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {customer.crCertificate && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">CR Certificate</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.crCertificate.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={getFileUrl(customer.crCertificate) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={getFileUrl(customer.crCertificate) || '#'} download>
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}

                      {customer.vatCertificate && (
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">VAT Certificate</p>
                              <p className="text-xs text-muted-foreground">
                                {customer.vatCertificate.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={getFileUrl(customer.vatCertificate) || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <HugeiconsIcon icon={LinkSquare01Icon} className="h-4 w-4 mr-2" />
                                View
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={getFileUrl(customer.vatCertificate) || '#'} download>
                                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                      <HugeiconsIcon icon={File01Icon} className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">No documents uploaded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contracts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contracts</CardTitle>
                  <CardDescription>
                    Active and historical contracts with this customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                    <HugeiconsIcon icon={File01Icon} className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No contracts found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Orders</CardTitle>
                  <CardDescription>Order history and shipment records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                    <HugeiconsIcon icon={File01Icon} className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No orders found</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
