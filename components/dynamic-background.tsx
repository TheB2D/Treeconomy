"use client";

import { useEffect, useRef } from "react";

export function DynamicBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const currentRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      targetRef.current = { x, y };
    };

    const tick = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;
      currentRef.current = current;

      if (rootRef.current) {
        rootRef.current.style.setProperty("--mx", `${current.x}`);
        rootRef.current.style.setProperty("--my", `${current.y}`);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="dynamic-bg" aria-hidden="true">
      <div className="dynamic-bg__layer dynamic-bg__layer--1" />
      <div className="dynamic-bg__layer dynamic-bg__layer--2" />
      <div className="dynamic-bg__layer dynamic-bg__layer--3" />
      <div className="dynamic-bg__layer dynamic-bg__layer--4" />
      <div className="dynamic-bg__dim" />
    </div>
  );
}
