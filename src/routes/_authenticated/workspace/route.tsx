import { Link, Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Mail, MessageSquare, NotebookPen, Search, ListChecks, Archive, LogOut } from "lucide-react";
import { useState } from "react";

import { BrandLockup } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/workspace")({
  component: WorkspaceLayout,
});

const NAV = [
  { to: "/workspace", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/workspace/email", label: "Email writer", icon: Mail },
  { to: "/workspace/meetings", label: "Meeting notes", icon: NotebookPen },
  { to: "/workspace/tasks", label: "Task planner", icon: ListChecks },
  { to: "/workspace/research", label: "Research", icon: Search },
  { to: "/workspace/assistant", label: "Assistant", icon: MessageSquare },
  { to: "/workspace/history", label: "Saved results", icon: Archive },
] as const;

function WorkspaceLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function onSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_1fr]">
      <aside
        className={cn(
          "flex flex-col gap-6 border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground lg:sticky lg:top-0 lg:h-screen",
          open ? "block" : "hidden lg:flex",
        )}
      >
        <BrandLockup subtitle={user?.email ?? "Signed in"} />
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact ?? false }}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-primary data-[status=active]:font-medium"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          variant="ghost"
          className="justify-start text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 lg:hidden">
          <BrandLockup subtitle="Workplace assistant" />
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Close" : "Menu"}
          </Button>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
