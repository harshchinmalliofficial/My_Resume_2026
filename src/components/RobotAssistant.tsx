"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChatPanel, useChat, type ChatEvent } from "./ChatPanel";
import { RobotView, usePageVisible, useWebGL } from "./RobotView";
import type { Pose } from "./RobotCanvas";

const CUE_KEY = "robot-cue-seen";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const noop = () => () => {};

// Placement without collisions, by construction (no scroll handlers, no content-chasing):
//  >= 1400px: the page's natural right gutter is wider than the robot.
//  768-1399px: layout reserves a right "lane" (--lane in globals.css) that the robot lives in.
//  < 768px: a floating robot would cover full-width content, so it docks in the sticky header instead.
const WIDE_QUERY = "(min-width: 768px)";
const useWide = () =>
  useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(WIDE_QUERY);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );

type CompanionProps = {
  variant: "float" | "dock";
  pose: Pose;
  facing: -1 | 0 | 1;
  hover: boolean;
  labelShown: boolean;
  active: boolean;
  onActivate: () => void;
  setHover: (v: boolean) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

function Companion({ variant, pose, facing, hover, labelShown, active, onActivate, setHover, buttonRef }: CompanionProps) {
  const float = variant === "float";
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onActivate}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => e.currentTarget.matches(":focus-visible") && setHover(true)}
      onBlur={() => setHover(false)}
      aria-label="Chat with Harsh's portfolio assistant"
      data-pose={pose}
      aria-haspopup="dialog"
      aria-expanded={false}
      className={`flex cursor-pointer ${float ? "flex-col items-end gap-1" : "relative items-center"}`}
    >
      <span
        aria-hidden
        className={`label whitespace-nowrap border border-line bg-surface px-2 py-1 !text-[0.7rem] !text-fg transition-[opacity,transform] duration-300 ${float ? "text-right leading-tight" : "absolute right-full mr-2 hidden min-[380px]:block"} ${labelShown ? "opacity-100" : "translate-y-1 opacity-0"}`}
      >
        {float ? (
          <>
            Ask about
            <br />
            Harsh
          </>
        ) : (
          "Ask about Harsh"
        )}
      </span>
      <RobotView pose={pose} facing={facing} hover={hover} active={active} bust={!float} className={float ? "h-32 w-24" : "h-14 w-14"} />
    </button>
  );
}

