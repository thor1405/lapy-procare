import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Laptop, Wrench, ShieldCheck } from 'lucide-react';

export const WhatsAppFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '917666104889';

  const sendWhatsApp = (customText) => {
    const encoded = encodeURIComponent(customText);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick Action Popup Modal */}
      {isOpen && (
        <div className="mb-4 w-72 sm:w-80 bg-white border border-[#E2E8F0] rounded-2xl shadow-premium p-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">Lapy Procare Support</h4>
                <p className="text-[11px] text-teal-600 font-medium">● Online in Mangaluru</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#64748B] my-3">
            Hello! How can our computer repair engineers help you today?
          </p>

          <div className="space-y-2">
            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I would like to book a laptop or PC repair appointment.')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                <span>Book a Repair Service</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I want to inquire about custom PC building and components.')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                <span>Custom PC Build Quote</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I need help checking the live status of my repair ticket.')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Track Existing Ticket</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="WhatsApp Chat Support"
        className="flex items-center gap-2 px-4 py-3 bg-[#14B8A6] hover:bg-[#0D9488] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium text-sm hover:scale-105 active:scale-95"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="hidden sm:inline font-semibold">WhatsApp Us</span>
      </button>
    </div>
  );
};
