import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Wrench,
  Laptop,
  FileText,
  CreditCard,
  User,
  LogOut,
  ArrowLeft,
  Cpu,
} from 'lucide-react';
import { Toaster } from 'sonner';

export const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'Book a Repair', path: '/customer/book', icon: Wrench },
    { name: 'My Repairs', path: '/customer/repairs', icon: Laptop },
    { name: 'Quotations', path: '/customer/quotations', icon: FileText },
    { name: 'Invoices', path: '/customer/invoices', icon: CreditCard },
    { name: 'Profile Settings', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#111827] font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between hidden md:flex shrink-0 shadow-sm">
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-[#E2E8F0]">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-[#111827] font-['Sora']">
                LAPY <span className="text-[#4F46E5]">PORTAL</span>
              </span>
            </Link>
          </div>

          {/* User Info Capsule */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] bg-slate-50/80">
            <p className="text-[11px] text-[#64748B] uppercase tracking-wider font-semibold">Signed In As</p>
            <p className="text-sm font-semibold text-[#111827] truncate mt-0.5">{user?.name || 'Customer'}</p>
            <p className="text-xs text-[#4F46E5] truncate font-medium">{user?.email}</p>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/customer'
                  ? location.pathname === '/customer'
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
            <span>Back to Public Website</span>
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
        <header className="md:hidden border-b border-[#E2E8F0] bg-white p-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#4F46E5]" />
            <span className="font-bold text-sm text-[#111827]">LAPY PORTAL</span>
          </Link>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/customer/book" className="text-[#4F46E5] font-semibold">
              Book Repair
            </Link>
            <Link to="/customer/repairs" className="text-[#475569]">
              My Repairs
            </Link>
            <button onClick={handleLogout} className="text-rose-600 font-medium">
              Logout
            </button>
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
