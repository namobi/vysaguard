/**
 * Pure function for consulate suggestion based on jurisdiction matching.
 *
 * This function takes pre-fetched consulate data and returns a ranked
 * suggestion. It has no side effects and makes no database calls.
 *
 * Scoring logic (from design doc Section 4.1):
 *   - Exact region match (by name or code) → highest confidence
 *   - Country-wide match (region_name IS NULL) → lower confidence
 *   - No jurisdiction match → consulate exists but unverified coverage
 */

import type { Consulate } from "@/types/database";
import type { ConsulateMatchType } from "@/types/api";
import type {
  ConsulateWithJurisdictions,
  SuggestionInput,
  SuggestionResult,
  ScoredConsulate,
} from "./types";

// Score weights for ranking
const SCORE_REGION_MATCH = 100;
const SCORE_COUNTRY_WIDE = 50;
const SCORE_UNVERIFIED = 10;

/**
 * Suggests a consulate based on jurisdiction matching.
 *
 * @param input - Pre-fetched consulates with jurisdictions and user context
 * @returns Ranked suggestion with explanations
 */
export function suggestConsulate(input: SuggestionInput): SuggestionResult {
  const { consulates, residenceRegion, residenceRegionCode, residenceCountryName } = input;

  if (consulates.length === 0) {
    return {
      suggested: null,
      alternatives: [],
      explanation: `We don't have consulate data for this destination in ${residenceCountryName} yet.`,
    };
  }

  const scored: ScoredConsulate[] = consulates.map((c) =>
    scoreConsulate(c, residenceRegion, residenceRegionCode, residenceCountryName)
  );

  // Sort: highest score first, then by jurisdiction priority
  scored.sort((a, b) => b.score - a.score);

  const [first, ...rest] = scored;

  return {
    suggested: first
      ? {
          consulate: stripJurisdictions(first.consulate),
          match_type: first.match_type,
          explanation: first.explanation,
        }
      : null,
    alternatives: rest.map((s) => ({
      consulate: stripJurisdictions(s.consulate),
      match_type: s.match_type,
      explanation: s.explanation,
    })),
    explanation: buildOverallExplanation(scored, residenceCountryName, residenceRegion),
  };
}

function scoreConsulate(
  consulate: ConsulateWithJurisdictions,
  residenceRegion: string | null | undefined,
  residenceRegionCode: string | null | undefined,
  residenceCountryName: string
): ScoredConsulate {
  const activeJurisdictions = consulate.jurisdictions.filter((j) => j.is_active);
  const coveredRegions = activeJurisdictions
    .filter((j) => j.region_name)
    .map((j) => j.region_name!);

  // Try exact region match first
  if (residenceRegion || residenceRegionCode) {
    const regionMatch = activeJurisdictions.find((j) => {
      if (!j.region_name && !j.region_code) return false;
      const nameMatch =
        j.region_name &&
        residenceRegion &&
        j.region_name.toLowerCase() === residenceRegion.toLowerCase();
      const codeMatch =
        j.region_code &&
        residenceRegionCode &&
        j.region_code.toUpperCase() === residenceRegionCode.toUpperCase();
      return nameMatch || codeMatch;
    });

    if (regionMatch) {
      return {
        consulate,
        match_type: "region",
        score: SCORE_REGION_MATCH + (regionMatch.priority || 0),
        explanation: buildExplanation(consulate, "region", residenceRegion, residenceCountryName, coveredRegions),
        coveredRegions,
      };
    }
  }

  // Try country-wide match
  const countryWide = activeJurisdictions.find((j) => j.region_name === null);
  if (countryWide) {
    return {
      consulate,
      match_type: "country_wide",
      score: SCORE_COUNTRY_WIDE + (countryWide.priority || 0),
      explanation: buildExplanation(consulate, "country_wide", residenceRegion, residenceCountryName, coveredRegions),
      coveredRegions,
    };
  }

  // No jurisdiction match — consulate exists but doesn't cover this region
  return {
    consulate,
    match_type: "unverified",
    score: SCORE_UNVERIFIED,
    explanation: buildExplanation(consulate, "unverified", residenceRegion, residenceCountryName, coveredRegions),
    coveredRegions,
  };
}

function buildExplanation(
  consulate: Consulate,
  matchType: ConsulateMatchType,
  residenceRegion: string | null | undefined,
  residenceCountryName: string,
  coveredRegions: string[]
): string {
  const regionList = coveredRegions.length > 0 ? coveredRegions.join(", ") : null;

  if (matchType === "region") {
    const regionText = residenceRegion ? `${residenceRegion}, ${residenceCountryName}` : residenceCountryName;
    const coverageText = regionList
      ? ` This consulate covers ${regionList}.`
      : "";
    return `Based on your residence in ${regionText}, you likely apply through the ${consulate.name} in ${consulate.city}.${coverageText}`;
  }

  if (matchType === "country_wide") {
    return `The ${consulate.name} in ${consulate.city} serves applicants across ${residenceCountryName}. Please verify that your specific region falls under their jurisdiction.`;
  }

  return `We found the ${consulate.name} in ${consulate.city}, but we don't have specific jurisdiction data for your region yet. Please verify directly with the consulate.`;
}

function buildOverallExplanation(
  scored: ScoredConsulate[],
  residenceCountryName: string,
  residenceRegion: string | null | undefined
): string {
  if (scored.length === 0) {
    return `No consulates found in ${residenceCountryName} for this destination.`;
  }

  if (scored.length === 1) {
    return scored[0].explanation;
  }

  const regionText = residenceRegion
    ? `${residenceRegion}, ${residenceCountryName}`
    : residenceCountryName;

  return `We found ${scored.length} consulates that may serve your region in ${regionText}. The ${scored[0].consulate.name} is the most likely match.`;
}

/** Remove jurisdictions array from consulate before returning to API */
function stripJurisdictions(consulate: ConsulateWithJurisdictions | Consulate): Consulate {
  if ("jurisdictions" in consulate) {
    const { jurisdictions: _, ...rest } = consulate as ConsulateWithJurisdictions;
    return rest;
  }
  return consulate;
}
