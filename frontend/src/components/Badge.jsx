import React from 'react';

const statusColorMap = {
  // Repair Statuses
  'Booking Received': 'bg-blue-50 text-blue-700 border-blue-200',
  'Device Received': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Diagnosis in Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Awaiting Customer Approval': 'bg-purple-50 text-purple-700 border-purple-200',
  'Repair Approved': 'bg-teal-50 text-teal-700 border-teal-200',
  'Repair in Progress': 'bg-sky-50 text-sky-700 border-sky-200',
  'Testing & Quality Check': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Ready for Collection': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed': 'bg-green-50 text-green-700 border-green-200',
  'Cancelled': 'bg-rose-50 text-rose-700 border-rose-200',

  // Payment Statuses
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Partially Paid': 'bg-amber-50 text-amber-700 border-amber-200',
  'Unpaid': 'bg-rose-50 text-rose-700 border-rose-200',
  'Refunded': 'bg-slate-100 text-slate-700 border-slate-200',

  // Quotation Statuses
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
  'Expired': 'bg-slate-100 text-slate-600 border-slate-200',

  // Roles
  'ADMIN': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'TECHNICIAN': 'bg-teal-50 text-teal-700 border-teal-200',
  'CUSTOMER': 'bg-blue-50 text-blue-700 border-blue-200',
};

export const Badge = ({ children, status, className = '' }) => {
  const colorClass = (status && statusColorMap[status]) || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {children || status}
    </span>
  );
};
