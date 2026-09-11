export type ToolId = "email" | "summary" | "tasks" | "research";

export type ToolField = {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  rows?: number;
};

export type ToolDef = {
  id: ToolId;
  path: string;
  name: string;
  tagline: string;
  description: string;
  cta: string;
  fields: ToolField[];
};

export const TOOL_DEFS: ToolDef[] = [
  {
    id: "email",
    path: "/workspace/email",
    name: "Email writer",
    tagline: "Drafts that sound like you",
    description: "Turn a few bullet points into a polished, ready-to-send message.",
    cta: "Draft the email",
    fields: [
      {
        name: "recipient",
        label: "Who is it for?",
        placeholder: "Thandi, our supplier contact",
        type: "text",
        required: true,
      },
      {
        name: "goal",
        label: "What should it achieve?",
        placeholder: "Ask for a revised quote and confirm delivery for the 14th",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        name: "tone",
        label: "Tone",
        placeholder: "Professional",
        type: "select",
        options: ["Professional", "Warm", "Direct", "Apologetic", "Persuasive"],
      },
      {
        name: "length",
        label: "Length",
        placeholder: "Short",
        type: "select",
        options: ["Short", "Medium", "Detailed"],
      },
    ],
  },
  {
    id: "summary",
    path: "/workspace/meetings",
    name: "Meeting summariser",
    tagline: "Notes in, decisions out",
    description: "Paste raw notes or a transcript and get decisions, actions and owners.",
    cta: "Summarise the meeting",
    fields: [
      {
        name: "title",
        label: "Meeting",
        placeholder: "Weekly ops stand-up",
        type: "text",
        required: true,
      },
      {
        name: "notes",
        label: "Notes or transcript",
        placeholder: "Paste everything that was said or scribbled down…",
        type: "textarea",
        rows: 10,
        required: true,
      },
    ],
  },
  {
    id: "tasks",
    path: "/workspace/tasks",
    name: "Task planner",
    tagline: "A plan you can start today",
    description: "Break a messy goal into sequenced tasks with effort and priority.",
    cta: "Build the plan",
    fields: [
      {
        name: "objective",
        label: "What needs to get done?",
        placeholder: "Launch the new onboarding guide for support staff",
        type: "textarea",
        rows: 4,
        required: true,
      },
      {
        name: "deadline",
        label: "Deadline",
        placeholder: "End of next week",
        type: "text",
      },
      {
        name: "capacity",
        label: "Time available",
        placeholder: "A few hours a day",
        type: "text",
      },
    ],
  },
  {
    id: "research",
    path: "/workspace/research",
    name: "Topic research",
    tagline: "Get up to speed fast",
    description: "A structured briefing on any work topic, with questions to dig into.",
    cta: "Research the topic",
    fields: [
      {
        name: "topic",
        label: "Topic",
        placeholder: "Four-day work week trials in professional services",
        type: "text",
        required: true,
      },
      {
        name: "angle",
        label: "What do you need it for?",
        placeholder: "A recommendation for our leadership team",
        type: "textarea",
        rows: 3,
      },
      {
        name: "depth",
        label: "Depth",
        placeholder: "Overview",
        type: "select",
        options: ["Overview", "Standard", "Deep dive"],
      },
    ],
  },
];

export function getToolDef(id: string): ToolDef | undefined {
  return TOOL_DEFS.find((t) => t.id === id);
}
