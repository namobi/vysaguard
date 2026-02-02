/**
 * API request and response types for VysaGuard
 */

// Provider status check response
export interface ProviderStatusResponse {
  isProvider: boolean;
  isComplete: boolean;
  providerId?: string;
}

// Provider creation response
export interface ProviderCreationResponse {
  success: boolean;
  providerId?: string;
  error?: string;
}

// Auth check response
export interface AuthCheckResponse {
  isAuthenticated: boolean;
  user?: any;
}

// Toast notification type
export interface Toast {
  message: string;
  tone: "success" | "error";
}

// View state type for dashboard
export type ViewState =
  | "dashboard"
  | "checklists"
  | "marketplace"
  | "requests"
  | "notifications"
  | "settings"
  | "find"
  | "playbook"
  | "checklist-preview";

// Dashboard prefill data
export interface DashboardPrefill {
  originCountrySlug: string;
  destinationCountrySlug: string;
  visaTypeSlug: string;
}
