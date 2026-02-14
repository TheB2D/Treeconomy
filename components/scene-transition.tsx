"use client";

import { useEffect, useState, useMemo } from "react";

interface SceneTransitionProps {
  isActive: boolean;
  onComplete: () => void;
}

const QUOTES = [
  {
    text: "The Earth does not belong to us: we belong to the Earth.",
    author: "Marlee Matlin"
  },
  {
    text: "The greatest threat to our planet is the belief that someone else will save it.",
    author: "Robert Swan"
  },
  {
    text: "We do not inherit the Earth from our ancestors; we borrow it from our children.",
    author: "Chief Seattle"
  },
  {
    text: "In nature, nothing exists alone.",
    author: "Rachel Carson"
  },
  {
    text: "The environment is where we all meet; where we all have a mutual interest; it is the one thing all of us share.",
    author: "Lady Bird Johnson"
  },
  {
    text: "We won't have a society if we destroy the environment.",
    author: "Margaret Mead"
  },
  {
    text: "What we are doing to the forests of the world is but a mirror reflection of what we are doing to ourselves.",
    author: "Mahatma Gandhi"
  },
  {
    text: "The Earth is what we all have in common.",
    author: "Wendell Berry"
  },
  {
    text: "Look deep into nature, and then you will understand everything better.",
    author: "Albert Einstein"
  },
  {
    text: "Plans to protect air and water, wilderness and wildlife are in fact plans to protect man.",
    author: "Stewart Udall"
  }
];

export function SceneTransition({ isActive, onComplete }: SceneTransitionProps) {
  const [phase, setPhase] = useState<'walk' | 'loading' | 'complete'>('walk');
  const [heroPosition, setHeroPosition] = useState(-5); // Start off-screen left
  
  // Select a random quote when the component becomes active
  const selectedQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isActive) return;

    // Phase 1: Hero walks across screen at better pace (3.5 seconds)
    // Background fades to black progressively during this time
    const walkTimer = setTimeout(() => {
      setPhase('loading');
    }, 3500);

    // Animate hero walking - slower pace
    const walkInterval = setInterval(() => {
      setHeroPosition((prev) => {
        if (prev >= 50) return 50; // Stop at center of screen
        return prev + 0.8; // Move 0.8% every 30ms (slower than before)
      });
    }, 30);

    return () => {
      clearTimeout(walkTimer);
      clearInterval(walkInterval);
    };
  }, [isActive]);

  useEffect(() => {
    if (phase === 'loading') {
      // Phase 2: Show loading text in pure black for 3 seconds
      const loadTimer = setTimeout(() => {
        setPhase('complete');
        onComplete();
      }, 3000); // Show loading for 3 seconds

      return () => clearTimeout(loadTimer);
    }
  }, [phase, onComplete]);

  if (!isActive) return null;

  // Calculate background fade based on hero position
  // Fades from 0 to 1 as hero moves from -5% to 50%
  const getBackgroundFade = () => {
    if (phase === 'loading' || phase === 'complete') {
      return 1; // Pure black during loading
    }
    // Progressive fade during walk: (current position + 5) / 55
    const fadeProgress = Math.min(Math.max((heroPosition + 5) / 55, 0), 1);
    return fadeProgress;
  };

  // Show loading text when background is mostly black (95%+)
  const showLoadingText = getBackgroundFade() >= 0.95 || phase === 'loading' || phase === 'complete';

  return (
    <div 
      className="fixed inset-0 z-[100] pointer-events-none"
    >
      {/* Background fade overlay - fades progressively as hero walks */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: getBackgroundFade(),
          pointerEvents: 'none',
        }}
      />

      {/* Hero character walking - larger size from the start */}
      <div
        style={{
          position: 'absolute',
          left: `${heroPosition}%`,
          top: '85vh',
          transform: `translate(-50%, -50%) scale(1.8)`, // Start at the "perfect" size
          imageRendering: 'pixelated',
        }}
      >
        <img 
          src="/hero_load.gif" 
          alt="Hero walking"
          style={{
            width: '80px',
            height: '80px',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      {/* Loading text overlay - appears as soon as it's black */}
      {showLoadingText && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'fadeIn 0.5s ease-in-out',
            pointerEvents: 'none',
          }}
        >
          <div className="text-center max-w-2xl px-8" style={{ marginTop: '-10vh' }}>
            <h2 
              className="text-4xl mb-6"
              style={{
                color: '#d1d5db',
                textShadow: '4px 4px 0 rgba(0,0,0,1)',
              }}
            >
              LOADING NEXT SCENE
            </h2>
            <div className="flex gap-3 justify-center mb-8">
              <div 
                className="w-4 h-4 border-2"
                style={{ 
                  backgroundColor: '#d1d5db',
                  borderColor: '#9ca3af',
                  animation: 'pixelBounce 1s ease-in-out infinite',
                  boxShadow: '2px 2px 0 rgba(0,0,0,1)'
                }}
              />
              <div 
                className="w-4 h-4 border-2"
                style={{ 
                  backgroundColor: '#d1d5db',
                  borderColor: '#9ca3af',
                  animation: 'pixelBounce 1s ease-in-out 0.2s infinite',
                  boxShadow: '2px 2px 0 rgba(0,0,0,1)'
                }}
              />
              <div 
                className="w-4 h-4 border-2"
                style={{ 
                  backgroundColor: '#d1d5db',
                  borderColor: '#9ca3af',
                  animation: 'pixelBounce 1s ease-in-out 0.4s infinite',
                  boxShadow: '2px 2px 0 rgba(0,0,0,1)'
                }}
              />
            </div>
            
            {/* Random Quote */}
            <div className="mt-8">
              <p 
                className="text-lg italic mb-3"
                style={{
                  color: '#e5e7eb',
                  textShadow: '2px 2px 0 rgba(0,0,0,1)',
                  lineHeight: '1.6',
                }}
              >
                &quot;{selectedQuote.text}&quot;
              </p>
              <p 
                className="text-sm"
                style={{
                  color: '#9ca3af',
                  textShadow: '2px 2px 0 rgba(0,0,0,1)',
                }}
              >
                — {selectedQuote.author}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes pixelBounce {
          0%, 100% { 
            transform: translateY(0) scale(1);
          }
          50% { 
            transform: translateY(-12px) scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
