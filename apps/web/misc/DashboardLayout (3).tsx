import React from 'react';
import { ShieldCheck, LogOut } from 'lucide-react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

interface DashboardLayoutProps {
  userType: string;
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
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
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
              onClick={item.onClick}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                item.disabled
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : item.active 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
            {children}
        </div>
      </main>
    </div>
  );
};