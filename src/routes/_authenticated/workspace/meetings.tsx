import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkbench } from "@/components/tool-workbench";
import { getToolDef } from "@/lib/tool-defs";

export const Route = createFileRoute("/_authenticated/workspace/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting summariser — Kestrel" },
      {
        name: "description",
        content: "Paste meeting notes or a transcript and get decisions, actions and owners.",
      },
      { property: "og:title", content: "Meeting summariser — Kestrel" },
      { property: "og:description", content: "Decisions, action items and owners from raw notes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ToolWorkbench tool={getToolDef("summary")!} />,
});
