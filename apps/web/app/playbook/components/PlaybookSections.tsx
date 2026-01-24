"use client";

export type PlaybookSection = {
  id: string;
  section_key: string;
  title: string;
  content_json: Record<string, unknown> | string[];
  sort_order: number;
};

type Props = {
  sections: PlaybookSection[];
  themeColor: string;
};

function renderContent(content: Record<string, unknown> | string[]) {
  // If content_json is an array of strings, render as bullet list
  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  // If content_json is an object with "steps" array
  if (content.steps && Array.isArray(content.steps)) {
    return (
      <ol className="space-y-3">
        {(content.steps as string[]).map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
            <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
              {i + 1}
            </span>
            <span className="pt-0.5">{String(step)}</span>
          </li>
        ))}
      </ol>
    );
  }

  // If content_json has "text" field
  if (content.text) {
    return <p className="text-sm text-gray-700 leading-relaxed">{String(content.text)}</p>;
  }

  // If content_json has "items" array of objects with label+description
  if (content.items && Array.isArray(content.items)) {
    return (
      <div className="space-y-3">
        {(content.items as { label?: string; description?: string }[]).map((item, i) => (
          <div key={i} className="border-l-2 border-gray-200 pl-3">
            {item.label && <div className="text-sm font-semibold text-gray-800">{item.label}</div>}
            {item.description && <div className="text-sm text-gray-600 mt-0.5">{item.description}</div>}
          </div>
        ))}
      </div>
    );
  }

  // Fallback: render as JSON
  return (
    <pre className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 overflow-x-auto">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

export default function PlaybookSections({ sections, themeColor }: Props) {
  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">Guidance</div>
      <div className="text-lg font-semibold" style={{ color: themeColor }}>
        Detailed Sections
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl bg-white shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
              >
                {section.section_key.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">{section.title}</h3>
            {renderContent(section.content_json)}
          </div>
        ))}
      </div>
    </div>
  );
}
