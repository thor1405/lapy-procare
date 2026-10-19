import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { WhatsAppFloating } from '../components/WhatsAppFloating';
import { Toaster } from 'sonner';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#475569] font-sans selection:bg-indigo-100 selection:text-indigo-800 relative">
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[400px] bg-indigo-50/70 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-1/6 w-[500px] h-[350px] bg-teal-50/60 rounded-full blur-[130px] pointer-events-none -z-10" />

      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloating />
      <Toaster position="top-right" richColors theme="light" />
    </div>
  );
};
