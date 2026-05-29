import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, MessageSquare, Trash2, Brain, LogOut } from "lucide-react";
import { createThread, deleteThread, listThreads } from "@/lib/threads.functions";
import { NovaOrb } from "@/components/nova-orb";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatSidebar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const params = useParams({ strict: false }) as { threadId?: string };

  const { data } = useQuery({
    queryKey: ["threads"],
    queryFn: () => list(),
  });

  const createMut = useMutation({
    mutationFn: async () => create(),
    onSuccess: async (r) => {
      await qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/c/$threadId", params: { threadId: r.id } });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: async (_r, id) => {
      await qc.invalidateQueries({ queryKey: ["threads"] });
      if (params.threadId === id) navigate({ to: "/c" });
    },
  });

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-sidebar/60 backdrop-blur">
      <div className="flex items-center gap-2 px-4 py-4">
        <NovaOrb size={28} active />
        <span className="font-display text-base font-semibold">NOVA</span>
      </div>

      <div className="px-3">
        <Button
          onClick={() => createMut.mutate()}
          disabled={createMut.isPending}
          className="w-full justify-start gap-2 glow-cyan"
        >
          <Plus className="size-4" /> New conversation
        </Button>
      </div>

      <nav className="mt-4 flex-1 overflow-y-auto px-2">
        <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Threads
        </p>
        <ul className="space-y-0.5">
          {(data?.threads ?? []).map((t) => (
            <li key={t.id} className="group flex items-center">
              <Link
                to="/c/$threadId"
                params={{ threadId: t.id }}
                className={cn(
                  "flex flex-1 items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm transition hover:bg-white/5",
                  params.threadId === t.id && "bg-white/10 text-foreground",
                )}
              >
                <MessageSquare className="size-3.5 shrink-0 opacity-60" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button
                onClick={() => {
                  if (confirm("Delete this conversation?")) deleteMut.mutate(t.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition px-1.5 text-muted-foreground hover:text-destructive"
                aria-label="Delete conversation"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
          {(!data || data.threads.length === 0) && (
            <li className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</li>
          )}
        </ul>
      </nav>

      <div className="border-t border-white/5 p-2">
        <Link
          to="/memory"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5"
        >
          <Brain className="size-4 opacity-70" /> Memory
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            toast.success("Signed out");
            navigate({ to: "/" });
          }}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white/5"
        >
          <LogOut className="size-4 opacity-70" /> Sign out
        </button>
      </div>
    </aside>
  );
}
