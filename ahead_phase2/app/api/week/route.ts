import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { WeekRequestSchema, WeekDetailSchema, WEEK_DETAIL_JSON_SCHEMA } from "@/lib/schemas";
import { getAnthropic, getAnthropicModel } from "@/lib/anthropic";
import {
  WEEK_PROMPT_VERSION,
  weekResearchSystemPrompt,
  weekResearchUserPrompt,
  weekBuildSystemPrompt,
  weekBuildUserPrompt,
} from "@/lib/prompts/week";

export const runtime = "nodejs";
// Two calls: a web-search research pass, then a structured build pass.
export const maxDuration = 300;

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

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { week_number, assessment, diagnosis, curriculum } = WeekRequestSchema.parse(payload);

    const week = curriculum.weeks.find((w) => w.week_number === week_number);
    if (!week) {
      return NextResponse.json(
        { error: `Week ${week_number} is not in this programme.` },
        { status: 400 }
      );
    }

    const client = getAnthropic();
    const model = getAnthropicModel();
    const sessionCount = sessionCountFrom(assessment.learning?.days);
    const minutesPerSession = minutesFrom(assessment.learning?.minutes);

    // ---- Phase A: research with real web search -------------------------
    // No output_config here. Anthropic always turns citations on for web
    // search, and citations are rejected alongside output_config.format.
    const researchMessage = await client.messages.create({
      model,
      max_tokens: 8000,
      system: weekResearchSystemPrompt,
      messages: [{ role: "user", content: weekResearchUserPrompt(assessment, diagnosis, week, curriculum) }],
      tools: [
        {
          type: "web_search_20260318",
          name: "web_search",
          max_uses: 8,
          user_location: { type: "approximate", country: "GB", timezone: "Europe/London" },
        },
      ],
    });

    // Harvest URLs from the search result blocks themselves. These are pages
    // Anthropic actually retrieved, so they cannot be hallucinated.
    const verified = new Map<string, { url: string; title: string }>();
    let researchNotes = "";

    for (const block of researchMessage.content as Anthropic.ContentBlock[]) {
      if (block.type === "text") {
        researchNotes += block.text + "\n";
      } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const result of block.content) {
          if (result.type === "web_search_result" && result.url) {
            verified.set(canonical(result.url), { url: result.url, title: result.title });
          }
        }
      }
    }

    const verifiedList = [...verified.values()];
    if (verifiedList.length === 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't find live resources for this week just now. Please try again in a moment.",
        },
        { status: 502 }
      );
    }

    // ---- Phase B: build the structured week ------------------------------
    const buildMessage = await client.messages.create({
      model,
      max_tokens: 8000,
      system: weekBuildSystemPrompt,
      messages: [
        {
          role: "user",
          content: weekBuildUserPrompt(
            assessment,
            diagnosis,
            week,
            sessionCount,
            minutesPerSession,
            researchNotes.trim(),
            verifiedList
          ),
        },
      ],
      output_config: { format: { type: "json_schema", schema: WEEK_DETAIL_JSON_SCHEMA } },
    });

    const textBlock = buildMessage.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") throw new Error("Claude returned no text block");
    const detail = WeekDetailSchema.parse(JSON.parse(textBlock.text));

    // Final guard: a resource survives only if its URL was actually retrieved.
    // This is what makes a dead or invented link structurally impossible.
    const before = detail.resources.length;
    const resources = detail.resources
      .filter((r) => verified.has(canonical(r.url)))
      .map((r) => ({ ...r, url: verified.get(canonical(r.url))!.url }));

    return NextResponse.json({
      ...detail,
      resources,
      meta: {
        model,
        prompt_version: WEEK_PROMPT_VERSION,
        searched_at: new Date().toISOString(),
        sources_considered: verifiedList.length,
        resources_dropped: before - resources.length,
      },
    });
  } catch (error) {
    console.error("Ahead week generation failed", error);
    const message = error instanceof Error ? error.message : "Unknown week generation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
