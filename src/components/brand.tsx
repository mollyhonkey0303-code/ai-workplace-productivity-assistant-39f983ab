import mark from "@/assets/kestrel-mark.png";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={mark}
      alt="Kestrel logo"
      className={cn("h-8 w-8 rounded-md object-contain", className)}
    />
  );
}

export function BrandLockup({ className, subtitle }: { className?: string; subtitle?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark />
      <div className="leading-tight">
        <div className="font-display text-base font-semibold tracking-tight">Kestrel</div>
        <div className="text-xs text-muted-foreground">{subtitle ?? "Workplace assistant"}</div>
      </div>
    </div>
  );
}
