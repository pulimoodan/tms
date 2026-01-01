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
              margin: 0.8cm;
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
              margin-bottom: 2px;
            }
            table td, table th {
              border: 1px solid #000;
              padding: 6px 8px;
              font-size: 9px;
              line-height: 1.4;
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

      <div className="max-w-4xl mx-auto p-4 print:p-2 space-y-1 print:space-y-0.5">
        <div className="border-b-2 border-gray-900 pb-1 print:border-b-2 print:border-black print:pb-0.5 print-break-avoid">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="shrink-0">
                <img
                  src="/company-logo.png"
                  alt={company.name || 'Company Logo'}
                  className="h-12 w-auto print:h-14 object-contain"
                  style={{ maxWidth: '200px' }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold print:text-base mb-0.5 text-gray-900">
                  TRUCKING WAYBILL
                </h1>
                {company.name && (
                  <p className="text-xs font-semibold text-gray-800 print:text-xs print:text-gray-900 mb-0">
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
            <div className="text-right shrink-0 border-l border-gray-300 pl-2 print:border-gray-400 print:pl-1">
              <p className="text-xs font-semibold text-gray-700 print:text-xs print:text-gray-900 mb-0">
                Waybill Number:
              </p>
              <p className="text-base font-bold print:text-sm text-gray-900 mb-0">
                {order.orderNo}
              </p>
              <p className="text-xs text-gray-600 print:text-xs">
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
          <tbody>
            {order.contract?.contractNumber && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                  Agreement NO:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.contract.contractNumber}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                  Trip Number:
                </td>
                <td className="border border-gray-400 px-4 py-2">{order.orderNo}/1</td>
              </tr>
            )}
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Consignor:
              </td>
              <td className="border border-gray-400 px-4 py-2">{company.name}</td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Consignor Address:
              </td>
              <td className="border border-gray-400 px-4 py-2">
                {[company.street, company.city, company.country].filter(Boolean).join(', ')}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Consignee:
              </td>
              <td className="border border-gray-400 px-4 py-2">{order.customer?.name || ''}</td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Consignee Address:
              </td>
              <td className="border border-gray-400 px-4 py-2"></td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
          <thead>
            <tr>
              <th
                colSpan={4}
                className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-bold text-left"
              >
                Shipment Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                Loading Site:
              </td>
              <td className="border border-gray-400 px-4 py-2">{order.from?.name || ''}</td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                Unloading Site:
              </td>
              <td className="border border-gray-400 px-4 py-2">{order.to?.name || ''}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Cargo Type:
              </td>
              <td className="border border-gray-400 px-4 py-2">General</td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Temperature Required:
              </td>
              <td className="border border-gray-400 px-4 py-2"></td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Seal:
              </td>
              <td className="border border-gray-400 px-4 py-2"></td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Customer Order / Ref #:
              </td>
              <td className="border border-gray-400 px-4 py-2">
                {order.bookingNumber || order.croNumber || ''}
              </td>
            </tr>
            {(order.requestedDate || order.requestedTime) && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Requested Date:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.requestedDate ? formatDate(order.requestedDate) : ''}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Requested Time:
                </td>
                <td className="border border-gray-400 px-4 py-2">{order.requestedTime || ''}</td>
              </tr>
            )}
            {order.eta && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  ETA:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {(() => {
                    const dt = formatDateTime(order.eta);
                    return typeof dt === 'string' ? formatDate(order.eta) : `${dt.date} ${dt.time}`;
                  })()}
                </td>
              </tr>
            )}
            {order.vesselName && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Vessel Name:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.vesselName}
                </td>
              </tr>
            )}
            {order.croNumber && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  CRO Number:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.croNumber}
                </td>
              </tr>
            )}
            {order.customerContact && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Customer Contact:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.customerContact}
                </td>
              </tr>
            )}
            {order.transporter && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Transporter:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.transporter}
                </td>
              </tr>
            )}
            {order.portOfLoading && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Port Of Loading:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.portOfLoading}
                </td>
              </tr>
            )}
            {order.shippingLine && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Shipping Line:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.shippingLine}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
          <thead>
            <tr>
              <th
                colSpan={4}
                className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-bold text-left"
              >
                Truck, Trailer and Driver Details
              </th>
            </tr>
          </thead>
          <tbody>
            {order.driver && (
              <>
                <tr>
                  <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                    Driver ID:
                  </td>
                  <td className="border border-gray-400 px-4 py-2">
                    {order.driver.iqamaNumber || order.driver.badgeNo || ''}
                  </td>
                  <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                    Driver Name:
                  </td>
                  <td className="border border-gray-400 px-4 py-2">{order.driver.name}</td>
                </tr>
                {order.driver.mobile && (
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Driver Mobile:
                    </td>
                    <td className="border border-gray-400 px-4 py-2">{order.driver.mobile}</td>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Trailer:
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.trailerNumber || order.attachment?.name || ''}
                    </td>
                  </tr>
                )}
              </>
            )}
            {order.vehicle && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Truck:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.vehicle.plateNumber}
                  {order.vehicle.chassisNo && ` (Chassis: ${order.vehicle.chassisNo})`}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Plate Number:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.vehicle.doorNo || order.vehicle.plateNumber || ''}
                </td>
              </tr>
            )}
            {order.attachment && !order.driver?.mobile && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Trailer:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.attachment.name || ''}
                  {order.attachment.chassisNo && ` (Chassis: ${order.attachment.chassisNo})`}
                </td>
              </tr>
            )}
            {(order.startKms !== null && order.startKms !== undefined) ||
            (order.kmOut !== null && order.kmOut !== undefined) ||
            (order.kmIn !== null && order.kmIn !== undefined) ||
            (order.runKm !== null && order.runKm !== undefined) ? (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Km Out:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.kmOut !== null && order.kmOut !== undefined
                    ? order.kmOut
                    : order.startKms !== null && order.startKms !== undefined
                      ? order.startKms
                      : ''}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Km In:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.kmIn !== null && order.kmIn !== undefined ? order.kmIn : ''}
                </td>
              </tr>
            ) : null}
            {order.runKm !== null && order.runKm !== undefined && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Run Km:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.runKm}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
          <thead>
            <tr>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Customer Details
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Cargo Description
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Container Number
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Container Size
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Weight UOM
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Weight
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Value (SAR)
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                SI/ No
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-4 py-2">
                {order.customer?.name || ''}
                {order.customerContact && (
                  <div className="text-xs text-gray-600">{order.customerContact}</div>
                )}
              </td>
              <td className="border border-gray-400 px-4 py-2">{order.cargoDescription || ''}</td>
              <td className="border border-gray-400 px-4 py-2">{order.containerNumber || ''}</td>
              <td className="border border-gray-400 px-4 py-2">{order.containerSize || ''}</td>
              <td className="border border-gray-400 px-4 py-2">{order.weightUom || 'TON'}</td>
              <td className="border border-gray-400 px-4 py-2">
                {order.weight
                  ? order.weightUom === 'KG'
                    ? Number(order.weight)
                    : Number(order.weight) / 1000
                  : ''}
                {order.tareWeight && (
                  <div className="text-xs text-gray-600">TARE WT: {Number(order.tareWeight)}</div>
                )}
              </td>
              <td className="border border-gray-400 px-4 py-2">
                {order.value ? Number(order.value).toLocaleString() : ''}
              </td>
              <td className="border border-gray-400 px-4 py-2">1</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
          <thead>
            <tr>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left w-16">
                Activities
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Purpose
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Delivery Location
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Activity Date
              </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                Activity Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 text-center">1</td>
              <td className="border border-gray-400 px-4 py-2">Trip Begin</td>
              <td className="border border-gray-400 px-4 py-2">Loading</td>
              <td className="border border-gray-400 px-4 py-2">{order.from?.name || ''}</td>
              <td className="border border-gray-400 px-4 py-2">
                {order.requestedDate
                  ? formatDate(order.requestedDate)
                  : formatDate(order.createdAt)}{' '}
                {order.requestedTime || ''}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-1.5 text-center">2</td>
              <td className="border border-gray-400 px-4 py-2">Trip End</td>
              <td className="border border-gray-400 px-4 py-2">Un Loading</td>
              <td className="border border-gray-400 px-4 py-2">{order.to?.name || ''}</td>
              <td className="border border-gray-400 px-4 py-2">
                {order.eta
                  ? (() => {
                      const dt = formatDateTime(order.eta);
                      return typeof dt === 'string'
                        ? formatDate(order.eta)
                        : `${dt.date} ${dt.time}`;
                    })()
                  : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {order.remarks && (
          <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-24">
                  Remarks:
                </td>
                <td className="border border-gray-400 px-4 py-2">{order.remarks}</td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="border-t-2 border-gray-900 pt-1 print:pt-0.5 print:border-t-2 print:border-black mt-1 print:mt-0.5 print-break-avoid">
          <table className="w-full text-xs print:text-xs border-collapse border border-gray-400">
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-1.5" colSpan={2}>
                  In my presence and knowledge above mentioned seal were opened and found.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-1.5" colSpan={2}>
                  I received the entire cargo in good condition and I have no claim.
                </td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-1.5" colSpan={2}>
                  I received the entire cargo but I have following remarks.
                </td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-3 gap-0.5 print:gap-0 mt-0.5 print:mt-0">
            <div className="col-span-2">
              <table className="w-full text-xs print:text-xs border-collapse border border-gray-400">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Client Authorized Name:
                    </td>
                    <td className="border border-gray-400 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Date:
                    </td>
                    <td className="border border-gray-400 px-4 py-2"></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Signature:
                    </td>
                    <td className="border border-gray-400 px-4 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full text-xs print:text-xs border-collapse border border-gray-400">
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Condition:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Good'}
                          readOnly
                          className="w-3 h-3 print:w-2 print:h-2 border-gray-400"
                        />
                        <span>Good</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Broken'}
                          readOnly
                          className="w-3 h-3 print:w-2 print:h-2 border-gray-400"
                        />
                        <span>Broken</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                      Receipt:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Fully Received'}
                          readOnly
                          className="w-3 h-3 print:w-2 print:h-2 border-gray-400"
                        />
                        <span>Fully Received</span>
                      </label>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={order.recipientAcknowledgment === 'Partially'}
                          readOnly
                          className="w-3 h-3 print:w-2 print:h-2 border-gray-400"
                        />
                        <span>Partially</span>
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-1 print:mt-0.5">
                <p className="text-xs print:text-xs font-semibold mb-0.5">Customer Stamp:</p>
                <div className="border-2 border-gray-400 min-h-[60px] print:min-h-[50px] p-1 print:p-0.5 bg-gray-50 print:bg-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
