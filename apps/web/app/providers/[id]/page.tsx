"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ProviderDetail = {
  id: string;
  business_name: string;
  bio: string | null;
  provider_type: string;
  years_experience: number | null;
  languages: string[];
  website_url: string | null;
  verified_at: string | null;
};

type ServiceArea = {
  countries: { name: string } | null;
  visa_types: { name: string } | null;
};

type Credential = {
  credential_type: string;
  issuing_body: string;
  is_verified: boolean;
};

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  reviewer_id: string;
};

export default function ProviderProfilePage() {
  const params = useParams();
  const providerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Request Assistance form
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubject, setRequestSubject] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Provider profile
      const { data: prov } = await supabase
        .from("providers")
        .select("id,business_name,bio,provider_type,years_experience,languages,website_url,verified_at")
        .eq("id", providerId)
        .eq("status", "verified")
        .maybeSingle();

      if (!prov) {
        setLoading(false);
        return;
      }
      setProvider(prov as ProviderDetail);

      // Load service areas, credentials, and reviews in parallel
      const [areaRes, credRes, revRes] = await Promise.all([
        supabase
          .from("provider_service_areas")
          .select("countries(name),visa_types(name)")
          .eq("provider_id", providerId)
          .eq("is_active", true),
        supabase
          .from("provider_credentials")
          .select("credential_type,issuing_body,is_verified")
          .eq("provider_id", providerId),
        supabase
          .from("provider_reviews")
          .select("id,rating,title,body,created_at,reviewer_id")
          .eq("provider_id", providerId)
          .order("created_at", { ascending: false }),
      ]);

      if (areaRes.data) setServiceAreas(areaRes.data as any[]);
      if (credRes.data) setCredentials(credRes.data as Credential[]);
      if (revRes.data) {
        setReviews(revRes.data as Review[]);
        if (revRes.data.length > 0) {
          const avg = revRes.data.reduce((s: number, r: any) => s + r.rating, 0) / revRes.data.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      }

      setLoading(false);
    };
    load();
  }, [providerId]);

  const handleSubmitReview = async () => {
    try {
      setSubmittingReview(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        alert("Please login to leave a review.");
        return;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          provider_id: providerId,
          rating: reviewRating,
          title: reviewTitle || undefined,
          body: reviewBody || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit review.");
        return;
      }

      // Refresh reviews
      const { data: revs } = await supabase
        .from("provider_reviews")
        .select("id,rating,title,body,created_at,reviewer_id")
        .eq("provider_id", providerId)
        .order("created_at", { ascending: false });

      if (revs) {
        setReviews(revs as Review[]);
        if (revs.length > 0) {
          const avg = revs.reduce((s: number, r: any) => s + r.rating, 0) / revs.length;
          setAvgRating(Math.round(avg * 10) / 10);
        }
      }

      setShowReviewForm(false);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
    } catch (err) {
      console.error(err);
      alert("Review submission failed.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setSubmittingRequest(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        alert("Please login to request assistance.");
        return;
      }

      const res = await fetch("/api/assistance-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          provider_id: providerId,
          subject: requestSubject,
          message: requestMessage || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit request.");
        return;
      }

      setRequestSuccess(true);
      setRequestSubject("");
      setRequestMessage("");
    } catch (err) {
      console.error(err);
      alert("Request submission failed.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
        <div className="text-gray-600">Loading provider...</div>
      </main>
    );
  }

  if (!provider) {
    return (
      <main className="min-h-screen bg-[#F5F7FB]">
        <header className="mx-auto max-w-5xl px-6 py-6">
          <Link href="/providers" className="text-sm text-gray-600 hover:underline">← Back to providers</Link>
        </header>
        <div className="mx-auto max-w-5xl px-6 text-center py-20">
          <div className="text-xl font-bold text-gray-700">Provider not found</div>
          <div className="mt-2 text-gray-500">This provider may not exist or isn&apos;t verified yet.</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F7FB]">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl text-[#0B1B3A]">VysaGuard</Link>
        <Link href="/providers" className="text-sm text-gray-600 hover:underline">← All providers</Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 space-y-6">
        {/* Hero */}
        <div className="rounded-3xl bg-white shadow-sm border p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500 capitalize">{provider.provider_type}</div>
              <h1 className="text-2xl font-bold text-[#0B1B3A]">{provider.business_name}</h1>
              {provider.bio && <p className="mt-2 text-gray-600">{provider.bio}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {avgRating && (
                  <div className="flex items-center gap-1.5 bg-yellow-50 rounded-lg px-3 py-1.5">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-yellow-700">{avgRating}</span>
                    <span className="text-xs text-gray-500">({reviews.length} reviews)</span>
                  </div>
                )}
                {provider.years_experience && (
                  <span className="text-sm text-gray-500">{provider.years_experience}+ years experience</span>
                )}
                {provider.verified_at && (
                  <span className="text-xs font-semibold rounded-full px-3 py-1 bg-green-100 text-green-700">Verified</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { setShowRequestForm((v) => !v); setRequestSuccess(false); }}
              className="rounded-xl bg-[#0B1B3A] text-white px-5 py-3 text-sm font-semibold hover:opacity-95"
            >
              Request Assistance
            </button>
            <button
              onClick={() => setShowReviewForm((v) => !v)}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-50"
            >
              Write a Review
            </button>
            {provider.website_url && (
              <a
                href={provider.website_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-50"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="rounded-3xl bg-white shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0B1B3A]">Write a Review</h3>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Rating</label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setReviewRating(n)}
                    className="text-2xl"
                  >
                    <svg className={`w-7 h-7 ${n <= reviewRating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Title (optional)</label>
              <input
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                placeholder="Brief summary"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Review</label>
              <textarea
                className="mt-1 w-full rounded-xl border px-4 py-3 text-sm resize-none"
                rows={3}
                placeholder="Share your experience..."
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
              />
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className="rounded-xl bg-[#0B1B3A] text-white px-5 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {/* Request Assistance Form */}
        {showRequestForm && (
          <div className="rounded-3xl bg-white shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-bold text-[#0B1B3A]">Request Assistance</h3>
            {requestSuccess ? (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <div className="text-sm font-semibold text-green-800">Request sent!</div>
                <div className="text-sm text-green-700 mt-1">
                  The provider will be notified and can accept or respond to your request.
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Subject *</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm"
                    placeholder="e.g., Need help with UK Skilled Worker visa documents"
                    value={requestSubject}
                    onChange={(e) => setRequestSubject(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Message (optional)</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border px-4 py-3 text-sm resize-none"
                    rows={4}
                    placeholder="Describe what you need help with..."
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest || !requestSubject.trim()}
                  className="rounded-xl bg-[#0B1B3A] text-white px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {submittingRequest ? "Sending..." : "Send Request"}
                </button>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details */}
          <div className="space-y-6">
            {/* Service Areas */}
            <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
              <div className="px-6 py-5 border-b">
                <div className="text-sm text-gray-500">Coverage</div>
                <div className="text-lg font-semibold text-[#0B1B3A]">Service Areas</div>
              </div>
              <div className="p-6">
                {serviceAreas.length === 0 ? (
                  <div className="text-sm text-gray-500">No service areas listed.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {serviceAreas.map((a, i) => (
                      <span key={i} className="rounded-xl border px-3 py-2 text-sm">
                        {(a.countries as any)?.name ?? "Unknown"}{a.visa_types ? ` • ${(a.visa_types as any).name}` : ""}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Credentials */}
            <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
              <div className="px-6 py-5 border-b">
                <div className="text-sm text-gray-500">Verification</div>
                <div className="text-lg font-semibold text-[#0B1B3A]">Credentials</div>
              </div>
              <div className="p-6">
                {credentials.length === 0 ? (
                  <div className="text-sm text-gray-500">No credentials listed.</div>
                ) : (
                  <ul className="space-y-3">
                    {credentials.map((c, i) => (
                      <li key={i} className="flex items-center justify-between">
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

            {/* Languages */}
            {provider.languages.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border p-6">
                <div className="text-sm text-gray-500 mb-2">Languages</div>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((l, i) => (
                    <span key={i} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm">{l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Feedback</div>
                <div className="text-lg font-semibold text-[#0B1B3A]">Reviews</div>
              </div>
              <span className="text-xs font-semibold rounded-full px-3 py-1 bg-gray-100">{reviews.length}</span>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {reviews.length === 0 ? (
                <div className="p-6 text-sm text-gray-500">No reviews yet. Be the first!</div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <svg key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    {r.title && <div className="text-sm font-semibold text-gray-900">{r.title}</div>}
                    {r.body && <div className="text-sm text-gray-600 mt-1">{r.body}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
