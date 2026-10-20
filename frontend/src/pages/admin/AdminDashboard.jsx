import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  CalendarCheck,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const COLORS = ['#4F46E5', '#3B82F6', '#14B8A6', '#8B5CF6', '#F59E0B', '#EC4899'];

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res.data?.data) {
          setData(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-2xl bg-slate-100" />
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const monthly = data?.monthlyVolume || [];
  const categories = data?.categoryDistribution || [];
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Operations & Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time business performance derived from verified database transactions.
          </p>
        </div>
        <Link to="/admin/bookings">
          <Button size="sm" icon={CalendarCheck}>
            Manage All Bookings
          </Button>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Total Customers</span>
            <Users className="w-4 h-4 text-[#4F46E5]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111827] font-mono">{metrics.totalCustomers || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Total Repair Tickets</span>
            <Wrench className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111827] font-mono">{metrics.totalRepairs || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Active in Lab</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#4F46E5] font-mono">{metrics.activeRepairs || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Pending Intake</span>
            <AlertCircle className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#111827] font-mono">{metrics.pendingBookings || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Completed Repairs</span>
            <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
          </div>
          <p className="text-2xl font-extrabold text-[#111827] font-mono">{metrics.completedRepairs || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border border-[#E2E8F0] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#64748B] font-semibold">Cancelled Tickets</span>
            <span className="text-xs text-rose-500 font-bold">X</span>
          </div>
          <p className="text-2xl font-extrabold text-slate-500 font-mono">{metrics.cancelledBookings || 0}</p>
        </Card>

        <Card className="p-4 sm:p-5 border border-emerald-200 bg-emerald-50/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-800 font-semibold">Realized Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 font-mono">
            ₹{(metrics.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 border border-amber-200 bg-amber-50/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-800 font-semibold">Outstanding Balances</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700 font-mono">
            ₹{(metrics.outstandingRevenue || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* Visual Analytics with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Repair Volume Bar Chart */}
        <Card className="lg:col-span-8 p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
            <span>Monthly Repair Volume (Recent 6 Months)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="repairs" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Donut Chart */}
        <Card className="lg:col-span-4 p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-sm">
          <h3 className="text-base font-bold text-[#111827]">Device Breakdown</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#111827',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] text-[#475569]">
            {categories.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Bookings Table */}
      <Card className="p-6 space-y-4 bg-white border border-[#E2E8F0] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <h3 className="text-base font-bold text-[#111827]">Latest Customer Service Requests</h3>
          <Link to="/admin/bookings" className="text-xs text-[#4F46E5] font-semibold hover:underline flex items-center gap-1">
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Cards View (< md) */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {recentBookings.map((b) => (
            <div key={b._id} className="py-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  to={`/admin/bookings?search=${b.ticketId}`}
                  className="font-mono text-sm font-bold text-[#4F46E5] hover:underline"
                >
                  {b.ticketId}
                </Link>
                <Badge status={b.status} />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#111827]">{b.customer?.name || 'Customer'}</span>
                <span className="text-[#64748B]">
                  {new Date(b.appointment?.date).toLocaleDateString('en-IN')}
                </span>
              </div>

              <div className="text-xs text-[#475569] bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                <span>{b.device?.brand} {b.device?.model}</span>
                <span className="text-[11px] text-[#64748B]">
                  {b.assignedTechnician ? b.assignedTechnician.name : 'Unassigned'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table (>= md) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                <th className="pb-3 font-semibold">Ticket ID</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Device</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Assigned Tech</th>
                <th className="pb-3 font-semibold">Scheduled Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {recentBookings.map((b) => (
                <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 font-mono font-bold text-[#4F46E5]">
                    <Link to={`/admin/bookings?search=${b.ticketId}`} className="hover:underline">
                      {b.ticketId}
                    </Link>
                  </td>
                  <td className="py-3 text-[#111827] font-semibold">{b.customer?.name || 'Customer'}</td>
                  <td className="py-3 text-[#475569]">
                    {b.device?.brand} {b.device?.model}
                  </td>
                  <td className="py-3">
                    <Badge status={b.status} />
                  </td>
                  <td className="py-3 text-[#64748B]">
                    {b.assignedTechnician ? b.assignedTechnician.name : 'Unassigned'}
                  </td>
                  <td className="py-3 text-[#64748B]">
                    {new Date(b.appointment?.date).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
