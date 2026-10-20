import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { useSocket } from '../utils/useSocket';
import api from '../api/client';
import { toast } from 'sonner';
import {
  Search,
  Laptop,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Wrench,
  Check,
} from 'lucide-react';

const ALL_STAGES = [
  'Booking Received',
  'Device Received',
  'Diagnosis in Progress',
  'Awaiting Customer Approval',
  'Repair Approved',
  'Repair in Progress',
  'Testing & Quality Check',
  'Ready for Collection',
  'Completed',
];

export const Tracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTicket = searchParams.get('ticketId') || '';

  const [ticketInput, setTicketInput] = useState(initialTicket);
  const [activeTicket, setActiveTicket] = useState(initialTicket);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Socket.IO hook listening for live updates on this ticket
  useSocket(activeTicket, (liveData) => {
    toast.info(`Status Update: ${liveData.status}`, {
      description: liveData.note || 'The technician updated this repair stage.',
    });
    fetchTracking(activeTicket);
  });

  const fetchTracking = async (ticket) => {
    if (!ticket.trim()) return;
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.get(`/tracking/${ticket.trim().toUpperCase()}`);
      if (res.data?.data?.tracking) {
        setTrackingData(res.data.data.tracking);
        setActiveTicket(ticket.trim().toUpperCase());
      }
    } catch (err) {
      setTrackingData(null);
      setErrorMsg(
        err.response?.data?.message ||
          `No repair ticket found for "${ticket}". Please check your Ticket ID.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicket) {
      fetchTracking(initialTicket);
    }
  }, [initialTicket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      setSearchParams({ ticketId: ticketInput.trim().toUpperCase() });
      fetchTracking(ticketInput.trim().toUpperCase());
    }
  };

  const getCurrentStageIndex = (status) => {
    return ALL_STAGES.indexOf(status);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge status="Ready for Collection" className="bg-indigo-50 text-indigo-700 border-indigo-200">
          Live Repair Telemetry
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          Track Your Device Repair
        </h1>
        <p className="text-[#64748B] text-sm">
          Enter your unique Ticket ID (e.g., <code className="text-indigo-600 font-semibold font-mono">LPC-2026-000001</code>) to track workbench diagnostics in real time.
        </p>
      </div>

      {/* Ticket Lookup Form */}
      <Card className="max-w-2xl mx-auto p-4 sm:p-5 border-[#E2E8F0]">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              placeholder="Enter Ticket ID (e.g. LPC-2026-000001)"
              className="w-full bg-slate-50 border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-3 text-sm text-[#111827] placeholder-slate-400 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          <Button type="submit" size="md" isLoading={isLoading} icon={Search}>
            Track Progress
          </Button>
        </form>
      </Card>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-60 w-full rounded-2xl" />
        </div>
      )}

      {/* Error Message */}
      {errorMsg && !isLoading && (
        <Card className="max-w-2xl mx-auto text-center p-8 border-rose-200 bg-rose-50/50">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#111827] mb-1">Ticket Not Found</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto mb-4">{errorMsg}</p>
          <p className="text-xs text-[#64748B]">
            Need help? WhatsApp our Vamanjoor desk at{' '}
            <a href="https://wa.me/917666104889" className="text-indigo-600 font-semibold underline">
              +91 7666104889
            </a>
          </p>
        </Card>
      )}

      {/* Tracking Result View */}
      {trackingData && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Status Capsule */}
          <Card className="border-[#E2E8F0] p-6 sm:p-8 bg-gradient-to-r from-indigo-50/40 via-white to-teal-50/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
              <div>
                <span className="text-xs text-[#64748B] uppercase tracking-wider block mb-1">
                  Ticket Reference
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-mono flex items-center gap-3">
                  {trackingData.ticketId}
                </h2>
              </div>
              <Badge status={trackingData.status} className="text-sm px-4 py-1.5" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
              <div>
                <span className="text-[#64748B] block mb-0.5">Device</span>
                <span className="text-[#111827] font-semibold">
                  {trackingData.device?.brand} {trackingData.device?.model}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Reported Issue</span>
                <span className="text-[#111827] font-semibold">{trackingData.problemCategory}</span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Appointment Date</span>
                <span className="text-[#111827] font-semibold">
                  {new Date(trackingData.appointment?.date).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block mb-0.5">Est. Completion</span>
                <span className="text-indigo-600 font-semibold">
                  {trackingData.estimatedCompletionDate
                    ? new Date(trackingData.estimatedCompletionDate).toLocaleDateString('en-IN')
                    : 'Diagnosis in Progress'}
                </span>
              </div>
            </div>
          </Card>

          {/* Stepper Stage Tracker */}
          <Card className="p-6 sm:p-8 border-[#E2E8F0] shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-[#111827] mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#4F46E5]" />
              <span>Repair Lifecycle Stage</span>
            </h3>

            {trackingData.status === 'Cancelled' ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
                This repair ticket has been cancelled.
              </div>
            ) : (
              <div className="relative">
                <div className="overflow-x-auto pb-4 pt-2 -mx-2 px-2">
                  <div className="min-w-[920px] flex items-start justify-between">
                    {ALL_STAGES.map((stage, idx) => {
                      const currentIdx = getCurrentStageIndex(trackingData.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;
                      const isNextStepDone = idx < currentIdx;
                      const isNextStepCurrent = idx + 1 === currentIdx;
                      const isLast = idx === ALL_STAGES.length - 1;

                      return (
                        <React.Fragment key={stage}>
                          {/* Step Node */}
                          <div className="flex flex-col items-center text-center w-24 sm:w-28 shrink-0">
                            {/* Circle Container: Exactly 40px tall with circle centered at 20px */}
                            <div className="h-10 w-10 flex items-center justify-center">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                  isCurrent
                                    ? 'bg-[#4F46E5] text-white ring-4 ring-indigo-100 shadow-md shadow-indigo-500/20 scale-110 z-10'
                                    : isCompleted
                                    ? 'bg-teal-600 text-white z-10'
                                    : 'bg-white text-slate-400 border-2 border-slate-200 z-10'
                                }`}
                              >
                                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                              </div>
                            </div>

                            {/* Label underneath - starts strictly at fixed offset and grows downwards */}
                            <span
                              className={`text-[11px] mt-2.5 font-medium leading-snug px-1 text-center ${
                                isCurrent
                                  ? 'text-[#4F46E5] font-bold'
                                  : isCompleted
                                  ? 'text-[#111827] font-semibold'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              {stage}
                            </span>
                          </div>

                          {/* Horizontal Connector Line: Exactly 40px tall with line centered at 20px */}
                          {!isLast && (
                            <div className="flex-1 h-10 flex items-center -mx-1 shrink">
                              <div
                                className={`h-1 w-full rounded-full transition-all duration-300 ${
                                  isNextStepCurrent
                                    ? 'bg-gradient-to-r from-teal-600 to-[#4F46E5]'
                                    : isNextStepDone
                                    ? 'bg-teal-600'
                                    : 'bg-slate-200'
                                }`}
                              />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Timeline and Technician Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Real-time Status History Timeline */}
            <Card className="p-6 space-y-4 border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Status History Logs</span>
              </h3>

              <div className="space-y-4 pt-2">
                {trackingData.timeline?.map((item, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2 border-indigo-200 pb-4 last:pb-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[6px] top-1"></span>
                    <p className="text-xs font-semibold text-[#111827]">{item.status}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{item.note}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customer Visible Technician Notes */}
            <Card className="p-6 space-y-4 border-[#E2E8F0]">
              <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                <span>Engineer Notes & Instructions</span>
              </h3>

              {trackingData.customerNotes?.length === 0 ? (
                <p className="text-xs text-[#64748B] italic pt-2">
                  No public notes added yet. Our technicians will post diagnostic observations here as testing concludes.
                </p>
              ) : (
                <div className="space-y-3 pt-2">
                  {trackingData.customerNotes?.map((n, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#475569]"
                    >
                      <p className="leading-relaxed">"{n.note}"</p>
                      <span className="text-[10px] text-[#64748B] block mt-1.5 font-medium">
                        Posted on {new Date(n.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-[#E2E8F0]">
                <a
                  href={`https://wa.me/917666104889?text=Hi%20Lapy%20Procare%2C%20regarding%20my%20repair%20ticket%20${trackingData.ticketId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full"
                >
                  <Button variant="secondary" size="sm" className="w-full text-xs">
                    Message Assigned Tech on WhatsApp
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
