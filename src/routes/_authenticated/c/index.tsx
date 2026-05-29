import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/threads.functions";
import { NovaOrb } from "@/components/nova-orb";

export const Route = createFileRoute("/_authenticated/c/")({
  component: NewThread,
});

function NewThread() {
  const navigate = useNavigate();
  const create = useServerFn(createThread);
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    create().then((r) => navigate({ to: "/c/$threadId", params: { threadId: r.id }, replace: true }));
  }, [create, navigate]);
  return (
    <div className="flex h-full items-center justify-center">
      <NovaOrb size={64} active />
    </div>
  );
}
