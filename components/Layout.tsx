import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, ClipboardCheck, BookOpen, Calculator } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dash' },
    { path: '/holdings', icon: Wallet, label: 'Asset' },
    { path: '/checklist', icon: ClipboardCheck, label: 'SOP' },
    { path: '/risk', icon: Calculator, label: 'Risk' },
    { path: '/journal', icon: BookOpen, label: 'Log' },
  ];

  return (
    <div className="min-h-screen bg-zen-bg text-zen-text pb-24">
      <main className="max-w-md mx-auto min-h-screen relative">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zen-bg/90 backdrop-blur-md border-t border-zen-line pb-safe pt-2 px-6 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center space-y-1 w-12 transition-colors duration-300
                ${isActive ? 'text-zen-text' : 'text-zen-subtext/50'}
              `}
            >
              <Icon size={22} strokeWidth={1.5} />
              <span className="text-[10px] tracking-wide font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
