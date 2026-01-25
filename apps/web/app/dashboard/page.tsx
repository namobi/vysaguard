"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ApplicantDashboard } from "@/components/google-studio/ApplicantDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
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
  }, [router]);

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

  return <ApplicantDashboard onLogout={handleLogout} userName={userName} />;
}
