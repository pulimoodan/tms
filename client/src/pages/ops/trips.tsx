import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusSignIcon, Search01Icon, Location03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TripForm, mockTripData } from '@/components/forms/trip-form';

const mockTrips = [
  {
    id: 'TRP-1001',
    driver: 'Ahmed Al-Sayed',
    vehicle: 'Mercedes Actros (123-KSA)',
    route: 'Riyadh -> Dubai',
    currentLocation: 'Al Batha Border',
    status: 'At Border',
    eta: '2025-12-22',
  },
  {
    id: 'TRP-1002',
    driver: 'Mohammed Khan',
    vehicle: 'Volvo FH16 (456-UAE)',
    route: 'Jeddah -> Riyadh',
    currentLocation: 'Mecca Highway',
    status: 'In Transit',
    eta: '2025-12-21',
  },
  {
    id: 'TRP-1003',
    driver: 'Rahul Singh',
    vehicle: 'Man TGX (789-KSA)',
    route: 'Dammam -> Kuwait City',
    currentLocation: 'Khafji Port',
    status: 'Customs Clearance',
    eta: '2025-12-21',
  },
];

export default function TripsPage() {
  const [, setLocation] = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any>(null);

  const openNewTripSheet = () => {
    setEditingTrip(null);
    setIsSheetOpen(true);
  };

  const openEditTripSheet = (trip: any) => {
    setEditingTrip(trip);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Trips Management</h1>
        <Button onClick={openNewTripSheet}>
          <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4" /> Plan New Trip
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Borders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-medium">Trip Status</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
              />
              <Input type="search" placeholder="Search trips..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip ID</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrips.map((trip) => (
                <TableRow
                  key={trip.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setLocation(`/ops/trips/${trip.id}`)}
                >
                  <TableCell className="font-medium">{trip.id}</TableCell>
                  <TableCell>{trip.driver}</TableCell>
                  <TableCell>{trip.vehicle}</TableCell>
                  <TableCell>{trip.route}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={Location03Icon}
                        className="h-3 w-3 text-muted-foreground"
                      />
                      {trip.currentLocation}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        trip.status === 'In Transit'
                          ? 'default'
                          : trip.status === 'At Border' || trip.status === 'Customs Clearance'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {trip.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{trip.eta}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditTripSheet(trip);
                      }}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{editingTrip ? 'Update Trip' : 'Plan New Trip'}</SheetTitle>
            <SheetDescription>
              {editingTrip
                ? 'Update trip status and location details.'
                : 'Schedule a new logistics trip.'}
            </SheetDescription>
          </SheetHeader>
          <TripForm
            initialData={editingTrip}
            isEditMode={!!editingTrip}
            onComplete={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
