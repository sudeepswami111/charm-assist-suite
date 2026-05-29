import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/threads.functions";
import { ChatWindow } from "@/components/chat-window";
import type { UIMessage } from "ai";

export const Route = createFileRoute("/_authenticated/c/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = Route.useParams();
  const fetcher = useServerFn(getThreadMessages);
  const opts = queryOptions({
    queryKey: ["thread", threadId],
    queryFn: () => fetcher({ data: { threadId } }),
  });
  const { data } = useSuspenseQuery(opts);

  const initial: UIMessage[] = data.messages.map((m) => ({
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: JSON.parse(m.partsJson),
  }));

  return <ChatWindow key={threadId} threadId={threadId} initialMessages={initial} />;
}
