import { useParams } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft01Icon, UserIcon, Location03Icon, Calendar01Icon, Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from "wouter";

export default function TripDetailsPage() {
  const { id } = useParams();

  // Mock data fetching based on ID
  const trip = {
    id: id || "TRP-1001",
    driver: "Ahmed Al-Sayed",
    vehicle: "Mercedes Actros (123-KSA)",
    route: "Riyadh -> Dubai",
    currentLocation: "Al Batha Border",
    status: "At Border",
    eta: "2025-12-22",
    checkpoints: [
        { name: "Riyadh Warehouse", time: "2025-12-20 08:00 AM", status: "Departed" },
        { name: "Al Kharj Checkpoint", time: "2025-12-20 10:30 AM", status: "Passed" },
        { name: "Al Batha Border", time: "2025-12-20 04:00 PM", status: "Arrived" },
        { name: "Dubai Jebel Ali", time: "-", status: "Pending" }
    ]
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/ops/trips">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Trip {trip.id}</h1>
          <p className="text-muted-foreground">{trip.route}</p>
        </div>
        <div className="flex items-center gap-2">
            <Badge variant="destructive">{trip.status}</Badge>
            <Button>Update Status</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Driver</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{trip.driver}</span>
              </div>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Vehicle</span>
              <span className="font-medium">{trip.vehicle}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Current Location</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Location03Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{trip.currentLocation}</span>
              </div>
            </div>
             <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Estimated Arrival</span>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{trip.eta}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkpoint Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-muted ml-3 space-y-6 pb-2">
                {trip.checkpoints.map((cp, i) => (
                    <div key={i} className="pl-6 relative">
                        <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 ${cp.status === 'Pending' ? 'bg-background border-muted' : 'bg-primary border-primary'}`} />
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">{cp.name}</span>
                            <span className="text-xs text-muted-foreground">{cp.time}</span>
                            <span className="text-xs font-medium mt-1">{cp.status}</span>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
