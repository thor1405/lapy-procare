import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  Laptop,
  AlertTriangle,
  Plus,
} from 'lucide-react';

export const CustomerRepairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchRepairs = () => {
    setIsLoading(true);
    api
      .get('/bookings/my')
      .then((res) => {
        setRepairs(res.data?.data?.bookings || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleCancelClick = (ticket) => {
    setSelectedTicket(ticket);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedTicket) return;
    setIsCancelling(true);

    try {
      await api.post(`/bookings/${selectedTicket.ticketId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer',
      });
      toast.success(`Repair ticket ${selectedTicket.ticketId} has been cancelled.`);
      setCancelModalOpen(false);
      fetchRepairs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel repair booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            My Repair Tickets
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Complete history of your hardware diagnostics, bookings, and repairs.
          </p>
        </div>
        <Link to="/customer/book">
          <Button icon={Plus} size="sm">
            Book New Repair
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : repairs.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <Laptop className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-[#111827] mb-1">No repair tickets on record</h3>
          <p className="text-xs max-w-sm mx-auto mb-6">
            When you schedule a laptop repair, PC upgrade, or diagnostics, your ticket history will appear here.
          </p>
          <Link to="/customer/book">
            <Button size="sm">Schedule a Repair</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {repairs.map((repair) => {
            const canCancel = ['Booking Received', 'Device Received'].includes(repair.status);

            return (
              <Card key={repair._id} className="p-5 sm:p-6 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0 border border-indigo-100">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-bold text-[#4F46E5]">
                          {repair.ticketId}
                        </span>
                        <Badge status={repair.status} />
                      </div>
                      <p className="text-xs text-[#111827] font-semibold mt-0.5">
                        {repair.device?.brand} {repair.device?.model} ({repair.device?.deviceType})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/track?ticketId=${repair.ticketId}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Track Live
                      </Button>
                    </Link>
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelClick(repair)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                  <div>
                    <span className="text-[#64748B] block mb-0.5 font-medium">Reported Issue:</span>
                    <span className="text-[#111827] font-semibold">{repair.problem?.category}</span>
                    <p className="text-[11px] text-[#475569] mt-0.5 line-clamp-1">
                      {repair.problem?.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#64748B] block mb-0.5 font-medium">Appointment:</span>
                    <span className="text-[#111827] font-semibold">
                      {new Date(repair.appointment?.date).toLocaleDateString('en-IN')}
                    </span>
                    <p className="text-[11px] text-[#475569] mt-0.5">{repair.appointment?.timeSlot}</p>
                  </div>

                  <div>
                    <span className="text-[#64748B] block mb-0.5 font-medium">Assigned Technician:</span>
                    <span className="text-[#4F46E5] font-semibold">
                      {repair.assignedTechnician ? repair.assignedTechnician.name : 'Workshop Queue'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title={`Cancel Repair Ticket: ${selectedTicket?.ticketId}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Are you sure you want to cancel this booking? This action will release your reserved appointment slot.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              placeholder="e.g. Schedule conflict, device resolved..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Booking
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isCancelling}
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
