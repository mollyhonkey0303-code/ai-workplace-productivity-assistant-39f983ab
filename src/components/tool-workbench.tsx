import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MessageResponse } from "@/components/ai-elements/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ToolDef } from "@/lib/tool-defs";
import { runTool } from "@/lib/workspace.functions";

export function ToolWorkbench({ tool }: { tool: ToolDef }) {
  const initial = Object.fromEntries(
    tool.fields.map((f) => [f.name, f.type === "select" ? (f.options?.[0] ?? "") : ""]),
  );
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const run = useServerFn(runTool);

  const mutation = useMutation({
    mutationFn: async () => {
      const firstField = tool.fields[0]!.name;
      const title = (values[firstField] || tool.name).slice(0, 120);
      return run({ data: { tool: tool.id, title, input: values } });
    },
    onSuccess: (data) => {
      setResult(data.output);
      queryClient.invalidateQueries({ queryKey: ["outputs"] });
      if (!("saved" in data) || data.saved) {
        toast.success("Saved to your results");
      } else {
        toast.warning("Generated, but saving to your history failed.");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "That didn't work. Try again.");
    },
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const missing = tool.fields.filter((f) => f.required && !values[f.name]?.trim());
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(", ")}`);
      return;
    }
    mutation.mutate();
  }

  async function onCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10">
      <header className="max-w-2xl">
        <p className="font-display text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {tool.tagline}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{tool.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-xl border bg-card p-5 shadow-sm lg:sticky lg:top-6 lg:self-start"
        >
          {tool.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required ? <span className="text-muted-foreground"> *</span> : null}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              ) : field.type === "select" ? (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(next) => setValues((v) => ({ ...v, [field.name]: next }))}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={values[field.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Working…
                </>
              ) : (
                tool.cta
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              title="Clear the form"
              onClick={() => {
                setValues(initial);
                setResult(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          {mutation.isPending ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Thinking it through…</p>
              <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ) : result ? (
            <>
              <div className="mb-4 flex items-center justify-between gap-3 border-b pb-3">
                <h2 className="text-sm font-medium">Result</h2>
                <Button variant="outline" size="sm" onClick={onCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy
                </Button>
              </div>
              <MessageResponse>{result}</MessageResponse>
            </>
          ) : (
            <div className="flex h-full min-h-56 flex-col items-center justify-center text-center">
              <p className="font-display text-sm font-medium">Nothing generated yet</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Fill in the form and your result will appear here. Everything you generate is
                saved under Saved results.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
