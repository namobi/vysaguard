"use client";

export type PlaybookMetaData = {
  id: string;
  processing_time_text: string | null;
  typical_cost_text: string | null;
  refusal_reasons: string[];
  updated_at: string;
};

type Props = {
  meta: PlaybookMetaData;
  themeColor: string;
};

export default function PlaybookMeta({ meta, themeColor }: Props) {
  const hasProcessingTime = !!meta.processing_time_text;
  const hasCost = !!meta.typical_cost_text;
  const hasRefusalReasons = meta.refusal_reasons.length > 0;

  if (!hasProcessingTime && !hasCost && !hasRefusalReasons) return null;

  return (
    <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
      <div className="px-6 py-5 border-b">
        <div className="text-sm text-gray-500">At a glance</div>
        <div className="text-lg font-semibold" style={{ color: themeColor }}>
          Key Information
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Processing Time */}
        {hasProcessingTime && (
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Processing Time</div>
              <div className="text-sm text-gray-600 mt-0.5">{meta.processing_time_text}</div>
            </div>
          </div>
        )}

        {/* Typical Cost */}
        {hasCost && (
          <div className="flex items-start gap-3">
            <div
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Typical Cost</div>
              <div className="text-sm text-gray-600 mt-0.5">{meta.typical_cost_text}</div>
            </div>
          </div>
        )}

        {/* Refusal Reasons */}
        {hasRefusalReasons && (
          <div>
            <div className="flex items-start gap-3 mb-3">
              <div
                className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-sm font-semibold text-gray-900">Common Refusal Reasons</div>
            </div>
            <ul className="space-y-2 pl-12">
              {meta.refusal_reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 border-t">
        <div className="text-xs text-gray-400">
          Last updated: {new Date(meta.updated_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}
