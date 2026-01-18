import { useEffect } from 'react';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Orbit01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const dummyProducts = [
  {
    id: '1',
    name: 'Office Chair',
    code: 'PROD-001',
    description: 'Ergonomic office chair with adjustable height',
    unit: 'pcs',
    price: 450.0,
    isActive: true,
  },
  {
    id: '2',
    name: 'Printer Paper A4',
    code: 'PROD-002',
    description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
    unit: 'ream',
    price: 25.0,
    isActive: true,
  },
  {
    id: '3',
    name: 'Laptop Stand',
    code: 'PROD-003',
    description: 'Adjustable aluminum laptop stand',
    unit: 'pcs',
    price: 120.0,
    isActive: true,
  },
];

const dummyVendors = [
  {
    id: '1',
    name: 'ABC Suppliers',
    email: 'contact@abcsuppliers.com',
    phone: '+966 50 123 4567',
    address: 'Riyadh, Saudi Arabia',
    isActive: true,
  },
  {
    id: '2',
    name: 'XYZ Trading',
    email: 'info@xyztrading.com',
    phone: '+966 50 987 6543',
    address: 'Jeddah, Saudi Arabia',
    isActive: true,
  },
];

export default function PrintRFQPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();
  const queryClient = useQueryClient();

  const dummyRFQ = {
    id: id || '1',
    rfqNumber: `RFQ-${id || '001'}`,
    rfqNo: `RFQ-${id || '001'}`,
    purchaseRequestId: '1',
    purchaseRequest: {
      requestNo: 'PR-001',
      title: 'Office Supplies Q1 2024',
    },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        description: 'Ergonomic office chair with adjustable height',
        unitPrice: null,
        totalPrice: null,
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
        unitPrice: null,
        totalPrice: null,
      },
    ],
    status: 'Draft',
    supplierName: 'ABC Suppliers',
    vendorId: '1',
    sentDate: undefined,
    dueDate: undefined,
    createdAt: new Date().toISOString(),
  };

  const { data: rfq, isLoading } = useQuery({
    queryKey: ['rfq', id],
    queryFn: async () => {
      if (!id) throw new Error('RFQ ID is required');
      const cachedData = queryClient.getQueryData(['rfqs']);
      if (Array.isArray(cachedData)) {
        const found = cachedData.find((r: any) => r.id === id);
        if (found) return found;
      }
      return { ...dummyRFQ, id };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (rfq && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [rfq, isLoading]);

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getProductName = (productId: string) => {
    const product = dummyProducts.find((p) => p.id === productId);
    return product
      ? `${product.name} ${product.code ? `(${product.code})` : ''}`
      : 'Unknown Product';
  };

  const getVendorName = (vendorId: string) => {
    const vendor = dummyVendors.find((v) => v.id === vendorId);
    return vendor ? vendor.name : 'Unknown Vendor';
  };

  if (isLoading || !rfq) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon icon={Orbit01Icon} className="h-8 w-8 animate-spin text-primary" />
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
          <h2 className="text-lg font-semibold">RFQ Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print / Download PDF
            </button>
            <button
              onClick={() => setLocation(`/purchase/rfqs/${id}`)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 print:p-0">
        <div className="border-b-2 border-gray-900 pb-4 mb-4 print-break-avoid">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold print:text-2xl">REQUEST FOR QUOTATION</h1>
              <p className="text-sm text-gray-600 print:text-xs mt-1">RFQ Document</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold print:text-xs">RFQ Number:</p>
              <p className="text-2xl font-bold print:text-xl">{rfq.rfqNumber || rfq.rfqNo}</p>
              <p className="text-xs text-gray-600 print:text-xs mt-1">
                Date: {formatDate(rfq.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 print-break-avoid">
          <table>
            <tbody>
              <tr>
                <td className="bg-gray-100 font-semibold" style={{ width: '30%' }}>
                  Status
                </td>
                <td>{rfq.status}</td>
              </tr>
              {rfq.purchaseRequest && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Purchase Request</td>
                  <td>{rfq.purchaseRequest.requestNo}</td>
                </tr>
              )}
              {rfq.supplierName && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Supplier</td>
                  <td>{rfq.supplierName}</td>
                </tr>
              )}
              {rfq.sentDate && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Sent Date</td>
                  <td>{formatDate(rfq.sentDate)}</td>
                </tr>
              )}
              {rfq.dueDate && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Due Date</td>
                  <td>{formatDate(rfq.dueDate)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mb-4 print-break-avoid">
          <h2 className="text-lg font-bold mb-2 print:text-base">Items</h2>
          <table>
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '30%' }}>Product</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '12.5%' }}>Unit Price (SAR)</th>
                <th style={{ width: '12.5%' }}>Total Price (SAR)</th>
              </tr>
            </thead>
            <tbody>
              {rfq.items && rfq.items.length > 0 ? (
                rfq.items.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{getProductName(item.productId)}</td>
                    <td>{item.description || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.unitPrice
                        ? item.unitPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </td>
                    <td>
                      {item.totalPrice
                        ? item.totalPrice.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">
                    No items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-gray-600 print:text-xs">
          <p>Generated on: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
