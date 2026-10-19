import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import api from '../../api/client';
import { toast } from 'sonner';
import { Settings, Save, Clock } from 'lucide-react';

export const AdminSettings = () => {
  const [settings, setSettings] = useState({
    businessName: 'Lapy Procare',
    email: 'lapyprocare@gmail.com',
    phone: '+91 7666104889',
    whatsapp: '+91 7666104889',
    address: 'Near St. Joseph Engineering College, Vamanjoor, Mangaluru, Karnataka – 575028, India',
    workingHours: {
      weekday: '09:00 AM - 08:00 PM',
      saturday: '09:30 AM - 07:00 PM',
      sunday: '10:00 AM - 02:00 PM',
    },
    isDoorstepServiceEnabled: true,
    isAIAssistantEnabled: true,
    standardGSTPercentage: 18,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => {
        if (res.data?.data?.settings) {
          setSettings(res.data.data.settings);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.patch('/admin/settings', settings);
      toast.success('Business settings updated successfully!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="pb-6 border-b border-[#E2E8F0]">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] font-['Sora'] tracking-tight">
          Business Profile & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1">
          Configure workshop business hours, doorstep service availability, and AI assistant toggles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <Clock className="w-4 h-4 text-[#4F46E5]" />
            <span>Service Center Working Hours</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Monday – Friday
              </label>
              <input
                type="text"
                value={settings.workingHours?.weekday}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    workingHours: { ...settings.workingHours, weekday: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Saturday
              </label>
              <input
                type="text"
                value={settings.workingHours?.saturday}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    workingHours: { ...settings.workingHours, saturday: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Sunday
              </label>
              <input
                type="text"
                value={settings.workingHours?.sunday}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    workingHours: { ...settings.workingHours, sunday: e.target.value },
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-[#111827] focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>
        </Card>

        {/* Feature Toggles */}
        <Card className="p-6 bg-white border border-[#E2E8F0] shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
            <Settings className="w-4 h-4 text-[#4F46E5]" />
            <span>Operational Toggles</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Enable Doorstep Service in Mangaluru</h4>
                <p className="text-[11px] text-[#64748B]">
                  Allow customers to request home/office pickup during booking wizard.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.isDoorstepServiceEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, isDoorstepServiceEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-300 text-[#4F46E5] focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Enable AI Virtual Troubleshooting Assistant</h4>
                <p className="text-[11px] text-[#64748B]">
                  Allow website visitors to use the AI symptom triage engine.
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.isAIAssistantEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, isAIAssistantEnabled: e.target.checked })
                }
                className="w-5 h-5 rounded border-slate-300 text-[#4F46E5] focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#111827]">Standard GST Tax Rate (%)</h4>
                <p className="text-[11px] text-[#64748B]">Applicable to invoices and quotations (18% standard).</p>
              </div>
              <input
                type="number"
                min="0"
                max="28"
                value={settings.standardGSTPercentage}
                onChange={(e) =>
                  setSettings({ ...settings, standardGSTPercentage: Number(e.target.value) })
                }
                className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#111827] text-right font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        <Button type="submit" size="md" isLoading={isSaving} icon={Save}>
          Save Settings
        </Button>
      </form>
    </div>
  );
};
