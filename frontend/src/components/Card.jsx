import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  onClick,
  ...props
}) => {
  const hoverClasses = hoverEffect
    ? 'hover:border-slate-300/80 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-out'
    : 'transition-all duration-300';

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
