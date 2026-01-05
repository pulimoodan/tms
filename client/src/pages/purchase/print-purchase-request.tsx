import { useEffect } from 'react';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loading01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

// Dummy data for now
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
  {
    id: '4',
    name: 'Desk Organizer',
    code: 'PROD-004',
    description: 'Multi-compartment desk organizer',
    unit: 'pcs',
    price: 35.0,
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
  {
    id: '3',
    name: 'Global Equipment Co.',
    email: 'sales@globalequip.com',
    phone: '+966 50 555 1234',
    address: 'Dammam, Saudi Arabia',
    isActive: true,
  },
];

export default function PrintPurchaseRequestPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();

  // Get status from localStorage
  const getStoredStatus = (prId: string) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`pr-status-${prId}`);
      return stored || 'Pending';
    }
    return 'Pending';
  };

  // Dummy data for now
  const dummyPR = {
    id: id || '1',
    prNumber: `PR-${id || '001'}`,
    requestNo: `PR-${id || '001'}`,
    description: 'Sample purchase request description for office supplies',
    sourceDocument: '',
    status: getStoredStatus(id || '1'),
    requestedDate: new Date().toISOString(),
    requestedBy: {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        estimatedCost: 4500.0,
        description: 'Ergonomic office chair with adjustable height',
        proposedVendorId: '1',
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        estimatedCost: 1250.0,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
        proposedVendorId: '2',
      },
    ],
  };

  const { data: purchaseRequest, isLoading } = useQuery({
    queryKey: ['purchase-request', id],
    queryFn: async () => {
      if (!id) throw new Error('Purchase Request ID is required');
      return { ...dummyPR, id };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (purchaseRequest && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [purchaseRequest, isLoading]);

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
    return vendor ? vendor.name : 'No vendor selected';
  };

  if (isLoading || !purchaseRequest) {
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
          <h2 className="text-lg font-semibold">Purchase Request Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print / Download PDF
            </button>
            <button
              onClick={() => setLocation(`/purchase/purchase-requests/${id}`)}
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
              <h1 className="text-3xl font-bold print:text-2xl">PURCHASE REQUEST</h1>
              <p className="text-sm text-gray-600 print:text-xs mt-1">Request for Purchase</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold print:text-xs">PR Number:</p>
              <p className="text-2xl font-bold print:text-xl">{purchaseRequest.prNumber}</p>
              <p className="text-xs text-gray-600 print:text-xs mt-1">
                Date: {formatDate(purchaseRequest.requestedDate)}
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
                <td>{purchaseRequest.status}</td>
              </tr>
              {purchaseRequest.description && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Description</td>
                  <td>{purchaseRequest.description}</td>
                </tr>
              )}
              {purchaseRequest.requestedBy && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Requested By</td>
                  <td>
                    {purchaseRequest.requestedBy.name}
                    {purchaseRequest.requestedBy.email && ` (${purchaseRequest.requestedBy.email})`}
                  </td>
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
                <th style={{ width: '25%' }}>Product</th>
                <th style={{ width: '30%' }}>Description</th>
                <th style={{ width: '10%' }}>Quantity</th>
                <th style={{ width: '15%' }}>Estimated Cost (SAR)</th>
                <th style={{ width: '15%' }}>Proposed Vendor</th>
              </tr>
            </thead>
            <tbody>
              {purchaseRequest.items && purchaseRequest.items.length > 0 ? (
                purchaseRequest.items.map((item: any, index: number) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{getProductName(item.productId)}</td>
                    <td>{item.description || '—'}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.estimatedCost?.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </td>
                    <td>{item.proposedVendorId ? getVendorName(item.proposedVendorId) : '—'}</td>
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
