import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Wrench,
  Clock,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { Toaster } from 'sonner';

export const TechLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#111827] font-sans antialiased">
      <aside className="w-64 border-r border-[#E2E8F0] bg-white flex flex-col justify-between hidden md:flex shrink-0 shadow-sm">
        <div>
          <div className="p-6 border-b border-[#E2E8F0] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Wrench className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#111827] font-['Sora']">
              TECH <span className="text-[#14B8A6]">WORKSPACE</span>
            </span>
          </div>

          <div className="px-6 py-3 border-b border-[#E2E8F0] bg-teal-50/70">
            <p className="text-[11px] text-teal-700 font-semibold tracking-wider uppercase">Field Engineer</p>
            <p className="text-xs text-[#111827] font-semibold truncate mt-0.5">{user?.name || 'Technician'}</p>
          </div>

          <nav className="p-4 space-y-1.5">
            <Link
              to="/technician"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-teal-700 border border-teal-200 shadow-xs"
            >
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Assigned Repair Jobs</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-3.5 py-2 text-xs text-[#64748B] hover:text-[#111827] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
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

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden border-b border-[#E2E8F0] bg-white p-4 flex items-center justify-between">
          <span className="font-bold text-sm text-teal-700">TECH WORKSPACE</span>
          <button onClick={handleLogout} className="text-xs text-rose-600 font-medium">Logout</button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
};
