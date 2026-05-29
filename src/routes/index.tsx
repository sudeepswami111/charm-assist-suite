import { createFileRoute, Link } from "@tanstack/react-router";
import { NovaOrb } from "@/components/nova-orb";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA — Your AI Assistant" },
      {
        name: "description",
        content: "Voice-ready AI assistant with persistent memory and tools.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <NovaOrb size={36} active />
          <span className="font-display text-lg font-semibold tracking-tight">NOVA</span>
        </div>
        <Link
          to="/login"
          className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition"
        >
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-16 pb-24 text-center md:pt-28">
        <div className="mx-auto mb-10 flex justify-center">
          <NovaOrb size={140} active className="glow-cyan" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80">// online</p>
        <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
          Your personal AI,
          <br />
          <span className="text-glow">always online.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
          NOVA listens, thinks, and remembers. Threaded conversations, voice in and out, tools that
          act — all on a private Lovable Cloud backend.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground glow-cyan hover:opacity-90 transition"
          >
            Start a conversation
          </Link>
          <a
            href="#capabilities"
            className="rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/5 transition"
          >
            See capabilities
          </a>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { t: "Threaded chats", d: "Each conversation lives at its own URL with full history." },
            {
              t: "Long-term memory",
              d: "NOVA remembers preferences and recalls them across sessions.",
            },
            {
              t: "Voice ready",
              d: "Press to talk, hear replies back — Web Speech in any modern browser.",
            },
            {
              t: "Tools that act",
              d: "Web search, time, summarization, memory writes with approval.",
            },
            { t: "Markdown native", d: "Code, lists, links — streamed and rendered cleanly." },
            { t: "Yours alone", d: "Auth-gated. Row-level security. Your data, your account." },
          ].map((c) => (
            <div key={c.t} className="glass rounded-2xl p-5">
              <h3 className="font-display text-base font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-muted-foreground">
        NOVA · Powered by Lovable AI
      </footer>
    </main>
  );
}
