import { useChat } from "@ai-sdk/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { clearChat, listChatMessages } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/workspace/assistant")({
  head: () => ({
    meta: [
      { title: "Workplace assistant — Kestrel" },
      {
        name: "description",
        content:
          "Chat with your AI workplace assistant about priorities, tricky messages and how to get work moving.",
      },
      { property: "og:title", content: "Workplace assistant — Kestrel" },
      { property: "og:description", content: "An ongoing chat that remembers your work context." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "Help me prioritise a week with too many deadlines.",
  "How do I push back on a request without damaging the relationship?",
  "Draft an agenda for a 30-minute project check-in.",
];

function AssistantPage() {
  const loadHistory = useServerFn(listChatMessages);
  const clear = useServerFn(clearChat);
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const history = useQuery({
    queryKey: ["chat-history"],
    queryFn: () => loadHistory(),
  });

  const initialMessages = useMemo<UIMessage[]>(
    () =>
      (history.data ?? []).map((row) => ({
        id: row.id,
        role: row.role === "assistant" ? "assistant" : "user",
        parts: [{ type: "text" as const, text: row.content }],
      })),
    [history.data],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session?.access_token
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : {};
        },
      }),
    [],
  );

  const { messages, sendMessage, status, setMessages } = useChat({
    id: "workplace-assistant",
    messages: initialMessages,
    transport,
    onError: (error) =>
      toast.error(error.message || "The assistant could not reply. Try again."),
  });

  useEffect(() => {
    if (history.isSuccess) setMessages(initialMessages);
  }, [history.isSuccess, initialMessages, setMessages]);

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    await sendMessage({ text: text.trim() });
    textareaRef.current?.focus();
  }

  async function onClear() {
    try {
      await clear();
      setMessages([]);
      queryClient.setQueryData(["chat-history"], []);
      toast.success("Chat cleared");
    } catch {
      toast.error("Could not clear the chat.");
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-4xl flex-col px-5 py-6 lg:h-screen lg:px-10">
      <header className="flex items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Workplace assistant</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One ongoing conversation, saved to your account.
          </p>
        </div>
        {messages.length > 0 ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        ) : null}
      </header>

      <Conversation className="flex-1 rounded-xl border bg-card">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<BrandMark className="h-10 w-10" />}
              title="What are you working on?"
              description="Ask about priorities, tricky conversations, planning or anything work-shaped."
            >
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="max-w-full whitespace-normal text-left"
                    onClick={() => send(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, index) =>
                    part.type === "text" ? (
                      <MessageResponse key={index}>{part.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" ? (
            <Message from="assistant">
              <MessageContent>
                <Shimmer>Thinking…</Shimmer>
              </MessageContent>
            </Message>
          ) : null}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        className="mt-4"
        onSubmit={async (message) => {
          await send(message.text);
        }}
      >
        <PromptInputTextarea
          ref={textareaRef}
          autoFocus
          placeholder="Ask about your work…"
        />
        <PromptInputFooter className="justify-end">
          <PromptInputSubmit status={status} disabled={busy} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
