import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { getToolDef } from "@/lib/tool-defs";
import { deleteOutput, listOutputs } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/workspace/history")({
  head: () => ({
    meta: [
      { title: "Saved results — Kestrel" },
      {
        name: "description",
        content: "Every email, summary, plan and briefing you have generated, saved to your account.",
      },
      { property: "og:title", content: "Saved results — Kestrel" },
      { property: "og:description", content: "Your saved AI-generated work, all in one list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const load = useServerFn(listOutputs);
  const remove = useServerFn(deleteOutput);
  const queryClient = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const outputs = useQuery({ queryKey: ["outputs"], queryFn: () => load() });

  const deletion = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outputs"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Could not delete that result."),
  });

  const rows = outputs.data ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 lg:px-10">
      <header>
        <h1 className="text-3xl font-semibold">Saved results</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you have generated, newest first.
        </p>
      </header>

      {outputs.isLoading ? (
        <div className="mt-8 space-y-2">
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Nothing saved yet. Generate an email, summary, plan or briefing and it will appear here.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => {
            const open = openId === row.id;
            return (
              <li key={row.id} className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setOpenId(open ? null : row.id)}
                  >
                    <p className="truncate text-sm font-medium">{row.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {getToolDef(row.tool)?.name ?? row.tool} ·{" "}
                      {new Date(row.created_at).toLocaleString()}
                    </p>
                  </button>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Copy"
                      onClick={async () => {
                        await navigator.clipboard.writeText(row.output);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title="Delete"
                      onClick={() => deletion.mutate(row.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {open ? (
                  <div className="border-t px-5 py-4">
                    <MessageResponse>{row.output}</MessageResponse>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
