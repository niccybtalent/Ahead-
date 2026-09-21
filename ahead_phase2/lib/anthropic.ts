import Anthropic from "@anthropic-ai/sdk";

export function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey: key });
}

export function getAnthropicModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
}

export function textFromMessage(message: Anthropic.Message) {
  const block = message.content.find((item) => item.type === "text");
  if (!block || block.type !== "text") throw new Error("Claude returned no text block");
  return block.text;
}
