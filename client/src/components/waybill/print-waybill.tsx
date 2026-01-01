import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PrintWaybillProps {
  waybill: {
    id: string;
    orderNo: string;
    customer?: {
      name: string;
      nameArabic?: string;
      street?: string;
      city?: string;
      country?: string;
    };
    from?: {
      name: string;
      nameArabic?: string;
      street?: string;
      city?: string;
      country?: string;
    };
    to?: {
      name: string;
      nameArabic?: string;
      street?: string;
      city?: string;
      country?: string;
    };
    contract?: {
      contractNumber: string;
    };
    vehicle?: {
      plateNumber: string;
      plateNumberArabic?: string;
      vehicleType?: {
        name: string;
      };
    };
    driver?: {
      name: string;
      mobile?: string;
    };
    weight?: number;
    volume?: number;
    status: string;
    createdAt: string;
  };
  company?: {
    name: string;
    nameArabic?: string;
    street?: string;
    city?: string;
    country?: string;
    crNo?: string;
    vatNo?: string;
  };
  open: boolean;
  onClose: () => void;
}

export function PrintWaybill({ waybill, company, open, onClose }: PrintWaybillProps) {
  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto print:max-w-none print:max-h-none print:p-0 print:m-0 print:border-0 print:shadow-none">
        <div className="print:hidden flex items-center justify-between mb-4">
          <DialogHeader>
            <DialogTitle>Print Waybill</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="default">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="bg-white print:bg-white p-8 print:p-6 space-y-6 print:space-y-4">
          <style>
            {`
              @media print {
                @page {
                  size: A4;
                  margin: 1cm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .print\\:hidden {
                  display: none !important;
                }
                .print\\:block {
                  display: block !important;
                }
                .print\\:border {
                  border: 1px solid #000 !important;
                }
                .print\\:break-inside-avoid {
                  break-inside: avoid;
                }
              }
            `}
          </style>

          <div className="border-b-2 border-gray-900 pb-4 print:border-b-2 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold print:text-2xl">WAYBILL</h1>
                <p className="text-sm text-gray-600 print:text-xs mt-1">
                  Shipping Document
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold print:text-xs">Waybill No:</p>
                <p className="text-2xl font-bold print:text-xl">{waybill.orderNo}</p>
                <p className="text-xs text-gray-600 print:text-xs mt-1">
                  Date: {formatDate(waybill.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 print:gap-4 print:break-inside-avoid">
            <div className="space-y-4 print:space-y-2">
              <div>
                <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                  Shipper / Company
                </h3>
                {company && (
                  <div className="text-sm print:text-xs space-y-1">
                    <p className="font-semibold">{company.name}</p>
                    {company.nameArabic && (
                      <p className="text-right" dir="rtl">{company.nameArabic}</p>
                    )}
                    {company.street && <p>{company.street}</p>}
                    <p>
                      {company.city && `${company.city}, `}
                      {company.country}
                    </p>
                    {company.crNo && <p>CR No: {company.crNo}</p>}
                    {company.vatNo && <p>VAT No: {company.vatNo}</p>}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                  From / Origin
                </h3>
                {waybill.from && (
                  <div className="text-sm print:text-xs space-y-1">
                    <p className="font-semibold">{waybill.from.name}</p>
                    {waybill.from.nameArabic && (
                      <p className="text-right" dir="rtl">{waybill.from.nameArabic}</p>
                    )}
                    {waybill.from.street && <p>{waybill.from.street}</p>}
                    <p>
                      {waybill.from.city && `${waybill.from.city}, `}
                      {waybill.from.country}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 print:space-y-2">
              <div>
                <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                  Consignee / Customer
                </h3>
                {waybill.customer && (
                  <div className="text-sm print:text-xs space-y-1">
                    <p className="font-semibold">{waybill.customer.name}</p>
                    {waybill.customer.nameArabic && (
                      <p className="text-right" dir="rtl">{waybill.customer.nameArabic}</p>
                    )}
                    {waybill.customer.street && <p>{waybill.customer.street}</p>}
                    <p>
                      {waybill.customer.city && `${waybill.customer.city}, `}
                      {waybill.customer.country}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                  To / Destination
                </h3>
                {waybill.to && (
                  <div className="text-sm print:text-xs space-y-1">
                    <p className="font-semibold">{waybill.to.name}</p>
                    {waybill.to.nameArabic && (
                      <p className="text-right" dir="rtl">{waybill.to.nameArabic}</p>
                    )}
                    {waybill.to.street && <p>{waybill.to.street}</p>}
                    <p>
                      {waybill.to.city && `${waybill.to.city}, `}
                      {waybill.to.country}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 print:gap-2 print:break-inside-avoid border-t border-gray-300 pt-4 print:pt-2">
            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                Vehicle Information
              </h3>
              {waybill.vehicle ? (
                <div className="text-sm print:text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Plate:</span> {waybill.vehicle.plateNumber}
                  </p>
                  {waybill.vehicle.plateNumberArabic && (
                    <p className="text-right" dir="rtl">
                      {waybill.vehicle.plateNumberArabic}
                    </p>
                  )}
                  {waybill.vehicle.vehicleType && (
                    <p>
                      <span className="font-semibold">Type:</span> {waybill.vehicle.vehicleType.name}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm print:text-xs text-gray-500">Not assigned</p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                Driver Information
              </h3>
              {waybill.driver ? (
                <div className="text-sm print:text-xs space-y-1">
                  <p>
                    <span className="font-semibold">Name:</span> {waybill.driver.name}
                  </p>
                  {waybill.driver.mobile && (
                    <p>
                      <span className="font-semibold">Mobile:</span> {waybill.driver.mobile}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm print:text-xs text-gray-500">Not assigned</p>
              )}
            </div>

            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase border-b border-gray-300 pb-1 mb-2">
                Cargo Details
              </h3>
              <div className="text-sm print:text-xs space-y-1">
                {waybill.weight && (
                  <p>
                    <span className="font-semibold">Weight:</span> {waybill.weight} kg
                  </p>
                )}
                {waybill.volume && (
                  <p>
                    <span className="font-semibold">Volume:</span> {waybill.volume} m³
                  </p>
                )}
                {waybill.contract && (
                  <p>
                    <span className="font-semibold">Contract:</span> {waybill.contract.contractNumber}
                  </p>
                )}
                <p>
                  <span className="font-semibold">Status:</span> {waybill.status}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-900 pt-4 print:pt-2 print:border-t-2 print:border-black mt-6 print:mt-4 print:break-inside-avoid">
            <div className="grid grid-cols-2 gap-4 print:gap-2">
              <div>
                <p className="text-xs print:text-xs text-gray-600 mb-2">
                  <strong>Terms & Conditions:</strong>
                </p>
                <ul className="text-xs print:text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>Goods are received in apparent good order and condition</li>
                  <li>Carrier is not responsible for loss or damage unless proven negligence</li>
                  <li>All disputes subject to jurisdiction of origin country</li>
                </ul>
              </div>
              <div className="text-right">
                <div className="mt-8 print:mt-6 space-y-2 print:space-y-1">
                  <div className="border-t border-gray-900 pt-2 print:pt-1 print:border-t print:border-black">
                    <p className="text-xs print:text-xs">Authorized Signature</p>
                  </div>
                  <div className="border-t border-gray-900 pt-2 print:pt-1 print:border-t print:border-black mt-4 print:mt-2">
                    <p className="text-xs print:text-xs">Driver Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-xs print:text-xs text-gray-500 mt-4 print:mt-2 border-t border-gray-300 pt-2 print:pt-1">
            <p>This is a computer-generated document. No signature required for electronic version.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

