export type LearningPreferences = {
  minutes: string;
  days: string;
  styles: string[];
  intensity: string;
};

export type AssessmentAnswers = {
  careerStage?: string;
  jobBasics?: {
    jobTitle: string;
    industry: string;
    actualWork: string;
  };
  aiFrequency?: string;
  aiActivities?: string[];
  technicalSkills?: string[];
  technicalDepth?: string;
  careerGoal?: {
    goalText: string;
    targetRole: string;
  };
  priorities?: string[];
  gaps?: string[];
  learning?: LearningPreferences;
  cvIntent?: string;
  outcome?: string;
};

export type Diagnosis = {
  current_profile: {
    summary: string;
    career_stage: string;
    domain: string;
    ai_maturity: string;
    technical_maturity: string;
    commercial_maturity: string;
    leadership_maturity: string;
    builder_maturity: string;
  };
  target_profile: {
    summary: string;
    likely_role_direction: string;
    responsibility_shift: string;
  };
  strengths: Array<{ name: string; evidence: string; why_it_matters: string }>;
  capability_gaps: Array<{ capability: string; priority: "high" | "medium" | "low"; reason: string }>;
  deprioritise: Array<{ skill: string; reason: string }>;
  development_strategy: string;
  desired_outcome: string;
};

export type CurriculumWeek = {
  week_number: number;
  title: string;
  objective: string;
  why_this_matters_for_you: string;
  capabilities_developed: string[];
  output: string;
};

export type Curriculum = {
  programme_title: string;
  programme_goal: string;
  programme_strategy: string;
  weeks: CurriculumWeek[];
};

export type GeneratedPlan = {
  diagnosis: Diagnosis;
  curriculum: Curriculum;
  meta: {
    model: string;
    diagnosis_prompt_version: string;
    curriculum_prompt_version: string;
  };
};

export type WeekSession = {
  day: number;
  title: string;
  minutes: number;
  focus: string;
  steps: string[];
  done_when: string;
};

export type WeekResource = {
  title: string;
  url: string;
  source: string;
  format: "course" | "article" | "video" | "documentation" | "tool" | "book" | "report";
  cost: "free" | "freemium" | "paid";
  time_required: string;
  why_this_one: string;
  use_in_session: number | null;
};

export type WeekDetail = {
  week_number: number;
  title: string;
  intro: string;
  capability_focus: string[];
  sessions: WeekSession[];
  resources: WeekResource[];
  deliverable: {
    brief: string;
    what_good_looks_like: string[];
    how_to_use_it: string;
  };
  checkpoint: string;
  meta: {
    model: string;
    prompt_version: string;
    searched_at: string;
    sources_considered: number;
    resources_dropped: number;
  };
};
