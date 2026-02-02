"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Credential = {
  credential_type: string;
  issuing_body: string;
  credential_number: string;
  issued_date: string;
  expiry_date: string;
};

type ServiceArea = {
  country_id: string;
  country_name: string;
  visa_type_id: string;
  visa_type_name: string;
};

type Country = { id: string; name: string };
type VisaType = { id: string; name: string };

const STEPS = ["Basic Info", "Credentials", "Service Areas", "Review"];

export default function OnboardingClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Step 1: Basic Info
  const [businessName, setBusinessName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [bio, setBio] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [providerType, setProviderType] = useState("agent");
  const [yearsExperience, setYearsExperience] = useState("");
  const [languages, setLanguages] = useState("");

  // Step 2: Credentials
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [credType, setCredType] = useState("");
  const [credIssuer, setCredIssuer] = useState("");
  const [credNumber, setCredNumber] = useState("");
  const [credIssued, setCredIssued] = useState("");
  const [credExpiry, setCredExpiry] = useState("");

  // Step 3: Service Areas
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedVisa, setSelectedVisa] = useState("");

  // Auth check
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setContactEmail(data.session.user.email ?? "");
      setCheckingAuth(false);
    };
    check();
  }, [router]);

  // Load countries + visa types for step 3
  useEffect(() => {
    const load = async () => {
      const [cRes, vRes] = await Promise.all([
        supabase.from("countries").select("id,name").order("name"),
        supabase.from("visa_types").select("id,name").order("name"),
      ]);
      if (cRes.data) setCountries(cRes.data);
      if (vRes.data) setVisaTypes(vRes.data);
    };
    load();
  }, []);

  const addCredential = () => {
    if (!credType || !credIssuer) return;
    setCredentials((prev) => [
      ...prev,
      {
        credential_type: credType,
        issuing_body: credIssuer,
        credential_number: credNumber,
        issued_date: credIssued,
        expiry_date: credExpiry,
      },
    ]);
    setCredType("");
    setCredIssuer("");
    setCredNumber("");
    setCredIssued("");
    setCredExpiry("");
  };

  const removeCredential = (idx: number) => {
    setCredentials((prev) => prev.filter((_, i) => i !== idx));
  };

  const addServiceArea = () => {
    if (!selectedCountry) return;
    const countryName = countries.find((c) => c.id === selectedCountry)?.name ?? "";
    const visaName = visaTypes.find((v) => v.id === selectedVisa)?.name ?? "All types";

    // Prevent duplicates
    const exists = serviceAreas.some(
      (a) => a.country_id === selectedCountry && a.visa_type_id === selectedVisa
    );
    if (exists) return;

    setServiceAreas((prev) => [
      ...prev,
      {
        country_id: selectedCountry,
        country_name: countryName,
        visa_type_id: selectedVisa,
        visa_type_name: visaName,
      },
    ]);
    setSelectedCountry("");
    setSelectedVisa("");
  };

  const removeServiceArea = (idx: number) => {
    setServiceAreas((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!businessName || !contactEmail || !providerType) {
      alert("Please fill in required fields (Business Name, Email, Provider Type).");
      setStep(0);
      return;
    }

    try {
      setSubmitting(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        alert("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/providers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          business_name: businessName,
          contact_email: contactEmail,
          contact_phone: contactPhone || undefined,
          bio: bio || undefined,
          website_url: websiteUrl || undefined,
          provider_type: providerType,
          years_experience: yearsExperience ? parseInt(yearsExperience) : undefined,
          languages: languages ? languages.split(",").map((l) => l.trim()).filter(Boolean) : undefined,
          credentials: credentials.length ? credentials : undefined,
          service_areas: serviceAreas.length
            ? serviceAreas.map((a) => ({
                country_id: a.country_id,
                visa_type_id: a.visa_type_id || undefined,
              }))
            : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Registration failed.");
        return;
      }

      router.push("/provider-dashboard");
    } catch (err) {
      console.error("Submit error:", err);
      alert("Registration failed (check console).");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-gray-600">Checking session...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <header className="mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl text-[#0B1B3A]">VysaGuard</Link>
        <span className="text-sm text-gray-500">Provider Onboarding</span>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-14">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i <= step ? "bg-[#0B1B3A] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i <= step ? "text-[#0B1B3A]" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B1B3A] transition-all"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white shadow-sm border p-8">
          {/* Step 1: Basic Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1B3A]">Basic Information</h2>
              <p className="text-sm text-gray-600">Tell us about your business and expertise.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Business Name *</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    placeholder="e.g., Vance Immigration Law"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Provider Type *</label>
                  <select
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    value={providerType}
                    onChange={(e) => setProviderType(e.target.value)}
                  >
                    <option value="agent">Immigration Agent</option>
                    <option value="lawyer">Immigration Lawyer</option>
                    <option value="consultant">Visa Consultant</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Contact Email *</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Contact Phone</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    placeholder="+1 555-0100"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Years of Experience</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    type="number"
                    placeholder="e.g., 5"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Website</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    placeholder="https://..."
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Languages (comma-separated)</label>
                <input
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                  placeholder="English, Spanish, French"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Bio</label>
                <textarea
                  className="mt-1 w-full rounded-xl border px-4 py-3 text-sm resize-none"
                  rows={3}
                  placeholder="Brief description of your services and experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Credentials */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1B3A]">Credentials & Licenses</h2>
              <p className="text-sm text-gray-600">Add your professional licenses and certifications. These will be verified.</p>

              {credentials.length > 0 && (
                <div className="space-y-2">
                  {credentials.map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <div className="text-sm font-semibold">{c.credential_type}</div>
                        <div className="text-xs text-gray-500">{c.issuing_body}{c.credential_number ? ` • #${c.credential_number}` : ""}</div>
                      </div>
                      <button onClick={() => removeCredential(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border p-4 space-y-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-700">Add a credential</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="Type (e.g., MARA License)"
                    value={credType}
                    onChange={(e) => setCredType(e.target.value)}
                  />
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="Issuing body"
                    value={credIssuer}
                    onChange={(e) => setCredIssuer(e.target.value)}
                  />
                  <input
                    className="rounded-lg border px-3 py-2 text-sm"
                    placeholder="License/cert number (optional)"
                    value={credNumber}
                    onChange={(e) => setCredNumber(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      type="date"
                      title="Issued date"
                      value={credIssued}
                      onChange={(e) => setCredIssued(e.target.value)}
                    />
                    <input
                      className="flex-1 rounded-lg border px-3 py-2 text-sm"
                      type="date"
                      title="Expiry date"
                      value={credExpiry}
                      onChange={(e) => setCredExpiry(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  onClick={addCredential}
                  disabled={!credType || !credIssuer}
                  className="rounded-lg bg-[#0B1B3A] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  + Add Credential
                </button>
              </div>

              <p className="text-xs text-gray-400">You can skip this step and add credentials later.</p>
            </div>
          )}

          {/* Step 3: Service Areas */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1B3A]">Service Areas</h2>
              <p className="text-sm text-gray-600">Which countries and visa types do you cover?</p>

              {serviceAreas.length > 0 && (
                <div className="space-y-2">
                  {serviceAreas.map((a, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                      <div>
                        <div className="text-sm font-semibold">{a.country_name}</div>
                        <div className="text-xs text-gray-500">{a.visa_type_name}</div>
                      </div>
                      <button onClick={() => removeServiceArea(i)} className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-xl border p-4 space-y-3 bg-gray-50">
                <div className="text-sm font-semibold text-gray-700">Add a service area</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="">Select country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2 text-sm"
                    value={selectedVisa}
                    onChange={(e) => setSelectedVisa(e.target.value)}
                  >
                    <option value="">All visa types</option>
                    {visaTypes.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={addServiceArea}
                  disabled={!selectedCountry}
                  className="rounded-lg bg-[#0B1B3A] text-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                >
                  + Add Area
                </button>
              </div>

              <p className="text-xs text-gray-400">You can skip this step and add service areas later.</p>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#0B1B3A]">Review & Submit</h2>
              <p className="text-sm text-gray-600">Please review your information before submitting.</p>

              <div className="space-y-4">
                <div className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Basic Info</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Business:</span> {businessName}</div>
                    <div><span className="text-gray-500">Type:</span> {providerType}</div>
                    <div><span className="text-gray-500">Email:</span> {contactEmail}</div>
                    <div><span className="text-gray-500">Phone:</span> {contactPhone || "—"}</div>
                    <div><span className="text-gray-500">Experience:</span> {yearsExperience ? `${yearsExperience} years` : "—"}</div>
                    <div><span className="text-gray-500">Languages:</span> {languages || "—"}</div>
                  </div>
                  {bio && <div className="mt-2 text-sm text-gray-600">{bio}</div>}
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Credentials ({credentials.length})
                  </div>
                  {credentials.length === 0 ? (
                    <div className="text-sm text-gray-500">None added yet</div>
                  ) : (
                    <ul className="space-y-1">
                      {credentials.map((c, i) => (
                        <li key={i} className="text-sm">{c.credential_type} — {c.issuing_body}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border p-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Service Areas ({serviceAreas.length})
                  </div>
                  {serviceAreas.length === 0 ? (
                    <div className="text-sm text-gray-500">None added yet</div>
                  ) : (
                    <ul className="space-y-1">
                      {serviceAreas.map((a, i) => (
                        <li key={i} className="text-sm">{a.country_name} — {a.visa_type_name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                After submission, your profile will be reviewed by our team. You&apos;ll receive a notification when verified.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold disabled:opacity-40"
            >
              Back
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="rounded-xl bg-[#0B1B3A] text-white px-5 py-3 text-sm font-semibold"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-xl bg-[#0B1B3A] text-white px-6 py-3 text-sm font-semibold disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
