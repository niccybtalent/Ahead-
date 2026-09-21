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
