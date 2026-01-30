"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ApplicantDashboard } from "@/components/google-studio/ApplicantDashboard";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("User");

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

      // Fetch profile to get full_name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", userId)
        .single();

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
    <ApplicantDashboard
      onLogout={handleLogout}
      userName={userName}
      startInChecklists={build}
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
