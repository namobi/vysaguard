import React from 'react';
import { ArrowRight, ArrowUpRight, Globe, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Professionals: React.FC = () => {
  const professionals = [
    {
      name: "Elena Vance, Esq.",
      role: "Immigration Lawyer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
      countries: "USA, Canada, United Kingdom",
      tags: ["H1-B", "Express Entry", "Global Talent"],
      rating: 4.9,
      reviews: 124
    },
    {
      name: "Marcus Thorne",
      role: "Verified Agent",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
      countries: "Australia, New Zealand",
      tags: ["Student Visa", "Skilled Migrant", "Visitor"],
      rating: 4.8,
      reviews: 89
    },
    {
      name: "Sophia Lindqvist",
      role: "Immigration Lawyer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200",
      countries: "Germany, Sweden, Netherlands",
      tags: ["EU Blue Card", "Family Union", "Research"],
      rating: 5.0,
      reviews: 56
    }
  ];

  return (
    <section id="verified-professionals" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Vetted Professionals Only.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We don’t just list providers. We verify their licenses, track their success rates, and enforce our strict code of conduct.
            </p>
          </div>
          <div>
            <Button variant="secondary" className="group">
              <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
              How we verify providers
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {professionals.map((pro, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <img src={pro.image} alt={pro.name} className="w-14 h-14 rounded-full object-cover border border-slate-100" />
                  <div className="absolute -bottom-1 -right-1 bg-white p-0.5 rounded-full">
                    <ShieldCheck size={14} className="text-success fill-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{pro.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-700 border border-slate-100">
                    {pro.role}
                  </span>
                </div>
              </div>

              {/* Countries */}
              <div className="flex items-start gap-2 mb-4 text-sm text-slate-600">
                <Globe className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <span>{pro.countries}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {pro.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-slate-50 text-slate-600 text-[11px] font-semibold uppercase tracking-wide border border-slate-100">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-900 text-sm">{pro.rating}</span>
                  <span className="text-slate-400 text-xs">({pro.reviews} reviews)</span>
                </div>
                <a href="#" className="flex items-center text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                  Consult <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center border-t border-slate-100 pt-12">
            <a href="#" className="inline-flex items-center font-semibold text-slate-900 hover:text-primary transition-colors text-base">
                View All Verified Professionals <ArrowRight className="ml-2 w-4 h-4" />
            </a>
        </div>

      </div>
    </section>
  );
};
