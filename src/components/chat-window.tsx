import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { NovaOrb } from "@/components/nova-orb";
import { Button } from "@/components/ui/button";
import { maybeTitleThread, saveUserMessage } from "@/lib/threads.functions";

type Props = {
  threadId: string;
  initialMessages: UIMessage[];
};

export function ChatWindow({ threadId, initialMessages }: Props) {
  const qc = useQueryClient();
  const saveUser = useServerFn(saveUserMessage);
  const titleIt = useServerFn(maybeTitleThread);

  const [input, setInput] = useState("");
  const [voiceOut, setVoiceOut] = useState(false);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<{ stop: () => void } | null>(null);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: { messages, threadId, ...(body ?? {}) },
    }),
  });

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: ({ message }) => {
      if (voiceOut && typeof window !== "undefined" && "speechSynthesis" in window) {
        const text = message.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text).join(" ");
        if (text) {
          const u = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(u);
        }
      }
      qc.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // persist user message + autotitle if first
    void saveUser({ data: { threadId, text: trimmed } });
    if (messages.length === 0) void titleIt({ data: { threadId, firstMessage: trimmed } });
    setInput("");
    await sendMessage({ text: trimmed });
  };

  const isBusy = status === "submitted" || status === "streaming";

  function toggleMic() {
    const W = typeof window !== "undefined" ? (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }) : null;
    const Ctor = W?.SpeechRecognition || W?.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Voice input isn't supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const r = new Ctor() as {
      lang: string; interimResults: boolean; continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void; onerror: () => void;
      start: () => void; stop: () => void;
    };
    r.lang = "en-US"; r.interimResults = false; r.continuous = false;
    r.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setInput((v) => (v ? v + " " : "") + t);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-3">
        <div className="flex items-center gap-3">
          <NovaOrb size={28} active={isBusy} />
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {isBusy ? "thinking…" : "ready"}
          </div>
        </div>
        <Button
          variant="ghost" size="sm" onClick={() => setVoiceOut(!voiceOut)}
          className="gap-2 text-xs"
        >
          {voiceOut ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4" />}
          Voice {voiceOut ? "on" : "off"}
        </Button>
      </header>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<NovaOrb size={56} active className="glow-cyan" />}
              title="What's on your mind?"
              description="Ask anything. NOVA remembers what matters and can use tools when needed."
            />
          ) : (
            messages.map((m) => (
              <Message key={m.id} from={m.role === "user" ? "user" : "assistant"}>
                <MessageContent
                  className={m.role === "assistant" ? "bg-transparent p-0 text-foreground" : undefined}
                >
                  {m.parts.map((part, i) => {
                    if (part.type === "text") {
                      return m.role === "assistant"
                        ? <MessageResponse key={i}>{part.text}</MessageResponse>
                        : <span key={i}>{part.text}</span>;
                    }
                    if (part.type?.startsWith?.("tool-")) {
                      const tp = part as unknown as { type: string; toolCallId?: string; state?: string; input?: unknown; output?: unknown; errorText?: string };
                      return (
                        <Tool key={i} defaultOpen={false} className="mt-2">
                          <ToolHeader type={tp.type as `tool-${string}`} state={(tp.state ?? "output-available") as never} />
                          <ToolContent>
                            <ToolInput input={tp.input} />
                            <ToolOutput output={tp.output ? <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(tp.output, null, 2)}</pre> : null} errorText={tp.errorText} />
                          </ToolContent>
                        </Tool>
                      );
                    }
                    return null;
                  })}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && (
            <div className="px-2 py-1"><Shimmer>NOVA is thinking…</Shimmer></div>
          )}
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
              {error.message}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-white/5 p-4">
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NOVA anything…"
            autoFocus
          />
          <PromptInputFooter className="justify-end gap-2">
            <Button type="button" variant="ghost" size="icon-sm" onClick={toggleMic} aria-label="Toggle voice input">
              {listening ? <MicOff className="size-3.5 text-destructive" /> : <Mic className="size-3.5" />}
            </Button>
            <PromptInputSubmit status={status} disabled={!input.trim() || isBusy} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
