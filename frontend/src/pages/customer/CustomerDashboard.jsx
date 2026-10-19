import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import { useAuthStore } from '../../store/authStore';
import api from '../../api/client';
import {
  Laptop,
  Clock,
  CheckCircle2,
  FileText,
  CreditCard,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const [repairs, setRepairs] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/my?limit=5'),
      api.get('/quotations/my'),
      api.get('/invoices/my'),
    ])
      .then(([bookingsRes, quotesRes, invoicesRes]) => {
        setRepairs(bookingsRes.data?.data?.bookings || []);
        setQuotations(quotesRes.data?.data?.quotations || []);
        setInvoices(invoicesRes.data?.data?.invoices || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeRepairs = repairs.filter(
    (r) => !['Completed', 'Cancelled'].includes(r.status)
  );
  const pendingQuotations = quotations.filter((q) => q.status === 'Pending');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Welcome, {user?.name?.split(' ')[0] || 'Customer'}!
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your computer repair appointments, active tickets, and tax invoices.
          </p>
        </div>
        <Link to="/customer/book">
          <Button icon={Plus} size="sm">
            Book New Repair
          </Button>
        </Link>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#64748B] font-semibold">Active Repairs</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center border border-indigo-100">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#111827] font-mono">{activeRepairs.length}</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#64748B] font-semibold">Pending Estimates</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#111827] font-mono">{pendingQuotations.length}</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#64748B] font-semibold">Total Invoices</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center border border-blue-200">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#111827] font-mono">{invoices.length}</p>
        </Card>

        <Card className="p-5 bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#64748B] font-semibold">Completed Jobs</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center border border-teal-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-[#111827] font-mono">
            {repairs.filter((r) => r.status === 'Completed').length}
          </p>
        </Card>
      </div>

      {/* Pending Quotations Attention Card */}
      {pendingQuotations.length > 0 && (
        <Card className="p-5 border border-amber-200 bg-amber-50/70 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#111827]">
                  You have {pendingQuotations.length} repair quotation(s) awaiting approval
                </h4>
                <p className="text-xs text-[#475569]">
                  Review diagnosis and parts breakdown so our technicians can proceed with service.
                </p>
              </div>
            </div>
            <Link to="/customer/quotations">
              <Button size="sm" variant="outline" className="text-xs bg-white text-[#111827] border-amber-300 hover:bg-amber-100/50">
                Review Estimates
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Recent Repairs Table */}
      <Card className="p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4F46E5]" />
            <span>Recent Repair Bookings</span>
          </h3>
          <Link to="/customer/repairs" className="text-xs text-[#4F46E5] font-semibold hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : repairs.length === 0 ? (
          <div className="text-center py-10 text-[#64748B]">
            <Laptop className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No repair bookings yet</p>
            <p className="text-xs mt-1 mb-4">Book your first repair or upgrade with Lapy Procare.</p>
            <Link to="/customer/book">
              <Button size="sm">Book a Repair</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                  <th className="pb-3 font-semibold">Ticket ID</th>
                  <th className="pb-3 font-semibold">Device</th>
                  <th className="pb-3 font-semibold">Problem</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Appointment</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {repairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-mono font-bold text-[#4F46E5]">
                      {repair.ticketId}
                    </td>
                    <td className="py-3 text-[#111827] font-semibold">
                      {repair.device?.brand} {repair.device?.model}
                    </td>
                    <td className="py-3 text-[#475569] max-w-xs truncate">
                      {repair.problem?.category}
                    </td>
                    <td className="py-3">
                      <Badge status={repair.status} />
                    </td>
                    <td className="py-3 text-[#64748B]">
                      {new Date(repair.appointment?.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/track?ticketId=${repair.ticketId}`}>
                        <Button variant="ghost" size="sm" className="text-xs text-[#4F46E5] hover:bg-indigo-50 font-semibold">
                          Track Live
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
