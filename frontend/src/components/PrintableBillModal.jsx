import React, { useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Printer, Download } from 'lucide-react';

export const PrintableBillModal = ({ isOpen, onClose, invoice, booking }) => {
  const printAreaRef = useRef(null);

  if (!invoice && !booking) return null;

  const inv = invoice || booking?.invoice;
  const b = booking || inv?.booking;

  const customerName = inv?.billingDetails?.name || b?.customer?.name || 'Walk-in Customer';
  const rawEmail = inv?.billingDetails?.email || b?.customer?.email || '';
  const customerEmail = !rawEmail || rawEmail.includes('@lapyprocare.local') || rawEmail.includes('walkin.') ? '' : rawEmail;
  const rawAddress = inv?.billingDetails?.address || b?.doorstepAddress?.street || '';
  const isWalkinAddr = !rawAddress || rawAddress.toLowerCase().includes('walk-in') || rawAddress.toLowerCase().includes('in-store') || rawAddress.toLowerCase().includes('drop off');
  const customerAddress = isWalkinAddr ? '' : rawAddress;

  const deviceBrand = b?.device?.brand || '';
  const deviceModel = b?.device?.model || '';
  const deviceType = b?.device?.deviceType || 'Hardware Device';
  const serialNo = b?.device?.serialNumber || '';
  const passcode = b?.device?.passcode || '';
  const accessories = b?.device?.accessories || [];

  const invoiceNumber = inv?.invoiceNumber || 'DRAFT';
  const ticketId = inv?.ticketId || b?.ticketId || 'N/A';
  const invoiceDate = inv?.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');

  const items = inv?.items || [];
  const labourCharges = Number(inv?.labourCharges || 0);
  const sparePartCharges = Number(inv?.sparePartCharges || 0);
  const additionalCharges = Number(inv?.additionalCharges || 0);
  const discount = Number(inv?.discount || 0);
  const taxRate = Number(inv?.taxRate || 0);
  const taxAmount = Number(inv?.taxAmount || 0);
  const totalAmount = Number(inv?.totalAmount || 0);
  const amountPaid = Number(inv?.amountPaid || 0);
  const balanceDue = Number(inv?.balanceDue || 0);
  const paymentStatus = inv?.paymentStatus || (balanceDue <= 0 && totalAmount > 0 ? 'Paid' : 'Unpaid');
  const paymentMethod = inv?.paymentMethod || 'Cash';

  const handlePrint = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${invoiceNumber} - Lapy Procare</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 10px;
              font-size: 13px;
              line-height: 1.4;
            }
            .header-bar {
              height: 6px;
              background: #4F46E5;
              border-radius: 3px;
              margin-bottom: 20px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #E2E8F0;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .brand h1 {
              font-size: 22px;
              font-weight: 800;
              color: #050B18;
              margin: 0 0 4px 0;
            }
            .brand p {
              margin: 2px 0;
              color: #64748B;
              font-size: 11px;
            }
            .invoice-badge {
              text-align: right;
            }
            .invoice-badge h2 {
              margin: 0;
              font-size: 18px;
              color: #4F46E5;
              font-weight: 800;
            }
            .invoice-badge p {
              margin: 2px 0;
              font-size: 12px;
              color: #334155;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .info-box {
              background: #F8FAFC;
              border: 1px solid #E2E8F0;
              border-radius: 8px;
              padding: 12px;
            }
            .info-box h3 {
              margin: 0 0 8px 0;
              font-size: 11px;
              text-transform: uppercase;
              color: #4F46E5;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .info-box p {
              margin: 3px 0;
              font-size: 12px;
              color: #1E293B;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #0F172A;
              color: white;
              font-size: 11px;
              text-transform: uppercase;
              text-align: left;
              padding: 8px 10px;
            }
            td {
              padding: 8px 10px;
              border-bottom: 1px solid #E2E8F0;
              font-size: 12px;
            }
            tr:nth-child(even) td {
              background: #F8FAFC;
            }
            .totals-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 10px;
            }
            .totals-table {
              width: 280px;
            }
            .totals-table td {
              padding: 5px 0;
              border: none;
            }
            .grand-total {
              border-top: 2px solid #4F46E5 !important;
              font-size: 15px;
              font-weight: 800;
              color: #4F46E5;
              padding-top: 8px !important;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
            }
            .status-paid {
              background: #DCFCE7;
              color: #166534;
            }
            .status-due {
              background: #FEE2E2;
              color: #991B1B;
            }
            .footer-terms {
              margin-top: 30px;
              padding-top: 15px;
              border-top: 1px dashed #CBD5E1;
              font-size: 10px;
              color: #64748B;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 40px;
              padding-top: 10px;
            }
            .sign-line {
              width: 180px;
              border-top: 1px solid #94A3B8;
              text-align: center;
              font-size: 11px;
              color: #475569;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar"></div>
          ${printContent.innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bill / Job Receipt: ${invoiceNumber}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Receipt Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                paymentStatus.toLowerCase() === 'paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              {paymentStatus.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="primary" icon={Printer} onClick={handlePrint}>
              Print Bill
            </Button>
            {inv?._id && (
              <a
                href={`/api/v1/invoices/${inv._id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white text-[#4F46E5] hover:bg-indigo-50 text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> PDF
              </a>
            )}
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div
          ref={printAreaRef}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 text-slate-900 shadow-xs text-xs space-y-6"
        >
          <div className="h-1.5 bg-indigo-600 rounded-full" />

          {/* Letterhead */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Sora'] tracking-tight">
                LAPY PROCARE
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Expert Laptop, Desktop, Mobile & Console Repairs • Chip-Level Service
              </p>
              <p className="text-[11px] text-slate-500">
                Near St. Joseph Engineering College, Vamanjoor, Mangaluru – 575028
              </p>
              <p className="text-[11px] font-mono text-indigo-700 font-semibold">
                Phone / WhatsApp: +91 7666104889 | lapyprocare@gmail.com
              </p>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <h2 className="text-base sm:text-lg font-bold text-indigo-600 font-mono">
                {inv ? 'TAX INVOICE / BILL' : 'REPAIR JOB CARD'}
              </h2>
              <p className="font-mono text-slate-800 font-bold text-sm">
                Bill #: <span className="text-indigo-600">{invoiceNumber}</span>
              </p>
              <p className="font-mono text-slate-600">
                Ticket Ref: <span className="font-bold text-slate-900">{ticketId}</span>
              </p>
              <p className="text-slate-500 text-[11px]">Date: {invoiceDate}</p>
            </div>
          </div>

          {/* Customer & Device Meta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <h3 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                Customer Details
              </h3>
              <p className="font-semibold text-slate-900 text-sm">{customerName}</p>
              <p className="text-slate-700 font-mono">Phone: {customerPhone}</p>
              {customerEmail ? <p className="text-slate-600 truncate">Email: {customerEmail}</p> : null}
              {customerAddress ? <p className="text-slate-600">Address: {customerAddress}</p> : null}
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <h3 className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                Device & Intake Specs
              </h3>
              <p className="font-semibold text-slate-900 text-sm">
                {deviceBrand} {deviceModel}
              </p>
              <p className="text-slate-700">Category: {deviceType}</p>
              {serialNo && <p className="text-slate-600 font-mono">Serial / IMEI: {serialNo}</p>}
              {passcode && <p className="text-slate-600 font-mono">Passcode / PIN: {passcode}</p>}
              {accessories.length > 0 && (
                <p className="text-slate-600">
                  Accessories Received: <span className="font-medium text-slate-800">{accessories.join(', ')}</span>
                </p>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">#</th>
                  <th className="py-2.5 px-3 font-semibold">Description / Part Replaced</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Unit Rate (₹)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.length > 0 ? (
                  items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.itemType || 'Service'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity || 1}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        ₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        ₹{Number(item.amount || item.unitPrice || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                      Standard service and hardware repair diagnosis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            {/* Payment Status Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5 w-full sm:w-64">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                Payment Verification
              </span>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    paymentStatus.toLowerCase() === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-700">
                <span>Method:</span>
                <span className="font-semibold">{paymentMethod}</span>
              </div>
              {amountPaid > 0 && (
                <div className="flex justify-between items-center text-slate-700">
                  <span>Paid:</span>
                  <span className="font-mono font-semibold text-emerald-700">
                    ₹{amountPaid.toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              {balanceDue > 0 && (
                <div className="flex justify-between items-center text-rose-600 font-bold">
                  <span>Balance Due:</span>
                  <span className="font-mono">₹{balanceDue.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Calculations Table */}
            <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-600">
              {labourCharges > 0 && (
                <div className="flex justify-between">
                  <span>Labour / Service Charges:</span>
                  <span className="font-mono text-slate-900">₹{labourCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              {sparePartCharges > 0 && (
                <div className="flex justify-between">
                  <span>Spare Parts Total:</span>
                  <span className="font-mono text-slate-900">₹{sparePartCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              {additionalCharges > 0 && (
                <div className="flex justify-between">
                  <span>Additional Charges:</span>
                  <span className="font-mono text-slate-900">₹{additionalCharges.toLocaleString('en-IN')}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Special Discount:</span>
                  <span className="font-mono">- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST ({taxRate}%):</span>
                  <span className="font-mono text-slate-900">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t-2 border-indigo-600 text-sm font-extrabold text-slate-900">
                <span>GRAND TOTAL:</span>
                <span className="font-mono text-indigo-700 text-base">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Warranty Terms */}
          <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 uppercase">Terms & Warranty Policy:</p>
            <p>
              1. All hardware repairs carry a 30-day service warranty against technical defects. Physical breakage,
              water damage, or tampering voids warranty.
            </p>
            <p>2. Devices not collected within 45 days from collection notice are subject to storage charges.</p>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-8 text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1 w-36 text-center">
              Customer Signature
            </div>
            <div className="border-t border-slate-400 pt-1 w-44 text-center font-semibold text-slate-800">
              For Lapy Procare Vamanjoor
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
