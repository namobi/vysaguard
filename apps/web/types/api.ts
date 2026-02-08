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

// Consulate suggestion types
export type ConsulateMatchType = "region" | "country_wide" | "unverified";

export interface ConsulateSuggestion {
  consulate: import("./database").Consulate;
  match_type: ConsulateMatchType;
  explanation: string;
}

export interface ConsulateSuggestionResponse {
  suggested: ConsulateSuggestion | null;
  alternatives: ConsulateSuggestion[];
  disclaimer: string;
}

// Residence status type
export type ResidenceStatus =
  | "citizen"
  | "permanent_resident"
  | "work_visa"
  | "student_visa"
  | "dependent_visa"
  | "refugee"
  | "other";
