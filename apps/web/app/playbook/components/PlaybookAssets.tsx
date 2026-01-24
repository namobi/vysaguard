"use client";

export type PlaybookAsset = {
  id: string;
  asset_type: string;
  title: string;
  description: string | null;
  file_path: string | null;
  external_url: string | null;
  sort_order: number;
};

type Props = {
  assets: PlaybookAsset[];
  themeColor: string;
};

function getAssetIcon(type: string) {
  switch (type.toLowerCase()) {
    case "pdf":
    case "document":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    case "link":
    case "url":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      );
    case "video":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "form":
    case "template":
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
  }
}

export default function PlaybookAssets({ assets, themeColor }: Props) {
  if (assets.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white shadow-sm border overflow-hidden">
      <div className="px-6 py-5 border-b flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Resources</div>
          <div className="text-lg font-semibold" style={{ color: themeColor }}>
            Helpful Assets
          </div>
        </div>
        <span
          className="text-xs font-semibold rounded-full px-3 py-1"
          style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
        >
          {assets.length}
        </span>
      </div>

      <ul className="divide-y">
        {assets.map((asset) => {
          const url = asset.external_url || asset.file_path;
          const isExternal = !!asset.external_url;

          return (
            <li key={asset.id} className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
                >
                  {getAssetIcon(asset.asset_type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-gray-900">{asset.title}</div>
                    <span className="text-[10px] font-medium text-gray-400 uppercase">
                      {asset.asset_type}
                    </span>
                  </div>
                  {asset.description && (
                    <div className="text-sm text-gray-600 mt-0.5">{asset.description}</div>
                  )}
                  {url && (
                    <a
                      href={url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:underline"
                      style={{ color: themeColor }}
                    >
                      {isExternal ? "Open link" : "Download"}
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
