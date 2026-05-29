import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ChatSidebar } from "@/components/chat-sidebar";

export const Route = createFileRoute("/_authenticated/c")({
  component: ChatLayout,
});

function ChatLayout() {
  return (
    <div className="flex h-screen w-full">
      <ChatSidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
