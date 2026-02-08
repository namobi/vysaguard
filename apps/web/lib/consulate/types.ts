/**
 * Internal types for the consulate suggestion algorithm.
 * These are used by suggestConsulate.ts and the API layer.
 */

import type { Consulate, ConsulateJurisdiction } from "@/types/database";
import type { ConsulateMatchType } from "@/types/api";

/** A consulate with its jurisdiction rows pre-fetched */
export interface ConsulateWithJurisdictions extends Consulate {
  jurisdictions: ConsulateJurisdiction[];
}

/** Input to the suggestion algorithm (all pre-fetched data, no DB calls) */
export interface SuggestionInput {
  /** All active consulates for (destination, host_country) with jurisdictions */
  consulates: ConsulateWithJurisdictions[];
  /** User's residence region (free text, optional) */
  residenceRegion?: string | null;
  /** User's residence region ISO 3166-2 code (optional) */
  residenceRegionCode?: string | null;
  /** User's residence country name (for explanation text) */
  residenceCountryName: string;
}

/** A scored consulate match from the algorithm */
export interface ScoredConsulate {
  consulate: Consulate;
  match_type: ConsulateMatchType;
  score: number;
  explanation: string;
  coveredRegions: string[];
}

/** Output of the suggestion algorithm */
export interface SuggestionResult {
  suggested: {
    consulate: Consulate;
    match_type: ConsulateMatchType;
    explanation: string;
  } | null;
  alternatives: {
    consulate: Consulate;
    match_type: ConsulateMatchType;
    explanation: string;
  }[];
  explanation: string;
}
