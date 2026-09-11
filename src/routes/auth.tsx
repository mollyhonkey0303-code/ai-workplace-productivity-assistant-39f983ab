import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Kestrel workplace assistant" },
      {
        name: "description",
        content:
          "Sign in to Kestrel to draft emails, summarise meetings, plan tasks and chat with your AI workplace assistant.",
      },
      { property: "og:title", content: "Sign in — Kestrel workplace assistant" },
      {
        property: "og:description",
        content: "Access your saved drafts, plans, summaries and assistant chat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/workspace" });
  }, [loading, session, navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/workspace" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/workspace" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try again or use your email address.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/workspace" });
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <BrandLockup />
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-semibold leading-tight">
            The busywork, handled before your first coffee.
          </h1>
          <p className="mt-4 text-sm text-sidebar-foreground/70">
            Kestrel drafts your emails, turns messy meeting notes into decisions and owners,
            sequences your week and briefs you on anything new — then keeps every result in
            one place.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          Your drafts and chat stay private to your account.
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <BrandLockup />
          </div>
          <h2 className="mt-8 font-display text-2xl font-semibold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to pick up where you left off."
              : "Start automating the parts of work nobody enjoys."}
          </p>

          {checkEmail ? (
            <div className="mt-8 rounded-lg border bg-card p-5 text-sm">
              <p className="font-medium">Check your inbox</p>
              <p className="mt-2 text-muted-foreground">
                We sent a confirmation link to {email}. Click it to finish creating your
                account, then come back and sign in.
              </p>
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  setCheckEmail(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="mt-8 w-full"
                onClick={onGoogle}
                disabled={busy}
              >
                Continue with Google
              </Button>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy
                    ? "One moment…"
                    : mode === "signin"
                      ? "Sign in"
                      : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-foreground underline underline-offset-4"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}

          <p className="mt-10 text-center text-xs text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
