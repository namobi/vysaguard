import React from 'react';
import { Database, GitCommit, Shield } from 'lucide-react';

export const Trust: React.FC = () => {
  return (
    <section id="trust" className="py-24 bg-slate-900 text-white overflow-hidden relative">
      {/* Removed decorative blue blob */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
              Truth is our product.
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              In immigration, "almost correct" is useless. VysaGuard is built on a rigorous data pipeline that tracks consulate updates, policy shifts, and form revisions.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-primary">
                  <Database size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Official Sources Only</h4>
                  <p className="text-slate-400 text-sm mt-1">We don't scrape blogs. We monitor official government portals and legislative feeds directly.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-primary">
                  <GitCommit size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Versioned History</h4>
                  <p className="text-slate-400 text-sm mt-1">We show you when a requirement changed. If a rule was updated yesterday, you will know.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-primary">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">Provider Vetting</h4>
                  <p className="text-slate-400 text-sm mt-1">Experts listed on VysaGuard undergo identity verification and license checks. No anonymous agents.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
                <span className="text-sm font-mono text-slate-400">changelog.json</span>
                <span className="text-xs bg-green-900/20 text-success px-2 py-1 rounded border border-green-800/20">Live Sync</span>
            </div>
            <div className="space-y-4 font-mono text-sm">
                <div className="flex gap-3">
                    <span className="text-slate-500">10:42 AM</span>
                    <span className="text-accent">UPDATE</span>
                    <span className="text-slate-300">Portugal D7: Minimum income adjusted to €820/mo</span>
                </div>
                <div className="flex gap-3">
                    <span className="text-slate-500">09:15 AM</span>
                    <span className="text-accent">UPDATE</span>
                    <span className="text-slate-300">US B1/B2: Interview waiver expansion announced</span>
                </div>
                <div className="flex gap-3">
                    <span className="text-slate-500">Yesterday</span>
                    <span className="text-primary">VERIFY</span>
                    <span className="text-slate-300">Provider #4092 (Lawyer) credentials validated</span>
                </div>
                <div className="flex gap-3">
                    <span className="text-slate-500">Yesterday</span>
                    <span className="text-accent">UPDATE</span>
                    <span className="text-slate-300">Canada: IEC pools now open for 2024 season</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};