import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
        <div className="font-semibold text-xl">VysaGuard</div>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="hover:underline" href="/find">
            Find requirements
          </Link>
          <Link className="hover:underline" href="/providers">
            Providers
          </Link>
          <Link className="rounded-full bg-black text-white px-4 py-2" href="/find">
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Visa requirements, checklists, and verified help — in one secure place.
            </h1>

            <p className="text-lg text-gray-600">
              VysaGuard helps you understand visa requirements, organize your documents, and hire
              verified agents/lawyers with in-app protection against scams.
            </p>

            <div className="flex gap-3">
              <Link href="/find" className="rounded-xl bg-black text-white px-5 py-3 font-medium">
                Find visa requirements
              </Link>
              <Link href="/providers" className="rounded-xl border border-gray-300 px-5 py-3 font-medium">
                Browse verified providers
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-gray-50 p-6">
            <div className="text-sm text-gray-600 mb-3">Quick start</div>

            <div className="space-y-3">
              <div className="rounded-xl bg-white border p-4">
                <div className="font-semibold">1) Choose destination</div>
                <div className="text-gray-600 text-sm">Country + visa type</div>
              </div>

              <div className="rounded-xl bg-white border p-4">
                <div className="font-semibold">2) Get checklist</div>
                <div className="text-gray-600 text-sm">Required + optional documents</div>
              </div>

              <div className="rounded-xl bg-white border p-4">
                <div className="font-semibold">3) Hire verified help (optional)</div>
                <div className="text-gray-600 text-sm">Escrow milestones + dispute protection</div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm">
              <div className="font-semibold">Safety notice</div>
              <div className="text-gray-700">
                Payments outside the app are <b>not refundable</b> and are at your own risk.
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
        © {new Date().getFullYear()} VysaGuard. Built for trust and clarity.
      </footer>
    </main>
  );
}
