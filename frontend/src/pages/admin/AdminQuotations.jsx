import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import { Plus, FileText, Trash2, Download } from 'lucide-react';

export const AdminQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ticketId: '',
    diagnosis: '',
    labourCharges: 499,
    discount: 0,
    validityDays: 7,
    items: [
      { description: 'Logic Board Diagnostic & Labour', itemType: 'Labour', quantity: 1, unitPrice: 499, amount: 499 },
    ],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuotations = () => {
    setIsLoading(true);
    api
      .get('/admin/quotations')
      .then((res) => {
        setQuotations(res.data?.data?.quotations || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
    api
      .get('/admin/bookings?limit=50')
      .then((res) => {
        setBookings(res.data?.data?.bookings || []);
      })
      .catch(() => {});
  }, []);

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: '', itemType: 'Spare Part', quantity: 1, unitPrice: 0, amount: 0 },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity) || 1;
      const p = Number(updated[index].unitPrice) || 0;
      updated[index].amount = q * p;
    }
    setFormData({ ...formData, items: updated });
  };

  const calculateSubtotal = () => {
    const itemsTotal = formData.items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return Math.max(0, itemsTotal - (Number(formData.discount) || 0));
  };

  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const gst = Math.round((sub * 18) / 100);
    return sub + gst;
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    if (!formData.ticketId || !formData.diagnosis) {
      toast.error('Please select a ticket ID and provide diagnosis details');
      return;
    }

    const sparePartsTotal = formData.items
      .filter((i) => i.itemType !== 'Labour')
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const labourTotal = formData.items
      .filter((i) => i.itemType === 'Labour')
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0) || formData.labourCharges;

    setIsSubmitting(true);
    try {
      await api.post('/admin/quotations', {
        ...formData,
        sparePartCharges: sparePartsTotal,
        labourCharges: labourTotal,
      });
      toast.success('Quotation generated and sent to customer!');
      setCreateModalOpen(false);
      fetchQuotations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Quotation Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Issue diagnostic repair estimates with itemized parts and GST calculation.
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} icon={Plus} size="sm">
          Issue New Quotation
        </Button>
      </div>

      {/* Quotations List */}
      <Card className="p-0 bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No quotations issued yet</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {quotations.map((q) => (
                <div key={q._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#4F46E5]">{q.quotationNumber}</span>
                      <span className="text-[11px] text-[#64748B] block font-mono">Ref: {q.ticketId}</span>
                    </div>
                    <Badge status={q.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Customer</span>
                      <span className="font-semibold text-[#111827] truncate block">
                        {q.customer?.name || 'Customer'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Total Amount</span>
                      <span className="font-mono font-bold text-[#111827]">
                        ₹{q.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Expires On</span>
                      <span className="text-[#475569]">
                        {new Date(q.expiresAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Issued On</span>
                      <span className="text-[#475569]">
                        {new Date(q.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <a
                      href={`/api/v1/quotations/${q._id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl border border-indigo-200 text-[#4F46E5] hover:bg-indigo-50 text-xs inline-flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Quotation #</th>
                    <th className="py-3 px-4 font-semibold">Ticket Ref</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Amount (₹)</th>
                    <th className="py-3 px-4 font-semibold">Expires</th>
                    <th className="py-3 px-4 font-semibold text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {quotations.map((q) => (
                    <tr key={q._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4F46E5]">
                        {q.quotationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#475569]">{q.ticketId}</td>
                      <td className="py-3.5 px-4 text-[#111827] font-semibold">{q.customer?.name}</td>
                      <td className="py-3.5 px-4">
                        <Badge status={q.status} />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#111827]">
                        ₹{q.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(q.expiresAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/api/v1/quotations/${q._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#4F46E5] hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* Create Quotation Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Repair Quotation"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Repair Ticket *
            </label>
            <select
              value={formData.ticketId}
              onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">Choose booking ticket...</option>
              {bookings.map((b) => (
                <option key={b._id} value={b.ticketId}>
                  {b.ticketId} — {b.device?.brand} {b.device?.model} ({b.customer?.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Diagnostic Report / Fault Identified *
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              rows={2}
              placeholder="e.g. Logic board 19V rail shorted by decayed ceramic capacitor C402..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
              required
            />
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#475569]">
                Itemized Services & Spare Parts
              </label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="py-1 text-xs">
                + Add Item
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description / Part name"
                    className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <select
                    value={item.itemType}
                    onChange={(e) => handleItemChange(idx, 'itemType', e.target.value)}
                    className="w-24 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-[#111827]"
                  >
                    <option value="Labour">Labour</option>
                    <option value="Spare Part">Spare Part</option>
                    <option value="Service">Service</option>
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-14 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-[#111827] text-center"
                  />
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                    placeholder="Price"
                    className="w-20 bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-[#111827] text-right font-mono"
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-rose-600 hover:text-rose-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
            <span className="text-[#64748B] font-medium">Total with 18% GST:</span>
            <span className="text-base font-bold text-[#4F46E5] font-mono">
              ₹{calculateTotal().toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Issue Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
