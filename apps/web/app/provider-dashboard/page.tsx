"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ProviderProfile = {
  id: string;
  business_name: string;
  contact_email: string;
  provider_type: string;
  status: string;
  years_experience: number | null;
  languages: string[];
  created_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
};

type CredentialRow = {
  id: string;
  credential_type: string;
  issuing_body: string;
  is_verified: boolean;
};

type ServiceAreaRow = {
  id: string;
  country_id: string;
  visa_type_id: string | null;
  countries: { name: string } | null;
  visa_types: { name: string } | null;
};

type RequestRow = {
  id: string;
  applicant_id: string;
  subject: string;
  message: string | null;
  status: string;
  provider_note: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending Review", color: "#92400E", bg: "#FEF3C7" },
  under_review: { label: "Under Review", color: "#1E40AF", bg: "#DBEAFE" },
  verified: { label: "Verified", color: "#065F46", bg: "#D1FAE5" },
  suspended: { label: "Suspended", color: "#991B1B", bg: "#FEE2E2" },
  rejected: { label: "Rejected", color: "#991B1B", bg: "#FEE2E2" },
};

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [credentials, setCredentials] = useState<CredentialRow[]>([]);
  const [serviceAreas, setServiceAreas] = useState<ServiceAreaRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      // Load provider profile
      const { data: prov, error: pErr } = await supabase
        .from("providers")
        .select("id,business_name,contact_email,provider_type,status,years_experience,languages,created_at,verified_at,rejection_reason")
        .maybeSingle();

      if (pErr) {
        console.error("Provider load error:", pErr);
        setLoading(false);
        return;
      }

      if (!prov) {
        // No provider profile, redirect to onboarding
        router.replace("/provider-onboarding");
        return;
      }

      setProvider(prov as ProviderProfile);

      // Load credentials and service areas
      const [credRes, areaRes] = await Promise.all([
        supabase
          .from("provider_credentials")
          .select("id,credential_type,issuing_body,is_verified")
          .eq("provider_id", prov.id),
        supabase
          .from("provider_service_areas")
          .select("id,country_id,visa_type_id,countries(name),visa_types(name)")
          .eq("provider_id", prov.id)
          .eq("is_active", true),
      ]);

      if (credRes.data) setCredentials(credRes.data as CredentialRow[]);
      if (areaRes.data) setServiceAreas(areaRes.data as any[]);

      // Fetch incoming requests
      const reqRes = await fetch("/api/assistance-requests?role=provider", {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests ?? []);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleRespond = async (requestId: string, status: "accepted" | "declined" | "completed") => {
    try {
      setRespondingId(requestId);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;

      const res = await fetch(`/api/assistance-requests/${requestId}/respond`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status } : r))
        );
      } else {
        const data = await res.json();
        alert(data.error || "Failed to respond.");
      }
    } catch (err) {
      console.error(err);
      alert("Response failed.");
    } finally {
      setRespondingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-gray-600">Loading provider dashboard...</div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">No provider profile found.</div>
          <Link href="/provider-onboarding" className="rounded-xl bg-[#0B1B3A] text-white px-5 py-3 text-sm font-semibold">
            Start Onboarding
          </Link>
        </div>
      </main>
    );
  }

  const statusCfg = STATUS_CONFIG[provider.status] ?? STATUS_CONFIG.pending;

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <header className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#0B1B3A] shadow-sm flex items-center justify-center text-white font-bold">V</div>
          <div>
            <div className="text-lg font-semibold text-[#0B1B3A]">VysaGuard</div>
            <div className="text-xs text-gray-500">Provider Portal</div>
          </div>
        </div>
        <button onClick={onLogout} className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-gray-50">
          Logout
        </button>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 space-y-6">
        {/* Status Card */}
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500">Provider Dashboard</div>
              <h1 className="text-2xl font-bold text-[#0B1B3A]">{provider.business_name}</h1>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="text-xs font-semibold rounded-full px-3 py-1"
                  style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}
                >
                  {statusCfg.label}
                </span>
                <span className="text-sm text-gray-500 capitalize">{provider.provider_type}</span>
              </div>

              {provider.status === "rejected" && provider.rejection_reason && (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-800">
                  <span className="font-semibold">Reason:</span> {provider.rejection_reason}
                </div>
              )}

              {provider.status === "pending" && (
                <div className="mt-3 text-sm text-gray-600">
                  Your application is being reviewed. You&apos;ll be notified once verified.
                </div>
              )}

              {provider.status === "verified" && (
                <div className="mt-3 text-sm text-green-700">
                  Your profile is live on the marketplace. Applicants can now find you.
                </div>
              )}
            </div>

            <div className="shrink-0 text-right text-sm text-gray-500">
              <div>Joined {new Date(provider.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
              {provider.verified_at && (
                <div className="text-green-600">Verified {new Date(provider.verified_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Details */}
          <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="px-6 py-5 border-b">
              <div className="text-sm text-gray-500">Profile</div>
              <div className="text-lg font-semibold text-[#0B1B3A]">Your Details</div>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{provider.contact_email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Experience</span><span>{provider.years_experience ? `${provider.years_experience} years` : "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Languages</span><span>{provider.languages.length ? provider.languages.join(", ") : "—"}</span></div>
            </div>
          </div>

          {/* Credentials */}
          <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Verification</div>
                <div className="text-lg font-semibold text-[#0B1B3A]">Credentials</div>
              </div>
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-gray-100">{credentials.length}</span>
            </div>
            <div className="p-6">
              {credentials.length === 0 ? (
                <div className="text-sm text-gray-500">No credentials added yet.</div>
              ) : (
                <ul className="space-y-3">
                  {credentials.map((c) => (
                    <li key={c.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{c.credential_type}</div>
                        <div className="text-xs text-gray-500">{c.issuing_body}</div>
                      </div>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${c.is_verified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {c.is_verified ? "Verified" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Service Areas */}
        <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Coverage</div>
              <div className="text-lg font-semibold text-[#0B1B3A]">Service Areas</div>
            </div>
            <span className="text-xs font-semibold rounded-full px-3 py-1 bg-gray-100">{serviceAreas.length}</span>
          </div>
          <div className="p-6">
            {serviceAreas.length === 0 ? (
              <div className="text-sm text-gray-500">No service areas configured.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((a) => (
                  <span key={a.id} className="rounded-xl border px-3 py-2 text-sm">
                    {(a.countries as any)?.name ?? "Unknown"}{a.visa_types ? ` • ${(a.visa_types as any).name}` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assistance Requests */}
        <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Incoming</div>
              <div className="text-lg font-semibold text-[#0B1B3A]">Assistance Requests</div>
            </div>
            <span className="text-xs font-semibold rounded-full px-3 py-1 bg-gray-100">
              {requests.filter((r) => r.status === "pending").length} pending
            </span>
          </div>
          <div>
            {requests.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No requests yet. They&apos;ll appear here when applicants reach out.</div>
            ) : (
              <ul className="divide-y">
                {requests.map((r) => (
                  <li key={r.id} className="px-6 py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[#0B1B3A]">{r.subject}</div>
                        {r.message && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{r.message}</div>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                          <span>{new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                          <span className={`font-semibold rounded-full px-2 py-0.5 ${
                            r.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            r.status === "accepted" ? "bg-green-100 text-green-700" :
                            r.status === "declined" ? "bg-red-100 text-red-700" :
                            r.status === "completed" ? "bg-purple-100 text-purple-700" :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {r.status}
                          </span>
                        </div>
                      </div>
                      {r.status === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleRespond(r.id, "accepted")}
                            disabled={respondingId === r.id}
                            className="rounded-xl bg-green-600 text-white px-3 py-2 text-xs font-semibold disabled:opacity-60 hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRespond(r.id, "declined")}
                            disabled={respondingId === r.id}
                            className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-semibold disabled:opacity-60 hover:bg-gray-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {r.status === "accepted" && (
                        <button
                          onClick={() => handleRespond(r.id, "completed")}
                          disabled={respondingId === r.id}
                          className="rounded-xl bg-purple-600 text-white px-3 py-2 text-xs font-semibold disabled:opacity-60 hover:bg-purple-700 shrink-0"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
