"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Login failed");
    } finally {
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
        <Link href="/signup" className="text-sm font-semibold hover:underline">
          Create account
        </Link>
      </header>

      <section className="mx-auto max-w-md px-6 py-10">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="mt-2 text-gray-600">Login to access your dashboard.</p>

        <div className="mt-6 rounded-3xl border p-6 space-y-4">
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
              placeholder="••••••••"
              type="password"
            />
          </div>

          <button
            onClick={onLogin}
            disabled={loading}
            className="w-full rounded-2xl bg-black text-white px-4 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link href="/signup" className="font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}