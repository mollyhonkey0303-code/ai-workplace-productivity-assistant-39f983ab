import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

import { createLovableAiGatewayProvider, requireLovableApiKey, WORKPLACE_MODEL } from "@/lib/ai-gateway.server";
import { ASSISTANT_SYSTEM_PROMPT } from "@/lib/prompts.server";
import type { Database } from "@/integrations/supabase/types";

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
        if (!token) return new Response("Unauthorized", { status: 401 });

        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!supabaseUrl || !publishableKey) {
          return new Response("Backend is not configured", { status: 500 });
        }

        const supabase = createClient<Database>(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}`, apikey: publishableKey } },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data: userData, error: userError } = await supabase.auth.getUser(token);
        if (userError || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        const body = (await request.json()) as { messages?: UIMessage[] };
        const messages = body.messages;
        if (!Array.isArray(messages) || messages.length === 0) {
          return new Response("Messages are required", { status: 400 });
        }

        const latest = messages[messages.length - 1]!;
        if (latest.role === "user") {
          const content = textOf(latest);
          if (content) {
            const { error } = await supabase
              .from("chat_messages")
              .insert({ user_id: userId, role: "user", content });
            if (error) console.error("[chat] failed to save user message", error);
          }
        }

        const gateway = createLovableAiGatewayProvider(requireLovableApiKey());

        try {
          const result = streamText({
            model: gateway(WORKPLACE_MODEL),
            system: ASSISTANT_SYSTEM_PROMPT,
            messages: await convertToModelMessages(messages),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages,
            onFinish: async ({ responseMessage }) => {
              const content = textOf(responseMessage);
              if (!content) return;
              const { error } = await supabase
                .from("chat_messages")
                .insert({ user_id: userId, role: "assistant", content });
              if (error) console.error("[chat] failed to save assistant message", error);
            },
          });
        } catch (error) {
          const status =
            (error as { statusCode?: number })?.statusCode ?? (error as { status?: number })?.status;
          const message =
            status === 402
              ? "This workspace has run out of AI credits."
              : status === 429
                ? "Too many requests right now — try again shortly."
                : "The assistant could not respond.";
          return new Response(message, { status: status && status >= 400 ? status : 500 });
        }
      },
    },
  },
});
