"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  FileText,
  CheckCircle2,
  Lock,
  ArrowRight,
  LayoutDashboard,
  FileCheck,
  UserCheck,
  XCircle,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/google-studio/Button';
import { Footer } from '@/components/google-studio/Footer';
import { checkAuth, checkProviderStatus, createOrEnsureProviderProfile } from '@/lib/providerUtils';

export default function ProviderSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleProviderSignup = async () => {
    try {
      setLoading(true);

      // Check if user is authenticated
      const { isAuthenticated } = await checkAuth();

      if (!isAuthenticated) {
        // Redirect to login with returnTo parameter
        router.push('/login?next=/provider/onboarding');
        return;
      }

      // User is authenticated, check provider status
      const { isProvider, isComplete } = await checkProviderStatus();

      if (isProvider && isComplete) {
        // Provider profile already complete, go to dashboard
        router.push('/provider/dashboard');
        return;
      }

      // Create/ensure provider profile exists
      const result = await createOrEnsureProviderProfile();

      if (!result.success) {
        alert(result.error || 'Failed to create provider profile');
        setLoading(false);
        return;
      }

      // Redirect to onboarding to complete profile
      router.push('/provider/onboarding');
    } catch (error: any) {
      console.error('Error handling provider signup:', error);
      alert(error.message || 'An error occurred');
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-md">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">VysaGuard</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
              <a href="/#trust" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Verification</a>
              <Link href="/providerSignup" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Become a Provider</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center font-medium transition-colors rounded-lg h-8 px-3 text-sm bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center font-medium transition-colors rounded-lg h-8 px-3 text-sm bg-primary text-white hover:bg-slate-800 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-8">
            <ShieldCheck size={14} />
            For Verified Professionals
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Built for Visa Agencies.<br />Designed for Trust.
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
            VysaGuard helps verified visa professionals connect with serious applicants, manage cases efficiently, and operate with transparency.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleProviderSignup} disabled={loading}>
              {loading ? 'Loading...' : 'Sign up as an Agent'}
            </Button>
            <Button variant="ghost" size="lg" className="text-slate-600">
              Learn how verification works
            </Button>
          </div>
        </div>
      </section>

      {/* Section 1: Value Pillars */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-primary mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Qualified Clients Only</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Applicants come through structured checklists, ensuring they understand the requirements before they contact you. Reduced noise, higher readiness.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-primary mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Clear Scope</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every request is tied to a defined visa route and documented requirements. No ambiguity about deliverables or expectations.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-primary mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Official Requirements</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our versioned playbooks reduce misinformation. You spend less time correcting myths and more time on strategy.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-primary mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Trust & Transparency</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Clear audit trails, document history, and status tracking build immediate trust with clients who value safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Features */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What You Can Do on VysaGuard</h2>
            <p className="text-slate-600">A purpose-built dashboard for immigration casework.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 max-w-5xl mx-auto">

            {/* Feature 1 */}
            <div className="flex gap-6">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <LayoutDashboard size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Client Intake</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Receive structured requests tied to specific visa routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>View applicant readiness scores before engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>One-click accept or decline functionality</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-6">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <FileCheck size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Case Management</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Track documents uploaded by applicants in real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Comment directly on specific checklist items</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Automated status updates (reviewing, completed, etc.)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-6">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <Users size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Communication</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Centralized secure messaging threads per case</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Eliminate scattered WhatsApp and email threads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Clear audit trail of all advice given</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex gap-6">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                  <UserCheck size={16} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Professional Profile</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Display your verified status and license number</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Define specific regions and visa types you support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
                    <span>Build credibility through verified completed cases</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Section 3: Verification */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block p-4 rounded-full bg-slate-50 border border-slate-100 mb-6">
            <Lock size={32} className="text-slate-700" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">A Marketplace Built on Verification</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
            VysaGuard is not an open directory. We manually verify the identity, business registration, and professional licensure of every agency on our platform. Applicants know that a VysaGuard profile means safety.
          </p>
          <Button variant="outline">
            View verification requirements
          </Button>
        </div>
      </section>

      {/* Section 4: Flow */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative">
              <span className="text-6xl font-bold text-slate-800 absolute -top-8 -left-4 z-0">1</span>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Sign Up</h3>
                <p className="text-slate-400 text-sm">Create your agency profile and submit your credentials for review.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-bold text-slate-800 absolute -top-8 -left-4 z-0">2</span>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Verification</h3>
                <p className="text-slate-400 text-sm">Our compliance team checks your license and business standing.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-bold text-slate-800 absolute -top-8 -left-4 z-0">3</span>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Onboarding</h3>
                <p className="text-slate-400 text-sm">Define your service areas, pricing models, and team access.</p>
              </div>
            </div>
            <div className="relative">
              <span className="text-6xl font-bold text-slate-800 absolute -top-8 -left-4 z-0">4</span>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Start Working</h3>
                <p className="text-slate-400 text-sm">Receive high-intent requests and manage cases in your dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Who this is for */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-success" /> For Agencies Who:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Provide legitimate, authorized visa guidance and legal services.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Want structured, serious clients who value professional help.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Value transparency, clear processes, and operational efficiency.</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <XCircle className="text-slate-300" /> Not For:
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                  <span>Unverified intermediaries or "fixers".</span>
                </li>
                <li className="flex items-start gap-3 text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                  <span>Informal agents operating without proper business documentation.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                  <span>Volume-driven lead sellers selling unverified data.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Join a Platform Built for Serious Visa Work
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Apply to become a verified visa professional on VysaGuard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleProviderSignup} disabled={loading}>
              {loading ? 'Loading...' : 'Sign up as an Agent'}
            </Button>
            <Button variant="outline" size="lg">
              Contact us for partnerships
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
