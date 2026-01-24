"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FileText,
  Globe,
  MapPin,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Google Studio UI Components
import { Hero } from "@/components/google-studio/Hero";
import { Problem } from "@/components/google-studio/Problem";
import { Solution } from "@/components/google-studio/Solution";
import { Trust } from "@/components/google-studio/Trust";
import { Marketplace } from "@/components/google-studio/Marketplace";
import { Destinations } from "@/components/google-studio/Destinations";
import { Professionals } from "@/components/google-studio/Professionals";
import { Audience } from "@/components/google-studio/Audience";
import { FinalCTA } from "@/components/google-studio/FinalCTA";
import { Footer } from "@/components/google-studio/Footer";

// --- Types ---
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar — matches Google Studio design */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-md">
                <ShieldCheck size={20} strokeWidth={2.5} />
              </div>
              <span className="font-semibold text-lg tracking-tight text-slate-900">VysaGuard</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it works</a>
              <a href="#trust" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Verification</a>
              <a href="#marketplace" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Agencies</a>
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

      <main>
        <Hero />

        {/* Guided Start & AI Assistant Section */}
        <section className="relative z-30 -mt-16 px-4 sm:px-6 lg:px-8 mb-16">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Cascading Dropdowns */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-slate-900">View Roadmap</h3>
                </div>
                <p className="text-xs text-slate-500">Select your route to see visa requirements.</p>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                {/* Origin Country */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Country of Origin
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={originCountry}
                      onChange={(e) => setOriginCountry(e.target.value)}
                      disabled={loadingCountries}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg outline-none transition-all text-sm text-slate-900 appearance-none cursor-pointer disabled:opacity-50"
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
                  <label className="text-xs font-medium text-slate-500">
                    Destination Country
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={destinationCountry}
                      onChange={(e) => setDestinationCountry(e.target.value)}
                      disabled={loadingCountries}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg outline-none transition-all text-sm text-slate-900 appearance-none cursor-pointer disabled:opacity-50"
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
                  <label className="text-xs font-medium text-slate-500">
                    Visa Category
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={visaCategory}
                      onChange={(e) => setVisaCategory(e.target.value)}
                      disabled={!originCountry || !destinationCountry || loadingVisaTypes}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg outline-none transition-all text-sm text-slate-900 appearance-none cursor-pointer disabled:opacity-50"
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

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center font-medium transition-colors rounded-lg h-10 px-4 text-sm bg-primary text-white hover:bg-slate-800 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Requirements
                </button>
                <button
                  disabled
                  className="flex-1 inline-flex items-center justify-center font-medium transition-colors rounded-lg h-10 px-4 text-sm bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Find Trusted Agents
                </button>
              </div>
            </div>

            {/* Right: AI Chatbot */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary text-white p-1.5 rounded-md">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Ask VysaGuard AI</h3>
                </div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  Visa questions
                </span>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 min-h-[200px] max-h-[280px] overflow-y-auto space-y-3 mb-4 pr-1">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-6">
                    <div className="bg-slate-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">How can I help?</p>
                    <p className="text-xs text-slate-500 max-w-[220px]">
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
                        className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-white"
                            : "bg-slate-50 text-slate-800 border border-slate-100"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
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
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-lg outline-none transition-all text-sm text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="inline-flex items-center justify-center rounded-lg h-10 w-10 bg-primary text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <Problem />
        <Solution />
        <Trust />
        <Marketplace />
        <Destinations />
        <Professionals />
        <Audience />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
