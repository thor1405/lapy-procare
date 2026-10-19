import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { Users } from 'lucide-react';

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
          <div className="overflow-x-auto">
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
        )}
      </Card>
    </div>
  );
};
