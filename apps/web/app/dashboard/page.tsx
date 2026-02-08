"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ApplicantDashboard } from "@/components/features/ApplicantDashboard";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("User");
  const [isProvider, setIsProvider] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const qs = searchParams.toString();
        const nextPath = `/dashboard${qs ? `?${qs}` : ""}`;
        router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      const userId = sessionData.session.user.id;

      // Fetch profile to get full_name, is_provider, and check completeness
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_provider, passport_nationality_id, residence_country_id")
        .eq("user_id", userId)
        .single();

      // Set provider status
      setIsProvider(profile?.is_provider || false);

      // Check if required profile fields are filled
      const isComplete = !!(profile?.full_name && profile?.passport_nationality_id && profile?.residence_country_id);
      setProfileIncomplete(!isComplete);

      // If user is a provider and not explicitly viewing as applicant, redirect to provider dashboard
      // Providers can still access /dashboard if they explicitly navigate there (e.g., via "Switch to User View")
      const viewAsApplicant = searchParams.get('view') === 'applicant';
      if (profile?.is_provider && !viewAsApplicant) {
        // Only redirect if there's no specific query params (like build, prefill, etc.)
        const hasQueryParams = Array.from(searchParams.keys()).length > 0;
        if (!hasQueryParams) {
          router.replace('/provider/dashboard');
          return;
        }
      }

      if (profile?.full_name) {
        // Extract first name from full_name
        const firstName = profile.full_name.split(" ")[0];
        setUserName(firstName);
      } else {
        // Fallback to email prefix if no profile
        const email = sessionData.session.user.email ?? "";
        if (email.includes("@")) {
          const prefix = email.split("@")[0];
          setUserName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
        }
      }

      setCheckingAuth(false);
    };

    checkSessionAndFetchProfile();
  }, [router, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  const build = searchParams.get("build") === "1";
  const origin_country_slug = searchParams.get("origin_country_slug") || "";
  const destination_country_slug = searchParams.get("destination_country_slug") || "";
  const visa_type_slug = searchParams.get("visa_type_slug") || "";

  return (
    <>
      {/* Provider View Switcher Banner */}
      {isProvider && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">You are viewing as an applicant</span>
          </div>
          <button
            onClick={() => router.push('/provider/dashboard')}
            className="text-sm font-semibold bg-white text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Switch to Provider View
          </button>
        </div>
      )}
      <div className={isProvider ? "pt-12" : ""}>
        <ApplicantDashboard
          onLogout={handleLogout}
          userName={userName}
          startInChecklists={build}
          profileIncomplete={profileIncomplete}
          prefill={
            origin_country_slug && destination_country_slug && visa_type_slug
              ? {
                  originCountrySlug: origin_country_slug,
                  destinationCountrySlug: destination_country_slug,
                  visaTypeSlug: visa_type_slug,
                }
              : null
          }
        />
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
