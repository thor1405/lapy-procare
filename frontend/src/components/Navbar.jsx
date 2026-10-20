import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from './Button';
import {
  Menu,
  X,
  Cpu,
  Wrench,
  Search,
  User,
  LogOut,
  Laptop,
  ArrowRight,
} from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Track Repair', path: '/track' },
    { name: 'Custom PC Builds', path: '/pc-builder' },
    { name: 'Contact', path: '/contact' },
  ];

  const getPortalLink = () => {
    if (!user) return '/customer';
    if (user.role === 'ADMIN') return '/admin';
    return '/customer';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-md transition-all shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Wordmark */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-[#111827] flex items-center gap-1.5 font-['Sora']">
              LAPY <span className="text-[#4F46E5]">PROCARE</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase block text-[#64748B] font-medium">
              Vamanjoor • Mangaluru
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#4F46E5] bg-indigo-50 font-semibold'
                    : 'text-[#475569] hover:text-[#111827] hover:bg-slate-100/70'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to={getPortalLink()}>
                <Button variant="secondary" size="sm" icon={User}>
                  {user?.role === 'ADMIN'
                    ? 'Admin Suite'
                    : 'Customer Portal'}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-rose-600"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/customer/book">
                <Button variant="primary" size="sm" icon={Wrench}>
                  Book a Repair
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          <Link to="/customer/book">
            <Button variant="primary" size="sm" className="px-3 py-1.5 text-xs">
              Book
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden border-b border-[#E2E8F0] bg-white px-4 pt-3 pb-6 space-y-1.5 animate-in slide-in-from-top-4 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 hover:text-[#4F46E5]"
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={getPortalLink()}
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-indigo-50 text-[#4F46E5] font-semibold text-sm border border-indigo-100"
                >
                  Go to {user?.role === 'ADMIN' ? 'Admin Suite' : 'Customer Portal'}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2 text-rose-600 text-sm font-medium"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-slate-50 text-slate-700 text-sm font-medium border border-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-center py-2.5 rounded-xl bg-[#4F46E5] text-white text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
