import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { ArrowLeft, Cpu } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center text-center px-4 py-16">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-[#4F46E5] mx-auto flex items-center justify-center border border-indigo-100 shadow-sm">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-6xl font-extrabold text-[#111827] font-mono tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-[#111827]">Page Not Found</h2>
        <p className="text-xs text-[#64748B]">
          The requested system node or repair portal page could not be located.
        </p>
        <Link to="/">
          <Button icon={ArrowLeft} size="sm">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
