import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft01Icon, Location03Icon, Building01Icon, GlobeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from "wouter";

export default function LocationDetailsPage() {
  const { id } = useParams();

  // Mock data fetching based on ID
  const location = {
    id: id || "LOC-001",
    name: "Riyadh Central Warehouse",
    type: "Warehouse",
    city: "Riyadh",
    country: "Saudi Arabia",
    coordinates: "24.7136, 46.6753",
    status: "Active",
    contact: {
        name: "Warehouse Manager",
        phone: "+966 11 222 3333",
        email: "ops.ruh@tms.com"
    },
    capacity: "5000 Pallet Positions"
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/config/locations">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{location.name}</h1>
          <p className="text-muted-foreground">{location.city}, {location.country}</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="default">{location.status}</Badge>
            <Button>Edit Location</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Type</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Building01Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{location.type}</span>
              </div>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Coordinates</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium font-mono text-xs">{location.coordinates}</span>
              </div>
            </div>
             <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Capacity</span>
              <span className="font-medium">{location.capacity}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
                <div className="font-medium">{location.contact.name}</div>
                <div className="text-sm text-muted-foreground">{location.contact.phone}</div>
                <div className="text-sm text-muted-foreground">{location.contact.email}</div>
            </div>
            <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">View on Map</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
