import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft01Icon,
  UserIcon,
  CallIcon,
  File01Icon,
  CreditCardIcon,
  IdentityCardIcon,
  GlobeIcon,
  LanguageSquareIcon,
  Orbit01Icon,
  AlertCircleIcon,
  Edit01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'wouter';
import { api } from '@/lib/api';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Active
        </Badge>
      );
    case 'OnTrip':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
          On Trip
        </Badge>
      );
    case 'Vacation':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
          Vacation
        </Badge>
      );
    case 'Inactive':
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20"
        >
          Inactive
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPositionLabel = (position?: string) => {
  switch (position) {
    case 'HeavyDutyDriver':
      return 'Heavy Duty Driver';
    case 'MediumTruckDriver':
      return 'Medium Truck Driver';
    case 'BusDriver':
      return 'Bus Driver';
    default:
      return 'Not specified';
  }
};

export default function DriverDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const {
    data: driver,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['driver', id],
    queryFn: async () => {
      const response = await api.get(`/drivers/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error('Driver not found');
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

  if (error || !driver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <HugeiconsIcon icon={AlertCircleIcon} className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">Driver not found</h2>
          <p className="text-muted-foreground mt-2">The driver you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => setLocation('/drivers/list')}>
            Back to Drivers
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center gap-4">
        <Link href="/drivers/list">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{driver.name}</h1>
          <p className="text-muted-foreground">
            {driver.nationality} {driver.iqamaNumber && `- ${driver.iqamaNumber}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(driver.status)}
          <Button onClick={() => setLocation(`/drivers/list/${driver.id}/edit`)}>
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driver.badgeNo && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={IdentityCardIcon} className="h-4 w-4" />
                  Badge Number
                </span>
                <span className="font-medium font-mono">{driver.badgeNo}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={CreditCardIcon} className="h-4 w-4" />
                Iqama / ID
              </span>
              <span className="font-medium font-mono">{driver.iqamaNumber}</span>
            </div>
            {driver.position && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Position</span>
                <span className="font-medium">{getPositionLabel(driver.position)}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-2">
                <HugeiconsIcon icon={GlobeIcon} className="h-4 w-4" />
                Nationality
              </span>
              <span className="font-medium">{driver.nationality}</span>
            </div>
            {driver.sponsorship && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Sponsorship</span>
                <span className="font-medium">{driver.sponsorship}</span>
              </div>
            )}
            {driver.mobile && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={CallIcon} className="h-4 w-4" />
                  Mobile Number
                </span>
                <span className="font-medium font-mono">{driver.mobile}</span>
              </div>
            )}
            {driver.preferredLanguage && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground flex items-center gap-2">
                  <HugeiconsIcon icon={LanguageSquareIcon} className="h-4 w-4" />
                  Preferred Language
                </span>
                <span className="font-medium">{driver.preferredLanguage}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driver.driverCardExpiry && (
              <div className="flex justify-between items-center border p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-muted p-2 rounded">
                    <HugeiconsIcon icon={File01Icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Driver Card</div>
                    <div className="text-xs text-muted-foreground">
                      Expires: {formatDate(driver.driverCardExpiry)}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    new Date(driver.driverCardExpiry) > new Date() ? 'outline' : 'destructive'
                  }
                  className={
                    new Date(driver.driverCardExpiry) > new Date()
                      ? 'text-green-600 border-green-200 bg-green-50'
                      : ''
                  }
                >
                  {new Date(driver.driverCardExpiry) > new Date() ? 'Valid' : 'Expired'}
                </Badge>
              </div>
            )}
            <div className="flex justify-between items-center border p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded">
                  <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">Status</div>
                  <div className="text-xs text-muted-foreground">Current driver status</div>
                </div>
              </div>
              {getStatusBadge(driver.status)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
