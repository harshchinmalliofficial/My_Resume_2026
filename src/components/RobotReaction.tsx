"use client";
import { useEffect } from "react";
import type { Pose } from "./RobotCanvas";
import { emit } from "@/lib/personality/bus";

// Lets a server-rendered page nudge the robot once, without delaying the page.
export function RobotReaction({ pose }: { pose: Pose }) {
  useEffect(() => {
    const t = window.setTimeout(() => emit({ type: "robot", pose }), 700);
    return () => window.clearTimeout(t);
  }, [pose]);
  return null;
}
