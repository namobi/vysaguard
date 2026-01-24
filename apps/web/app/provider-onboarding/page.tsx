import { Suspense } from "react";
import OnboardingClient from "./OnboardingClient";

export default function ProviderOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center text-gray-600">Loading...</div>}>
      <OnboardingClient />
    </Suspense>
  );
}
