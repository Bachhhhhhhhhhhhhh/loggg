"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedNumberProps {
  value: string;
  duration?: number;
  className?: string;
}

function parseNumericValue(value: string) {
  const match = value.match(/^([\d,.]+)/);
  if (!match) return null;

  const numericPart = match[1];
  return {
    target: parseFloat(numericPart.replace(/,/g, "")),
    suffix: value.slice(numericPart.length),
    decimals: (numericPart.split(".")[1] || "").length,
  };
}

export function AnimatedNumber({ value, duration = 1200, className }: AnimatedNumberProps) {
  const parsed = parseNumericValue(value);
  const [display, setDisplay] = useState(() =>
    parsed ? (parsed.decimals > 0 ? "0." + "0".repeat(parsed.decimals) : "0") : value
  );
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (hasAnimated.current) {
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    const numeric = parseNumericValue(value);
    if (!numeric) {
      hasAnimated.current = true;
      const frame = requestAnimationFrame(() => setDisplay(value));
      return () => cancelAnimationFrame(frame);
    }

    let rafId = 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = numeric.target * eased;

          setDisplay(
            (numeric.decimals > 0
              ? current.toFixed(numeric.decimals)
              : Math.round(current).toString()) + numeric.suffix
          );

          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            hasAnimated.current = true;
            setDisplay(value);
          }
        };

        rafId = requestAnimationFrame(tick);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}