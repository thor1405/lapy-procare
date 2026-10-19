import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import { Download, Receipt } from 'lucide-react';

export const CustomerInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = () => {
    setIsLoading(true);
    api
      .get('/invoices/my')
      .then((res) => {
        setInvoices(res.data?.data?.invoices || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPdf = async (id, num) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${num}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tax invoice PDF downloaded');
    } catch (err) {
      toast.error('Unable to download PDF invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Tax Invoices & Billing
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Official GST invoices, payment receipts, and 30-day warranty records.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <Receipt className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-[#111827] mb-1">No billing records yet</h3>
          <p className="text-xs max-w-sm mx-auto">
            Official GST tax invoices will be generated and available for PDF download once your repairs conclude.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {invoices.map((inv) => (
            <Card key={inv._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#4F46E5]">
                      {inv.invoiceNumber}
                    </span>
                    <Badge status={inv.paymentStatus} />
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Ticket Ref: <strong className="text-[#111827] font-mono">{inv.ticketId}</strong> • Issued on{' '}
                    {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownloadPdf(inv._id, inv.invoiceNumber)}
                    icon={Download}
                  >
                    Download Tax Invoice PDF
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                      <th className="pb-2 font-semibold">Billed Service / Component</th>
                      <th className="pb-2 font-semibold">Type</th>
                      <th className="pb-2 text-center font-semibold">Qty</th>
                      <th className="pb-2 text-right font-semibold">Rate</th>
                      <th className="pb-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {inv.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-[#111827] font-semibold">{item.description}</td>
                        <td className="py-2.5 text-[#64748B]">{item.itemType}</td>
                        <td className="py-2.5 text-center text-[#475569]">{item.quantity}</td>
                        <td className="py-2.5 text-right text-[#475569] font-mono">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 text-right text-[#4F46E5] font-mono font-semibold">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payment Summary */}
              <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-[11px] text-[#64748B] space-y-0.5">
                  <p>Payment Mode: <strong className="text-[#111827] font-medium">{inv.paymentMethod}</strong></p>
                  <p>Labour: ₹{inv.labourCharges.toLocaleString('en-IN')} | Parts: ₹{inv.sparePartCharges.toLocaleString('en-IN')}</p>
                  <p>GST ({inv.taxRate}%): ₹{inv.taxAmount.toLocaleString('en-IN')}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-[#64748B] block font-medium">Total Payable</span>
                  <span className="text-2xl font-extrabold text-[#111827] font-mono">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
