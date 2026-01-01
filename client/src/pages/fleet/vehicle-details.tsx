import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft01Icon, Edit01Icon, Delete01Icon, Download01Icon, ShippingTruck02Icon, Loading01Icon, AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { api } from "@/lib/api";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Active':
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
          Active
        </Badge>
      );
    case 'InMaintenance':
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20">
          In Maintenance
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
    case 'OnTrip':
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20">
          On Trip
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getCategoryLabel = (category: string) => {
  const labels: { [key: string]: string } = {
    TractorHead: 'Tractor Head',
    FourXTwoTractorHead: '4X2 Tractor Head',
    CraneMountedTruck: 'Crane Mounted Truck',
    LightDutyTruck: 'Light Duty Truck',
    BoomTruck: 'Boom Truck',
    DieselTanker: 'Diesel Tanker',
    MiniVan: 'Mini Van',
    Pickup: 'Pickup',
    SUV: 'SUV',
    FlatBedTrailer: 'Flat Bed Trailer',
    LowBedTrailer: 'Low Bed Trailer',
    DryBox: 'Dry Box',
    CurtainSide: 'Curtain Side',
    HydraulicWinchWithBox: 'Hydraulic Winch With Box',
    Forklift: 'Forklift',
    BackhoLoader: 'Backho Loader',
    RoughTerrainCrane: 'Rough Terrain Crane',
    SkidLoader: 'Skid Loader',
  };
  return labels[category] || category;
};

export default function VehicleDetailsPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams();

  const { data: vehicle, isLoading, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const response = await api.get(`/vehicles/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      throw new Error('Vehicle not found');
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/fleet/vehicles")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>Vehicle not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/fleet/vehicles")}
            data-testid="button-back-vehicles"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <HugeiconsIcon icon={ShippingTruck02Icon} className="h-8 w-8 text-primary" />
              {vehicle.name}
            </h1>
            <p className="text-muted-foreground">{getCategoryLabel(vehicle.category)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <HugeiconsIcon icon={Download01Icon} className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => setLocation(`/fleet/vehicles/${vehicle.id}/edit`)}
            data-testid="button-edit-vehicle"
          >
            <HugeiconsIcon icon={Edit01Icon} className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(vehicle.status)}
              </div>

              <div className="pt-4 border-t space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold" data-testid="text-vehicle-type">
                    {vehicle.type}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-semibold" data-testid="text-vehicle-category">
                    {getCategoryLabel(vehicle.category)}
                  </p>
                </div>
                {vehicle.asset && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Asset Number</p>
                    <p className="font-mono text-sm font-semibold" data-testid="text-asset">
                      {vehicle.asset}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {vehicle.plateNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Plate Number</p>
                    <p className="font-semibold" data-testid="text-plate-number">
                      {vehicle.plateNumber}
                    </p>
                    {vehicle.plateNumberArabic && (
                      <p className="text-xs text-muted-foreground mt-1">{vehicle.plateNumberArabic}</p>
                    )}
                  </div>
                )}
                {vehicle.doorNo && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Door Number</p>
                    <p className="font-semibold" data-testid="text-door-no">
                      {vehicle.doorNo}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {vehicle.make && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Make</p>
                    <p className="font-semibold" data-testid="text-make">
                      {vehicle.make}
                    </p>
                  </div>
                )}
                {vehicle.model && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Model</p>
                    <p className="font-semibold" data-testid="text-model">
                      {vehicle.model}
                    </p>
                  </div>
                )}
              </div>

              {vehicle.equipmentNo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Equipment Number</p>
                  <p className="font-semibold" data-testid="text-equipment-no">
                    {vehicle.equipmentNo}
                  </p>
                </div>
              )}

              {vehicle.equipmentType && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Equipment Type</p>
                  <p className="font-semibold" data-testid="text-equipment-type">
                    {vehicle.equipmentType}
                  </p>
                </div>
              )}

              {vehicle.sequenceNo && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sequence Number</p>
                  <p className="font-mono text-sm font-semibold" data-testid="text-sequence-no">
                    {vehicle.sequenceNo}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {(vehicle.engineModel || vehicle.horsePower || vehicle.manufacturingYear || vehicle.engineSerialNo) && (
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Engine Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {vehicle.engineModel && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Engine Model</p>
                      <p className="font-semibold" data-testid="text-engine-model">
                        {vehicle.engineModel}
                      </p>
                    </div>
                  )}
                  {vehicle.horsePower && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Horse Power</p>
                      <p className="font-semibold" data-testid="text-horse-power">
                        {vehicle.horsePower} HP
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {vehicle.manufacturingYear && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Manufacturing Year</p>
                      <p className="font-semibold" data-testid="text-manufacturing-year">
                        {vehicle.manufacturingYear}
                      </p>
                    </div>
                  )}
                  {vehicle.engineSerialNo && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Engine Serial Number</p>
                      <p className="font-mono text-sm font-semibold" data-testid="text-engine-serial">
                        {vehicle.engineSerialNo}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {vehicle.chassisNo && (
            <Card className="border border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Identifiers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Chassis Number</p>
                  <p className="font-mono text-sm font-semibold" data-testid="text-chassis-no">
                    {vehicle.chassisNo}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

