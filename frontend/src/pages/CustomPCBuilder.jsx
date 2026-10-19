import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { toast } from 'sonner';
import {
  Cpu,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Send,
  Save,
  RotateCcw,
} from 'lucide-react';

const CATEGORIES = [
  'Processor',
  'Motherboard',
  'RAM',
  'Graphics Card',
  'Storage',
  'Power Supply',
  'Cabinet',
  'Cooling',
];

const USE_CASES = [
  'Gaming',
  'Office',
  'Video Editing',
  'Programming',
  'Graphic Design',
  'Workstation',
];

export const CustomPCBuilder = () => {
  const { isAuthenticated } = useAuthStore();
  const [componentsList, setComponentsList] = useState([]);
  const [useCase, setUseCase] = useState('Gaming');
  const [selectedComponents, setSelectedComponents] = useState({});
  const [validationResult, setValidationResult] = useState({
    isCompatible: true,
    issues: [],
    totalPrice: 0,
    estimatedWattage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch PC Components catalog from MongoDB
  useEffect(() => {
    api
      .get('/pc-builder/components')
      .then((res) => {
        if (res.data?.data?.components) {
          setComponentsList(res.data.data.components);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Compute live compatibility whenever components change
  useEffect(() => {
    const ids = Object.values(selectedComponents).filter(Boolean);
    if (ids.length === 0) {
      setValidationResult({
        isCompatible: true,
        issues: [],
        totalPrice: 0,
        estimatedWattage: 0,
      });
      return;
    }

    api
      .post('/pc-builder/calculate', { components: selectedComponents })
      .then((res) => {
        if (res.data?.data) {
          setValidationResult(res.data.data);
        }
      })
      .catch(() => {});
  }, [selectedComponents]);

  const handleSelectComponent = (category, compId) => {
    setSelectedComponents((prev) => ({
      ...prev,
      [category]: compId === prev[category] ? null : compId,
    }));
  };

  const handleReset = () => {
    setSelectedComponents({});
  };

  const handleSaveBuild = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save your PC build configuration');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/pc-builder/save', {
        buildName: `${useCase} Rig Setup`,
        useCase,
        components: selectedComponents,
      });
      toast.success('Custom PC configuration saved to your portal!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save build');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestQuote = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a quote request');
      return;
    }

    const compCount = Object.values(selectedComponents).filter(Boolean).length;
    if (compCount < 3) {
      toast.error('Please select at least a Processor, Motherboard, and RAM to request a quote');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/pc-builder/save', {
        buildName: `${useCase} Workstation Quote Request`,
        useCase,
        components: selectedComponents,
      });

      const buildId = res.data?.data?.build?._id;
      if (buildId) {
        await api.post(`/pc-builder/${buildId}/request-quote`);
      }

      toast.success('Quotation request submitted to Lapy Procare hardware engineers!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <Badge status="Ready for Collection" className="bg-teal-50 text-teal-700 border-teal-200">
          Hardware Configurator
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] font-['Sora']">
          Interactive Custom PC Builder
        </h1>
        <p className="text-[#64748B] text-sm sm:text-base">
          Configure a custom rig with live socket matching, RAM DDR standard verification, and automated wattage calculations.
        </p>
      </div>

      {/* Use Case Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {USE_CASES.map((uc) => (
          <button
            key={uc}
            onClick={() => setUseCase(uc)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              useCase === uc
                ? 'bg-[#4F46E5] text-white shadow-sm'
                : 'bg-white text-[#475569] hover:text-[#111827] border border-[#E2E8F0]'
            }`}
          >
            {uc}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Columns: Component Selection Categories */}
        <div className="lg:col-span-8 space-y-6">
          {CATEGORIES.map((category) => {
            const categoryComps = componentsList.filter((c) => c.category === category);
            const currentSelectedId = selectedComponents[category];

            return (
              <Card key={category} className="p-5 sm:p-6 border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>{category}</span>
                  </h3>
                  <span className="text-xs text-[#64748B]">
                    {currentSelectedId ? (
                      <span className="text-teal-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      'Choose 1 component'
                    )}
                  </span>
                </div>

                {categoryComps.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No parts available in this category currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categoryComps.map((comp) => {
                      const isSelected = currentSelectedId === comp._id;
                      return (
                        <div
                          key={comp._id}
                          onClick={() => handleSelectComponent(category, comp._id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400 shadow-sm'
                              : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h4 className="text-xs font-semibold text-[#111827] leading-tight">
                              {comp.name}
                            </h4>
                            <span className="text-xs font-bold text-indigo-600 shrink-0">
                              ₹{comp.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 text-[10px] text-[#64748B] mt-2">
                            {comp.specifications?.socket && (
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                                Socket: {comp.specifications.socket}
                              </span>
                            )}
                            {comp.specifications?.memoryType && (
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                                {comp.specifications.memoryType}
                              </span>
                            )}
                            {comp.specifications?.wattage > 0 && (
                              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-mono">
                                {comp.specifications.wattage}W
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right Sticky Column: Build Summary & Compatibility Feedback */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <Card className="p-6 border-[#E2E8F0] bg-white shadow-card">
            <h3 className="text-base font-bold text-[#111827] mb-4 pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <span>Build Summary</span>
              <button
                onClick={handleReset}
                title="Reset Build"
                className="text-xs text-[#64748B] hover:text-rose-600 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </h3>

            {/* Compatibility Telemetry Banner */}
            <div className="mb-5">
              {validationResult.issues?.length > 0 ? (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-700">
                  <div className="flex items-center gap-2 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Compatibility Issues Detected</span>
                  </div>
                  {validationResult.issues.map((issue, idx) => (
                    <p key={idx} className="text-[11px] leading-relaxed">
                      • {issue}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
                  <span>All selected components are 100% hardware compatible!</span>
                </div>
              )}
            </div>

            {/* Estimated Power & Price */}
            <div className="space-y-3 pb-5 border-b border-[#E2E8F0] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Target Workload:</span>
                <span className="text-[#111827] font-semibold">{useCase}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#64748B]">Estimated Peak Draw:</span>
                <span className="text-indigo-600 font-mono font-bold">
                  ~{validationResult.estimatedWattage} Watts
                </span>
              </div>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-100">
                <span className="text-[#111827] font-semibold">Estimated Total:</span>
                <span className="text-xl font-extrabold text-[#111827] font-mono">
                  ₹{validationResult.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 space-y-2.5">
              <Button
                onClick={handleRequestQuote}
                isLoading={isSubmitting}
                size="md"
                className="w-full"
                icon={Send}
              >
                Request Official Quote
              </Button>
              <Button
                onClick={handleSaveBuild}
                isLoading={isSubmitting}
                variant="secondary"
                size="md"
                className="w-full"
                icon={Save}
              >
                Save Build to My Account
              </Button>
            </div>

            <p className="text-[11px] text-[#64748B] text-center mt-4">
              Assembly and 24-hr stress testing included on all full rig orders at Lapy Procare Vamanjoor.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
