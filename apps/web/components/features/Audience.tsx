import React from 'react';

export const Audience: React.FC = () => {
  const segments = [
    { title: "International Students", desc: "Navigate F-1, Tier 4, and study permit rules without risking your semester start date." },
    { title: "Skilled Professionals", desc: "Clear paths for H-1B, Blue Card, and employer-sponsored work visas." },
    { title: "Families", desc: "Reunite with spouses and children using checklists designed for complex dependency rules." },
    { title: "Digital Nomads", desc: "Find countries offering remote work visas and verify income requirements." }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Built for every journey.</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {segments.map((seg, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">{seg.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{seg.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};