export function RobotAssistant() {
  const reduce = useReducedMotion();
  const visible = usePageVisible();
  const wide = useWide();
  const gl = useWebGL();
  // Browser-only DOM targets: the body (chat panel) and the header slot (mobile dock).
  const body = useSyncExternalStore(noop, () => document.body, () => null);
  const dock = useSyncExternalStore(noop, () => document.getElementById("robot-dock"), () => null);

  const [open, setOpen] = useState(false);
  const [pose, setPose] = useState<Pose>("idle");
  const [facing, setFacing] = useState<-1 | 0 | 1>(0);
  const [chatPose, setChatPose] = useState<Pose>("idle");
  const [hover, setHover] = useState(false);
  const [cue, setCue] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const seq = useRef(0); // invalidates in-flight sequences, so rapid clicks cannot race
  const chatSeq = useRef(0);
  const wasOpen = useRef(false);
  const lastAmbient = useRef("");

  const timed = useCallback((p: Pose, ms: number, f: -1 | 0 | 1 = 0) => {
    if (busy.current) return; // ambient and cue animations never interrupt a click sequence
    const t = ++seq.current;
    setPose(p);
    setFacing(f);
    window.setTimeout(() => {
      if (t === seq.current && !busy.current) {
        setPose("idle");
        setFacing(0);
      }
    }, ms);
  }, []);

  // Arrival: the robot runs in from the edge on load, and again whenever the chat closes.
  useEffect(() => {
    if (open) return;
    const id = requestAnimationFrame(() => {
      if (!reduce) timed("run", 650, -1);
      if (wasOpen.current) button.current?.focus();
      wasOpen.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [open, reduce, timed, wide]);
  useEffect(() => {
    if (open) wasOpen.current = true;
  }, [open]);

  // Ambient life: sparse, varied, only while idle, visible, and the chat is closed.
  useEffect(() => {
    if (reduce || open || !visible) return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        if (!busy.current) {
          const options = ["curious", "wave", "bounce"].filter((o) => o !== lastAmbient.current);
          const pick = options[Math.floor(Math.random() * options.length)];
          lastAmbient.current = pick;
          if (pick === "curious") timed("curious", 2200);
          if (pick === "wave") timed("wave", 1900);
          if (pick === "bounce") timed("anticipate", 380);
        }
        loop();
      }, 7000 + Math.random() * 7000);
    };
    loop();
    return () => window.clearTimeout(t);
  }, [reduce, open, visible, timed]);

  // One gentle cue per session, never a popup: the label appears and the robot waves once.
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(CUE_KEY);
    } catch {}
    if (seen) return;
    const show = window.setTimeout(() => {
      try {
        sessionStorage.setItem(CUE_KEY, "1");
      } catch {}
      setCue(true);
      if (!reduce) timed("wave", 1900);
    }, 3500);
    const hide = window.setTimeout(() => setCue(false), 9500);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [reduce, timed]);

  const openChat = useCallback(() => {
    const t = ++chatSeq.current;
    setOpen(true);
    setChatPose("greeting");
    window.setTimeout(() => t === chatSeq.current && setChatPose("idle"), 1900);
  }, []);

  const activate = useCallback(async () => {
    if (open || busy.current) return;
    setCue(false);
    if (reduce || gl !== "ok") return openChat(); // nothing to animate: open at once
    busy.current = true;
    seq.current++; // cancels any pending ambient reset
    try {
      // Anticipation crouch, joyful hop, then the panel opens and the avatar greets.
      setFacing(0);
      setPose("anticipate");
      await sleep(170);
      setPose("happy");
      await sleep(620);
      openChat();
      setPose("idle");
    } finally {
      busy.current = false;
    }
  }, [open, reduce, gl, openChat]);

  // Chat events drive the avatar: thinking while waiting, talking while answering, a thumbs-up on success.
  const onChatEvent = useCallback((e: ChatEvent) => {
    const t = ++chatSeq.current;
    const then = (ms: number, fn: () => void) => window.setTimeout(() => t === chatSeq.current && fn(), ms);
    if (e === "send") setChatPose("thinking");
    if (e === "reply") {
      setChatPose("talk");
      then(1700, () => {
        setChatPose("celebrate");
        then(1700, () => setChatPose("idle"));
      });
    }
    if (e === "error") {
      setChatPose("curious");
      then(1800, () => setChatPose("idle"));
    }
  }, []);
  const chat = useChat(onChatEvent);

  const close = useCallback(() => {
    chatSeq.current++;
    setOpen(false);
  }, []);

  const props: Omit<CompanionProps, "variant"> = {
    pose,
    facing,
    hover,
    labelShown: cue || hover,
    active: !open && !reduce,
    onActivate: activate,
    setHover,
    buttonRef: button,
  };
  const dur = reduce ? 0 : 0.4;
  const enter = (x: number) => ({ initial: reduce ? false : { opacity: 0, x }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0 }, transition: { duration: dur, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <>
      {wide ? (
        // z-30: above page content, below the sticky header (z-40) and the chat panel (z-50).
        <div
          data-robot
          className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-2 z-30"
          style={{ paddingRight: "env(safe-area-inset-right)" }}
        >
          <AnimatePresence>
            {!open && (
              <motion.div key="fab" className="pointer-events-auto" {...enter(70)}>
                <Companion variant="float" {...props} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        dock && createPortal(<AnimatePresence>{!open && <motion.div key="dock" data-robot {...enter(0)}><Companion variant="dock" {...props} /></motion.div>}</AnimatePresence>, dock)
      )}
      {body && createPortal(<AnimatePresence>{open && <ChatPanel chat={chat} pose={chatPose} active={visible && !reduce} onClose={close} />}</AnimatePresence>, body)}
    </>
  );
}
