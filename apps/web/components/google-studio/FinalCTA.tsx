import React from 'react';
import { Button } from './Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          You are finally in the right place.
        </h2>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
          Stop guessing with outdated blogs and anonymous forums. Start your application with verified requirements and trusted support today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="secondary" size="lg" className="border-transparent">
            Start with Visa Requirements
          </Button>
          <Button className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700" size="lg">
            See how verified help works
          </Button>
        </div>
      </div>
    </section>
  );
};