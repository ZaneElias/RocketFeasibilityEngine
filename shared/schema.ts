import { z } from "zod";

// Rocket Type Enums
export const RocketCategory = z.enum(["model", "industrial"]);
export const ModelRocketType = z.enum(["hobby", "solo_project", "team_project"]);
export const SafetyLevel = z.enum(["beginner", "intermediate", "advanced"]);

// Location Data
export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  country: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  displayName: z.string().optional(),
});

// Rocket Configuration
export const rocketConfigSchema = z.object({
  category: RocketCategory,
  modelType: ModelRocketType.optional(),
  safetyLevel: SafetyLevel.optional(),
});

// Zone Validation Result
export const zoneValidationSchema = z.object({
  isValid: z.boolean(),
  warnings: z.array(z.object({
    type: z.enum(["airport", "school", "military", "urban_dense", "restricted", "other"]),
    message: z.string(),
    distance: z.number().optional(), // distance in meters
  })),
  severity: z.enum(["safe", "caution", "danger"]),
});

// Feasibility Score (0-100)
export const feasibilityScoreSchema = z.object({
  score: z.number().min(0).max(100),
  status: z.enum(["feasible", "caution", "not_recommended"]),
  details: z.string(),
});

// Analysis Categories
export const resourcesAnalysisSchema = z.object({
  materials: feasibilityScoreSchema,
  expertise: feasibilityScoreSchema,
  facilities: feasibilityScoreSchema,
  overall: feasibilityScoreSchema,
});

export const legalAnalysisSchema = z.object({
  permits: feasibilityScoreSchema,
  regulations: feasibilityScoreSchema,
  restrictions: feasibilityScoreSchema,
  overall: feasibilityScoreSchema,
});

export const geographicalAnalysisSchema = z.object({
  terrain: feasibilityScoreSchema,
  weather: feasibilityScoreSchema,
  accessibility: feasibilityScoreSchema,
  overall: feasibilityScoreSchema,
});

export const geopoliticalAnalysisSchema = z.object({
  stability: feasibilityScoreSchema,
  cooperation: feasibilityScoreSchema,
  risks: feasibilityScoreSchema,
  overall: feasibilityScoreSchema,
});

export const timingAnalysisSchema = z.object({
  seasonality: feasibilityScoreSchema,
  currentConditions: feasibilityScoreSchema,
  optimalWindow: z.string(),
  overall: feasibilityScoreSchema,
});

export const practicalityAnalysisSchema = z.object({
  cost: feasibilityScoreSchema,
  timeline: feasibilityScoreSchema,
  successProbability: feasibilityScoreSchema,
  overall: feasibilityScoreSchema,
});

// Complete Analysis Result
export const analysisResultSchema = z.object({
  id: z.string(),
  location: locationSchema,
  rocketConfig: rocketConfigSchema,
  zoneValidation: zoneValidationSchema,
  resources: resourcesAnalysisSchema,
  legal: legalAnalysisSchema,
  geographical: geographicalAnalysisSchema,
  geopolitical: geopoliticalAnalysisSchema,
  timing: timingAnalysisSchema,
  practicality: practicalityAnalysisSchema,
  overallScore: z.number().min(0).max(100),
  recommendation: z.string(),
  createdAt: z.string(),
});

// API Request/Response Types
export const analyzeLocationRequestSchema = z.object({
  location: locationSchema,
  rocketConfig: rocketConfigSchema,
});

export const reverseGeocodeRequestSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

// Type exports
export type RocketCategory = z.infer<typeof RocketCategory>;
export type ModelRocketType = z.infer<typeof ModelRocketType>;
export type SafetyLevel = z.infer<typeof SafetyLevel>;
export type Location = z.infer<typeof locationSchema>;
export type RocketConfig = z.infer<typeof rocketConfigSchema>;
export type ZoneValidation = z.infer<typeof zoneValidationSchema>;
export type FeasibilityScore = z.infer<typeof feasibilityScoreSchema>;
export type ResourcesAnalysis = z.infer<typeof resourcesAnalysisSchema>;
export type LegalAnalysis = z.infer<typeof legalAnalysisSchema>;
export type GeographicalAnalysis = z.infer<typeof geographicalAnalysisSchema>;
export type GeopoliticalAnalysis = z.infer<typeof geopoliticalAnalysisSchema>;
export type TimingAnalysis = z.infer<typeof timingAnalysisSchema>;
export type PracticalityAnalysis = z.infer<typeof practicalityAnalysisSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalyzeLocationRequest = z.infer<typeof analyzeLocationRequestSchema>;
export type ReverseGeocodeRequest = z.infer<typeof reverseGeocodeRequestSchema>;
