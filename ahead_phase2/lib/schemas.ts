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

export const WeekRequestSchema = z.object({
  week_number: z.number().int().min(1).max(10),
  assessment: AssessmentSchema,
  diagnosis: DiagnosisSchema,
  curriculum: CurriculumSchema,
});

export const WeekDetailSchema = z.object({
  week_number: z.number().int(),
  title: z.string(),
  intro: z.string(),
  capability_focus: z.array(z.string()),
  sessions: z.array(z.object({
    day: z.number().int(),
    title: z.string(),
    minutes: z.number().int(),
    focus: z.string(),
    steps: z.array(z.string()),
    done_when: z.string(),
  })).min(1),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    source: z.string(),
    format: z.string().transform((v) => v.toLowerCase()).pipe(
      z.enum(["course", "article", "video", "documentation", "tool", "book", "report"])
    ),
    cost: z.string().transform((v) => v.toLowerCase()).pipe(z.enum(["free", "freemium", "paid"])),
    time_required: z.string(),
    why_this_one: z.string(),
    use_in_session: z.number().int().nullable(),
  })),
  deliverable: z.object({
    brief: z.string(),
    what_good_looks_like: z.array(z.string()),
    how_to_use_it: z.string(),
  }),
  checkpoint: z.string(),
});

export const WEEK_DETAIL_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["week_number", "title", "intro", "capability_focus", "sessions", "resources", "deliverable", "checkpoint"],
  properties: {
    week_number: { type: "integer" },
    title: { type: "string" },
    intro: { type: "string" },
    capability_focus: { type: "array", items: { type: "string" } },
    sessions: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["day", "title", "minutes", "focus", "steps", "done_when"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          minutes: { type: "integer" },
          focus: { type: "string" },
          steps: { type: "array", items: { type: "string" } },
          done_when: { type: "string" },
        },
      },
    },
    resources: {
      type: "array",
      items: {
        type: "object", additionalProperties: false,
        required: ["title", "url", "source", "format", "cost", "time_required", "why_this_one", "use_in_session"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
          source: { type: "string" },
          format: { type: "string", enum: ["course", "article", "video", "documentation", "tool", "book", "report"] },
          cost: { type: "string", enum: ["free", "freemium", "paid"] },
          time_required: { type: "string" },
          why_this_one: { type: "string" },
          use_in_session: { type: ["integer", "null"] },
        },
      },
    },
    deliverable: {
      type: "object", additionalProperties: false,
      required: ["brief", "what_good_looks_like", "how_to_use_it"],
      properties: {
        brief: { type: "string" },
        what_good_looks_like: { type: "array", items: { type: "string" } },
        how_to_use_it: { type: "string" },
      },
    },
    checkpoint: { type: "string" },
  },
} as const;
