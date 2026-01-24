"use client";

type Props = {
  currentVersion: number;
  latestVersion: number;
  changeSummary: string | null;
  onSync: () => void;
  syncing: boolean;
};

export default function VersionSyncBanner({
  currentVersion,
  latestVersion,
  changeSummary,
  onSync,
  syncing,
}: Props) {
  if (latestVersion <= currentVersion) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="text-sm font-semibold text-blue-900">
              Template updated (v{currentVersion} → v{latestVersion})
            </div>
          </div>
          {changeSummary && (
            <div className="mt-1 text-sm text-blue-800">{changeSummary}</div>
          )}
          <div className="mt-2 text-xs text-blue-600">
            New items will be added. Your existing progress is preserved.
          </div>
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          className="shrink-0 rounded-xl bg-blue-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>
    </div>
  );
}
