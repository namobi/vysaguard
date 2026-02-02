import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-900 text-white p-1 rounded-md">
                    <ShieldCheck size={16} strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-slate-900">VysaGuard</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Replacing confusion with clarity for global citizens. The trusted source for immigration intelligence.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900">Visa Requirements</a></li>
              <li><a href="#" className="hover:text-slate-900">Find Experts</a></li>
              <li><a href="#" className="hover:text-slate-900">Track Application</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900">About Us</a></li>
              <li><a href="#" className="hover:text-slate-900">Data Methodology</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-slate-900">Provider Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} VysaGuard Inc. All rights reserved.</p>
          <p>Not affiliated with any government agency. Information provided for guidance only.</p>
        </div>
      </div>
    </footer>
  );
};