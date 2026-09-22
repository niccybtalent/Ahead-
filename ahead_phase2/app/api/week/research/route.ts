import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { WeekRequestSchema } from "@/lib/schemas";
import { getAnthropic, getAnthropicModel } from "@/lib/anthropic";
import { weekResearchSystemPrompt, weekResearchUserPrompt } from "@/lib/prompts/week";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Phase A of week generation: search the live web.
 *
 * Split into its own request so neither half of the work can approach the
 * platform timeout. Runs with the web_search server tool and no structured
 * output, because Anthropic always enables citations for web search and
 * citations are rejected alongside output_config.format.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { week_number, assessment, diagnosis, curriculum } = WeekRequestSchema.parse(payload);

    const week = curriculum.weeks.find((w) => w.week_number === week_number);
    if (!week) {
      return NextResponse.json({ error: `Week ${week_number} is not in this programme.` }, { status: 400 });
    }

    const client = getAnthropic();
    const model = getAnthropicModel();

    const message = await client.messages.create({
      model,
      max_tokens: 4000,
      system: weekResearchSystemPrompt,
      messages: [{ role: "user", content: weekResearchUserPrompt(assessment, diagnosis, week, curriculum) }],
      tools: [
        {
          type: "web_search_20260318",
          name: "web_search",
          max_uses: 5,
          user_location: { type: "approximate", country: "GB", timezone: "Europe/London" },
        },
      ],
    });

    // Harvest URLs from the search result blocks themselves. These are pages
    // Anthropic actually retrieved, so they cannot be hallucinated.
    const seen = new Map<string, { url: string; title: string }>();
    let notes = "";

    for (const block of message.content as Anthropic.ContentBlock[]) {
      if (block.type === "text") {
        notes += block.text + "\n";
      } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
        for (const result of block.content) {
          if (result.type === "web_search_result" && result.url) {
            seen.set(result.url, { url: result.url, title: result.title });
          }
        }
      }
    }

    const verified = [...seen.values()];
    if (verified.length === 0) {
      return NextResponse.json(
        { error: "We couldn't find live resources for this week just now. Please try again in a moment." },
        { status: 502 }
      );
    }

    return NextResponse.json({ notes: notes.trim(), verified });
  } catch (error) {
    console.error("Ahead week research failed", error);
    const message = error instanceof Error ? error.message : "Unknown research error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
