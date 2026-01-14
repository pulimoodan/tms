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
                className="border border-gray-400 px-3 py-1.5 bg-blue-200 font-bold text-left print:bg-blue-200"
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
                Cargo Description:
              </td>
              <td className="border border-gray-400 px-4 py-2">{order.cargoDescription || ''}</td>
              <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                Temperature Required:
              </td>
              <td className="border border-gray-400 px-4 py-2">
                {order.temperature ? `${order.temperature}°C` : ''}
              </td>
            </tr>
            {((order.containerNumber || (order.podNumber || order.podDocument))) && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Container Number:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.containerNumber || ''}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  POD:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.podNumber ? `POD #: ${order.podNumber}` : ''}
                  {order.podNumber && order.podDocument ? ' - ' : ''}
                  {order.podDocument ? 'POD Submitted' : order.podNumber ? 'POD Not Submitted' : ''}
                </td>
              </tr>
            )}
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
                colSpan={6}
                className="border border-gray-400 px-3 py-1.5 bg-blue-200 font-bold text-left print:bg-blue-200"
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
                  <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                    {order.driver.name}
                  </td>
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
                    <td className="border border-gray-400 px-4 py-2" colSpan={3}>
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
                  Door No.:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={3}>
                  {order.vehicle.doorNo || order.vehicle.plateNumber || ''}
                </td>
              </tr>
                )}
            {order.attachment && !order.driver?.mobile && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Trailer:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={5}>
                  {order.attachment.name || ''}
                      {order.attachment.chassisNo && ` (Chassis: ${order.attachment.chassisNo})`}
                </td>
              </tr>
                )}
            {order.accessories && order.accessories.length > 0 && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Accessories:
                </td>
                <td className="border border-gray-400 px-4 py-2" colSpan={5}>
                  {order.accessories.map((accessory: any, index: number) => (
                    <div key={accessory.id} className={index > 0 ? 'mt-1' : ''}>
                      {accessory.name || 'Unnamed'}
                      {accessory.plateNumber && ` (${accessory.plateNumber})`}
                      {accessory.doorNo && ` - Door: ${accessory.doorNo}`}
                    </div>
                  ))}
                </td>
              </tr>
            )}
            {((order.startKms !== null && order.startKms !== undefined) ||
            (order.kmOut !== null && order.kmOut !== undefined) ||
            (order.kmIn !== null && order.kmIn !== undefined) ||
            (order.runKm !== null && order.runKm !== undefined)) && (
              <tr>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Km Start:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.kmOut !== null && order.kmOut !== undefined
                    ? order.kmOut
                    : order.startKms !== null && order.startKms !== undefined
                      ? order.startKms
                      : ''}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Km Closing:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.kmIn !== null && order.kmIn !== undefined ? order.kmIn : ''}
                </td>
                <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold">
                  Run Km:
                </td>
                <td className="border border-gray-400 px-4 py-2">
                  {order.runKm !== null && order.runKm !== undefined ? order.runKm : ''}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
              <thead>
                <tr>
              <th
                colSpan={5}
                className="border border-gray-400 px-3 py-1.5 bg-blue-200 font-bold text-left print:bg-blue-200"
              >
                    Cargo Details
                  </th>
                </tr>
                <tr>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                    Sl No.
                  </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                    Cargo Description
                  </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                    Wt (Ton)
                  </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                    Vol (m³)
                  </th>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left">
                    Value (SAR)
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Use cargoItems array if available, otherwise fall back to single cargo fields
                  const cargoItems = order.cargoItems && Array.isArray(order.cargoItems) && order.cargoItems.length > 0
                    ? order.cargoItems
                    : [{
                        description: order.cargoDescription || '',
                        weight: order.weight,
                        weightUom: order.weightUom || 'TON',
                        volume: order.volume,
                        value: order.value,
                      }];

                  return cargoItems.map((cargo: any, index: number) => {
                    // Convert weight to Ton
                    const weightInTon = cargo.weight
                      ? cargo.weightUom === 'KG'
                        ? (Number(cargo.weight) / 1000).toFixed(3)
                        : Number(cargo.weight).toFixed(3)
                      : '';

                    return (
                      <tr key={index}>
                        <td className="border border-gray-400 px-3 py-1.5 text-center">
                          {index + 1}
                        </td>
                        <td className="border border-gray-400 px-4 py-2">
                          {cargo.description || cargo.cargoDescription || ''}
                        </td>
                        <td className="border border-gray-400 px-4 py-2">
                          {weightInTon}
                        </td>
                        <td className="border border-gray-400 px-4 py-2">
                          {cargo.volume ? Number(cargo.volume).toFixed(2) : ''}
                        </td>
                        <td className="border border-gray-400 px-4 py-2">
                          {cargo.value ? Number(cargo.value).toLocaleString() : ''}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>

        <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid">
                <thead>
                  <tr>
              <th
                colSpan={5}
                className="border border-gray-400 px-3 py-1.5 bg-blue-200 font-bold text-left print:bg-blue-200"
              >
                Activities
                    </th>
                  </tr>
                  <tr>
              <th className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold text-left w-16">
                Sl No.
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
                    <td className="border border-gray-400 px-4 py-2">Loading</td>
                    <td className="border border-gray-400 px-4 py-2">{order.from?.name || ''}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.dispatchFromLoading
                        ? (() => {
                            const dt = formatDateTime(order.dispatchFromLoading);
                            return typeof dt === 'string' ? formatDate(order.dispatchFromLoading) : dt.date;
                          })()
                        : ''}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.dispatchFromLoading
                        ? (() => {
                            const dt = formatDateTime(order.dispatchFromLoading);
                            return typeof dt === 'string' ? '' : dt.time;
                          })()
                        : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 text-center">2</td>
                    <td className="border border-gray-400 px-4 py-2">Arrival</td>
                    <td className="border border-gray-400 px-4 py-2">{order.to?.name || ''}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.arrivalAtOffloading
                        ? (() => {
                            const dt = formatDateTime(order.arrivalAtOffloading);
                            return typeof dt === 'string' ? formatDate(order.arrivalAtOffloading) : dt.date;
                          })()
                        : ''}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.arrivalAtOffloading
                        ? (() => {
                            const dt = formatDateTime(order.arrivalAtOffloading);
                            return typeof dt === 'string' ? '' : dt.time;
                          })()
                        : ''}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-1.5 text-center">3</td>
                    <td className="border border-gray-400 px-4 py-2">Unloading</td>
                    <td className="border border-gray-400 px-4 py-2">{order.to?.name || ''}</td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.completedUnloading
                        ? (() => {
                            const dt = formatDateTime(order.completedUnloading);
                            return typeof dt === 'string' ? formatDate(order.completedUnloading) : dt.date;
                          })()
                        : ''}
                    </td>
                    <td className="border border-gray-400 px-4 py-2">
                      {order.completedUnloading
                        ? (() => {
                            const dt = formatDateTime(order.completedUnloading);
                            return typeof dt === 'string' ? '' : dt.time;
                          })()
                        : ''}
                    </td>
                  </tr>
                </tbody>
              </table>

        {/* Footer: Remarks and Condition */}
        {(order.remarks || order.recipientAcknowledgment) && (
          <table className="w-full text-xs print:text-xs border-collapse border border-gray-400 print-break-avoid mt-1 print:mt-0.5">
            <thead>
              <tr>
                <th
                  colSpan={4}
                  className="border border-gray-400 px-3 py-1.5 bg-blue-200 font-bold text-left print:bg-blue-200"
                >
                  Additional Information
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {order.remarks && (
                  <>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                      Remarks:
                    </td>
                    <td className="border border-gray-400 px-4 py-2">{order.remarks}</td>
                  </>
                )}
                {order.recipientAcknowledgment && (
                  <>
                    <td className="border border-gray-400 px-3 py-1.5 bg-gray-100 font-semibold w-32">
                      Condition:
                    </td>
                    <td className="border border-gray-400 px-4 py-2">{order.recipientAcknowledgment}</td>
                  </>
                )}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
