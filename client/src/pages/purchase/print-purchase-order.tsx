import { useEffect } from 'react';
import { useParams, useLocation as useWouterLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
];

export default function PrintPurchaseOrderPage() {
  const { id } = useParams();
  const [, setLocation] = useWouterLocation();

  const dummyPO = {
    id: id || '1',
    poNo: `PO-${id || '001'}`,
    supplierName: 'ABC Suppliers',
    supplierEmail: 'contact@abcsuppliers.com',
    status: 'Issued',
    issueDate: new Date().toISOString(),
    expectedDeliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    totalAmount: 12500.0,
    rfq: { rfqNo: 'RFQ-001' },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        unitPrice: 450.0,
        totalPrice: 4500.0,
        description: 'Ergonomic office chair with adjustable height',
      },
      {
        id: '2',
        productId: '2',
        quantity: 50,
        unitPrice: 25.0,
        totalPrice: 1250.0,
        description: 'A4 size printer paper, 80gsm, 500 sheets per ream',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  const { data: purchaseOrder, isLoading } = useQuery({
    queryKey: ['purchase-order', id],
    queryFn: async () => {
      if (!id) throw new Error('Purchase Order ID is required');
      return { ...dummyPO, id };
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (purchaseOrder && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [purchaseOrder, isLoading]);

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

  if (isLoading || !purchaseOrder) {
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
          <h2 className="text-lg font-semibold">Purchase Order Print Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Print / Download PDF
            </button>
            <button
              onClick={() => setLocation(`/purchase/purchase-orders/${id}`)}
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
              <h1 className="text-3xl font-bold print:text-2xl">PURCHASE ORDER</h1>
              <p className="text-sm text-gray-600 print:text-xs mt-1">PO Document</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold print:text-xs">PO Number:</p>
              <p className="text-2xl font-bold print:text-xl">{purchaseOrder.poNo}</p>
              <p className="text-xs text-gray-600 print:text-xs mt-1">
                Date: {formatDate(purchaseOrder.issueDate)}
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
                <td>{purchaseOrder.status}</td>
              </tr>
              {purchaseOrder.rfq && (
                <tr>
                  <td className="bg-gray-100 font-semibold">RFQ</td>
                  <td>{purchaseOrder.rfq.rfqNo}</td>
                </tr>
              )}
              {purchaseOrder.supplierName && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Supplier</td>
                  <td>{purchaseOrder.supplierName}</td>
                </tr>
              )}
              {purchaseOrder.expectedDeliveryDate && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Expected Delivery Date</td>
                  <td>{formatDate(purchaseOrder.expectedDeliveryDate)}</td>
                </tr>
              )}
              {purchaseOrder.totalAmount && (
                <tr>
                  <td className="bg-gray-100 font-semibold">Total Amount</td>
                  <td>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'SAR',
                      minimumFractionDigits: 2,
                    }).format(purchaseOrder.totalAmount)}
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
                <th style={{ width: '15%' }}>Unit Price (SAR)</th>
                <th style={{ width: '15%' }}>Total Price (SAR)</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrder.items && purchaseOrder.items.length > 0 ? (
                purchaseOrder.items.map((item: any, index: number) => (
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
