import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import { MessageSquare, Phone, Mail } from 'lucide-react';

export const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInquiries = () => {
    setIsLoading(true);
    api
      .get('/admin/inquiries')
      .then((res) => {
        setInquiries(res.data?.data?.inquiries || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/inquiries/${id}`, { status });
      toast.success(`Inquiry marked as ${status}`);
      fetchInquiries();
    } catch (err) {
      toast.error('Failed to update inquiry status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Website Contact Form Inquiries
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Inquiries and service queries submitted through the public website.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : inquiries.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-[#111827]">No inquiries received yet</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                    <span>{inq.name}</span>
                    <span className="text-xs text-[#4F46E5] font-semibold font-mono">• {inq.subject}</span>
                  </h3>
                  <div className="flex gap-4 text-xs text-[#64748B] mt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-[#4F46E5]" /> {inq.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#4F46E5]" /> {inq.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      inq.status === 'Resolved'
                        ? 'bg-teal-50 text-teal-700 border-teal-200'
                        : inq.status === 'Contacted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {inq.status}
                  </span>

                  <select
                    value={inq.status}
                    onChange={(e) => handleUpdateStatus(inq._id, e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#111827] p-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="New">Mark New</option>
                    <option value="Contacted">Mark Contacted</option>
                    <option value="Resolved">Mark Resolved</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-[#334155] leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                "{inq.message}"
              </p>

              <span className="text-[10px] text-[#64748B] block font-medium">
                Submitted on {new Date(inq.createdAt).toLocaleString('en-IN')}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
