import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import { PrintableBillModal } from '../../components/PrintableBillModal';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  Edit3,
  MessageSquare,
  Wrench,
  Plus,
  Receipt,
  Trash2,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'Booking Received',
  'Device Received',
  'Diagnosis in Progress',
  'Awaiting Customer Approval',
  'Repair Approved',
  'Repair in Progress',
  'Testing & Quality Check',
  'Ready for Collection',
  'Completed',
  'Cancelled',
];

export const AdminBookings = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [bookings, setBookings] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [prepareBillModalOpen, setPrepareBillModalOpen] = useState(false);

  // Delete Ticket State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal form states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Prepare Bill Form State
  const [billItems, setBillItems] = useState([
    { description: 'Device Servicing & Hardware Diagnostics', itemType: 'Service', quantity: 1, unitPrice: 499, amount: 499 },
  ]);
  const [billLabour, setBillLabour] = useState(499);
  const [billSpareParts, setBillSpareParts] = useState(0);
  const [billAdditional, setBillAdditional] = useState(0);
  const [billDiscount, setBillDiscount] = useState(0);
  const [billTaxRate, setBillTaxRate] = useState(0);
  const [billPaymentMethod, setBillPaymentMethod] = useState('Cash');
  const [billAmountPaid, setBillAmountPaid] = useState(499);
  const [billPaymentReference, setBillPaymentReference] = useState('');
  const [isSubmittingBill, setIsSubmittingBill] = useState(false);

  const openPrepareBillModal = (booking) => {
    setSelectedBooking(booking);
    if (booking.invoice) {
      setActiveInvoice(booking.invoice);
      setBillModalOpen(true);
      return;
    }
    setBillItems([
      { description: `${booking.device?.brand || ''} ${booking.device?.model || ''} - Repair Service`, itemType: 'Service', quantity: 1, unitPrice: 499, amount: 499 },
    ]);
    setBillLabour(499);
    setBillSpareParts(0);
    setBillAdditional(0);
    setBillDiscount(0);
    setBillTaxRate(0);
    setBillPaymentMethod('Cash');
    setBillAmountPaid(499);
    setBillPaymentReference('');
    setPrepareBillModalOpen(true);
  };

  const handleAddBillItem = () => {
    setBillItems([
      ...billItems,
      { description: '', itemType: 'Spare Part', quantity: 1, unitPrice: 0, amount: 0 },
    ]);
  };

  const handleBillItemChange = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;
    if (field === 'quantity' || field === 'unitPrice') {
      const q = Number(updated[index].quantity || 1);
      const p = Number(updated[index].unitPrice || 0);
      updated[index].amount = q * p;
    }
    setBillItems(updated);
    const spareTotal = updated
      .filter((it) => it.itemType === 'Spare Part')
      .reduce((sum, it) => sum + Number(it.amount || 0), 0);
    setBillSpareParts(spareTotal);
  };

  const handleRemoveBillItem = (index) => {
    const updated = billItems.filter((_, i) => i !== index);
    setBillItems(updated);
    const spareTotal = updated
      .filter((it) => it.itemType === 'Spare Part')
      .reduce((sum, it) => sum + Number(it.amount || 0), 0);
    setBillSpareParts(spareTotal);
  };

  const billSubtotal = Math.max(
    0,
    Number(billLabour || 0) + Number(billSpareParts || 0) + Number(billAdditional || 0) - Number(billDiscount || 0)
  );
  const billTaxAmount = Math.round((billSubtotal * Number(billTaxRate || 0)) / 100);
  const billGrandTotal = Math.max(0, billSubtotal + billTaxAmount);
  const billBalanceDue = Math.max(0, billGrandTotal - Number(billAmountPaid || 0));

  const handleSaveBill = async (e) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setIsSubmittingBill(true);

    try {
      const res = await api.post('/admin/invoices', {
        ticketId: selectedBooking.ticketId,
        items: billItems,
        labourCharges: Number(billLabour || 0),
        sparePartCharges: Number(billSpareParts || 0),
        additionalCharges: Number(billAdditional || 0),
        discount: Number(billDiscount || 0),
        taxRate: Number(billTaxRate || 0),
        paymentMethod: billPaymentMethod,
        amountPaid: Number(billAmountPaid || 0),
        paymentReference: billPaymentReference,
        paymentStatus: billBalanceDue <= 0 && billGrandTotal > 0 ? 'Paid' : billAmountPaid > 0 ? 'Partially Paid' : 'Unpaid',
      });
      toast.success(`Bill for ticket ${selectedBooking.ticketId} prepared successfully!`);
      setPrepareBillModalOpen(false);
      const newInvoice = res.data?.data?.invoice;
      setActiveInvoice(newInvoice);
      setBillModalOpen(true);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to prepare bill');
    } finally {
      setIsSubmittingBill(false);
    }
  };

  const fetchBookings = () => {
    setIsLoading(true);
    let url = `/admin/bookings?limit=50`;
    if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    api
      .get(url)
      .then((res) => {
        setBookings(res.data?.data?.bookings || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBookings();
    api
      .get('/admin/technicians')
      .then((res) => {
        setTechnicians(res.data?.data?.technicians || []);
      })
      .catch(() => {});
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setIsUpdating(true);

    try {
      await api.patch(`/admin/bookings/${selectedBooking.ticketId}/status`, {
        status: newStatus,
        note: statusNote,
      });
      toast.success(`Ticket ${selectedBooking.ticketId} updated to ${newStatus}`);
      setStatusModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignTechnician = async () => {
    if (!selectedTechId) return;
    setIsUpdating(true);

    try {
      await api.post(`/admin/bookings/${selectedBooking.ticketId}/assign`, {
        technicianId: selectedTechId,
      });
      toast.success(`Technician assigned to ${selectedBooking.ticketId}`);
      setAssignModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign technician');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!customNote.trim()) return;
    setIsUpdating(true);

    try {
      await api.post(`/admin/bookings/${selectedBooking.ticketId}/notes`, {
        note: customNote,
        isInternal: isInternalNote,
      });
      toast.success(`${isInternalNote ? 'Internal' : 'Customer'} note logged`);
      setNoteModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setIsDeleting(true);

    try {
      await api.delete(`/admin/bookings/${bookingToDelete.ticketId}`);
      toast.success(`Ticket ${bookingToDelete.ticketId} deleted successfully`);
      setDeleteModalOpen(false);
      setBookingToDelete(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete booking');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Repair Bookings Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Dispatch engineers, track workshop stages, and update ticket telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/bookings/new">
            <Button size="sm" variant="primary" icon={Plus}>
              New Offline Ticket
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border border-[#E2E8F0] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Ticket ID (e.g. LPC-2026), device brand or model..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <Button type="submit" size="sm">
              Filter
            </Button>
          </div>
        </form>
      </Card>

      {/* Bookings Table */}
      <Card className="p-0 bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No repair tickets found</p>
            <p className="text-xs">Try clearing the search query or changing filters.</p>
          </div>
        ) : (
          <>
            {/* Mobile Touch-Friendly Card View (<768px) */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {bookings.map((b) => (
                <div key={b._id} className="p-4 space-y-3 bg-white hover:bg-slate-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {b.ticketId}
                    </span>
                    <Badge status={b.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Customer</span>
                      <span className="text-[#111827] font-semibold block truncate">{b.customer?.name}</span>
                      <a href={`tel:${b.customer?.phone}`} className="text-teal-700 font-mono text-[11px] underline">
                        {b.customer?.phone}
                      </a>
                    </div>
                    <div>
                      <span className="text-[#64748B] block text-[10px] uppercase font-semibold">Device</span>
                      <span className="text-[#111827] font-medium block truncate">{b.device?.brand} {b.device?.model}</span>
                      <span className="text-[#64748B] text-[11px] truncate block">{b.device?.deviceType || 'Hardware'} • {b.problem?.category}</span>
                      {b.servicePreference?.toLowerCase().includes('doorstep') && (
                        <span className="inline-block mt-1 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-semibold">
                          🏠 Home Service
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                    <span className="text-[#64748B]">
                      {new Date(b.appointment?.date).toLocaleDateString('en-IN')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {b.invoice ? (
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setActiveInvoice(b.invoice);
                            setBillModalOpen(true);
                          }}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 text-xs flex items-center gap-1"
                          title="View Bill"
                        >
                          <Receipt className="w-3 h-3 text-emerald-600" />
                          <span>Bill</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openPrepareBillModal(b)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-200 text-xs flex items-center gap-1"
                          title="Prepare Bill"
                        >
                          <Receipt className="w-3 h-3 text-indigo-600" />
                          <span>Bill</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setNewStatus(b.status);
                          setStatusNote('');
                          setStatusModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-[#475569] font-semibold border border-slate-200 text-xs flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Update</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setCustomNote('');
                          setIsInternalNote(false);
                          setNoteModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-100 text-[#475569] font-semibold border border-slate-200 text-xs flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Note</span>
                      </button>
                      <button
                        onClick={() => {
                          setBookingToDelete(b);
                          setDeleteModalOpen(true);
                        }}
                        className="px-2 py-1 rounded-lg bg-rose-50 text-rose-600 font-semibold border border-rose-200 text-xs flex items-center gap-1 hover:bg-rose-100"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Ticket ID</th>
                    <th className="py-3 px-4 font-semibold">Customer & Contact</th>
                    <th className="py-3 px-4 font-semibold">Device</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Service Lead</th>
                    <th className="py-3 px-4 font-semibold">Appointment</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#4F46E5]">
                        {b.ticketId}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[#111827] font-semibold block">{b.customer?.name}</span>
                        <span className="text-[11px] text-[#64748B]">{b.customer?.phone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[#111827] font-medium block">
                          {b.device?.brand} {b.device?.model}
                        </span>
                        <span className="text-[11px] text-[#64748B] block">
                          {b.device?.deviceType || 'Hardware'} • {b.problem?.category}
                        </span>
                        {b.servicePreference?.toLowerCase().includes('doorstep') && (
                          <span className="inline-block mt-0.5 text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
                            🏠 Home Service
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 text-[#475569]">
                        <span className="text-teal-700 font-semibold flex items-center gap-1.5 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                          <span>{b.assignedTechnician?.name || 'Admin (You)'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(b.appointment?.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.invoice ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(b);
                                setActiveInvoice(b.invoice);
                                setBillModalOpen(true);
                              }}
                              title="View & Print Bill"
                              className="text-xs py-1 px-2.5 text-emerald-700 border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 flex items-center gap-1 font-semibold"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Bill (₹{b.invoice.totalAmount.toLocaleString('en-IN')})</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPrepareBillModal(b)}
                              title="Add Costs & Prepare Bill"
                              className="text-xs py-1 px-2.5 text-indigo-700 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 flex items-center gap-1 font-semibold"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Prepare Bill</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(b);
                              setNewStatus(b.status);
                              setStatusNote('');
                              setStatusModalOpen(true);
                            }}
                            title="Update Status & Stage"
                            className="p-1.5 text-[#4F46E5] hover:bg-indigo-50"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(b);
                              setCustomNote('');
                              setIsInternalNote(false);
                              setNoteModalOpen(true);
                            }}
                            title="Add Note"
                            className="p-1.5 text-teal-600 hover:bg-teal-50"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBookingToDelete(b);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Ticket"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* 1. Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${selectedBooking?.ticketId}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select New Stage *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Customer Visible Status Note
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              rows={3}
              placeholder="e.g. Ultrasonic cleaning complete; replacing logic board capacitors..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isUpdating} onClick={handleUpdateStatus}>
              Commit Status Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* 2. Assign Technician Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Engineer: ${selectedBooking?.ticketId}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Select Certified Technician *
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              <option value="">Choose technician...</option>
              {technicians.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name} ({tech.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isUpdating} onClick={handleAssignTechnician}>
              Assign Job
            </Button>
          </div>
        </div>
      </Modal>

      {/* 3. Add Note Modal */}
      <Modal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        title={`Add Note: ${selectedBooking?.ticketId}`}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="internal-check"
              checked={isInternalNote}
              onChange={(e) => setIsInternalNote(e.target.checked)}
              className="rounded border-slate-300 text-[#4F46E5] focus:ring-indigo-500"
            />
            <label htmlFor="internal-check" className="text-xs text-[#475569]">
              Internal staff note only (hidden from customer tracking)
            </label>
          </div>

          <div>
            <textarea
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              rows={4}
              placeholder="Type note observation..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isUpdating} onClick={handleAddNote}>
              Save Note
            </Button>
          </div>
        </div>
      </Modal>

      {/* 4. Prepare Bill Modal */}
      <Modal
        isOpen={prepareBillModalOpen}
        onClose={() => setPrepareBillModalOpen(false)}
        title={`Prepare Bill: ${selectedBooking?.ticketId} (${selectedBooking?.customer?.name})`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveBill} className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">
              Repair Line Items (Services & Spare Parts):
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={handleAddBillItem}
              className="text-xs py-1"
            >
              Add Item
            </Button>
          </div>

          {/* Items List */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {billItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
              >
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    value={item.description}
                    onChange={(e) => handleBillItemChange(idx, 'description', e.target.value)}
                    placeholder="Description / Part name"
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <select
                    value={item.itemType}
                    onChange={(e) => handleBillItemChange(idx, 'itemType', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Service">Service</option>
                    <option value="Spare Part">Spare Part</option>
                    <option value="Labour">Labour</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleBillItemChange(idx, 'quantity', e.target.value)}
                    className="w-full px-1.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) => handleBillItemChange(idx, 'unitPrice', e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-right"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-1">
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                  </span>
                  {billItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBillItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Charges and Totals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Labour (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={billLabour}
                  onChange={(e) => setBillLabour(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Spare Parts (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={billSpareParts}
                  onChange={(e) => setBillSpareParts(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Additional Fees (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={billAdditional}
                  onChange={(e) => setBillAdditional(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-0.5">Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={billDiscount}
                  onChange={(e) => setBillDiscount(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono text-emerald-700"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-900">₹{billSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-indigo-700">₹{billGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Mode</label>
                  <select
                    value={billPaymentMethod}
                    onChange={(e) => setBillPaymentMethod(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-900"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max={billGrandTotal}
                    value={billAmountPaid}
                    onChange={(e) => setBillAmountPaid(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-600">Balance Due:</span>
                <span className={`font-mono font-bold ${billBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {billBalanceDue > 0 ? `₹${billBalanceDue.toLocaleString('en-IN')}` : 'Settled in Full'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setPrepareBillModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" isLoading={isSubmittingBill} type="submit" icon={Receipt}>
              Save & Generate Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. Printable Bill / Receipt Modal */}
      {billModalOpen && (
        <PrintableBillModal
          isOpen={billModalOpen}
          onClose={() => setBillModalOpen(false)}
          invoice={activeInvoice}
          booking={selectedBooking}
        />
      )}

      {/* 6. Delete Ticket Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteModalOpen(false);
            setBookingToDelete(null);
          }
        }}
        title="Delete Repair Ticket"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm text-rose-900">Are you sure you want to delete this ticket?</p>
              <p>
                Ticket <span className="font-mono font-bold text-rose-950 bg-rose-100 px-1 py-0.5 rounded">{bookingToDelete?.ticketId}</span> will be permanently deleted along with all its status history and any linked bills or payments.
              </p>
              <p className="text-rose-600 font-semibold pt-0.5">⚠️ This action is permanent and cannot be undone.</p>
            </div>
          </div>

          {bookingToDelete && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-800">{bookingToDelete.customer?.name || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono text-slate-800">{bookingToDelete.customer?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Device:</span>
                <span className="font-semibold text-slate-800">
                  {bookingToDelete.device?.brand} {bookingToDelete.device?.model}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-slate-800">{bookingToDelete.status}</span>
              </div>
              {bookingToDelete.invoice && (
                <div className="flex justify-between items-center text-indigo-700 font-semibold pt-1.5 border-t border-slate-200">
                  <span>Linked Bill Amount:</span>
                  <span className="font-mono font-bold">₹{bookingToDelete.invoice.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-200">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={isDeleting}
              onClick={() => {
                setDeleteModalOpen(false);
                setBookingToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              type="button"
              isLoading={isDeleting}
              onClick={handleDeleteBooking}
              icon={Trash2}
            >
              Delete Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
