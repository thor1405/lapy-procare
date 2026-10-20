import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  Receipt,
  Boxes,
  Contact,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react';
import { Toaster } from 'sonner';

export const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      {/* Desktop Sidebar */}
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
              <p className="text-[11px] text-[#4F46E5] font-semibold tracking-wider uppercase">Lead Tech & Admin</p>
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
                      ? 'bg-indigo-50 text-[#4F46E5] font-semibold border border-indigo-200/80 shadow-xs'
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
        {/* Mobile Top Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md px-4 py-3 flex items-center justify-between shadow-xs">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F46E5] to-[#14B8A6] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-[#111827] font-['Sora']">
              ADMIN <span className="text-[#4F46E5]">SUITE</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer / Sheet */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-b border-[#E2E8F0] bg-white px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-3 z-30">
            {/* Superuser Tag */}
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#4F46E5] font-bold uppercase tracking-wider">Lead Tech & Admin</p>
                <p className="text-xs font-bold text-[#111827] truncate mt-0.5">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Nav Items */}
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#4F46E5] text-white shadow-sm shadow-indigo-100'
                        : 'text-[#475569] hover:bg-slate-50 hover:text-[#111827]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-[#64748B] hover:text-[#111827] font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Public Site</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 text-rose-600 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
};
