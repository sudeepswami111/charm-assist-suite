import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deleteMemory, listMemories, upsertMemory } from "@/lib/memories.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/memory")({
  component: MemoryPage,
});

function MemoryPage() {
  const qc = useQueryClient();
  const list = useServerFn(listMemories);
  const upsert = useServerFn(upsertMemory);
  const del = useServerFn(deleteMemory);

  const { data } = useQuery({ queryKey: ["memories"], queryFn: () => list() });
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const upsertMut = useMutation({
    mutationFn: async (v: { key: string; value: string }) => upsert({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["memories"] });
      setKey(""); setValue("");
      toast.success("Memory saved");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });
  const delMut = useMutation({
    mutationFn: async (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    upsertMut.mutate({ key: key.trim(), value: value.trim() });
  }

  return (
    <div className="mx-auto h-screen w-full max-w-3xl overflow-y-auto px-6 py-8">
      <Link to="/c" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to chat
      </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold">Memory</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Facts and preferences NOVA remembers about you. NOVA can add to this list during conversations.
      </p>

      <form onSubmit={submit} className="glass mt-8 space-y-3 rounded-2xl p-5">
        <div>
          <Label htmlFor="key">Key</Label>
          <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="favorite_language" maxLength={80} required />
        </div>
        <div>
          <Label htmlFor="val">Value</Label>
          <Textarea id="val" value={value} onChange={(e) => setValue(e.target.value)} placeholder="TypeScript" maxLength={2000} required />
        </div>
        <Button type="submit" disabled={upsertMut.isPending} className="glow-cyan">Save memory</Button>
      </form>

      <ul className="mt-8 space-y-2">
        {(data?.memories ?? []).map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-card/40 p-4">
            <div className="min-w-0 flex-1">
              <div className="font-mono text-xs text-primary">{m.key}</div>
              <div className="mt-1 text-sm">{m.value}</div>
            </div>
            <button onClick={() => delMut.mutate(m.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
        {(!data || data.memories.length === 0) && (
          <li className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
            No memories yet. NOVA will add some as you chat, or you can add them manually above.
          </li>
        )}
      </ul>
    </div>
  );
}
