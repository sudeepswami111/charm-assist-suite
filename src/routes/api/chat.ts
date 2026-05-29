import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SYSTEM_PROMPT = `You are NOVA — a focused, capable AI assistant in the spirit of Jarvis.

Operating principles:
- AI should think. Tools should act. Safety should approve risky actions.
- Be concise, warm, and direct. Use markdown when helpful (lists, code blocks).
- When the user shares a preference, fact about themselves, or anything worth remembering long-term, call the "remember" tool.
- Use "recall" when the answer likely depends on something you stored before.
- Use "get_time" for date/time questions. Use "web_search" only for current events or facts you cannot reason about.
- Never claim to have taken real-world actions (sending email, controlling devices) you cannot perform.`;

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { messages?: UIMessage[]; threadId?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!Array.isArray(body.messages) || !body.threadId) {
          return new Response("messages and threadId required", { status: 400 });
        }

        const userId = await getUserIdFromRequest(request);
        if (!userId) return new Response("Unauthorized", { status: 401 });

        // verify thread ownership
        const { data: thread } = await supabaseAdmin
          .from("threads")
          .select("id, user_id")
          .eq("id", body.threadId)
          .maybeSingle();
        if (!thread || thread.user_id !== userId) {
          return new Response("Forbidden", { status: 403 });
        }

        // load user memories to inject
        const { data: mems } = await supabaseAdmin
          .from("memories")
          .select("key, value")
          .eq("user_id", userId)
          .limit(50);
        const memBlock =
          mems && mems.length
            ? `\n\nWhat you remember about the user:\n${mems
                .map((m) => `- ${m.key}: ${m.value}`)
                .join("\n")}`
            : "";

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const tools = {
          get_time: tool({
            description: "Get the current date/time in ISO and human readable format.",
            inputSchema: z.object({
              timezone: z.string().optional().describe("IANA timezone, e.g. America/New_York"),
            }),
            execute: async ({ timezone }) => {
              const now = new Date();
              const tz = timezone || "UTC";
              const human = new Intl.DateTimeFormat("en-US", {
                dateStyle: "full",
                timeStyle: "long",
                timeZone: tz,
              }).format(now);
              return { iso: now.toISOString(), human, timezone: tz };
            },
          }),
          remember: tool({
            description:
              "Store a long-term fact or preference about the user. Use a short snake_case key and a concise value.",
            inputSchema: z.object({
              key: z.string().min(1).max(80),
              value: z.string().min(1).max(2000),
            }),
            execute: async ({ key, value }) => {
              const { error } = await supabaseAdmin
                .from("memories")
                .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
              if (error) return { ok: false, error: error.message };
              return { ok: true, key, value };
            },
          }),
          recall: tool({
            description: "List everything NOVA remembers about the user.",
            inputSchema: z.object({}),
            execute: async () => {
              const { data } = await supabaseAdmin
                .from("memories")
                .select("key, value")
                .eq("user_id", userId);
              return { memories: data ?? [] };
            },
          }),
          summarize_text: tool({
            description:
              "Return a short summary of a piece of text the user already provided in the conversation.",
            inputSchema: z.object({
              text: z.string().min(1).max(20000),
              max_sentences: z.number().int().min(1).max(10).default(3),
            }),
            execute: async ({ text, max_sentences }) => {
              return {
                text,
                max_sentences,
                note: "Summarize the provided text yourself in the reply.",
              };
            },
          }),
        };

        const modelMessages = await convertToModelMessages(body.messages);
        const result = streamText({
          model,
          system: SYSTEM_PROMPT + memBlock,
          messages: modelMessages,
          tools,
          stopWhen: stepCountIs(50),
        });

        const threadId = body.threadId;
        const inputMessages = body.messages;
        return result.toUIMessageStreamResponse({
          originalMessages: inputMessages,
          onFinish: async ({ messages: finalMessages }) => {
            try {
              const existingIds = new Set(inputMessages.map((m) => m.id));
              const newAssistant = finalMessages.filter(
                (m) => m.role === "assistant" && !existingIds.has(m.id),
              );
              for (const m of newAssistant) {
                await supabaseAdmin.from("messages").insert({
                  thread_id: threadId,
                  role: "assistant",
                  parts: JSON.parse(JSON.stringify(m.parts)),
                });
              }
              await supabaseAdmin
                .from("threads")
                .update({ updated_at: new Date().toISOString() })
                .eq("id", threadId);
            } catch (e) {
              console.error("[chat] persist error", e);
            }
          },
          onError: (err) => {
            console.error("[chat] stream error", err);
            const e = err as { message?: string };
            return e?.message ?? "Stream error";
          },
        });
      },
    },
  },
});
