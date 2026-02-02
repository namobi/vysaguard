"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      // If email confirmation is ON, user may need to confirm. For MVP, we'll still route.
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignup = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Google signup failed");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-black" />
          <div className="font-semibold text-lg">VysaGuard</div>
        </Link>
        <Link href="/login" className="text-sm font-semibold hover:underline">
          Login
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-gray-600">Start saving checklists and uploads.</p>

        <div className="mt-6 rounded-3xl border p-6 space-y-4">
          {/* Google OAuth Button */}
          <button
            onClick={onGoogleSignup}
            disabled={loading}
            className="w-full rounded-2xl bg-white border-2 border-gray-200 text-gray-700 px-4 py-3 font-semibold hover:bg-gray-50 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              type="email"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Password</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-3 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              type="password"
            />
          </div>

          <button
            onClick={onSignup}
            disabled={loading}
            className="w-full rounded-2xl bg-black text-white px-4 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>

          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold hover:underline">
              Login
            </Link>
          </div>

          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 text-xs text-gray-700">
            If email confirmation is enabled in Supabase, check your inbox and confirm before logging in.
          </div>
        </div>
      </section>
    </main>
  );
}