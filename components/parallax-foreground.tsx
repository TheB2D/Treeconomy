"use client";

import { useEffect, useRef } from "react";

interface ParallaxForegroundProps {
  offset: { x: number; y: number };
  zoom: number;
}

export function ParallaxForeground({ offset, zoom }: ParallaxForegroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerLayerRef = useRef<HTMLDivElement>(null);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const accumulatedPanRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (containerRef.current && innerLayerRef.current) {
      // Calculate actual pan delta (not affected by zoom changes)
      const panDeltaX = offset.x - lastPanRef.current.x;
      const panDeltaY = offset.y - lastPanRef.current.y;
      
      // Accumulate the pan movement
      const parallaxMultiplier = 0.03; // Reduced for subtler effect
      accumulatedPanRef.current.x += panDeltaX * parallaxMultiplier;
      accumulatedPanRef.current.y += panDeltaY * parallaxMultiplier;
      
      lastPanRef.current = { x: offset.x, y: offset.y };
      
      // Apply accumulated pan as translation
      containerRef.current.style.transform = 
        `translate(${-accumulatedPanRef.current.x}px, ${-accumulatedPanRef.current.y}px)`;
      
      // Apply zoom as subtle scale (trees scale a little bit with zoom)
      const scaleAmount = 0.92 + (zoom * 0.08); // Ranges from 0.92 to 1.06 as zoom goes from 0.65 to 1.8
      innerLayerRef.current.style.transform = `translate(-50%, -50%) scale(${scaleAmount})`;
    }
  }, [offset, zoom]);

  return (
    <div 
      ref={containerRef}
      className="parallax-foreground"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        opacity: 1,
        willChange: 'transform',
      }}
    >
      <div
        ref={innerLayerRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: '100vw',
          height: '100vh',
          minWidth: '2304px',
          minHeight: '1296px',
          backgroundImage: "url('/dynamic_background_1/4.png')",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '100% 100%',
          imageRendering: 'pixelated',
          willChange: 'transform',
          transition: 'transform 0.15s ease-out',
        }}
      />
    </div>
  );
}
