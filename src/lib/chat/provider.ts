import { GoogleGenAI } from "@google/genai";
import { ProviderError, classifyError } from "./errors";
import type { ChatMessage } from "./validate";

// Verified with a live request on 2026-10-13: gemini-3.1-flash-lite answered (HTTP 200).
// gemini-3.5-flash-lite is listed as free-tier but did not respond within 45s, and gemini-2.5-* returns
// "no longer available to new users". Availability varies by account and changes over time, so set GEMINI_MODEL.
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const TIMEOUT_MS = 20000; // below the client's 25s abort

// Provider boundary: swap this function to change models or vendors.
export async function generateReply(messages: ChatMessage[], system: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ProviderError("config", "GEMINI_API_KEY is not set");
  const maxOutputTokens = Number(process.env.CHAT_MAX_OUTPUT_TOKENS) > 0 ? Number(process.env.CHAT_MAX_OUTPUT_TOKENS) : 600;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
      config: { systemInstruction: system, maxOutputTokens, abortSignal: AbortSignal.timeout(TIMEOUT_MS) },
    });
    const text = res.text?.trim();
    if (!text) throw new ProviderError("empty", "empty response");
    return text;
  } catch (err) {
    if (err instanceof ProviderError) throw err;
    const status = (err as { status?: number } | null)?.status;
    throw new ProviderError(classifyError(err), `provider status ${status ?? "none"}`); // status only: no keys, no chat text
  }
}
