import { useEffect } from 'react';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export default function PrintWaybillPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const { user } = useAuth();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await api.get(`/users/${user?.id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      return null;
    },
    enabled: !!user?.id,
  });

  const companyId = currentUser?.companyId;

  const { data: company, isLoading: isLoadingCompany } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      const response = await api.get(`/companies/${companyId}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      return null;
    },
    enabled: !!companyId,
  });

  const { data: order, isLoading: isLoadingOrder } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/orders/${id}`);
      if (response.data.success && response.data.result) {
        return response.data.result;
      }
      return null;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (order && company && !isLoadingOrder && !isLoadingCompany) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [order, company, isLoadingOrder, isLoadingCompany]);

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return {
      date: date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
  };

  if (isLoadingOrder || isLoadingCompany || !order || !company) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white print:bg-white">
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
              background: white;
            }
            .no-print {
              display: none !important;
            }
            .print-break-avoid {
              break-inside: avoid;
            }
            table {
              border-collapse: collapse;
              width: 100%;
            }
            table td, table th {
              border: 1px solid #000;
              padding: 4px 8px;
              font-size: 10px;
            }
            table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
          }
          @media screen {
            .no-print {
              display: block;
            }
          }
        `}
      </style>

      <div className="no-print p-4 bg-gray-100 border-b">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h2 className="text-lg font-semibold">Waybill Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print / Download PDF
            </button>
            <button
              onClick={() => setLocation(`/ops/orders/${id}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8 print:p-4 space-y-3 print:space-y-2">
        <div className="border-b-2 border-gray-900 pb-3 print:border-b-2 print:border-black print:pb-2 print-break-avoid mb-2 print:mb-1">
          <div className="flex justify-between items-start gap-4 print:gap-3">
            <div className="flex items-start gap-3 print:gap-2 flex-1 min-w-0">
              <div className="shrink-0">
                <img
                  src="/company-logo.png"
                  alt={company.name || 'Company Logo'}
                  className="h-16 w-auto print:h-20 object-contain"
                  style={{ maxWidth: '280px' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold print:text-lg mb-1.5 print:mb-1 text-gray-900">
                  TRUCKING WAYBILL
                </h1>
                {company.name && (
                  <p className="text-xs font-semibold text-gray-800 print:text-xs print:text-gray-900 mb-0.5">
                    {company.name}
                  </p>
                )}
                {(company.street || company.city || company.country) && (
                  <p className="text-xs text-gray-600 print:text-xs leading-tight">
                    {[company.street, company.city, company.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0 border-l border-gray-300 pl-3 print:border-gray-400 print:pl-2">
              <p className="text-xs font-semibold text-gray-700 print:text-xs print:text-gray-900 mb-0.5">
                Waybill Number:
              </p>
              <p className="text-lg font-bold print:text-base text-gray-900 mb-1 print:mb-0.5">{order.orderNo}</p>
              <p className="text-xs text-gray-600 print:text-xs">
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {order.contract?.contractNumber && (
          <div className="print-break-avoid mb-2 print:mb-1">
            <p className="text-xs font-semibold print:text-xs mb-0.5">Agreement NO:</p>
            <p className="text-xs print:text-xs">{order.contract.contractNumber}</p>
          </div>
        )}

        <div className="border-t border-gray-300 pt-2 print:pt-1.5 print-break-avoid mb-2 print:mb-1">
          <h3 className="font-bold text-xs print:text-xs uppercase mb-1.5 print:mb-1">Consignment Details</h3>
          <div className="grid grid-cols-2 gap-3 print:gap-2 text-xs print:text-xs">
            <div>
              <p className="font-semibold mb-0.5">Consignor:</p>
              <p>{company.name}</p>
            </div>
            <div>
              <p className="font-semibold mb-0.5">Consignee:</p>
              <p>{order.customer?.name || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-2 print:pt-1.5 print-break-avoid mb-2 print:mb-1">
          <div className="grid grid-cols-2 gap-3 print:gap-2">
            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase mb-2">Shipment Details</h3>
              <div className="text-xs print:text-xs space-y-1">
                <p>
                  <span className="font-semibold">Loading Point:</span> {order.from?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-semibold">Delivery Point:</span> {order.to?.name || 'N/A'}
                </p>
                {order.eta && (
                  <p>
                    <span className="font-semibold">ETA:</span>{' '}
                    {(() => {
                      const dt = formatDateTime(order.eta);
                      return typeof dt === 'string'
                        ? formatDate(order.eta)
                        : `${dt.date} ${dt.time}`;
                    })()}
                  </p>
                )}
                {order.vesselName && (
                  <p>
                    <span className="font-semibold">Vessel Name:</span> {order.vesselName}
                  </p>
                )}
                {order.croNumber && (
                  <p>
                    <span className="font-semibold">CRO Number:</span> {order.croNumber}
                  </p>
                )}
                {order.customerContact && (
                  <p>
                    <span className="font-semibold">Customer Contact:</span> {order.customerContact}
                  </p>
                )}
                {order.transporter && (
                  <p>
                    <span className="font-semibold">Transporter:</span> {order.transporter}
                  </p>
                )}
                {order.portOfLoading && (
                  <p>
                    <span className="font-semibold">Port Of Loading:</span> {order.portOfLoading}
                  </p>
                )}
                {order.shippingLine && (
                  <p>
                    <span className="font-semibold">Shipping Line:</span> {order.shippingLine}
                  </p>
                )}
                {(order.requestedDate || order.requestedTime) && (
                  <p>
                    <span className="font-semibold">Requested Date:</span>{' '}
                    {order.requestedDate ? formatDate(order.requestedDate) : ''}{' '}
                    {order.requestedTime || ''}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase mb-2">
                Truck, Trailer and Driver Details
              </h3>
              <div className="text-xs print:text-xs space-y-1">
                {order.driver && (
                  <>
                    <p>
                      <span className="font-semibold">Driver ID:</span>{' '}
                      {order.driver.iqamaNumber || order.driver.badgeNo || 'N/A'}
                    </p>
                    <p>
                      <span className="font-semibold">Driver Name:</span> {order.driver.name}
                    </p>
                    {order.driver.mobile && (
                      <p>
                        <span className="font-semibold">Driver Mobile:</span> {order.driver.mobile}
                      </p>
                    )}
                  </>
                )}
                {order.vehicle && (
                  <>
                    <p>
                      <span className="font-semibold">Truck:</span> {order.vehicle.plateNumber}
                      {order.vehicle.chassisNo && ` (Chassis: ${order.vehicle.chassisNo})`}
                    </p>
                    {order.vehicle.doorNo && (
                      <p>
                        <span className="font-semibold">Door #/ Plate ID:</span>{' '}
                        {order.vehicle.doorNo}
                      </p>
                    )}
                  </>
                )}
                {order.attachment && (
                  <>
                    <p>
                      <span className="font-semibold">Attachment:</span>{' '}
                      {order.attachment.name || 'N/A'}
                      {order.attachment.chassisNo && ` (Chassis: ${order.attachment.chassisNo})`}
                    </p>
                  </>
                )}
                {order.trailerNumber && (
                  <p>
                    <span className="font-semibold">Trailer #:</span> {order.trailerNumber}
                  </p>
                )}
                {order.startKms !== null && order.startKms !== undefined && (
                  <p>
                    <span className="font-semibold">Start KMs:</span> {order.startKms}
                  </p>
                )}
                {order.kmOut !== null && order.kmOut !== undefined && (
                  <p>
                    <span className="font-semibold">Km Out:</span> {order.kmOut}
                  </p>
                )}
                {order.kmIn !== null && order.kmIn !== undefined && (
                  <p>
                    <span className="font-semibold">Km In:</span> {order.kmIn}
                  </p>
                )}
                {order.runKm !== null && order.runKm !== undefined && (
                  <p>
                    <span className="font-semibold">Run Km:</span> {order.runKm}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-3 print:pt-2 print-break-avoid">
          <h3 className="font-bold text-sm print:text-xs uppercase mb-2">Cargo Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs print:text-xs border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Customer Details
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Cargo Description
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Container Number
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Container Size
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Weight UOM
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Weight
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    Value (SAR)
                  </th>
                  <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                    SI/ No
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.customer?.name || 'N/A'}
                    {order.customerContact && (
                      <div className="text-xs text-gray-600 mt-0.5">{order.customerContact}</div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.cargoDescription || 'N/A'}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.containerNumber || 'N/A'}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.containerSize || 'N/A'}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">{order.weightUom || 'TON'}</td>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.weight
                      ? order.weightUom === 'KG'
                        ? Number(order.weight)
                        : Number(order.weight) / 1000
                      : 'N/A'}
                    {order.tareWeight && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        TARE WT: {Number(order.tareWeight)}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">
                    {order.value ? Number(order.value).toLocaleString() : 'N/A'}
                  </td>
                  <td className="border border-gray-400 px-2 py-1">1</td>
                </tr>
              </tbody>
            </table>
          </div>
          {order.bookingNumber && (
            <div className="mt-2 text-xs print:text-xs">
              <p>
                <span className="font-semibold">Booking Number:</span> {order.bookingNumber}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 pt-3 print:pt-2 print-break-avoid">
          <div className="grid grid-cols-3 gap-4 print:gap-3">
            <div className="col-span-2">
              <h3 className="font-bold text-sm print:text-xs uppercase mb-2">Loading Activities</h3>
              <table className="w-full text-xs print:text-xs border border-gray-400">
                <thead>
                  <tr>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                      Arrival at Loading Point
                      <div className="text-xs font-normal text-gray-600">مكان التحميل</div>
                    </th>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                      Completed Loading
                      <div className="text-xs font-normal text-gray-600">الانتهاء من التفريغ</div>
                    </th>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                      Dispatch from Loading Point
                      <div className="text-xs font-normal text-gray-600">الترحيل</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-bold text-sm print:text-xs uppercase mb-2">
                Offloading Activities
              </h3>
              <table className="w-full text-xs print:text-xs border border-gray-400">
                <thead>
                  <tr>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                      Arrival at Offloading
                      <div className="text-xs font-normal text-gray-600">وصول الوجهه</div>
                    </th>
                    <th className="border border-gray-400 px-2 py-1 bg-gray-100 font-semibold text-left">
                      Completed Unloading
                      <div className="text-xs font-normal text-gray-600">انتهاء التفريغ</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10 font-semibold">
                      Date
                      <div className="text-xs font-normal text-gray-600">التاريخ</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10"></td>
                    <td className="border border-gray-400 px-2 py-2 h-12 print:h-10 font-semibold">
                      Time
                      <div className="text-xs font-normal text-gray-600">الوقت</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {order.remarks && (
          <div className="border-t border-gray-300 pt-3 print:pt-2 print-break-avoid">
            <h3 className="font-bold text-sm print:text-xs uppercase mb-2">Remarks</h3>
            <p className="text-xs print:text-xs">{order.remarks}</p>
          </div>
        )}

        <div className="border-t-2 border-gray-900 pt-4 print:pt-3 print:border-t-2 print:border-black mt-4 print:mt-3 print-break-avoid">
          <h3 className="font-bold text-sm print:text-xs uppercase mb-3 print:mb-2">
            Recipient Acknowledgment
          </h3>
          <div className="grid grid-cols-3 gap-4 print:gap-3">
            <div className="col-span-2">
              <table className="w-full text-xs print:text-xs border border-gray-400">
                <tbody>
                  <tr>
                    <td className="border-b border-gray-300 px-2 py-2 print:py-1.5">
                      In my presence and knowledge above mentioned seal were opened and found.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-300 px-2 py-2 print:py-1.5">
                      I received the entire cargo in good condition and I have no claim.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-300 px-2 py-2 print:py-1.5">
                      I received the entire cargo but I have following remarks.
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-900 px-2 py-2 print:py-1.5 font-semibold">
                      Client Authorized Name:
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-900 px-2 py-2 print:py-1.5 font-semibold">
                      Date:
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-900 px-2 py-2 print:py-1.5 font-semibold">
                      Signature:
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 print:py-1.5">
                      <div className="font-semibold mb-1">Note:</div>
                      <div className="border border-gray-400 min-h-[60px] print:min-h-[50px] p-2 print:p-1">
                        {order.remarks && <p className="text-xs print:text-xs">{order.remarks}</p>}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-2 text-xs print:text-xs text-gray-600">
                <p>Contact: +966 55 1108897, Email: support@safesolution.com</p>
              </div>
            </div>
            <div>
              <table className="w-full text-xs print:text-xs border border-gray-400">
                <tbody>
                  <tr>
                    <td className="border-b border-gray-400 px-2 py-2 print:py-1.5 font-semibold">
                      Condition:
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-400 px-2 py-2 print:py-1.5">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Good'}
                          readOnly
                          className="w-4 h-4 print:w-3 print:h-3 border-gray-400"
                        />
                        <span>Good</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-400 px-2 py-2 print:py-1.5">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Broken'}
                          readOnly
                          className="w-4 h-4 print:w-3 print:h-3 border-gray-400"
                        />
                        <span>Broken</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-400 px-2 py-2 print:py-1.5 font-semibold">
                      Receipt:
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-gray-400 px-2 py-2 print:py-1.5">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Fully Received'}
                          readOnly
                          className="w-4 h-4 print:w-3 print:h-3 border-gray-400"
                        />
                        <span>Fully Received</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 print:py-1.5">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Partially'}
                          readOnly
                          className="w-4 h-4 print:w-3 print:h-3 border-gray-400"
                        />
                        <span>Partially</span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 print:mt-2">
                <p className="text-xs print:text-xs font-semibold mb-1">Customer Stamp:</p>
                <div className="border-2 border-gray-400 min-h-[80px] print:min-h-[70px] p-2 print:p-1 bg-gray-50 print:bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
