import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  Edit3,
  MessageSquare,
  Wrench,
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

  const [selectedBooking, setSelectedBooking] = useState(null);

  // Modal form states
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [selectedTechId, setSelectedTechId] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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
          <div className="overflow-x-auto">
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
                      <span className="text-[11px] text-[#64748B]">{b.problem?.category}</span>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
};
