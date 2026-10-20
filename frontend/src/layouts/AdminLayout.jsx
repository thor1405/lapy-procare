import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  Receipt,
  Boxes,
  Users2,
  Contact,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { Toaster } from 'sonner';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Analytics & KPIs', path: '/admin', icon: LayoutDashboard },
    { name: 'Repair Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Quotations', path: '/admin/quotations', icon: FileCheck2 },
    { name: 'Invoices & Billing', path: '/admin/invoices', icon: Receipt },
    { name: 'Inventory & Parts', path: '/admin/inventory', icon: Boxes },
    { name: 'Customer Directory', path: '/admin/customers', icon: Contact },
    { name: 'Website Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Business Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#111827] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between hidden lg:flex shrink-0 shadow-sm">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#111827] font-['Sora']">
                ADMIN <span className="text-[#4F46E5]">SUITE</span>
              </span>
            </Link>
          </div>

          {/* Admin Tag */}
          <div className="px-6 py-3 border-b border-[#E2E8F0] bg-indigo-50/70 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#4F46E5] font-semibold tracking-wider uppercase">System Superuser</p>
              <p className="text-xs text-[#111827] font-semibold truncate mt-0.5">{user?.name || 'Administrator'}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200/80 shadow-xs font-semibold'
                      : 'text-[#475569] hover:text-[#111827] hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#4F46E5]' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#E2E8F0] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#64748B] hover:text-[#111827] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-[#E2E8F0] bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4F46E5]" />
            <span className="font-bold text-sm text-[#111827]">ADMIN SUITE</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/admin/bookings" className="text-[#4F46E5] font-semibold">Bookings</Link>
            <Link to="/admin/invoices" className="text-[#475569]">Billing</Link>
            <button onClick={handleLogout} className="text-rose-600 font-medium">Logout</button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
};
