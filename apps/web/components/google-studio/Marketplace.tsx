"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { supabase } from "@/lib/supabaseClient";

export const Marketplace: React.FC = () => {
  const router = useRouter();

  const handleStartChecklist = async () => {
    const nextUrl = "/dashboard?view=checklists&build=1";
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.push(`/login?next=${encodeURIComponent(nextUrl)}`);
      return;
    }
    router.push(nextUrl);
  };

  return (
    <section id="marketplace" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Choose your level of support.
          </h2>
          <p className="text-slate-600 mt-4 text-lg">
            Whether you are comfortable handling paperwork yourself or need professional legal guidance, we provide a safe path forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: DIY */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col relative overflow-hidden">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Self-Guided</h3>
                <p className="text-slate-500 mt-2">For experienced travelers who just need the correct forms.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-900 mt-0.5" />
                    <span className="text-slate-700 text-sm">Official, up-to-date requirement lists</span>
                </li>
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-900 mt-0.5" />
                    <span className="text-slate-700 text-sm">Direct links to official application portals</span>
                </li>
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-slate-900 mt-0.5" />
                    <span className="text-slate-700 text-sm">Document tracking dashboard</span>
                </li>
            </ul>

            <Button
              variant="outline"
              className="w-full justify-between group"
              onClick={handleStartChecklist}
            >
              Start Checklist
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </Button>
          </div>

          {/* Card 2: Expert */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-white shadow-md flex flex-col relative overflow-hidden ring-1 ring-slate-100">
            <div className="absolute top-0 right-0 p-4">
                <ShieldCheck className="text-success w-6 h-6" />
            </div>
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Verified Expert</h3>
                <p className="text-slate-500 mt-2">Hire a vetted agency or lawyer to manage the process.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5" />
                    <span className="text-slate-700 text-sm">Personalized case review</span>
                </li>
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5" />
                    <span className="text-slate-700 text-sm">Identity & license verified providers</span>
                </li>
                <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-success mt-0.5" />
                    <span className="text-slate-700 text-sm">Secure payments (No WhatsApp transfers)</span>
                </li>
            </ul>

            <Button variant="primary" className="w-full justify-between">
              Find an Expert
              <ArrowRight className="w-4 h-4 text-white/70" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};
