import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkbench } from "@/components/tool-workbench";
import { getToolDef } from "@/lib/tool-defs";

export const Route = createFileRoute("/_authenticated/workspace/research")({
  head: () => ({
    meta: [
      { title: "Topic research — Kestrel" },
      {
        name: "description",
        content: "Get a structured briefing on any work topic, with questions to dig into next.",
      },
      { property: "og:title", content: "Topic research — Kestrel" },
      { property: "og:description", content: "Structured briefings that get you up to speed fast." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ToolWorkbench tool={getToolDef("research")!} />,
});
