import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-zen-line p-5 ${className}`}>
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = 
({ children, className = '', variant = 'primary', ...props }) => {
  const baseStyle = "w-full py-3 rounded-xl font-medium tracking-wide text-sm transition-all active:scale-[0.98]";
  const variants = {
    primary: "bg-zen-text text-zen-bg hover:bg-black",
    secondary: "bg-zen-surface text-zen-text border border-zen-line hover:bg-zen-line",
    danger: "bg-zen-warn/20 text-zen-alert border border-zen-warn/30",
  };
  
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs text-zen-subtext mb-1.5 tracking-wide">{label}</label>}
    <input 
      className={`w-full bg-zen-surface rounded-lg px-4 py-3 text-zen-text outline-none focus:ring-1 focus:ring-zen-subtext/20 transition-all ${className}`}
      {...props}
    />
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-[#7A9A8A]/10 text-[#7A9A8A]',
    red: 'bg-[#B87D7B]/10 text-[#B87D7B]',
    gray: 'bg-zen-subtext/10 text-zen-subtext',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};
