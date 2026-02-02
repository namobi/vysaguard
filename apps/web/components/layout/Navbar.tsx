import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface NavbarProps {
  onNavigate: (view: 'landing' | 'applicant' | 'agency') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('landing')}
          >
            <div className="bg-primary text-white p-1.5 rounded-md">
                <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-slate-900">VysaGuard</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#trust" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Verification</a>
            <button 
              onClick={() => onNavigate('agency')} 
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors focus:outline-none"
            >
              For Agencies
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
              onClick={() => onNavigate('applicant')}
            >
              Log in
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => onNavigate('applicant')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};