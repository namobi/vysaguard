import React from 'react';
import { ClipboardCheck, Compass, UserCheck } from 'lucide-react';

export const Solution: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Select Route",
      description: "Input your citizenship, residency, and destination. We instantly filter the noise.",
      icon: <Compass className="w-5 h-5" />
    },
    {
      step: "02",
      title: "Official Checklist",
      description: "Access a structured list of documents sourced directly from consular requirements.",
      icon: <ClipboardCheck className="w-5 h-5" />
    },
    {
      step: "03",
      title: "Verified Support",
      description: "Apply yourself, or hire a vetted expert to handle the paperwork for you.",
      icon: <UserCheck className="w-5 h-5" />
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Order replacing chaos.
          </h2>
          <p className="text-slate-500 mt-2 text-lg">Your journey, simplified into three predictable steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Decorative line for desktop */}
          <div className="hidden md:block absolute top-8 left-16 right-16 h-0.5 bg-slate-100 -z-10" />

          {steps.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="w-16 h-16 bg-white border-2 border-slate-100 text-slate-400 rounded-full flex items-center justify-center text-xl font-bold mb-6 group-hover:border-slate-900 group-hover:text-slate-900 transition-colors z-10 mx-auto md:mx-0 shadow-sm">
                {item.step}
              </div>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 h-full">
                <div className="flex items-center gap-2 mb-3 text-slate-900">
                    {item.icon}
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};