"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Lock,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

// --- Types ---
interface Provider {
  id: string;
  name: string;
  role: "Verified Agent" | "Immigration Lawyer";
  countries: string[];
  services: string[];
  rating: number;
  reviews: number;
  image: string;
}

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 p-1.5 rounded-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            VysaGuard
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#become-provider"
            className="text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors"
          >
            Become a Verified Provider
          </a>
          <a
            href="#destinations"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Destinations
          </a>
          <a
            href="#providers"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Providers
          </a>
          <a
            href="#pricing"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Pricing
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            How It Works
          </a>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <button className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4">
            Login
          </button>
          <button className="bg-slate-950 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-900 transition-all shadow-lg shadow-slate-900/10">
            Sign Up
          </button>
        </div>

        <button
          className="md:hidden text-slate-900"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b p-6 flex flex-col gap-4 md:hidden shadow-xl animate-in slide-in-from-top duration-300">
          <a href="#become-provider" className="text-lg font-bold text-blue-700">
            Become a Verified Provider
          </a>
          <a href="#destinations" className="text-lg font-bold text-slate-900">
            Destinations
          </a>
          <a href="#providers" className="text-lg font-bold text-slate-900">
            Providers
          </a>
          <a href="#pricing" className="text-lg font-bold text-slate-900">
            Pricing
          </a>
          <hr />
          <div className="flex flex-col gap-3">
            <button className="w-full text-center py-3 font-bold text-slate-600 border rounded-xl">
              Login
            </button>
            <button className="w-full text-center py-3 font-bold bg-slate-900 text-white rounded-xl">
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const ProviderCard = ({ provider }: { provider: Provider }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group">
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={provider.image}
            alt={provider.name}
            className="w-16 h-16 rounded-full object-cover border-4 border-slate-50"
          />
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-50" />
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 text-lg">{provider.name}</h4>
          <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
            {provider.role}
          </span>
        </div>
      </div>
    </div>

    <div className="space-y-4 mb-6">
      <div className="flex items-start gap-2">
        <Globe className="w-4 h-4 text-slate-400 mt-1" />
        <span className="text-sm text-slate-600 leading-tight">
          {provider.countries.join(", ")}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {provider.services.map((s) => (
          <span
            key={s}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
          >
            {s}
          </span>
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between pt-5 border-t border-slate-50">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span className="text-sm font-bold text-slate-900">{provider.rating}</span>
        <span className="text-xs text-slate-400">
          ({provider.reviews} reviews)
        </span>
      </div>
      <button className="text-sm font-bold text-slate-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
        Consult <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default function Page() {
  const [dest, setDest] = useState("");
  const [visaType, setVisaType] = useState("");
  const [stage, setStage] = useState("");
  const [aiInput, setAiInput] = useState("");

  const providers: Provider[] = [
    {
      id: "1",
      name: "Elena Vance, Esq.",
      role: "Immigration Lawyer",
      countries: ["USA", "Canada", "United Kingdom"],
      services: ["H1-B", "Express Entry", "Global Talent"],
      rating: 4.9,
      reviews: 124,
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      id: "2",
      name: "Marcus Thorne",
      role: "Verified Agent",
      countries: ["Australia", "New Zealand"],
      services: ["Student Visa", "Skilled Migrant", "Visitor"],
      rating: 4.8,
      reviews: 89,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
    },
    {
      id: "3",
      name: "Sophia Lindqvist",
      role: "Immigration Lawyer",
      countries: ["Germany", "Sweden", "Netherlands"],
      services: ["EU Blue Card", "Family Union", "Research"],
      rating: 5.0,
      reviews: 56,
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200",
    },
  ];

  return (
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden bg-white min-h-[90vh] flex items-center">
        {/* Cinematic Professional Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2560&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-60 grayscale-[0.1]"
            alt="Globally inclusive travel and immigration"
          />
          {/* Fades for text legibility and cinematic blend - Slightly transparent for image pop */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white"></div>
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/10 backdrop-blur-md border border-slate-900/10 text-slate-800 text-[10px] font-bold uppercase tracking-widest mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified Immigration Framework
            </div>
            <h1 className="text-6xl lg:text-8xl font-serif text-slate-950 leading-[1.05] tracking-tight mb-8">
              Visa Journey, <br />
              <span className="text-blue-700 italic">Done Right.</span>
            </h1>
            <p className="text-xl text-slate-900 leading-relaxed mb-12 font-semibold">
              Join thousands of global applicants using our verified playbooks,
              structured checklist builder, expert connections, and secure payment
              protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <button className="bg-slate-950 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 group shadow-2xl shadow-slate-950/20">
                Start Your Journey
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/80 backdrop-blur-md text-slate-900 border border-slate-200 px-10 py-5 rounded-2xl text-lg font-bold hover:border-slate-400 transition-all flex items-center justify-center gap-2">
                Browse Destinations
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200/50 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
                    alt="User"
                  />
                ))}
              </div>
              <div className="text-sm">
                <span className="block font-bold text-slate-900">12k+ Applicants</span>
                <span className="text-slate-700 font-bold">
                  Successfully relocated this year
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative z-10">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-100 rounded-full blur-2xl opacity-50"></div>

              {/* Requirements Checklist UI Container */}
              <div className="relative bg-white/95 backdrop-blur-sm border border-slate-200 p-8 rounded-[2.5rem] shadow-[0_48px_80px_-20px_rgba(0,0,0,0.12)] min-h-[440px] flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-500">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-slate-900">
                      Application Progress
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" />
                      Live Status
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        label: "Passport (6+ months validity)",
                        status: "completed",
                        desc: "Scan verified by AI-Guard",
                      },
                      {
                        label: "Passport photo",
                        status: "completed",
                        desc: "Compliant with biometric standards",
                      },
                      {
                        label: "Visa application form confirmation",
                        status: "pending",
                        desc: "Awaiting final electronic signature",
                      },
                      {
                        label: "Bank statements (last 3–6 months)",
                        status: "completed",
                        desc: "Balance verified and encrypted",
                      },
                      {
                        label: "Travel itinerary (optional)",
                        status: "not-started",
                        desc: "Phase: Trip planning",
                      },
                      {
                        label: "Employment letter / proof of income",
                        status: "pending",
                        desc: "Company verification in progress",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition-all duration-300 ${
                          item.status === "completed"
                            ? "bg-emerald-50/30 border-emerald-100"
                            : item.status === "pending"
                            ? "bg-white border-blue-200 shadow-sm scale-[1.02]"
                            : "bg-slate-50 border-transparent opacity-50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                              item.status === "completed"
                                ? "bg-emerald-500 text-white"
                                : item.status === "pending"
                                ? "bg-blue-600 text-white animate-pulse"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {item.status === "completed" ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : item.status === "pending" ? (
                              <Clock className="w-3.5 h-3.5" />
                            ) : null}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 leading-tight mb-0.5">
                              {item.label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Ref: VG-9021-USA
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-900">72% Uploaded</span>
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[72%] bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Overlays - Made to "Pop" more */}
              <div className="absolute -top-6 -right-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xl max-w-[220px] transform rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Trust Rating
                    </span>
                    <span className="text-sm font-bold text-slate-900">Tier 1 Secured</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  End-to-end encryption active for all sensitive documentation.
                </div>
              </div>

              <div className="absolute -bottom-14 -left-12 bg-slate-950 p-6 rounded-[2rem] shadow-2xl max-w-[260px] transform -rotate-2 hover:rotate-0 transition-transform duration-500 border border-white/10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/40">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
                      Escrow Active
                    </span>
                    <span className="text-base font-bold text-white">Protected Funds</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Funds held in secure custody. Release scheduled upon Case Milestone #04.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guided Start & AI Assistant Section */}
      <section className="relative z-30 -mt-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Form Side - Compact & Professional */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-3 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="bg-slate-50/50 rounded-[1.5rem] p-6 h-full flex flex-col">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Destination
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Country</option>
                      <option value="usa">USA</option>
                      <option value="can">Canada</option>
                      <option value="uk">UK</option>
                      <option value="aus">Australia</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Visa Category
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Type</option>
                      <option value="work">Work</option>
                      <option value="study">Study</option>
                      <option value="immigrate">PR</option>
                      <option value="visit">Visit</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Stage
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer"
                    >
                      <option value="">Current Progress Stage</option>
                      <option value="res">Early Research</option>
                      <option value="prep">Gathering Documents</option>
                      <option value="ready">Ready to Submit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mt-auto">
                <button className="w-full max-w-[280px] py-4 bg-slate-950 text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-blue-900/10 flex items-center justify-center gap-2 group text-sm border border-slate-800 transform active:scale-[0.98]">
                  View Roadmap
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* AI Side - Inspired & Compact */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-3 shadow-xl shadow-slate-200/40">
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Ask Vysa AI</h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Visa questions
                  </span>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed mb-6 font-medium">
                  Ask about documents, timelines, costs, interview prep, red flags, and scams.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      placeholder="e.g., What documents do I need for a US visa?"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-inner"
                    />
                  </div>
                  <button className="bg-slate-950 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all text-xs shadow-md transform active:scale-95">
                    Ask
                  </button>
                </div>
              </div>

              <div className="bg-blue-50/40 border border-blue-100/50 p-4 rounded-xl flex items-center gap-3">
                <div className="bg-white p-1 rounded-md shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  <span className="font-bold text-blue-900">Tip:</span> Ask for a checklist to auto-generate one for your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Locations Grid */}
      <section id="destinations" className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl font-serif text-slate-950 mb-4 tracking-tight leading-tight">
                Popular Global Destinations
              </h2>
              <p className="text-slate-500 font-medium">
                Explore tailored immigration pathways for the world's most sought-after economies.
              </p>
            </div>
            <button className="text-slate-900 font-bold flex items-center gap-2 group">
              View All Destinations{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                name: "United Kingdom",
                image:
                  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400&h=500",
                pathways: "12 Pathways",
              },
              {
                name: "Australia",
                image:
                  "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400&h=500",
                pathways: "8 Pathways",
              },
              {
                name: "Canada",
                image:
                  "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=400&h=500",
                pathways: "15 Pathways",
              },
              {
                name: "United States",
                image:
                  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&q=80&w=400&h=500",
                pathways: "10 Pathways",
              },
            ].map((loc, idx) => (
              <div
                key={idx}
                className="group relative h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
              >
                <img
                  src={loc.image}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={loc.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-white text-2xl font-serif mb-1">{loc.name}</h3>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
                    {loc.pathways}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* “Relocation is a project” Section */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/40 relative">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-serif text-slate-950">Your Case Timeline</h3>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Phase 03
                  </span>
                </div>

                <div className="space-y-5">
                  {[
                    { title: "Requirements", desc: "Verified by country profile", active: false },
                    { title: "Document Uploads", desc: "Encrypted & tracked", active: true },
                    { title: "Legal Review", desc: "Assigned expert checks", active: false },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${
                        step.active
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                          {step.active ? "In Progress" : "Queued"}
                        </div>
                        <h4 className="font-bold text-slate-700">{step.title}</h4>
                        <div className="text-xs text-slate-500 font-medium mt-1">{step.desc}</div>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                          step.active ? "bg-blue-600 text-white" : "bg-white border text-slate-400"
                        }`}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl">
                  <div className="text-center">
                    <div className="text-2xl font-serif">100%</div>
                    <div className="text-[10px] font-bold uppercase tracking-tighter">
                      Accurate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-5xl font-serif text-slate-950 mb-8 leading-tight">
                Relocation isn't a task. <br />
                It's a project.
              </h2>
              <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
                We've broken down every country's immigration code into a visual, structured project management dashboard.
              </p>
              <div className="space-y-8">
                {[
                  {
                    title: "Dynamic Playbooks",
                    text: "Interactive guides that update as your profile changes.",
                  },
                  {
                    title: "Smart Checklists",
                    text: "Know exactly which document goes where and what's missing.",
                  },
                  {
                    title: "Direct Expert Link",
                    text: "Message your lawyer or agent directly within the task.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-950 mb-1">
                        {item.title}
                      </h4>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experts Section */}
      <section id="providers" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-serif text-slate-950 mb-6 tracking-tight">
                Vetted Professionals Only.
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                We don't just list providers. We verify their licenses, track their success rates, and enforce our strict code of conduct.
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-900">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              How we verify providers
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {providers.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Trusted by firms in 40+ countries
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40">
              <span className="text-xl font-serif font-bold italic">LegalGlobal</span>
              <span className="text-xl font-serif font-bold italic">ImmiPath</span>
              <span className="text-xl font-serif font-bold italic">SafeHaven</span>
              <span className="text-xl font-serif font-bold italic">VisaNexus</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Protection Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-slate-950 rounded-[3.5rem] p-12 lg:p-24 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] -mr-64 -mb-64 transition-transform duration-1000 group-hover:scale-110"></div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl font-serif mb-8 leading-tight">
                  Your money is safe. <br />
                  Period.
                </h2>
                <p className="text-xl text-slate-400 mb-12 font-medium">
                  VysaGuard Escrow ensures that your payments are only released to professionals when specific milestones are met.
                </p>

                <div className="grid sm:grid-cols-2 gap-8">
                  <div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Milestone Escrow</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Funds are unlocked phase-by-phase as your application progresses.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-amber-400" />
                    </div>
                    <h4 className="text-lg font-bold mb-2">Dispute Center</h4>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Independent legal arbitration if services aren't delivered as promised.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-md">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                    Payment Safety Score
                  </span>
                  <span className="text-2xl font-serif">100%</span>
                </div>
                <div className="space-y-6">
                  <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <p className="text-red-200 text-sm font-bold mb-2">NEVER DO THIS:</p>
                    <p className="text-red-300 text-xs leading-relaxed font-medium">
                      Pay an agent via bank transfer, WhatsApp, or Zelle. You will have no legal recourse if they disappear.
                    </p>
                  </div>
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <p className="text-emerald-200 text-sm font-bold mb-2">ALWAYS DO THIS:</p>
                    <p className="text-emerald-300 text-xs leading-relaxed font-medium">
                      Use the VysaGuard protected portal for all transactions. Your funds are federally insured.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-slate-200"></div>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-serif text-slate-950 mb-10 leading-[1.1]">
            Ready to make the <br />
            move for real?
          </h2>
          <p className="text-xl text-slate-500 mb-14 font-medium max-w-xl mx-auto">
            Stop scrolling through forums. Start following a verified playbook today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-slate-950 text-white px-12 py-6 rounded-2xl text-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-slate-950/20 group">
              Start Application
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="bg-white text-slate-950 border border-slate-200 px-12 py-6 rounded-2xl text-xl font-bold hover:border-slate-950 transition-all">
              Find a Lawyer
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-24 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-slate-950 p-1.5 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-slate-950">
                  VysaGuard
                </span>
              </div>
              <p className="text-slate-500 font-medium leading-relaxed max-w-xs mb-8">
                The global infrastructure for safe, structured, and successful immigration.
              </p>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-950 hover:border-slate-950 transition-all cursor-pointer"
                  >
                    <Globe className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-bold text-slate-950 mb-6">Explore</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-slate-950 cursor-pointer">United States</li>
                <li className="hover:text-slate-950 cursor-pointer">Canada</li>
                <li className="hover:text-slate-950 cursor-pointer">United Kingdom</li>
                <li className="hover:text-slate-950 cursor-pointer">European Union</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-950 mb-6">Expertise</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-slate-950 cursor-pointer">
                  Immigration Lawyers
                </li>
                <li className="hover:text-slate-950 cursor-pointer">Certified Agents</li>
                <li className="hover:text-slate-950 cursor-pointer">Tax Advisors</li>
                <li className="hover:text-slate-950 cursor-pointer">Relocation Pros</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-950 mb-6">Support</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-slate-950 cursor-pointer">Help Center</li>
                <li className="hover:text-slate-950 cursor-pointer">Safety Center</li>
                <li className="hover:text-slate-950 cursor-pointer">Contact Us</li>
                <li className="hover:text-slate-950 cursor-pointer">Case Tracking</li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-950 mb-6">Legal</h5>
              <ul className="space-y-4 text-sm text-slate-500 font-medium">
                <li className="hover:text-slate-950 cursor-pointer">Privacy</li>
                <li className="hover:text-slate-950 cursor-pointer">Terms</li>
                <li className="hover:text-slate-950 cursor-pointer">Security</li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
              © 2024 VysaGuard Immigration Technology Inc.
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                SSL Secure
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CreditCard className="w-4 h-4 text-blue-500" />
                PCI Compliant
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
