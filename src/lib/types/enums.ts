/**
 * HIDDEN INDIA — CORE EDITORIAL & EVIDENCE ENUMS
 * Strict typing across database schemas, CMS, and frontend presentation.
 */

/**
 * Editorial workflow status for destinations and historical entries.
 */
export const EditorialStatus = {
  DRAFT: 'draft',
  RESEARCHING: 'researching',
  NEEDS_REVIEW: 'needs_review',
  VERIFIED: 'verified',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type EditorialStatusType = (typeof EditorialStatus)[keyof typeof EditorialStatus];

/**
 * Evidence classification standard.
 * Prevents folklore and local beliefs from being displayed as verified historical facts.
 */
export const EvidenceClassification = {
  DOCUMENTED: 'DOCUMENTED',         // Supported by official, archaeological, academic or archival sources
  LOCAL_TRADITION: 'LOCAL_TRADITION', // Oral traditions, local beliefs, folklore
  DISPUTED: 'DISPUTED',             // Credible historical sources disagree
  UNKNOWN: 'UNKNOWN',               // Insufficient reliable historical evidence
} as const;

export type EvidenceClassificationType =
  (typeof EvidenceClassification)[keyof typeof EvidenceClassification];

/**
 * Source citation types for strict attribution.
 */
export const SourceType = {
  GOVERNMENT: 'GOVERNMENT',
  ARCHAEOLOGICAL: 'ARCHAEOLOGICAL',
  ACADEMIC: 'ACADEMIC',
  MUSEUM: 'MUSEUM',
  OFFICIAL_TOURISM: 'OFFICIAL_TOURISM',
  ARCHIVAL: 'ARCHIVAL',
  NEWS: 'NEWS',
  OTHER: 'OTHER',
} as const;

export type SourceTypeType = (typeof SourceType)[keyof typeof SourceType];

/**
 * Destination physical accessibility & difficulty level.
 */
export const DifficultyLevel = {
  EASY: 'easy',
  MODERATE: 'moderate',
  CHALLENGING: 'challenging',
  STRENUOUS: 'strenuous',
} as const;

export type DifficultyLevelType = (typeof DifficultyLevel)[keyof typeof DifficultyLevel];

/**
 * Vehicle types supported by the practical trip engine.
 */
export const VehicleType = {
  PETROL_CAR: 'petrol_car',
  DIESEL_CAR: 'diesel_car',
  CNG_CAR: 'cng_car',
  MOTORCYCLE: 'motorcycle',
  EV: 'ev',
} as const;

export type VehicleTypeType = (typeof VehicleType)[keyof typeof VehicleType];
