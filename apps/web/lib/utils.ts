/**
 * Utility functions for the VysaGuard application
 */

/**
 * Format a date string to a short, readable format
 * @param iso ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDateShort(iso?: string | null): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Compute progress percentage from checklist items
 * @param items Array of checklist items with required and status properties
 * @returns Progress percentage (0-100)
 */
export function computeProgress(
  items: Array<{ required: boolean; status: string }>
): number {
  const requiredItems = items.filter((i) => i.required);
  if (requiredItems.length === 0) return 0;
  const completed = requiredItems.filter((i) => i.status !== "todo").length;
  return Math.round((completed / requiredItems.length) * 100);
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Combine class names conditionally
 * @param classes Class names to combine
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
