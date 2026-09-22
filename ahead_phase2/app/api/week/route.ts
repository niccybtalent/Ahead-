import { NextResponse } from "next/server";
import { z } from "zod";
import { WeekRequestSchema, WeekDetailSchema, WEEK_DETAIL_JSON_SCHEMA } from "@/lib/schemas";
import { getAnthropic, getAnthropicModel } from "@/lib/anthropic";
import { WEEK_PROMPT_VERSION, weekBuildSystemPrompt, weekBuildUserPrompt } from "@/lib/prompts/week";

export const runtime = "nodejs";
export const maxDuration = 300;

const BuildRequestSchema = WeekRequestSchema.extend({
  notes: z.string(),
  verified: z.array(z.object({ url: z.string(), title: z.string() })).min(1),
});

/** Sessions per week, taken from what the person said they can actually do. */
function sessionCountFrom(days: string | undefined) {
  const parsed = Number.parseInt(days ?? "", 10);
  if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 7) return parsed;
  return 5;
}

/** Minutes per session, from their stated daily time. */
function minutesFrom(minutes: string | undefined) {
  const parsed = Number.parseInt(minutes ?? "", 10);
  if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 240) return parsed;
  return 60;
}

/** Collapse a URL to a comparable form so trivial differences do not reject a real link. */
function canonical(url: string) {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    const path = u.pathname.replace(/\/+$/, "").toLowerCase();
    return `${host}${path}`;
  } catch {
    return url.trim().toLowerCase();
  }
}

/**
 * Phase B of week generation: turn verified research into the structured week.
 *
 * No tools here, so output_config.format is allowed. The model is given the
 * verified URL list from the research call and may not use any other link.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { week_number, assessment, diagnosis, curriculum, notes, verified } =
      BuildRequestSchema.parse(payload);

    const week = curriculum.weeks.find((w) => w.week_number === week_number);
    if (!week) {
      return NextResponse.json({ error: `Week ${week_number} is not in this programme.` }, { status: 400 });
    }

    const allowed = new Map<string, { url: string; title: string }>();
    for (const r of verified) allowed.set(canonical(r.url), r);

    const client = getAnthropic();
    const model = getAnthropicModel();

    const message = await client.messages.create({
      model,
      max_tokens: 6000,
      system: weekBuildSystemPrompt,
      messages: [
        {
          role: "user",
          content: weekBuildUserPrompt(
            assessment,
            diagnosis,
            week,
            sessionCountFrom(assessment.learning?.days),
            minutesFrom(assessment.learning?.minutes),
            notes,
            verified
          ),
        },
      ],
      output_config: { format: { type: "json_schema", schema: WEEK_DETAIL_JSON_SCHEMA } },
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no text block");
    const detail = WeekDetailSchema.parse(JSON.parse(textBlock.text));

    // Final guard: a resource survives only if its URL was actually retrieved
    // during research. This is what makes a dead or invented link structurally
    // impossible rather than merely discouraged.
    const before = detail.resources.length;
    const resources = detail.resources
      .filter((r) => allowed.has(canonical(r.url)))
      .map((r) => ({ ...r, url: allowed.get(canonical(r.url))!.url }));

    return NextResponse.json({
      ...detail,
      resources,
      meta: {
        model,
        prompt_version: WEEK_PROMPT_VERSION,
        searched_at: new Date().toISOString(),
        sources_considered: verified.length,
        resources_dropped: before - resources.length,
      },
    });
  } catch (error) {
    console.error("Ahead week build failed", error);
    const message = error instanceof Error ? error.message : "Unknown week build error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
