"use client";

import React, { useState } from 'react';
import { ShieldCheck, LogOut, Menu, X } from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  userType: 'Applicant' | 'Agency' | 'Verified Agent';
  userName: string;
  sidebarItems: SidebarItem[];
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userType,
  userName,
  sidebarItems,
  children,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarItemClick = (onClick?: () => void) => {
    if (onClick) onClick();
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 ml-2">
          <div className="bg-primary text-white p-1 rounded-md">
            <ShieldCheck size={14} strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900">VysaGuard</span>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-50
        lg:z-10
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <div className="lg:hidden absolute top-4 right-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-1 rounded-md">
                <ShieldCheck size={16} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">VysaGuard</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item, idx) => (
            <button
              key={idx}
              disabled={item.disabled}
              onClick={() => handleSidebarItemClick(item.onClick)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.disabled
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : item.active
                    ? 'bg-primary text-white shadow-sm cursor-pointer'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer'
              }`}
            >
              {item.active ? React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "text-white" }) : item.icon}
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {userName.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userType}</p>
            </div>
          </div>
          <button
            onClick={() => {
              onLogout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};