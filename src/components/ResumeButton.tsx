"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { FileText } from "@phosphor-icons/react";
import { site } from "@/data/site";
import { resumeClosed } from "@/content/personality";
import { emit, subscribe } from "@/lib/personality/bus";
import { firstThisSession, nextMessage } from "@/lib/personality/messages";

// The viewer and pdf.js load only after the first click, so the home page bundle is unchanged.
const ResumeViewer = dynamic(() => import("./ResumeViewer"), { ssr: false });

const cls = "inline-flex items-center gap-2 whitespace-nowrap border border-fg/40 px-5 py-3 font-medium transition-colors hover:border-fg";

export function ResumeButton({ src, fallbackHref }: { src: string | null; fallbackHref: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  // The console and the tour open the same viewer through the bus.
  useEffect(() => subscribe((e) => e.type === "open-resume" && setOpen(true)), []);
  if (!src) {
    return <a href={fallbackHref} className={cls}><FileText size={18} /> View Resume</a>;
  }
  return (
    <>
      <button ref={opener} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={cls}>
        <FileText size={18} /> View Resume
      </button>
      {open && (
        <ResumeViewer
          src={src}
          downloadName={site.resumeDownloadName}
          onClose={() => {
            setOpen(false);
            opener.current?.focus();
            // A real event (the viewer was closed), not a claim about what was read. Shown once per session.
            if (firstThisSession("resume-nudge")) {
              const m = nextMessage("resume-closed", resumeClosed);
              if (m) window.setTimeout(() => emit({ type: "robot", pose: "happy", say: { id: m.id, text: m.text } }), 500);
            }
          }}
        />
      )}
    </>
  );
}
