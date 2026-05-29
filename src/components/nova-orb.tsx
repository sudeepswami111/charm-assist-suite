import { cn } from "@/lib/utils";

export function NovaOrb({ size = 32, active = false, className }: { size?: number; active?: boolean; className?: string }) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full opacity-70 blur-md",
          active ? "orb-pulse" : "",
        )}
        style={{ background: "radial-gradient(circle, var(--cyan-glow) 0%, transparent 70%)" }}
      />
      <div
        className={cn("absolute inset-[15%] rounded-full border-2", active ? "orb-spin" : "")}
        style={{
          borderColor: "transparent",
          borderTopColor: "var(--cyan-glow)",
          borderRightColor: "var(--violet-glow)",
        }}
      />
      <div
        className="absolute inset-[35%] rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.95 0.05 220) 0%, var(--cyan-glow) 60%, transparent 100%)",
          boxShadow: "0 0 12px var(--cyan-glow)",
        }}
      />
    </div>
  );
}
