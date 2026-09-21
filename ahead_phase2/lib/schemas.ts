import { z } from "zod";

export const AssessmentSchema = z.object({
  careerStage: z.string().optional(),
  jobBasics: z.object({
    jobTitle: z.string(),
    industry: z.string(),
    actualWork: z.string(),
  }).optional(),
  aiFrequency: z.string().optional(),
  aiActivities: z.array(z.string()).optional(),
  technicalSkills: z.array(z.string()).optional(),
  technicalDepth: z.string().optional(),
  careerGoal: z.object({ goalText: z.string(), targetRole: z.string() }).optional(),
  priorities: z.array(z.string()).optional(),
  gaps: z.array(z.string()).optional(),
  learning: z.object({
    minutes: z.string(),
    days: z.string(),
    styles: z.array(z.string()),
    intensity: z.string(),
  }).optional(),
  cvIntent: z.string().optional(),
  outcome: z.string().optional(),
});

export const DiagnosisSchema = z.object({
  current_profile: z.object({
    summary: z.string(),
    career_stage: z.string(),
    domain: z.string(),
    ai_maturity: z.string(),
    technical_maturity: z.string(),
    commercial_maturity: z.string(),
    leadership_maturity: z.string(),
    builder_maturity: z.string(),
  }),
  target_profile: z.object({
    summary: z.string(),
    likely_role_direction: z.string(),
    responsibility_shift: z.string(),
  }),
  strengths: z.array(z.object({ name: z.string(), evidence: z.string(), why_it_matters: z.string() })),
  capability_gaps: z.array(z.object({
    capability: z.string(),
    priority: z.string().transform((value) => value.toLowerCase()).pipe(z.enum(["high", "medium", "low"])),
    reason: z.string(),
  })),
  deprioritise: z.array(z.object({ skill: z.string(), reason: z.string() })),
  development_strategy: z.string(),
  desired_outcome: z.string(),
});

export const CurriculumSchema = z.object({
  programme_title: z.string(),
  programme_goal: z.string(),
  programme_strategy: z.string(),
  weeks: z.array(z.object({
    week_number: z.number().int(),
    title: z.string(),
    objective: z.string(),
    why_this_matters_for_you: z.string(),
    capabilities_developed: z.array(z.string()),
    output: z.string(),
  })).length(10),
});

export const DIAGNOSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["current_profile", "target_profile", "strengths", "capability_gaps", "deprioritise", "development_strategy", "desired_outcome"],
  properties: {
    current_profile: {
      type: "object", additionalProperties: false,
      required: ["summary", "career_stage", "domain", "ai_maturity", "technical_maturity", "commercial_maturity", "leadership_maturity", "builder_maturity"],
      properties: {
        summary: { type: "string" }, career_stage: { type: "string" }, domain: { type: "string" }, ai_maturity: { type: "string" },
        technical_maturity: { type: "string" }, commercial_maturity: { type: "string" }, leadership_maturity: { type: "string" }, builder_maturity: { type: "string" }
      }
    },
    target_profile: {
      type: "object", additionalProperties: false,
      required: ["summary", "likely_role_direction", "responsibility_shift"],
      properties: { summary: { type: "string" }, likely_role_direction: { type: "string" }, responsibility_shift: { type: "string" } }
    },
    strengths: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["name", "evidence", "why_it_matters"], properties: { name: { type: "string" }, evidence: { type: "string" }, why_it_matters: { type: "string" } } }
    },
    capability_gaps: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["capability", "priority", "reason"], properties: { capability: { type: "string" }, priority: { type: "string", enum: ["high", "medium", "low"] }, reason: { type: "string" } } }
    },
    deprioritise: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["skill", "reason"], properties: { skill: { type: "string" }, reason: { type: "string" } } }
    },
    development_strategy: { type: "string" },
    desired_outcome: { type: "string" }
  }
} as const;

export const CURRICULUM_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["programme_title", "programme_goal", "programme_strategy", "weeks"],
  properties: {
    programme_title: { type: "string" }, programme_goal: { type: "string" }, programme_strategy: { type: "string" },
    weeks: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["week_number", "title", "objective", "why_this_matters_for_you", "capabilities_developed", "output"],
        properties: {
          week_number: { type: "integer" }, title: { type: "string" }, objective: { type: "string" }, why_this_matters_for_you: { type: "string" },
          capabilities_developed: { type: "array", items: { type: "string" } }, output: { type: "string" }
        }
      }
    }
  }
} as const;
