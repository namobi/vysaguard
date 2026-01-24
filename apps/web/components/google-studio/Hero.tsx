import React from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-36 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none" />
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Copy */}
          <div className="max-w-2xl">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Visa requirements.<br />Clear. Current. Verified.
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
              Official, up-to-date visa requirements with step-by-step checklists — sourced from government portals and kept current as rules change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-10">
              <div className="flex flex-col gap-2">
                  <Button size="lg" className="w-full sm:w-auto">
                    Find Requirements
                  </Button>
                  <span className="text-xs text-slate-500 pl-1">Official checklists · No signup required</span>
              </div>
              <div className="flex flex-col gap-2">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Get Help from Verified Experts
                  </Button>
                  <span className="text-xs text-slate-500 pl-1">Licensed agencies & immigration lawyers</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 border-t border-slate-100 pt-6 max-w-lg">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">✓</span>
                    <span>Government-sourced</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">✓</span>
                    <span>Versioned updates</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">✓</span>
                    <span>Scam-resistant</span>
                </div>
            </div>
          </div>

          {/* Right: Visual - Checklist Card */}
          <div className="relative hidden lg:block select-none">
            {/* Background decorative blob - neutralized */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-slate-100 to-slate-50 rounded-full blur-3xl -z-10 opacity-60"></div>

            {/* Main Card: The "Checklist" */}
            <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 max-w-[460px] mx-auto relative z-10">
                {/* Header Row */}
                <div className="flex justify-between items-center mb-5">
                    <div className="px-2.5 py-1 bg-green-50 text-success text-[10px] font-bold uppercase tracking-wider rounded border border-green-100/50">
                        Official — Active
                    </div>
                    <span className="text-xs text-slate-400 font-mono tracking-tight">Revised Jan 10, 2026</span>
                </div>

                {/* Title & Source */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-1.5">Digital Nomad Visa — Portugal</h3>
                    <p className="text-xs text-slate-500 font-medium">Published by VysaGuard · Source: SEF / AIMA</p>
                </div>

                {/* Checklist Items */}
                <div className="space-y-3">
                    {/* Item 1 - Checked */}
                    <div className="flex items-start gap-4 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
                        <div className="mt-0.5 text-slate-900">
                            <CheckCircle size={18} fill="#2E7D32" className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900 leading-none mb-1.5">Valid passport</p>
                            <p className="text-xs text-slate-500 leading-none">Minimum 6 months validity</p>
                        </div>
                    </div>

                    {/* Item 2 - Pending */}
                    <div className="flex items-start gap-4 p-3.5 rounded-lg border border-transparent hover:bg-slate-50 transition-colors">
                        <div className="mt-0.5">
                            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-300"></div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 leading-none mb-1.5">Criminal record certificate</p>
                            <p className="text-xs text-slate-500 leading-none">From country of residence</p>
                        </div>
                    </div>

                    {/* Item 3 - Pending */}
                    <div className="flex items-start gap-4 p-3.5 rounded-lg border border-transparent hover:bg-slate-50 transition-colors">
                        <div className="mt-0.5">
                            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-300"></div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 leading-none mb-1.5">Proof of income</p>
                            <p className="text-xs text-slate-500 font-mono leading-none">€3,040/month</p>
                        </div>
                    </div>

                    {/* Item 4 - Pending */}
                    <div className="flex items-start gap-4 p-3.5 rounded-lg border border-transparent hover:bg-slate-50 transition-colors">
                        <div className="mt-0.5">
                            <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-slate-300"></div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 leading-none mb-1.5">Health insurance policy</p>
                            <p className="text-xs text-slate-500 leading-none">Valid in Portugal</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                     <span>4 requirements</span>
                     <div className="flex items-center gap-1.5 text-slate-500">
                        <RefreshCw size={12} className="text-slate-400" />
                        <span>Auto-updates enabled</span>
                     </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};