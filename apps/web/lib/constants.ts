/**
 * Application constants for VysaGuard
 */

// App metadata
export const APP_NAME = "VysaGuard";
export const APP_DESCRIPTION = "Your trusted guide for visa applications";

// Route paths
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  SIGNUP: "/signup",
  PROVIDER_DASHBOARD: "/provider/dashboard",
  PROVIDER_ONBOARDING: "/provider/onboarding",
  PROVIDER_SIGNUP: "/providerSignup",
  CHECKLIST: "/checklist",
  FIND: "/find",
  PLAYBOOK: "/playbook",
  MARKETPLACE: "/marketplace",
  NOTIFICATIONS: "/notifications",
} as const;

// User types
export const USER_TYPES = {
  APPLICANT: "Applicant",
  AGENCY: "Agency",
  VERIFIED_AGENT: "Verified Agent",
} as const;

// Checklist item statuses
export const CHECKLIST_STATUS = {
  TODO: "todo",
  UPLOADED: "uploaded",
  VERIFIED: "verified",
} as const;

// Provider statuses
export const PROVIDER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10485760, // 10MB
  ACCEPTED_TYPES: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  ACCEPTED_MIME_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ],
} as const;

// Toast notification durations
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;
