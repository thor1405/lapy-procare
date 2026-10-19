import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Skeleton } from '../../components/Skeleton';
import api from '../../api/client';
import { toast } from 'sonner';
import {
  Wrench,
  Clock,
  FileEdit,
  ClipboardCheck,
} from 'lucide-react';

const TECH_STAGES = [
  'Device Received',
  'Diagnosis in Progress',
  'Repair in Progress',
  'Testing & Quality Check',
  'Ready for Collection',
];

export const TechnicianDashboard = () => {
  const [repairs, setRepairs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Stage update modal
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [stage, setStage] = useState('');
  const [techNote, setTechNote] = useState('');

  // Diagnostic findings modal
  const [findingsModalOpen, setFindingsModalOpen] = useState(false);
  const [findingsText, setFindingsText] = useState('');
  const [priority, setPriority] = useState('Normal');

  // Completion modal
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionNote, setCompletionNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRepairs = () => {
    setIsLoading(true);
    api
      .get('/technician/repairs')
      .then((res) => {
        setRepairs(res.data?.data?.repairs || []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleUpdateStage = async () => {
    if (!stage) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/technician/repairs/${selectedRepair.ticketId}/status`, {
        status: stage,
        note: techNote,
      });
      toast.success(`Repair stage updated to ${stage}`);
      setStageModalOpen(false);
      fetchRepairs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveFindings = async () => {
    if (!findingsText.trim()) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/technician/repairs/${selectedRepair.ticketId}/findings`, {
        diagnosticFindings: findingsText,
        priority,
      });
      toast.success('Diagnostic report updated');
      setFindingsModalOpen(false);
      fetchRepairs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update findings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCompletion = async () => {
    setIsSubmitting(true);
    try {
      await api.post(`/technician/repairs/${selectedRepair.ticketId}/complete`, {
        completionNotes: completionNote,
      });
      toast.success('Device marked as Ready for Collection!');
      setCompletionModalOpen(false);
      fetchRepairs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Field Engineer Workbench
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Assigned repair tickets, diagnostic logs, and quality check sign-off.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : repairs.length === 0 ? (
        <Card className="text-center py-16 text-[#64748B] bg-white border border-[#E2E8F0]">
          <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-[#111827] mb-1">No repair jobs currently assigned</h3>
          <p className="text-xs max-w-sm mx-auto">
            When new repair tickets are assigned to you by the administrator, they will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {repairs.map((r) => (
            <Card key={r._id} className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-[#4F46E5]">
                      {r.ticketId}
                    </span>
                    <Badge status={r.status} />
                    <span className="text-xs text-amber-700 font-semibold px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                      Priority: {r.priority || 'Normal'}
                    </span>
                  </div>
                  <p className="text-xs text-[#111827] font-semibold mt-1">
                    {r.device?.brand} {r.device?.model} • Customer: {r.customer?.name} ({r.customer?.phone})
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRepair(r);
                      setFindingsText(r.diagnosticFindings || '');
                      setPriority(r.priority || 'Normal');
                      setFindingsModalOpen(true);
                    }}
                    icon={FileEdit}
                    className="text-xs"
                  >
                    Findings
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedRepair(r);
                      setStage(r.status);
                      setTechNote('');
                      setStageModalOpen(true);
                    }}
                    icon={Clock}
                    className="text-xs"
                  >
                    Progress Stage
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRepair(r);
                      setCompletionNote('');
                      setCompletionModalOpen(true);
                    }}
                    icon={ClipboardCheck}
                    className="text-xs"
                  >
                    Sign Off
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[#64748B] block mb-1 font-medium">Customer Issue Description:</span>
                  <p className="text-[#334155]">{r.problem?.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[#64748B] block mb-1 font-medium">Engineer Diagnostic Findings:</span>
                  <p className="text-[#4F46E5] font-medium">
                    {r.diagnosticFindings || 'Pending physical examination on workbench...'}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Progress Stage Modal */}
      <Modal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        title={`Progress Stage: ${selectedRepair?.ticketId}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Workbench Stage *
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              {TECH_STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Technician Note (Visible to Customer)
            </label>
            <textarea
              value={techNote}
              onChange={(e) => setTechNote(e.target.value)}
              rows={3}
              placeholder="e.g. Ultrasonic cleaning complete; replacing logic board capacitors..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setStageModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} onClick={handleUpdateStage}>
              Update Stage
            </Button>
          </div>
        </div>
      </Modal>

      {/* Diagnostic Findings Modal */}
      <Modal
        isOpen={findingsModalOpen}
        onClose={() => setFindingsModalOpen(false)}
        title={`Diagnostic Findings: ${selectedRepair?.ticketId}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-[#111827] focus:outline-none focus:border-indigo-500"
            >
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent / Express</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Detailed Findings & Component Failures *
            </label>
            <textarea
              value={findingsText}
              onChange={(e) => setFindingsText(e.target.value)}
              rows={5}
              placeholder="Record multimeter readings, shorted rails, capacitor values, LCD cable condition..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setFindingsModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} onClick={handleSaveFindings}>
              Save Findings
            </Button>
          </div>
        </div>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        title={`Quality Check Sign-Off: ${selectedRepair?.ticketId}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#475569]">
            Confirm that all diagnostic tests, thermal paste burn-in, and hardware stress runs passed.
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1.5">
              Handover Quality Report
            </label>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              rows={3}
              placeholder="e.g. All stress tests passed. Memtest verified 0 errors. Thermal peak 65C. Ready for handover."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" onClick={() => setCompletionModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" isLoading={isSubmitting} onClick={handleSubmitCompletion}>
              Mark Ready for Collection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
