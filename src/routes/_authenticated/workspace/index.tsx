import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { TOOL_DEFS, getToolDef } from "@/lib/tool-defs";
import { listOutputs } from "@/lib/workspace.functions";

export const Route = createFileRoute("/_authenticated/workspace/")({
  head: () => ({
    meta: [
      { title: "Your workspace — Kestrel" },
      {
        name: "description",
        content:
          "Jump into email drafting, meeting summaries, task planning, research or your assistant chat.",
      },
      { property: "og:title", content: "Your workspace — Kestrel" },
      { property: "og:description", content: "All your AI workplace tools in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const load = useServerFn(listOutputs);
  const outputs = useQuery({ queryKey: ["outputs"], queryFn: () => load() });
  const recent = (outputs.data ?? []).slice(0, 4);
  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <header>
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Your workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Hello, {firstName}.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Pick a tool and hand over the busywork. Everything you generate is saved so you can
          come back to it later.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOL_DEFS.map((tool) => (
          <Link
            key={tool.id}
            to={tool.path}
            className="group rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
          >
            <p className="font-display text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {tool.tagline}
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold">
              {tool.name}
              <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 flex flex-col gap-4 rounded-xl border bg-sidebar p-6 text-sidebar-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageSquare className="mt-1 h-5 w-5 text-sidebar-primary" />
          <div>
            <h2 className="text-lg font-semibold">Talk it through</h2>
            <p className="mt-1 text-sm text-sidebar-foreground/70">
              Your assistant keeps one ongoing conversation about your work.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/workspace/assistant">Open the chat</Link>
        </Button>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent results</h2>
          <Link
            to="/workspace/history"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            See all
          </Link>
        </div>
        {outputs.isLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-14 animate-pulse rounded-lg bg-muted" />
            <div className="h-14 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing yet — your first draft, summary or plan will show up here.
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-xl border bg-card">
            {recent.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{row.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {getToolDef(row.tool)?.name ?? row.tool} ·{" "}
                    {new Date(row.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/workspace/history">View</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
