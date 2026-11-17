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
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Laptop,
  Check,
  CreditCard,
  AlertCircle,
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

const DEVICE_TYPES = [
  'Laptop',
  'Desktop',
  'Gaming PC',
  'Mobile / Smartphone',
  'Gaming Console',
  'Other',
];

const PROBLEM_CATEGORIES = [
  'Display & Screen Replacement',
  'Motherboard & Chip-Level Repair',
  'Battery & Power Delivery',
  'Storage / SSD & RAM Upgrade',
  'Overheating & Thermal Servicing',
  'Operating System & Software',
  'Liquid / Water Damage Restoration',
  'Charging Port & DC Jack Repair',
  'Hinge & Body Panel Repair',
  'Console HDMI / Power / Controller',
  'General Diagnosis & Troubleshooting',
];

const ACCESSORY_OPTIONS = [
  'Charger / Power Adapter',
  'Power Cord',
  'Laptop Bag / Sleeve',
  'Wireless Mouse / Dongle',
  'Original Box',
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

  // Quick Payment Status State
  const [quickPaymentModalOpen, setQuickPaymentModalOpen] = useState(false);
  const [quickPaymentBooking, setQuickPaymentBooking] = useState(null);
  const [quickPayStatus, setQuickPayStatus] = useState('Paid');
  const [quickPayAmount, setQuickPayAmount] = useState(0);
  const [quickPayMethod, setQuickPayMethod] = useState('Cash');
  const [isSavingQuickPayment, setIsSavingQuickPayment] = useState(false);

  // Edit Whole Ticket Details State
  const [editTicketModalOpen, setEditTicketModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editActiveTab, setEditActiveTab] = useState('customer'); // 'customer' | 'device' | 'problem' | 'billing'
  const [isSavingTicket, setIsSavingTicket] = useState(false);

  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editCustomerEmail, setEditCustomerEmail] = useState('');
  const [editCustomerStreet, setEditCustomerStreet] = useState('');

  const [editDeviceType, setEditDeviceType] = useState('Laptop');
  const [editDeviceBrand, setEditDeviceBrand] = useState('');
  const [editDeviceModel, setEditDeviceModel] = useState('');
  const [editDeviceSerial, setEditDeviceSerial] = useState('');
  const [editDevicePasscode, setEditDevicePasscode] = useState('');
  const [editDeviceAccessories, setEditDeviceAccessories] = useState([]);

  const [editProblemCategory, setEditProblemCategory] = useState('');
  const [editProblemDescription, setEditProblemDescription] = useState('');
  const [editDiagnosticFindings, setEditDiagnosticFindings] = useState('');
  const [editPriority, setEditPriority] = useState('Normal');

  const [editStatus, setEditStatus] = useState('Device Received');
  const [editStatusNote, setEditStatusNote] = useState('');
  const [editAssignedTechId, setEditAssignedTechId] = useState('');

  const [editBillPaymentStatus, setEditBillPaymentStatus] = useState('Unpaid');
  const [editBillAmountPaid, setEditBillAmountPaid] = useState(0);
  const [editBillPaymentMethod, setEditBillPaymentMethod] = useState('Cash');

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
    const inv = booking.invoice;
    if (inv) {
      const safeItems = Array.isArray(inv.items) && inv.items.length > 0
        ? inv.items.map((it) => ({
            description: it.description || '',
            itemType: it.itemType || 'Service',
            quantity: it.quantity || 1,
            unitPrice: it.unitPrice || 0,
            amount: it.amount || 0,
          }))
        : [
            {
              description: `${booking.device?.brand || ''} ${booking.device?.model || ''} - Repair Service`,
              itemType: 'Service',
              quantity: 1,
              unitPrice: inv.totalAmount || 0,
              amount: inv.totalAmount || 0,
            },
          ];

      setBillItems(safeItems);
      setBillLabour(inv.labourCharges || 0);
      setBillSpareParts(inv.sparePartCharges || 0);
      setBillAdditional(inv.additionalCharges || 0);
      setBillDiscount(inv.discount || 0);
      setBillTaxRate(0);
      setBillPaymentMethod(inv.paymentMethod || 'Cash');
      setBillAmountPaid(inv.amountPaid !== undefined ? inv.amountPaid : inv.totalAmount || 0);
      setBillPaymentReference(inv.paymentReference || '');
      setPrepareBillModalOpen(true);
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

  const openQuickPaymentModal = (booking) => {
    if (!booking.invoice) {
      // If no invoice yet, prompt to prepare bill
      openPrepareBillModal(booking);
      return;
    }
    setQuickPaymentBooking(booking);
    const inv = booking.invoice;
    setQuickPayStatus(inv.paymentStatus || 'Unpaid');
    setQuickPayAmount(inv.amountPaid !== undefined ? inv.amountPaid : (inv.paymentStatus === 'Paid' ? inv.totalAmount : 0));
    setQuickPayMethod(inv.paymentMethod || 'Cash');
    setQuickPaymentModalOpen(true);
  };

  const handleUpdatePaymentStatusQuick = async (ticketId, newStatus, customAmount = null, method = null) => {
    try {
      const res = await api.patch(`/admin/bookings/${ticketId}/payment-status`, {
        paymentStatus: newStatus,
        amountPaid: customAmount !== null ? customAmount : undefined,
        paymentMethod: method || undefined,
      });
      toast.success(`Payment status updated to ${newStatus}`);
      fetchBookings();
      if (activeInvoice && activeInvoice.ticketId === ticketId) {
        setActiveInvoice(res.data?.data?.invoice);
      }
      setQuickPaymentModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleSaveQuickPayment = async (e) => {
    e.preventDefault();
    if (!quickPaymentBooking) return;
    setIsSavingQuickPayment(true);
    try {
      const res = await api.patch(`/admin/bookings/${quickPaymentBooking.ticketId}/payment-status`, {
        paymentStatus: quickPayStatus,
        amountPaid: Number(quickPayAmount || 0),
        paymentMethod: quickPayMethod,
      });
      toast.success(`Payment updated: ${quickPayStatus}`);
      setQuickPaymentModalOpen(false);
      fetchBookings();
      if (activeInvoice && activeInvoice.ticketId === quickPaymentBooking.ticketId) {
        setActiveInvoice(res.data?.data?.invoice);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    } finally {
      setIsSavingQuickPayment(false);
    }
  };

  const openEditTicketModal = (booking) => {
    setEditingTicket(booking);
    setEditActiveTab('customer');

    // Customer
    setEditCustomerName(booking.customer?.name || '');
    setEditCustomerPhone(booking.customer?.phone || '');
    setEditCustomerEmail(
      booking.customer?.email && !booking.customer.email.includes('@lapyprocare.local')
        ? booking.customer.email
        : ''
    );
    setEditCustomerStreet(booking.doorstepAddress?.street || booking.customer?.address?.street || '');

    // Device
    setEditDeviceType(booking.device?.deviceType || 'Laptop');
    setEditDeviceBrand(booking.device?.brand || '');
    setEditDeviceModel(booking.device?.model || '');
    setEditDeviceSerial(booking.device?.serialNumber || '');
    setEditDevicePasscode(booking.device?.passcode || '');
    setEditDeviceAccessories(Array.isArray(booking.device?.accessories) ? booking.device.accessories : []);

    // Problem
    setEditProblemCategory(booking.problem?.category || PROBLEM_CATEGORIES[0]);
    setEditProblemDescription(booking.problem?.description || '');
    setEditDiagnosticFindings(booking.diagnosticFindings || '');
    setEditPriority(booking.priority || 'Normal');

    // Stage & Tech
    setEditStatus(booking.status || 'Device Received');
    setEditStatusNote('');
    setEditAssignedTechId(booking.assignedTechnician?._id || booking.assignedTechnician || '');

    // Bill
    if (booking.invoice) {
      setEditBillPaymentStatus(booking.invoice.paymentStatus || 'Unpaid');
      setEditBillAmountPaid(
        booking.invoice.amountPaid !== undefined
          ? booking.invoice.amountPaid
          : (booking.invoice.paymentStatus === 'Paid' ? booking.invoice.totalAmount : 0)
      );
      setEditBillPaymentMethod(booking.invoice.paymentMethod || 'Cash');
    } else {
      setEditBillPaymentStatus('Unpaid');
      setEditBillAmountPaid(0);
      setEditBillPaymentMethod('Cash');
    }

    setEditTicketModalOpen(true);
  };

  const handleToggleAccessory = (acc) => {
    if (editDeviceAccessories.includes(acc)) {
      setEditDeviceAccessories(editDeviceAccessories.filter((a) => a !== acc));
    } else {
      setEditDeviceAccessories([...editDeviceAccessories, acc]);
    }
  };

  const handleSaveTicketDetails = async (e) => {
    e.preventDefault();
    if (!editingTicket) return;
    setIsSavingTicket(true);

    try {
      const payload = {
        customer: {
          name: editCustomerName.trim(),
          phone: editCustomerPhone.trim(),
          email: editCustomerEmail.trim(),
          address: { street: editCustomerStreet.trim() },
        },
        device: {
          deviceType: editDeviceType,
          brand: editDeviceBrand.trim(),
          model: editDeviceModel.trim(),
          serialNumber: editDeviceSerial.trim(),
          passcode: editDevicePasscode.trim(),
          accessories: editDeviceAccessories,
        },
        problem: {
          category: editProblemCategory,
          description: editProblemDescription.trim(),
        },
        priority: editPriority,
        diagnosticFindings: editDiagnosticFindings.trim(),
        status: editStatus,
        statusNote: editStatusNote.trim(),
        assignedTechnician: editAssignedTechId || null,
        billing: editingTicket.invoice ? {
          paymentStatus: editBillPaymentStatus,
          amountPaid: Number(editBillAmountPaid || 0),
          paymentMethod: editBillPaymentMethod,
        } : undefined,
      };

      await api.put(`/admin/bookings/${editingTicket.ticketId}`, payload);
      toast.success(`Ticket ${editingTicket.ticketId} details updated successfully!`);
      setEditTicketModalOpen(false);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket details');
    } finally {
      setIsSavingTicket(false);
    }
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
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.invoice ? (
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setActiveInvoice(b.invoice);
                              setBillModalOpen(true);
                            }}
                            className="px-2 py-1 text-slate-800 font-semibold border-r border-slate-200 flex items-center gap-1 hover:bg-slate-50"
                            title="View / Print Bill"
                          >
                            <Receipt className="w-3 h-3 text-indigo-600" />
                            <span>₹{b.invoice.totalAmount?.toLocaleString('en-IN')}</span>
                          </button>
                          <button
                            onClick={() => openQuickPaymentModal(b)}
                            title="Tap to change payment status"
                            className={`px-1.5 py-1 text-[10px] font-extrabold uppercase ${
                              b.invoice.paymentStatus?.toLowerCase() === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : b.invoice.paymentStatus?.toLowerCase() === 'partially paid'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {b.invoice.paymentStatus || 'UNPAID'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPrepareBillModal(b)}
                          className="px-2 py-1 rounded-lg bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-200 text-xs flex items-center gap-1"
                          title="Prepare Bill"
                        >
                          <Receipt className="w-3 h-3 text-indigo-600" />
                          <span>+ Bill</span>
                        </button>
                      )}
                      <button
                        onClick={() => openEditTicketModal(b)}
                        className="px-2 py-1 rounded-lg bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-200 text-xs flex items-center gap-1"
                        title="Edit Whole Ticket Details"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
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
                            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBooking(b);
                                  setActiveInvoice(b.invoice);
                                  setBillModalOpen(true);
                                }}
                                title="View & Print Bill Receipt"
                                className="px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 flex items-center gap-1.5 border-r border-slate-200 transition-colors"
                              >
                                <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                                <span className="font-mono font-bold">₹{b.invoice.totalAmount?.toLocaleString('en-IN')}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openQuickPaymentModal(b)}
                                title="Click to toggle or update payment status (Paid / Unpaid)"
                                className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                                  b.invoice.paymentStatus?.toLowerCase() === 'paid'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : b.invoice.paymentStatus?.toLowerCase() === 'partially paid'
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  b.invoice.paymentStatus?.toLowerCase() === 'paid'
                                    ? 'bg-emerald-500'
                                    : b.invoice.paymentStatus?.toLowerCase() === 'partially paid'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`} />
                                <span>{b.invoice.paymentStatus || 'UNPAID'}</span>
                              </button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPrepareBillModal(b)}
                              title="Add Costs & Prepare Bill"
                              className="text-xs py-1 px-2.5 text-indigo-700 border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 flex items-center gap-1 font-semibold"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>+ Prepare Bill</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTicketModal(b)}
                            title="Edit Whole Ticket Details & Status"
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

      {/* 4. Prepare / Edit Bill Modal */}
      <Modal
        isOpen={prepareBillModalOpen}
        onClose={() => setPrepareBillModalOpen(false)}
        title={selectedBooking?.invoice ? `Edit Bill: ${selectedBooking?.ticketId} (${selectedBooking?.customer?.name || 'Walk-in'})` : `Prepare Bill: ${selectedBooking?.ticketId} (${selectedBooking?.customer?.name || 'Walk-in'})`}
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
              {selectedBooking?.invoice ? 'Update Bill & Costs' : 'Save & Generate Bill'}
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
          onEditBill={(b) => openPrepareBillModal(b)}
          onUpdatePaymentStatus={(ticketId, status) => handleUpdatePaymentStatusQuick(ticketId, status)}
        />
      )}

      {/* Quick Payment Status Modal */}
      <Modal
        isOpen={quickPaymentModalOpen}
        onClose={() => setQuickPaymentModalOpen(false)}
        title={`Update Payment Status: ${quickPaymentBooking?.ticketId}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveQuickPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-800">{quickPaymentBooking?.customer?.name || 'Walk-in'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Device:</span>
              <span className="font-medium text-slate-800">
                {quickPaymentBooking?.device?.brand} {quickPaymentBooking?.device?.model}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-200 font-bold">
              <span className="text-slate-700">Total Bill Amount:</span>
              <span className="font-mono text-indigo-700 text-sm">
                ₹{quickPaymentBooking?.invoice?.totalAmount?.toLocaleString('en-IN') || 0}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Payment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setQuickPayStatus('Paid');
                  setQuickPayAmount(quickPaymentBooking?.invoice?.totalAmount || 0);
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                  quickPayStatus === 'Paid'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                }`}
              >
                ✓ Paid (Full)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickPayStatus('Partially Paid');
                  if (!quickPayAmount || quickPayAmount === (quickPaymentBooking?.invoice?.totalAmount || 0)) {
                    setQuickPayAmount(Math.round((quickPaymentBooking?.invoice?.totalAmount || 0) / 2));
                  }
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                  quickPayStatus === 'Partially Paid'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
                }`}
              >
                Partial Paid
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuickPayStatus('Unpaid');
                  setQuickPayAmount(0);
                }}
                className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                  quickPayStatus === 'Unpaid'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50'
                }`}
              >
                ✕ Unpaid
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Received (₹)
              </label>
              <input
                type="number"
                min="0"
                max={quickPaymentBooking?.invoice?.totalAmount || 0}
                value={quickPayAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQuickPayAmount(e.target.value);
                  const total = quickPaymentBooking?.invoice?.totalAmount || 0;
                  if (val >= total && total > 0) {
                    setQuickPayStatus('Paid');
                  } else if (val > 0) {
                    setQuickPayStatus('Partially Paid');
                  } else {
                    setQuickPayStatus('Unpaid');
                  }
                }}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Mode
              </label>
              <select
                value={quickPayMethod}
                onChange={(e) => setQuickPayMethod(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI (GPay/PhonePe)</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
            <span className="text-slate-500">Remaining Balance:</span>
            <span className={`font-mono font-bold ${
              (Number(quickPaymentBooking?.invoice?.totalAmount || 0) - Number(quickPayAmount || 0)) > 0
                ? 'text-rose-600'
                : 'text-emerald-700'
            }`}>
              {(Number(quickPaymentBooking?.invoice?.totalAmount || 0) - Number(quickPayAmount || 0)) > 0
                ? `₹${(Number(quickPaymentBooking?.invoice?.totalAmount || 0) - Number(quickPayAmount || 0)).toLocaleString('en-IN')}`
                : 'Settled in Full'}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setQuickPaymentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={isSavingQuickPayment}
            >
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Whole Ticket & Customer Details Modal */}
      <Modal
        isOpen={editTicketModalOpen}
        onClose={() => setEditTicketModalOpen(false)}
        title={`Edit Ticket Details: ${editingTicket?.ticketId}`}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveTicketDetails} className="space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setEditActiveTab('customer')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                editActiveTab === 'customer'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              👤 Customer & Device
            </button>
            <button
              type="button"
              onClick={() => setEditActiveTab('problem')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                editActiveTab === 'problem'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              🛠️ Problem, Stage & Lead
            </button>
            <button
              type="button"
              onClick={() => setEditActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                editActiveTab === 'billing'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              💳 Bill & Payment Status
            </button>
          </div>

          {/* TAB 1: Customer & Device */}
          {editActiveTab === 'customer' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editCustomerName}
                    onChange={(e) => setEditCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number (WhatsApp) *</label>
                  <input
                    type="tel"
                    required
                    value={editCustomerPhone}
                    onChange={(e) => setEditCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={editCustomerEmail}
                    onChange={(e) => setEditCustomerEmail(e.target.value)}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Address / Locality</label>
                  <input
                    type="text"
                    value={editCustomerStreet}
                    onChange={(e) => setEditCustomerStreet(e.target.value)}
                    placeholder="e.g. Vamanjoor, Mangaluru"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="font-bold text-slate-800 block mb-2">Device Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Device Category</label>
                    <select
                      value={editDeviceType}
                      onChange={(e) => setEditDeviceType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500"
                    >
                      {DEVICE_TYPES.map((dt) => (
                        <option key={dt} value={dt}>{dt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand *</label>
                    <input
                      type="text"
                      required
                      value={editDeviceBrand}
                      onChange={(e) => setEditDeviceBrand(e.target.value)}
                      placeholder="e.g. Dell, Sony, Apple"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={editDeviceModel}
                      onChange={(e) => setEditDeviceModel(e.target.value)}
                      placeholder="e.g. Precision T3600, PS4"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Serial / Service Tag</label>
                    <input
                      type="text"
                      value={editDeviceSerial}
                      onChange={(e) => setEditDeviceSerial(e.target.value)}
                      placeholder="e.g. 7XYZ123"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">PIN / Passcode</label>
                    <input
                      type="text"
                      value={editDevicePasscode}
                      onChange={(e) => setEditDevicePasscode(e.target.value)}
                      placeholder="For bench testing"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block font-semibold text-slate-700 mb-1.5">Accessories Handed Over</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCESSORY_OPTIONS.map((acc) => {
                      const isSelected = editDeviceAccessories.includes(acc);
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => handleToggleAccessory(acc)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{acc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Problem, Stage & Lead */}
          {editActiveTab === 'problem' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Problem Category</label>
                  <select
                    value={editProblemCategory}
                    onChange={(e) => setEditProblemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    {PROBLEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repair Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reported Customer Symptoms / Issue Description *</label>
                <textarea
                  rows={2}
                  required
                  value={editProblemDescription}
                  onChange={(e) => setEditProblemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Counter Diagnostic Findings / Bench Notes</label>
                <textarea
                  rows={2}
                  value={editDiagnosticFindings}
                  onChange={(e) => setEditDiagnosticFindings(e.target.value)}
                  placeholder="e.g. Short circuit detected on 19V rail; capacitor C201 blown..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Repair Stage / Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Service Lead</label>
                  <select
                    value={editAssignedTechId}
                    onChange={(e) => setEditAssignedTechId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Admin (You)</option>
                    {technicians.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.phone || t.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Note (Customer visible if stage changed)</label>
                <input
                  type="text"
                  value={editStatusNote}
                  onChange={(e) => setEditStatusNote(e.target.value)}
                  placeholder="e.g. Ultrasonic clean complete; awaiting final thermal bench run."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Bill & Payment */}
          {editActiveTab === 'billing' && (
            <div className="space-y-4 text-xs">
              {editingTicket?.invoice ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Bill Number:</span>
                      <span className="font-mono font-bold text-slate-900">{editingTicket.invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-800">Grand Total:</span>
                      <span className="font-mono text-indigo-700 text-base">
                        ₹{editingTicket.invoice.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setEditTicketModalOpen(false);
                          openPrepareBillModal(editingTicket);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-xs flex items-center gap-1"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Edit Full Line Items & Pricing</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Customer Payment Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditBillPaymentStatus('Paid');
                          setEditBillAmountPaid(editingTicket.invoice.totalAmount || 0);
                        }}
                        className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                          editBillPaymentStatus === 'Paid'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        ✓ Paid (Settled)
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditBillPaymentStatus('Partially Paid')}
                        className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                          editBillPaymentStatus === 'Partially Paid'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
                        }`}
                      >
                        Partially Paid
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditBillPaymentStatus('Unpaid');
                          setEditBillAmountPaid(0);
                        }}
                        className={`py-2 px-3 rounded-xl border font-bold transition-all ${
                          editBillPaymentStatus === 'Unpaid'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50'
                        }`}
                      >
                        ✕ Unpaid (Due)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Amount Paid (₹)</label>
                      <input
                        type="number"
                        min="0"
                        max={editingTicket.invoice.totalAmount || 0}
                        value={editBillAmountPaid}
                        onChange={(e) => {
                          setEditBillAmountPaid(e.target.value);
                          const val = Number(e.target.value);
                          const total = editingTicket.invoice.totalAmount || 0;
                          if (val >= total && total > 0) setEditBillPaymentStatus('Paid');
                          else if (val > 0) setEditBillPaymentStatus('Partially Paid');
                          else setEditBillPaymentStatus('Unpaid');
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                      <select
                        value={editBillPaymentMethod}
                        onChange={(e) => setEditBillPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI (GPay/PhonePe)</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                  <Receipt className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-800">No bill prepared yet for this ticket.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    icon={Plus}
                    onClick={() => {
                      setEditTicketModalOpen(false);
                      openPrepareBillModal(editingTicket);
                    }}
                  >
                    Prepare Bill Now
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-500 font-mono">Ticket: {editingTicket?.ticketId}</span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditTicketModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={isSavingTicket}
              >
                Save All Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

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
