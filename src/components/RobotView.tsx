"use client";
import dynamic from "next/dynamic";
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Robot } from "@phosphor-icons/react";
import type { Pose } from "./RobotCanvas";

// three.js and the model are a separate chunk, requested only after the browser is idle.
const RobotCanvas = dynamic(() => import("./RobotCanvas"), { ssr: false });

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
export const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => document.visibilityState === "visible", () => true);

export const useWebGL = () =>
  useSyncExternalStore(
    () => () => {},
    () => (hasWebGL() ? "ok" : "none"),
    () => "pending",
  );

export function RobotView({ pose, facing = 0, hover = false, active, bust, className = "" }: { pose: Pose; facing?: -1 | 0 | 1; hover?: boolean; active: boolean; bust?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const support = useWebGL();
  const gl = failed ? "none" : support;
  const visible = usePageVisible();

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 250));
    const id = idle(() => setReady(true));
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);

  return (
    <div className={className} data-pose={pose} aria-hidden>
      {gl === "ok" && ready && (
        <Boundary onError={() => setFailed(true)}>
          <RobotCanvas pose={pose} facing={facing} hover={hover} active={active && visible} bust={bust} />
        </Boundary>
      )}
      {gl === "none" && (
        <span className="flex h-full w-full items-center justify-center text-accent">
          <Robot size={bust ? 26 : 40} />
        </span>
      )}
    </div>
  );
}
