import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { WaybillForm } from "@/components/forms/waybill-form";

export default function WaybillFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/ops/waybills/:id/edit");
  const isEditMode = !!match;
  const orderId = params?.id;

  const handleComplete = () => {
    setLocation("/ops/waybills");
  };

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setLocation("/ops/waybills")}
          data-testid="button-back"
          className="flex-shrink-0"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Waybill" : "New Waybill"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode 
              ? "Update waybill details and shipment information" 
              : "Create a new waybill for shipment tracking"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <WaybillForm 
          isEditMode={isEditMode}
          orderId={orderId}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
