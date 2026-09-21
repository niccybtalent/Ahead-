import { NextResponse } from "next/server";
import { AssessmentSchema, CurriculumSchema, DiagnosisSchema, CURRICULUM_JSON_SCHEMA, DIAGNOSIS_JSON_SCHEMA } from "@/lib/schemas";
import { getAnthropic, getAnthropicModel, textFromMessage } from "@/lib/anthropic";
import { diagnosisSystemPrompt, diagnosisUserPrompt, DIAGNOSIS_PROMPT_VERSION } from "@/lib/prompts/diagnosis";
import { curriculumSystemPrompt, curriculumUserPrompt, CURRICULUM_PROMPT_VERSION } from "@/lib/prompts/curriculum";

export const runtime = "nodejs";
// Two sequential Claude calls (up to 5k + 7k output tokens) routinely take
// longer than 60s. Vercel's Fluid compute allows 300s on every plan, so use it.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const assessment = AssessmentSchema.parse(payload.assessment);

    const client = getAnthropic();
    const model = getAnthropicModel();

    const diagnosisMessage = await client.messages.create({
      model,
      max_tokens: 5000,
      system: diagnosisSystemPrompt,
      messages: [{ role: "user", content: diagnosisUserPrompt(assessment) }],
      output_config: {
        format: { type: "json_schema", schema: DIAGNOSIS_JSON_SCHEMA },
      },
    });

    const diagnosis = DiagnosisSchema.parse(JSON.parse(textFromMessage(diagnosisMessage)));

    const curriculumMessage = await client.messages.create({
      model,
      max_tokens: 7000,
      system: curriculumSystemPrompt,
      messages: [{ role: "user", content: curriculumUserPrompt(assessment, diagnosis) }],
      output_config: {
        format: { type: "json_schema", schema: CURRICULUM_JSON_SCHEMA },
      },
    });

    const curriculum = CurriculumSchema.parse(JSON.parse(textFromMessage(curriculumMessage)));

    return NextResponse.json({
      diagnosis,
      curriculum,
      meta: {
        model,
        diagnosis_prompt_version: DIAGNOSIS_PROMPT_VERSION,
        curriculum_prompt_version: CURRICULUM_PROMPT_VERSION,
      },
    });
  } catch (error) {
    console.error("Ahead generation failed", error);
    const message = error instanceof Error ? error.message : "Unknown generation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
