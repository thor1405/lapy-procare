import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';
import { Lock, Mail, Cpu, ArrowRight } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success(`Welcome back, ${res.user.name}!`);
      if (redirectPath) {
        navigate(redirectPath);
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/customer');
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F46E5] via-[#3B82F6] to-[#14B8A6] flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl text-[#111827] font-['Sora'] tracking-tight">
              LAPY <span className="text-[#4F46E5]">PROCARE</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-[#111827] pt-2">Sign In to Your Account</h2>
          <p className="text-xs text-[#64748B]">
            Access repair tracking, quotations, GST invoices, and service history.
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#475569]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-[#4F46E5] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#111827] placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={isLoading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* Demo Credentials Quick-Fill Pill Helper */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-[#64748B] space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
            <span className="font-semibold text-[#111827] block">Quick Demo Logins:</span>
            <div className="flex flex-wrap gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@lapyprocare.com');
                  setPassword('Admin@Lapy2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-medium transition-colors"
              >
                Admin & Lead Tech
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('customer@gmail.com');
                  setPassword('Customer@123');
                }}
                className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 font-medium transition-colors"
              >
                Customer
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-[#64748B]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#4F46E5] font-semibold hover:underline">
            Register as Customer
          </Link>
        </p>
      </div>
    </div>
  );
};
