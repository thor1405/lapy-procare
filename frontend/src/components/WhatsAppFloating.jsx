import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Laptop, Smartphone, Gamepad2, Home, PhoneCall } from 'lucide-react';

export const WhatsAppFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const primaryWhatsApp = '919606668315';
  const secondaryPhone = '+917666104889';

  const sendWhatsApp = (customText) => {
    const encoded = encodeURIComponent(customText);
    window.open(`https://wa.me/${primaryWhatsApp}?text=${encoded}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {/* Quick Action Popup Modal */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white border border-[#E2E8F0] rounded-2xl shadow-premium p-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#111827]">Lapy Procare Support</h4>
                <p className="text-[11px] text-teal-600 font-medium">● Online in Mangaluru • Home Service</p>
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
            Tech problems? We've got you covered. How can our certified engineers assist you today?
          </p>

          <div className="space-y-2">
            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I would like to book a Laptop or Computer repair service.')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-medium">Computer & Laptop Repair</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I need repair service for my Mobile / Smartphone (iPhone / Android).')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-medium">Mobile & Smartphone Service</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I want to book Gaming Console service (PS5 / PS4 / Xbox / Nintendo Switch).')
              }
              className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 text-xs text-[#111827] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                <span className="font-medium">Console Repair (PS5 / Xbox / Switch)</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={() =>
                sendWhatsApp('Hi Lapy Procare, I would like to request Home / Doorstep service at my address in Mangaluru.')
              }
              className="w-full text-left p-2.5 rounded-xl bg-teal-50/60 hover:bg-teal-100/50 border border-teal-200 text-xs text-teal-900 flex items-center justify-between transition-colors font-semibold"
            >
              <div className="flex items-center gap-2">
                <Home className="w-3.5 h-3.5 text-teal-600" />
                <span>Home Service (Doorstep Repair)</span>
              </div>
              <ChevronRight className="w-3 h-3 text-teal-500" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1 font-mono">
              <PhoneCall className="w-3 h-3 text-indigo-600" /> +91 7666104889
            </span>
            <span className="font-semibold text-teal-700">WA: +91 9606668315</span>
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
