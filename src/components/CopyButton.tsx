"use client";
import { Copy } from "@phosphor-icons/react";
import { strings } from "@/content/personality";
import { emit } from "@/lib/personality/bus";

// Reports success only after the clipboard write resolves; any failure (or a missing API) says so plainly.
export function CopyButton({ value, label }: { value: string; label: string }) {
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("unsupported");
      await navigator.clipboard.writeText(value);
      emit({ type: "toast", text: strings.copyOk });
      emit({ type: "robot", pose: "happy" });
    } catch {
      emit({ type: "toast", text: strings.copyFail, tone: "error" });
    }
  };
  return (
    <button type="button" onClick={copy} aria-label={label} className="inline-flex h-10 items-center gap-1.5 border border-line px-3 text-sm text-fg transition-colors hover:border-fg">
      <Copy size={16} /> Copy
    </button>
  );
}
