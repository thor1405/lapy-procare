import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { Users, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/customers')
      .then((res) => {
        setCustomers(res.data?.data?.customers || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Registered customer accounts, contact numbers, and verified service addresses.
        </p>
      </div>

      <Card className="p-0 bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-[#111827]">No customer accounts registered yet</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards (< md) */}
            <div className="md:hidden divide-y divide-[#E2E8F0]">
              {customers.map((c) => (
                <div key={c._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#111827]">{c.name}</h4>
                    <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4F46E5]" />
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#475569]">
                      <Mail className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                      <a href={`mailto:${c.email}`} className="text-[#4F46E5] hover:underline font-mono truncate">
                        {c.email}
                      </a>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2 text-[#475569]">
                        <Phone className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <a href={`tel:${c.phone}`} className="hover:underline font-mono font-semibold text-[#111827]">
                          {c.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-[#64748B]">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c.address?.street ? `${c.address.street}, ` : ''}{c.address?.city || 'Mangaluru'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer Name</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Phone Number</th>
                    <th className="py-3 px-4 font-semibold">Location</th>
                    <th className="py-3 px-4 font-semibold">Registered On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-[#111827] font-bold">{c.name}</td>
                      <td className="py-3.5 px-4 font-mono text-[#4F46E5] font-semibold">{c.email}</td>
                      <td className="py-3.5 px-4 font-mono text-[#475569]">{c.phone}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {c.address?.street ? `${c.address.street}, ` : ''}{c.address?.city || 'Mangaluru'}
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
