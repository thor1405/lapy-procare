import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import { Users2, Plus, Phone, Award } from 'lucide-react';

export const AdminTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [techProfiles, setTechProfiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTech, setNewTech] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: 'Chip-Level Motherboard Repair, Display Overhaul',
    experienceYears: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTechnicians = () => {
    setIsLoading(true);
    api
      .get('/admin/technicians')
      .then((res) => {
        setTechnicians(res.data?.data?.technicians || []);
        setTechProfiles(res.data?.data?.techProfiles || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleCreateTechnician = async (e) => {
    e.preventDefault();
    if (!newTech.name || !newTech.email || !newTech.phone || !newTech.password) {
      toast.error('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/admin/technicians', newTech);
      toast.success('Technician account created successfully!');
      setAddModalOpen(false);
      fetchTechnicians();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create technician account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
            Technician & Field Engineer Staff
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage certified repair specialists, specializations, and active workbench assignments.
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} icon={Plus} size="sm">
          Add New Technician
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <Users2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-[#111827]">No technician accounts on file</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {technicians.map((tech) => {
            const profile = techProfiles.find((p) => p.user?._id === tech._id);
            return (
              <Card key={tech._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#111827]">{tech.name}</h3>
                    <p className="text-xs text-[#4F46E5] font-mono mt-0.5">{tech.email}</p>
                  </div>
                  <Badge status="TECHNICIAN" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-[#E2E8F0]">
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Phone className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span>{tech.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#475569]">
                    <Award className="w-3.5 h-3.5 text-teal-600" />
                    <span>{profile?.experienceYears || 3}+ Years Experience</span>
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="text-[#64748B] block mb-1 font-medium">Specializations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.specialization?.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[#4F46E5] border border-indigo-100 text-[11px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Technician Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create Technician Account">
        <form onSubmit={handleCreateTechnician} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Full Name *</label>
            <input
              type="text"
              value={newTech.name}
              onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
              placeholder="e.g. Ramesh Bhat"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Email Address *</label>
              <input
                type="email"
                value={newTech.email}
                onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                placeholder="tech@lapyprocare.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Phone Number *</label>
              <input
                type="tel"
                value={newTech.phone}
                onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
                placeholder="+91 98450 XXXXX"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Account Password *</label>
            <input
              type="password"
              value={newTech.password}
              onChange={(e) => setNewTech({ ...newTech, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Specializations (comma separated)</label>
            <input
              type="text"
              value={newTech.specialization}
              onChange={(e) => setNewTech({ ...newTech, specialization: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Create Technician
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
