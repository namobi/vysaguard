import React from 'react';
import { Clock, Layers, Shield } from 'lucide-react';

export const Problem: React.FC = () => {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-warning" />,
      title: "Outdated Information",
      description: "Government websites are often neglected. Relying on year-old blog posts can lead to immediate rejection."
    },
    {
      icon: <Layers className="w-6 h-6 text-warning" />,
      title: "Fragmented Rules",
      description: "The requirements for your specific nationality, residency, and destination are rarely found in one single place."
    },
    {
      icon: <Shield className="w-6 h-6 text-warning" />,
      title: "Prevalent Scams",
      description: "Unverified 'agents' prey on anxiety. Sending money to a stranger on WhatsApp is a risk you shouldn't take."
    }
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-4">
            The visa process is broken.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Applying for a visa affects your life, career, and family. Yet the current system is built on uncertainty, fragmented information, and risk. One mistake can cost you months of time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((prob, index) => (
            <div key={index} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-6 border border-slate-100">
                {prob.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{prob.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {prob.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};