import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Destinations: React.FC = () => {
  const destinations = [
    {
      country: "United Kingdom",
      pathways: "12 Pathways",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800"
    },
    {
      country: "Australia",
      pathways: "8 Pathways",
      image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800"
    },
    {
      country: "Canada",
      pathways: "15 Pathways",
      image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&q=80&w=800"
    },
    {
      country: "United States",
      pathways: "10 Pathways",
      image: "https://images.unsplash.com/photo-1508433957232-3107f5fd5995?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">
              Popular Global Destinations
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Explore tailored immigration pathways for the world’s most sought-after economies.
            </p>
          </div>
          <a href="#" className="hidden md:inline-flex items-center font-medium text-slate-900 hover:text-slate-700 transition-colors">
            View All Destinations <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest, idx) => (
            <div 
              key={idx} 
              className="group relative h-80 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all"
            >
              {/* Image Background */}
              <img 
                src={dest.image} 
                alt={dest.country} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <h3 className="text-xl font-bold text-white mb-1">{dest.country}</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="text-sm font-medium text-slate-200">{dest.pathways}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Action */}
        <div className="mt-8 md:hidden">
          <a href="#" className="inline-flex items-center font-medium text-slate-900 hover:text-slate-700 transition-colors">
            View All Destinations <ArrowRight className="ml-2 w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
};