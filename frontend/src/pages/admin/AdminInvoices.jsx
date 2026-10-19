import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import { Plus, Receipt, Download } from 'lucide-react';

export const AdminInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [transactionRef, setTransactionRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Invoice form state
  const [formData, setFormData] = useState({
    ticketId: '',
    labourCharges: 499,
    sparePartCharges: 0,
    discount: 0,
    items: [
      { description: 'Device Servicing & Diagnostics', itemType: 'Service', quantity: 1, unitPrice: 499, amount: 499 },
    ],
  });

  const fetchInvoices = () => {
    setIsLoading(true);
    api
      .get('/admin/invoices')
      .then((res) => {
        setInvoices(res.data?.data?.invoices || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    api
      .get('/admin/bookings?limit=50')
      .then((res) => {
        setBookings(res.data?.data?.bookings || []);
      })
      .catch(() => {});
  }, []);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!formData.ticketId) {
      toast.error('Please select a repair ticket');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/invoices', formData);
      toast.success('Tax invoice generated successfully!');
      setCreateModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/admin/invoices/${selectedInvoice._id}/payments`, {
        amount: Number(payAmount),
        method: payMethod,
        transactionId: transactionRef,
      });
      toast.success(`Payment of ₹${payAmount} recorded successfully!`);
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Tax Invoices & Payment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track customer receivables, record cash and UPI transactions, and export GST invoices.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} icon={Plus} size="sm">
          Generate Invoice
        </Button>
      </div>

      {/* Invoices Table */}
      <Card className="p-0 bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No invoices on file</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Invoice #</th>
                  <th className="py-3 px-4 font-semibold">Ticket Ref</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Total (₹)</th>
                  <th className="py-3 px-4 font-semibold">Balance Due</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#4F46E5]">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#475569]">{inv.ticketId}</td>
                    <td className="py-3.5 px-4 text-[#111827] font-semibold">
                      {inv.billingDetails?.name || inv.customer?.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-[#111827]">
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600 font-bold">₹{inv.balanceDue.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-teal-700 font-bold">Settled</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={inv.paymentStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {inv.balanceDue > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setPayAmount(inv.balanceDue);
                              setPayMethod('UPI');
                              setTransactionRef('');
                              setPaymentModalOpen(true);
                            }}
                            className="text-xs py-1"
                          >
                            Record Pay
                          </Button>
                        )}
                        <a
                          href={`/api/v1/invoices/${inv._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4F46E5] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title={`Record Payment for ${selectedInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex justify-between">
            <span className="text-[#64748B]">Total Invoice Amount:</span>
            <span className="text-[#111827] font-bold font-mono">₹{selectedInvoice?.totalAmount}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Payment Amount Received (₹) *
            </label>
            <input
              type="number"
              min="1"
              max={selectedInvoice?.balanceDue}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Payment Method *
            </label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Cash">Cash at Counter</option>
              <option value="Card">Credit / Debit Card</option>
              <option value="Bank Transfer">NEFT / IMPS Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Transaction UTR / Reference ID
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="e.g. UPI Ref 32918291..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Confirm Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Generate Tax Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Booking Ticket *
            </label>
            <select
              value={formData.ticketId}
              onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Choose booking...</option>
              {bookings.map((b) => (
                <option key={b._id} value={b.ticketId}>
                  {b.ticketId} — {b.device?.brand} {b.device?.model} ({b.customer?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Labour Charges (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.labourCharges}
                onChange={(e) => setFormData({ ...formData, labourCharges: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Spare Parts (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.sparePartCharges}
                onChange={(e) => setFormData({ ...formData, sparePartCharges: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Generate & Dispatch Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
