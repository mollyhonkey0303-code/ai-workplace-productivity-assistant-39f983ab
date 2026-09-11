import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkbench } from "@/components/tool-workbench";
import { getToolDef } from "@/lib/tool-defs";

export const Route = createFileRoute("/_authenticated/workspace/email")({
  head: () => ({
    meta: [
      { title: "Email writer — Kestrel" },
      {
        name: "description",
        content: "Turn a few bullet points into a polished, ready-to-send work email.",
      },
      { property: "og:title", content: "Email writer — Kestrel" },
      { property: "og:description", content: "AI-drafted work emails in your tone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ToolWorkbench tool={getToolDef("email")!} />,
});
