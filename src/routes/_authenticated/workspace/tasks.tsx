import { createFileRoute } from "@tanstack/react-router";

import { ToolWorkbench } from "@/components/tool-workbench";
import { getToolDef } from "@/lib/tool-defs";

export const Route = createFileRoute("/_authenticated/workspace/tasks")({
  head: () => ({
    meta: [
      { title: "Task planner — Kestrel" },
      {
        name: "description",
        content: "Break a messy goal into sequenced tasks with effort, priority and timing.",
      },
      { property: "og:title", content: "Task planner — Kestrel" },
      { property: "og:description", content: "A plan you can start today, built from one goal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ToolWorkbench tool={getToolDef("tasks")!} />,
});
