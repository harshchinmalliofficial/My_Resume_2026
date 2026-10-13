"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowClockwise, PaperPlaneRight, X } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { RobotView } from "./RobotView";
import type { Pose } from "./RobotCanvas";

export type ChatEvent = "send" | "reply" | "error";
export type Msg = { id: number; role: "user" | "assistant" | "notice"; content: string; source?: "ai" | "offline" | "intro" };

const INTRO = "Hey! I'm Harsh's AI assistant. Ask me about his projects, AI engineering experience, MCP, RAG, automation, or technical skills.";
const STARTERS = ["Tell me about Harsh's MCP Gateway.", "What has he built using RAG?", "What does he do at Cognizant?", "What technologies does he work with?"];
const MAX = 500;

// Conversation state lives with the parent so it survives closing and reopening the panel.
export function useChat(onEvent?: (e: ChatEvent) => void) {
  const [messages, setMessages] = useState<Msg[]>([{ id: 0, role: "assistant", content: INTRO, source: "intro" }]);
  const [loading, setLoading] = useState(false);
  const [talking, setTalking] = useState(false); // drives the robot's talking pose
  const id = useRef(1);
  const pending = useRef(false);
  const events = useRef(onEvent);
  useEffect(() => {
    events.current = onEvent;
  });
  const messagesRef = useRef<Msg[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const send = useCallback(async (text: string, retry = false) => {
    const content = text.trim().slice(0, MAX);
    if (!content || pending.current) return; // blocks duplicate submissions
    pending.current = true;
    setLoading(true);
    setTalking(true);
    events.current?.("send");
    setMessages((m) => {
      const base = m.filter((x) => x.role !== "notice");
      return retry ? base : [...base, { id: id.current++, role: "user", content }];
    });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only real conversation turns are sent; the intro and offline answers are not model context.
        body: JSON.stringify({
          messages: [...messagesRef.current.filter((x) => x.role !== "notice" && x.source !== "intro" && x.source !== "offline"), ...(retry ? [] : [{ role: "user" as const, content }])].map((x) => ({ role: x.role, content: x.content })),
        }),
        signal: AbortSignal.timeout(25000),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.reply) {
        setMessages((m) => [...m, { id: id.current++, role: "assistant", content: data.reply, source: "ai" }]);
        events.current?.("reply");
      } else {
        events.current?.("error");
        setMessages((m) => [
          ...m,
          { id: id.current++, role: "notice", content: data.error ?? "Something went wrong. Please try again." },
          ...(data.fallback ? [{ id: id.current++, role: "assistant" as const, content: data.fallback, source: "offline" as const }] : []),
        ]);
      }
    } catch {
      events.current?.("error");
      setMessages((m) => [...m, { id: id.current++, role: "notice", content: "Could not reach the assistant. Check your connection and try again." }]);
    } finally {
      pending.current = false;
      setLoading(false);
      setTimeout(() => setTalking(false), 1800);
    }
  }, []);

  return { messages, loading, talking, send };
}

export function ChatPanel({ chat, pose, active, onClose }: { chat: ReturnType<typeof useChat>; pose: Pose; active: boolean; onClose: () => void }) {
  const reduce = useReducedMotion();
  const { messages, loading, send } = chat;
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const last = messages[messages.length - 1];
  const offline = messages.some((m) => m.source === "offline");
  // Free-tier replies can take 10 seconds or more; say so instead of leaving the visitor guessing.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setSlow(true), 6000);
    return () => {
      clearTimeout(t);
      setSlow(false);
    };
  }, [loading]);

  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [messages, loading]);
  useEffect(() => {
    // Auto-grow the textarea up to four lines.
    const el = input.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [text]);

  const submit = () => {
    if (!text.trim() || loading) return;
    send(text);
    setText("");
  };

  return (
    <motion.section
      role="dialog"
      aria-labelledby="chat-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ transformOrigin: "bottom right" }}
      className="fixed inset-x-3 bottom-3 z-50 flex max-h-[min(640px,calc(100dvh-1.5rem))] flex-col border border-line bg-bg pb-[env(safe-area-inset-bottom)] sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px]"
    >
      <header className="flex items-center gap-3 border-b border-line p-4">
        {/* The companion lives here while the chat is open, so there is only ever one robot on screen. */}
        <RobotView pose={pose} active={active} bust className="h-14 w-14 shrink-0 border border-line bg-surface" />
        <div className="min-w-0 flex-1">
          <h2 id="chat-title" className="text-[0.95rem] font-medium leading-tight">Chat with Harsh about himself</h2>
          <p className="label mt-1 flex items-center gap-2" aria-live="polite">
            <span aria-hidden className={`h-1.5 w-1.5 ${offline ? "bg-muted" : "bg-accent"}`} />
            {loading ? "Thinking" : offline ? "Using saved answers" : "Ready"}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close chat" className="-mr-1 p-2 text-muted transition-colors hover:text-fg">
          <X size={20} />
        </button>
      </header>

      <div ref={log} role="log" aria-live="polite" aria-label="Conversation" className="min-h-[220px] flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((m) =>
          m.role === "notice" ? (
            <div key={m.id} role="alert" className="border border-accent p-3 text-sm">
              <p>{m.content}</p>
              {m === last && lastUser && (
                <button type="button" onClick={() => send(lastUser.content, true)} disabled={loading} className="mt-2 inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline">
                  <ArrowClockwise size={14} /> Try again
                </button>
              )}
            </div>
          ) : (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
              <div className={`max-w-[88%] whitespace-pre-line p-3 text-[0.92rem] leading-relaxed ${m.role === "user" ? "bg-fg text-bg" : "border border-line bg-surface"}`}>
                {m.source === "offline" && <p className="label mb-2">Saved answer, not AI-generated</p>}
                {m.content}
              </div>
            </div>
          ),
        )}
        {loading && (
          <div className="border border-line bg-surface p-3" role="status" aria-label="Assistant is typing">
            {[0, 1, 2].map((i) => (
              <span key={i} className="dot mr-1.5" style={{ "--i": i } as React.CSSProperties} />
            ))}
            {slow && <p className="label mt-2">Still working. Free-tier answers can take a few seconds.</p>}
          </div>
        )}
        {messages.length === 1 && (
          <ul className="space-y-2 pt-1">
            {STARTERS.map((s) => (
              <li key={s}>
                <button type="button" onClick={() => send(s)} disabled={loading} className="w-full border border-line p-3 text-left text-sm transition-colors hover:border-accent">
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-line p-3"
      >
        <label htmlFor="chat-input" className="sr-only">Ask about Harsh</label>
        <div className="flex items-end gap-2">
          <textarea
            id="chat-input"
            ref={input}
            rows={1}
            value={text}
            maxLength={MAX}
            placeholder="Ask about projects, skills, experience"
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            className="min-h-11 flex-1 resize-none border border-line bg-surface px-3 py-[0.65rem] text-[0.95rem] text-fg placeholder:text-muted focus-visible:border-fg/50 focus-visible:outline-none"
          />
          <button type="submit" disabled={loading || !text.trim()} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-accent-ink transition-transform active:translate-y-px disabled:opacity-40">
            <PaperPlaneRight size={20} />
          </button>
        </div>
        <p className="label mt-2">
          {text.length > 400 ? `${MAX - text.length} characters left. ` : ""}AI assistant using public portfolio facts. Not Harsh himself.
        </p>
      </form>
    </motion.section>
  );
}
