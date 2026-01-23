"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Lock,
  MapPin,
  Menu,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
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
          <Link
            href="/login"
            className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-slate-950 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-900 transition-all shadow-lg shadow-slate-900/10"
          >
            Sign Up
          </Link>
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
            <Link
              href="/login"
              className="w-full text-center py-3 font-bold text-slate-600 border rounded-xl"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="w-full text-center py-3 font-bold bg-slate-900 text-white rounded-xl"
            >
              Sign Up
            </Link>
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

interface Country {
  id: string;
  name: string;
}

interface VisaType {
  id: string;
  name: string;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("vysa_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("vysa_session_id", id);
  }
  return id;
}

export default function Page() {
  // Cascading dropdown state
  const [originCountry, setOriginCountry] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [visaCategory, setVisaCategory] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [loadingVisaTypes, setLoadingVisaTypes] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch countries on mount
  useEffect(() => {
    async function fetchCountries() {
      const { data } = await supabase
        .from("countries")
        .select("id, name")
        .order("name");
      if (data) setCountries(data);
      setLoadingCountries(false);
    }
    fetchCountries();
  }, []);

  // Fetch visa types when origin + destination are selected
  useEffect(() => {
    if (!originCountry || !destinationCountry) {
      setVisaTypes([]);
      setVisaCategory("");
      return;
    }
    async function fetchVisaTypes() {
      setLoadingVisaTypes(true);
      setVisaCategory("");
      const { data } = await supabase
        .from("visa_routes")
        .select("visa_type_id, visa_types(id, name)")
        .eq("origin_country_id", originCountry)
        .eq("destination_country_id", destinationCountry)
        .eq("is_active", true);
      if (data) {
        const types = data
          .map((r: Record<string, unknown>) => r.visa_types as VisaType | null)
          .filter((v): v is VisaType => v !== null);
        setVisaTypes(types);
      }
      setLoadingVisaTypes(false);
    }
    fetchVisaTypes();
  }, [originCountry, destinationCountry]);

  // Send chat message
  async function handleSendMessage() {
    const text = chatInput.trim();
    if (!text || chatLoading) return;

    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_text: text,
          session_id: getSessionId(),
          origin_country_id: originCountry || null,
          destination_country_id: destinationCountry || null,
          visa_category_id: visaCategory || null,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: data.answer || "Sorry, I couldn't process that request." },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

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
      <section className="relative pt-20 pb-24 lg:pt-32 lg:pb-40 overflow-hidden bg-white min-h-[90vh] flex items-center">
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

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/10 backdrop-blur-md border border-slate-900/10 text-slate-800 text-[10px] font-bold uppercase tracking-widest mb-8">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Verified Immigration Framework
            </div>
            <h1 className="text-5xl lg:text-7xl font-serif text-slate-950 leading-[1.1] tracking-tight mb-8">
              Your Visa Journey, <br />
              <span className="text-blue-700 italic">Fully Clarified.</span>
            </h1>

            {/* Bullet Points with Dark Green Checks */}
            <div className="space-y-4 mb-12">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                  Official requirements as simple checklists
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                  Verified immigration experts when you need them
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <p className="text-lg text-slate-700 font-medium leading-relaxed">
                  Full payment protection, always
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/login"
                className="bg-slate-950 text-white px-10 py-5 rounded-2xl text-base font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                View Visa Requirements
                <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="bg-white text-slate-900 border-2 border-slate-300 px-10 py-5 rounded-2xl text-base font-bold hover:border-slate-900 transition-all">
                Find Visa Agencies
              </button>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200/50 flex items-center justify-center lg:justify-start gap-6">
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

          {/* Right: Checklist Builder */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Your Visa Checklist</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-800/50 uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    Live
                  </div>
                </div>
                <p className="text-sm text-slate-400 font-medium">USA Tourist Visa (B1/B2)</p>
              </div>

              {/* Checklist Items */}
              <div className="p-6 space-y-2.5">
                {[
                  { label: "Valid Passport", status: "completed", desc: "6+ months validity", icon: FileText },
                  { label: "Passport Photos", status: "completed", desc: "2 recent photos", icon: FileText },
                  { label: "Application Form", status: "pending", desc: "DS-160 online", icon: FileText },
                  { label: "Bank Statements", status: "completed", desc: "Last 6 months", icon: CreditCard },
                  { label: "Employment Letter", status: "pending", desc: "From current employer", icon: FileText },
                  { label: "Travel Itinerary", status: "not-started", desc: "Flight & accommodation", icon: Globe },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className={`group relative rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                        item.status === "completed"
                          ? "bg-gradient-to-br from-emerald-50 to-emerald-50/50 border-emerald-200 hover:border-emerald-300"
                          : item.status === "pending"
                          ? "bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200 hover:border-blue-300 shadow-sm"
                          : "bg-slate-50/50 border-slate-200/60 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-center gap-4 p-4">
                        <div
                          className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                            item.status === "completed"
                              ? "bg-gradient-to-br from-emerald-600 to-emerald-700"
                              : item.status === "pending"
                              ? "bg-gradient-to-br from-blue-600 to-blue-700"
                              : "bg-gradient-to-br from-slate-300 to-slate-400"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <Check className="w-5 h-5 text-white" strokeWidth={3} />
                          ) : item.status === "pending" ? (
                            <div className="relative">
                              <Sparkles className="w-5 h-5 text-white animate-pulse" />
                              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                            </div>
                          ) : (
                            <Icon className="w-5 h-5 text-slate-600" strokeWidth={2} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className={`text-sm font-bold ${
                              item.status === "completed" ? "text-emerald-950" :
                              item.status === "pending" ? "text-blue-950" :
                              "text-slate-700"
                            }`}>
                              {item.label}
                            </div>
                            {item.status === "completed" && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" strokeWidth={2.5} />
                            )}
                          </div>
                          <div className="text-xs text-slate-600 font-medium">{item.desc}</div>
                        </div>
                      </div>
                      {item.status === "pending" && (
                        <div className="absolute top-2 right-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-lg shadow-blue-600/50"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress Footer */}
              <div className="px-6 pb-6">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-bold text-slate-900">Overall Progress</span>
                    </div>
                    <span className="text-lg font-bold text-slate-950">67%</span>
                  </div>
                  <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                    <div className="absolute inset-0 h-full w-[67%] bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-500 rounded-full shadow-lg animate-pulse"></div>
                    <div className="absolute inset-0 h-full w-[67%] bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"></div>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 font-medium text-center">
                    4 of 6 requirements completed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guided Start & AI Assistant Section */}
      <section className="relative z-30 -mt-16 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Left: Cascading Dropdowns */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-3 shadow-xl shadow-slate-200/40 flex flex-col">
            <div className="bg-slate-50/50 rounded-[1.5rem] p-6 h-full flex flex-col">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">View Roadmap</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium">Select your route to see visa requirements.</p>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                {/* Origin Country */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Country of Origin
                  </label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      disabled={loadingCountries}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">{loadingCountries ? "Loading..." : "Select origin country"}</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination Country */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Destination Country
                  </label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      disabled={loadingCountries}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">{loadingCountries ? "Loading..." : "Select destination country"}</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Visa Category */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Visa Category
                  </label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <select
                      value={visaCategory}
                      onChange={(e) => setVisaCategory(e.target.value)}
                      disabled={!originCountry || !destinationCountry || loadingVisaTypes}
                      className="w-full pl-9 pr-3 py-3 bg-white border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 rounded-xl outline-none transition-all text-sm font-bold text-slate-900 appearance-none shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">
                        {loadingVisaTypes
                          ? "Loading..."
                          : !originCountry || !destinationCountry
                          ? "Select origin & destination first"
                          : visaTypes.length === 0
                          ? "No visa categories available"
                          : "Select visa category"}
                      </option>
                      {visaTypes.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CTA Buttons - Non-interactive */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  disabled
                  className="flex-1 py-3.5 bg-slate-950 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm opacity-90 cursor-not-allowed"
                >
                  <Search className="w-4 h-4" />
                  Find Requirements
                </button>
                <button
                  disabled
                  className="flex-1 py-3.5 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 text-sm opacity-90 cursor-not-allowed"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Find Trusted Agents
                </button>
              </div>
            </div>
          </div>

          {/* Right: AI Chatbot */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-3 shadow-xl shadow-slate-200/40">
            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-6 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Ask VysaGuard AI</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Visa questions
                </span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 min-h-[200px] max-h-[280px] overflow-y-auto space-y-3 mb-4 pr-1">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6">
                    <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mb-1">How can I help?</p>
                    <p className="text-xs text-slate-400 max-w-[220px]">
                      Ask about documents, timelines, costs, interview prep, or common pitfalls.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          msg.role === "user"
                            ? "bg-slate-900 text-white rounded-br-md"
                            : "bg-slate-100 text-slate-800 rounded-bl-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g., What documents do I need for a US visa?"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(); }}
                  disabled={chatLoading}
                  className="flex-1 pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none transition-all text-xs font-medium text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-slate-950 text-white p-3 rounded-xl hover:bg-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
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
                      className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${step.active
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
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center ${step.active ? "bg-blue-600 text-white" : "bg-white border text-slate-400"
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
