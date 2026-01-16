import Link from "next/link";

type Playbook = {
  title: string;
  eligibility: string[];
  documents: string[];
  steps: string[];
  rejectionReasons: string[];
};

// Simple mock playbooks (we’ll move to Supabase next)
const PLAYBOOKS: Record<string, Playbook> = {
  "united-states/tourist": {
    title: "United States Tourist Visa (B1/B2)",
    eligibility: [
      "Valid passport",
      "Strong ties to home country (job, family, assets)",
      "Sufficient funds for travel",
    ],
    documents: [
      "Passport (6+ months validity)",
      "DS-160 confirmation",
      "Visa fee receipt (if required)",
      "Passport photo",
      "Bank statements",
      "Employment letter / proof of income",
      "Travel itinerary (optional)",
      "Invitation letter (if applicable)",
    ],
    steps: [
      "Complete DS-160 online",
      "Pay visa fee (if applicable)",
      "Schedule embassy/consulate interview",
      "Prepare documents",
      "Attend interview",
      "Receive decision",
    ],
    rejectionReasons: [
      "Weak ties / suspected immigrant intent",
      "Insufficient financial proof",
      "Inconsistent answers or unclear purpose",
      "Missing/incorrect documents",
    ],
  },
  "canada/tourist": {
    title: "Canada Visitor Visa (TRV)",
    eligibility: ["Valid passport", "Proof of funds", "Ties to home country"],
    documents: [
      "Passport",
      "Application forms",
      "Photo",
      "Bank statements",
      "Purpose of travel letter",
    ],
    steps: ["Create IRCC account", "Submit application", "Biometrics", "Decision"],
    rejectionReasons: ["Insufficient funds", "Weak ties", "Incomplete forms"],
  },
};

function humanizeSlug(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PlaybookPage({
  params,
}: {
  params: { country: string; visa: string };
}) {
  const key = `${params.country}/${params.visa}`;
  const playbook = PLAYBOOKS[key];

  return (
    <main className="min-h-screen bg-white">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl">
          VysaGuard
        </Link>
        <Link href="/find" className="text-sm text-gray-600 hover:underline">
          Back to search
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-14 space-y-8">
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            {humanizeSlug(params.country)} • {humanizeSlug(params.visa)}
          </div>

          <h1 className="text-3xl font-bold">
            {playbook?.title ?? "Visa Playbook (Coming soon)"}
          </h1>

          {!playbook && (
            <p className="text-gray-600">
              We don’t have this playbook yet. Next step is loading playbooks from Supabase.
            </p>
          )}
        </div>

        {playbook && (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <Card title="Eligibility">
                {playbook.eligibility.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </Card>

              <Card title="Required Documents">
                {playbook.documents.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </Card>
            </div>

            <Card title="Application Steps">
              {playbook.steps.map((i, idx) => (
                <li key={i}>
                  {idx + 1}. {i}
                </li>
              ))}
            </Card>

            <Card title="Common Rejection Reasons">
              {playbook.rejectionReasons.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </Card>

            <div className="flex gap-3 pt-2">
              <Link
                href={`/checklist?country=${encodeURIComponent(params.country)}&visa=${encodeURIComponent(
                  params.visa
                )}`}
                className="rounded-xl bg-black text-white px-5 py-3 font-medium"
              >
                Generate checklist
              </Link>

              <Link
                href="/providers"
                className="rounded-xl border border-gray-300 px-5 py-3 font-medium"
              >
                Hire verified help
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6">
      <h2 className="font-semibold text-lg mb-3">{title}</h2>
      <ul className="list-disc list-inside space-y-1 text-gray-700">{children}</ul>
    </div>
  );
}
