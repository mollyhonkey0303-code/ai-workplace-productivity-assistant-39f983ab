import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RunToolInput = z.object({
  tool: z.enum(["email", "summary", "tasks", "research"]),
  title: z.string().min(1).max(160),
  input: z.record(z.string()),
});

export const runTool = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => RunToolInput.parse(data))
  .handler(async ({ data, context }) => {
    const { streamText } = await import("ai");
    const { createLovableAiGatewayProvider, requireLovableApiKey, WORKPLACE_MODEL } = await import(
      "./ai-gateway.server"
    );
    const { buildToolPrompt } = await import("./prompts.server");

    const gateway = createLovableAiGatewayProvider(requireLovableApiKey());

    let output: string;
    try {
      const result = streamText({
        model: gateway(WORKPLACE_MODEL),
        prompt: buildToolPrompt(data.tool, data.input),
      });
      output = await result.text;
    } catch (error) {
      const status = (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { status?: number })?.status;
      if (status === 402) {
        throw new Error("This workspace has run out of AI credits. Add credits to keep generating.");
      }
      if (status === 429) {
        throw new Error("Too many requests right now. Wait a few seconds and try again.");
      }
      throw new Error(
        error instanceof Error ? error.message : "The assistant could not finish that request.",
      );
    }

    if (!output.trim()) {
      throw new Error("The assistant returned an empty result. Try again with more detail.");
    }

    const { data: row, error } = await context.supabase
      .from("generated_outputs")
      .insert({
        user_id: context.userId,
        tool: data.tool,
        title: data.title,
        input: data.input,
        output,
      })
      .select("id, tool, title, input, output, created_at")
      .single();

    if (error) {
      // Generation succeeded — return it even if saving failed.
      console.error("[workspace] failed to save output", error);
      return {
        id: null,
        tool: data.tool,
        title: data.title,
        output,
        created_at: new Date().toISOString(),
        saved: false,
      };
    }

    return { ...row, saved: true };
  });

export const listOutputs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("generated_outputs")
      .select("id, tool, title, input, output, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteOutput = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("generated_outputs")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listChatMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("chat_messages")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
