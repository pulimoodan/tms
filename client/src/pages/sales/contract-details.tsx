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
  Calendar01Icon,
  File01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Building01Icon,
  CreditCardIcon,
  Clock01Icon,
  Orbit01Icon,
  ShippingTruck02Icon,
  Location03Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ContractDetailsPage() {
  const [match, params] = useRoute('/sales/contracts/:id');
  const [, setLocation] = useLocation();
  const { setEntityLabel } = useBreadcrumb();
  const id = params?.id;

  const {
    data: contract,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await api.get(`/contracts/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error('Contract not found');
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (contract?.contractNumber) {
      setEntityLabel(contract.contractNumber);
    }
    return () => setEntityLabel(null);
  }, [contract, setEntityLabel]);

  const { data: routes } = useQuery({
    queryKey: ['contract-routes', id],
    queryFn: async () => {
      if (!id) return [];
      const response = await api.get(`/contracts/${id}/routes`);
      if (response.data.success && Array.isArray(response.data.results)) {
        return response.data.results;
      }
      return [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Contract not found</h2>
          <p className="text-muted-foreground mt-2">
            The contract you're looking for doesn't exist or has been deleted.
          </p>
        </div>
        <Button onClick={() => setLocation('/sales/contracts')}>
          <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'Draft':
        return (
          <Badge
            variant="secondary"
            className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20"
          >
            <HugeiconsIcon icon={File01Icon} className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case 'Expired':
        return (
          <Badge
            variant="outline"
            className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20"
          >
            <HugeiconsIcon icon={Clock01Icon} className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case 'Terminated':
        return (
          <Badge
            variant="destructive"
            className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20"
          >
            <HugeiconsIcon icon={AlertCircleIcon} className="mr-1 h-3 w-3" />
            Terminated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isExpired = (endDate?: string) => {
    if (!endDate) return false;
    try {
      return new Date(endDate) < new Date();
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setLocation('/sales/contracts')}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{contract.contractNumber}</h1>
              {getStatusBadge(contract.status)}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <span className="font-mono text-xs">{contract.id}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation(`/sales/contracts/${id}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit Contract
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={File01Icon} className="h-5 w-5 text-primary" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Contract Number</p>
                <p className="font-mono text-sm font-medium">{contract.contractNumber}</p>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Customer</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Building01Icon} className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{contract.customer?.name || '—'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Credit Terms</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CreditCardIcon} className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{contract.creditTerm?.name || '—'}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Start Date</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{formatDate(contract.startDate)}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">End Date</p>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{formatDate(contract.endDate)}</p>
                  {isExpired(contract.endDate) && (
                    <Badge variant="destructive" className="text-xs">
                      Expired
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDate(contract.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDate(contract.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-primary" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                {contract.bankGuarantee ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="h-4 w-4 text-emerald-500"
                  />
                ) : (
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Bank Guarantee Required</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {contract.insurance ? (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="h-4 w-4 text-emerald-500"
                  />
                ) : (
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4 text-muted-foreground" />
                )}
                <span>Insurance Required</span>
              </div>
              {contract.maxWaitingHours && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Max Waiting Hours</p>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium text-sm">{contract.maxWaitingHours}h</p>
                  </div>
                </div>
              )}
              {contract.waitingCharge && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Waiting Charge per Hour</p>
                  <p className="font-medium text-sm">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'SAR' }).format(
                      contract.waitingCharge,
                    )}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="routes">Routes</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                  <CardDescription>Complete contract information and terms</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                  {contract.material && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Material</p>
                      <p className="font-medium text-sm">{contract.material}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    {getStatusBadge(contract.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Contract Period</p>
                    <p className="font-medium text-sm">
                      {formatDate(contract.startDate)} — {formatDate(contract.endDate)}
                    </p>
                  </div>
                  {contract.maxWaitingHours && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Waiting Hours</p>
                      <p className="font-medium text-sm">{contract.maxWaitingHours} hours</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="routes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Routes & Pricing</CardTitle>
                  <CardDescription>
                    Service routes and agreed pricing for this contract
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {routes && routes.length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Vehicle Type</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {routes.map((route: any) => (
                            <TableRow key={route.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <HugeiconsIcon
                                    icon={Location03Icon}
                                    className="h-4 w-4 text-muted-foreground"
                                  />
                                  <span>{route.from?.name || '—'}</span>
                                  {route.from?.code && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                      ({route.from.code})
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <HugeiconsIcon
                                    icon={Location03Icon}
                                    className="h-4 w-4 text-muted-foreground"
                                  />
                                  <span>{route.to?.name || '—'}</span>
                                  {route.to?.code && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                      ({route.to.code})
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <HugeiconsIcon
                                    icon={ShippingTruck02Icon}
                                    className="h-4 w-4 text-muted-foreground"
                                  />
                                  <span>{route.vehicleType?.name || '—'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'SAR',
                                }).format(route.price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                      <HugeiconsIcon
                        icon={ShippingTruck02Icon}
                        className="h-8 w-8 mb-2 opacity-50"
                      />
                      <p className="text-sm">No routes defined for this contract</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>Contract documents and attachments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex flex-col items-center justify-center text-muted-foreground border-dashed border rounded-md">
                    <HugeiconsIcon icon={File01Icon} className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No documents uploaded</p>
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
