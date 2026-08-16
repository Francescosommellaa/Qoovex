"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type HeroMockupScrollProps = {
  children: ReactNode;
  className?: string;
};

export function HeroMockupScroll({ children, className = "" }: HeroMockupScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let animationFrameId = 0;
    let listeningForScroll = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start expanding when container top reaches 85% of viewport
      // Complete expansion when container top reaches 20% of viewport
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.20;
      const progress = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);

      setScrollProgress(progress);
    };

    const onScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    const stopListeningForScroll = () => {
      if (!listeningForScroll) return;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleScroll);
      listeningForScroll = false;
    };

    const updateMotionPreference = () => {
      stopListeningForScroll();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      if (reducedMotion.matches) {
        setScrollProgress(1);
        return;
      }

      handleScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
      listeningForScroll = true;
    };

    reducedMotion.addEventListener("change", updateMotionPreference);
    updateMotionPreference();

    return () => {
      reducedMotion.removeEventListener("change", updateMotionPreference);
      stopListeningForScroll();
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Compute transform values:
  // Initial: scale(0.84), rotateX(14deg), translateY(24px)
  // Final: scale(1.0), rotateX(0deg), translateY(0px)
  const scale = 0.84 + scrollProgress * 0.16;
  const rotateX = 14 * (1 - scrollProgress);
  const translateY = 24 * (1 - scrollProgress);
  const shadowOpacity = 0.08 + scrollProgress * 0.22;

  return (
    <div className={`perspective-container w-full ${className}`} ref={containerRef}>
      <div
        data-hero-mockup-scroll
        style={{
          transform: `rotateX(${rotateX}deg) scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: "50% 0%",
          boxShadow: `0 ${10 + scrollProgress * 25}px ${30 + scrollProgress * 40}px -10px rgba(0, 0, 0, ${shadowOpacity})`,
          transition: "transform 0.08s ease-out, box-shadow 0.08s ease-out",
          willChange: "transform",
        }}
      >
        <div className="relative rounded-2xl border bg-card/95 shadow-2xl backdrop-blur-xl ring-1 ring-foreground/10 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
