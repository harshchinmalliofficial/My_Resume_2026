"use client";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { FileText } from "@phosphor-icons/react";
import { site } from "@/data/site";

// The viewer and pdf.js load only after the first click, so the home page bundle is unchanged.
const ResumeViewer = dynamic(() => import("./ResumeViewer"), { ssr: false });

const cls = "inline-flex items-center gap-2 whitespace-nowrap border border-fg/40 px-5 py-3 font-medium transition-colors hover:border-fg";

export function ResumeButton({ src, fallbackHref }: { src: string | null; fallbackHref: string }) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
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
          }}
        />
      )}
    </>
  );
}
