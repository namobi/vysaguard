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

// Consulate types
export const CONSULATE_TYPES = {
  EMBASSY: "embassy",
  CONSULATE: "consulate",
  VISA_APPLICATION_CENTER: "visa_application_center",
} as const;

// Consulate note types
export const CONSULATE_NOTE_TYPES = {
  ADDITIONAL_DOCUMENT: "additional_document",
  SPECIAL_INSTRUCTION: "special_instruction",
  APPOINTMENT_INFO: "appointment_info",
  FEE_INFO: "fee_info",
  PROCESSING_NOTE: "processing_note",
} as const;

// Residence statuses
export const RESIDENCE_STATUSES = {
  CITIZEN: "citizen",
  PERMANENT_RESIDENT: "permanent_resident",
  WORK_VISA: "work_visa",
  STUDENT_VISA: "student_visa",
  DEPENDENT_VISA: "dependent_visa",
  REFUGEE: "refugee",
  OTHER: "other",
} as const;

// Consulate disclaimer text
export const CONSULATE_DISCLAIMER =
  "Consulate jurisdiction information is provided as guidance only and may change. Please verify directly with the relevant consulate or embassy before submitting your application." as const;
