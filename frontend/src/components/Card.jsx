import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  const hoverClasses = hoverEffect
    ? 'hover:border-slate-300 hover:shadow-card-hover transition-all duration-300'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-card ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
