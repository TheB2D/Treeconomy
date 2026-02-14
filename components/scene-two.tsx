"use client";

import { Button } from "./ui/8bit-button";
import { useEffect, useState } from "react";

interface SceneTwoProps {
  onBack: () => void;
}

export function SceneTwo({ onBack }: SceneTwoProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Trigger fade-in animation after mount
    setTimeout(() => setFadeIn(true), 50);
  }, []);

  const handleLearnMore = () => {
    setIsFocused(true);
    // Delay UI appearance slightly for smooth transition
    setTimeout(() => setShowUI(true), 300);
  };

  const handleClose = () => {
    setShowUI(false);
    setTimeout(() => setIsFocused(false), 300);
  };

  const handleReturn = () => {
    // Start fade out
    setIsFadingOut(true);
    // After fade completes, return to scene 1
    setTimeout(() => {
      onBack();
    }, 1000); // 1 second fade duration
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{
        opacity: isFadingOut ? 0 : (fadeIn ? 1 : 0),
        transition: 'opacity 1s ease-in-out',
      }}
    >
      {/* Background GIF - full screen, always prominent */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background2.gif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          filter: isFocused ? 'none' : 'blur(2px)',
          transition: 'filter 0.5s ease-in-out',
        }}
      />

      {/* Light overlay for readability only when not focused */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundColor: isFocused ? 'transparent' : 'rgba(0,0,0,0.2)',
          transition: 'background-color 0.5s ease-in-out',
        }}
      />

      {/* Initial Content - Hidden when focused */}
      {!isFocused && (
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6">
            <h1 
              className="text-5xl mb-4"
              style={{
                color: '#48bb78',
                textShadow: '4px 4px 0 rgba(0,0,0,0.8), 0 0 20px rgba(72, 187, 120, 0.5)',
              }}
            >
              NATURE&apos;S THOUGHT
            </h1>
            
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{
                color: '#f0f0f0',
                textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
              }}
            >
              A peaceful place where the ranger reflects on their journey...
            </p>

            <div className="mt-8 flex gap-4 justify-center">
              <Button
                onClick={handleReturn}
                variant="outline"
                size="lg"
              >
                Return to Skill Tree
              </Button>
              <Button
                onClick={handleLearnMore}
                variant="default"
                size="lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Environmental Impact UI - Floating Panel on Left */}
      {showUI && (
        <div 
          className="absolute left-8 top-1/2 z-20"
          style={{
            animation: 'slideInLeft 0.4s ease-out forwards',
            width: 'calc(50% - 4rem)',
            transform: 'translateY(-50%)',
            height: '85vh',
          }}
        >
          <div 
            className="bg-card/95 border-4 border-border pixel-border h-full flex flex-col"
            style={{
              width: '100%',
              boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-3 border-b-4 border-border flex justify-between items-center">
              <h2 className="text-xl">ENVIRONMENTAL IMPACT</h2>
              <button
                onClick={handleClose}
                className="text-2xl hover:scale-110 transition-transform"
                style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
              >
                ✕
              </button>
            </div>

            {/* Content - No scrollbar, fixed layout */}
            <div className="p-4 flex-1 flex flex-col gap-3 overflow-hidden">
              {/* Top row - Two metrics side by side */}
              <div className="grid grid-cols-2 gap-3 h-[22%]">
                {/* Fossil Fuels */}
                <div className="border-2 border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">🛢️ FOSSIL</span>
                    <span className="text-destructive text-lg font-bold">78%</span>
                  </div>
                  <div className="w-full h-6 border-2 border-border bg-card">
                    <div 
                      className="h-full bg-destructive"
                      style={{ width: '78%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Non-renewable reliance
                  </p>
                </div>

                {/* CO2 Emissions */}
                <div className="border-2 border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">☁️ CO2</span>
                    <span className="text-destructive text-lg font-bold">92%</span>
                  </div>
                  <div className="w-full h-6 border-2 border-border bg-card">
                    <div 
                      className="h-full bg-destructive"
                      style={{ width: '92%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Atmospheric carbon
                  </p>
                </div>
              </div>

              {/* Middle row - Two metrics side by side */}
              <div className="grid grid-cols-2 gap-3 h-[22%]">
                {/* Renewable Energy */}
                <div className="border-2 border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">🌱 RENEW</span>
                    <span className="text-primary text-lg font-bold">22%</span>
                  </div>
                  <div className="w-full h-6 border-2 border-border bg-card">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: '22%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sustainable energy
                  </p>
                </div>

                {/* Forest Coverage */}
                <div className="border-2 border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">🌲 FOREST</span>
                    <span className="text-accent text-lg font-bold">45%</span>
                  </div>
                  <div className="w-full h-6 border-2 border-border bg-card">
                    <div 
                      className="h-full bg-accent"
                      style={{ width: '45%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Natural habitats
                  </p>
                </div>
              </div>

              {/* Message Panel */}
              <div className="border-2 border-border bg-muted/70 p-4 h-[28%]">
                <div className="text-xs mb-2 text-primary font-bold">📊 RANGER STATUS</div>
                <p className="text-[11px] leading-relaxed text-foreground/90">
                  The earth&apos;s balance shifts with every choice. Your skills 
                  determine the fate of ecosystems. Current trajectory: 
                  <span className="text-destructive font-bold"> CRITICAL</span>
                </p>
                <p className="text-[10px] mt-2 text-muted-foreground italic">
                  &quot;We do not inherit the earth from our ancestors; 
                  we borrow it from our children.&quot;
                </p>
              </div>

              {/* Action Panel */}
              <div className="border-2 border-primary bg-primary/10 p-3 h-[20%]">
                <div className="text-sm font-bold text-primary mb-2">⚡ YOUR IMPACT</div>
                <p className="text-[11px] leading-tight">
                  Level up sustainable skills to shift these metrics. 
                  Every point matters.
                </p>
              </div>

              {/* Bottom Button */}
              <div className="mt-auto pt-2">
                <Button
                  onClick={handleReturn}
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  Return to Skill Tree
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
