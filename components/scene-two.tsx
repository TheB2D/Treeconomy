"use client";

import { Button } from "./ui/8bit-button";
import { useEffect, useState, useRef } from "react";

interface SceneTwoProps {
  onBack: () => void;
}

interface BankData {
  name: string;
  logo: string;
  debt: number;
  fossilFuelInvestment: number;
}

export function SceneTwo({ onBack }: SceneTwoProps) {
  const [fadeIn, setFadeIn] = useState(false);
  const [showUI, setShowUI] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [carbonValue, setCarbonValue] = useState(0);
  const [typedMessage, setTypedMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  const fullMessage = "Your financial choices ripple through the ecosystem. Every dollar you owe funds projects that either heal or harm our planet. By understanding where your money goes, you gain the power to redirect it toward a sustainable future.";
  
  const banks: BankData[] = [
    { name: "Chase Bank", logo: "/icons/key_t1.png", debt: 15420, fossilFuelInvestment: 18.5 },
    { name: "Capital One", logo: "/icons/swipe_t2.png", debt: 8750, fossilFuelInvestment: 12.3 },
    { name: "Wells Fargo", logo: "/icons/scroll_t3.png", debt: 6200, fossilFuelInvestment: 21.7 },
  ];

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 50);
    setTimeout(() => setShowUI(true), 800);
  }, []);

  // Carbon counter animation
  useEffect(() => {
    if (showUI) {
      const targetValue = 6.2;
      const duration = 2000;
      const steps = 60;
      const increment = targetValue / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= targetValue) {
          setCarbonValue(targetValue);
          clearInterval(timer);
          // Start typing message after counter finishes
          setIsTyping(true);
        } else {
          setCarbonValue(current);
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [showUI]);

  // Typing animation
  useEffect(() => {
    if (isTyping && typedMessage.length < fullMessage.length) {
      const timer = setTimeout(() => {
        setTypedMessage(fullMessage.slice(0, typedMessage.length + 1));
      }, 30);
      return () => clearTimeout(timer);
    } else if (typedMessage.length === fullMessage.length) {
      setIsTyping(false);
    }
  }, [isTyping, typedMessage, fullMessage]);

  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleReturn = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onBack();
    }, 1000);
  };

  const getFossilFuelColor = (percentage: number) => {
    if (percentage < 5) return '#48bb78';
    if (percentage < 15) return '#ecc94b';
    return '#f56565';
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{
        opacity: isFadingOut ? 0 : (fadeIn ? 1 : 0),
        transition: 'opacity 1s ease-in-out',
      }}
    >
      {/* Background GIF - full screen */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/background2.gif')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
        }}
      />

      {/* Subtle overlay for better contrast */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.3), rgba(0,0,0,0.1))',
        }}
      />

      {/* Nature's Insights Panel - Left Side */}
      {showUI && (
        <div 
          className="absolute left-0 top-0 z-20 h-screen md:w-1/2 w-full flex items-center justify-start pl-8"
          style={{
            animation: 'slideInLeft 0.4s ease-out forwards',
            transform: `translateY(${scrollY * 0.5}px)`,
          }}
        >
          <div 
            className="w-full max-w-[600px] h-[90vh] flex flex-col overflow-hidden bg-card/95 border-4 border-border pixel-border"
            style={{
              boxShadow: '8px 8px 0 rgba(0,0,0,0.5)',
              imageRendering: 'pixelated',
            }}
          >
            {/* 1. HEADER SECTION (80px) */}
            <div 
              className="px-6 py-4 bg-primary text-primary-foreground border-b-4 border-border"
              style={{ 
                minHeight: '80px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 
                    className="text-2xl leading-tight"
                    style={{
                      textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                    }}
                  >
                    NATURE&apos;S INSIGHTS
                  </h2>
                  <p 
                    className="text-[11px] mt-1"
                    style={{
                      opacity: 0.7,
                    }}
                  >
                    AI RANGER ANALYSIS
                  </p>
                </div>
                <img
                  src="/icons/leaf.png"
                  alt="Leaf status"
                  className="w-8 h-8 object-contain"
                  style={{
                    animation: 'leafSway 2s ease-in-out infinite',
                    transformOrigin: 'top center',
                  }}
                />
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <img src="/icons/sound_on.png" alt="Sound on" className="w-5 h-5 object-contain opacity-80" />
                <img src="/icons/music.png" alt="Music" className="w-5 h-5 object-contain opacity-70" />
              </div>
            </div>

            {/* Scrollable Content Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
              
              {/* 2. CARBON IMPACT CARD (180px) */}
              <div 
                className="border-4 border-destructive bg-destructive/10 p-4 relative overflow-hidden pixel-border"
                style={{
                  minHeight: '180px',
                }}
              >
                <div className="absolute top-2 right-2 opacity-30">
                  <img src="/icons/downgrade.png" alt="Impact warning" className="w-10 h-10 object-contain" />
                </div>
                <div className="relative z-10">
                  <div 
                    className="text-3xl font-bold mb-2 text-destructive"
                    style={{
                      textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {carbonValue.toFixed(1)} TONS CO2/YEAR
                  </div>
                  <div 
                    className="text-xs mb-4 text-foreground"
                  >
                    YOUR DEBT&apos;S CARBON FOOTPRINT
                  </div>
                  
                  {/* Progress bar */}
                  <div className="relative h-8 bg-card border-2 border-border overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-destructive"
                      style={{
                        width: '82%',
                        transition: 'width 2s ease-out',
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-foreground"
                      style={{ textShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
                    >
                      82% ABOVE AVERAGE
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. BANK ATTRIBUTION SECTION (200px min) */}
              <div 
                className="border-2 border-border bg-muted/50 p-4 pixel-border"
                style={{
                  minHeight: '200px',
                }}
              >
                <h3 
                  className="text-lg font-bold mb-3 text-primary"
                  style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
                >
                  WHERE YOUR MONEY GOES
                </h3>
                
                <div className="space-y-3">
                  {banks.map((bank, index) => (
                    <div
                      key={index}
                      className="p-3 border-2 border-border bg-card pixel-border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                      style={{
                        transform: 'perspective(1000px) rotateX(0deg)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateX(2deg) scale(1.02)';
                        e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img src={bank.logo} alt={`${bank.name} icon`} className="w-7 h-7 object-contain" />
                          <span className="font-semibold text-sm text-foreground">
                            {bank.name}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          ${bank.debt.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>
                          Fossil fuel investment:
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <span style={{ color: getFossilFuelColor(bank.fossilFuelInvestment) }}>
                            <span className="inline-flex items-center gap-1">
                              <img src="/icons/scroll6.png" alt="Fossil fuel metric" className="w-4 h-4 object-contain" />
                              {bank.fossilFuelInvestment}%
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. AI RANGER MESSAGE BOX (220px min) */}
              <div 
                className="border-2 border-primary bg-primary/10 p-4 pixel-border"
                style={{
                  minHeight: '220px',
                }}
              >
                <div className="flex gap-3">
                  <div 
                    className="w-8 h-8 border-2 border-primary bg-primary/20 flex-shrink-0 flex items-center justify-center"
                  >
                    <img src="/icons/scroll_t7.png" alt="AI Ranger" className="w-5 h-5 object-contain" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-3xl mb-2 text-primary opacity-60">
                      &ldquo;
                    </div>
                    <p 
                      className="text-sm leading-relaxed text-foreground"
                      style={{ 
                        minHeight: '120px',
                      }}
                    >
                      {typedMessage}
                      {isTyping && (
                        <span 
                          className="inline-block w-2 h-4 ml-1 bg-primary"
                          style={{
                            animation: 'blink 1s infinite',
                          }}
                        />
                      )}
                    </p>
                    
                    {!isTyping && (
                      <div 
                        className="mt-3 text-center text-xs text-primary/50"
                      >
                        <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 5. ACTION BUTTONS (120px) */}
              <div className="space-y-3" style={{ minHeight: '120px' }}>
                <Button
                  variant="default"
                  size="lg"
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <img src="/icons/up.png" alt="Up arrow" className="w-4 h-4 object-contain" />
                    SHOW GREEN ALTERNATIVES
                  </span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <img src="/icons/down.png" alt="Down arrow" className="w-4 h-4 object-contain" />
                    EXPLAIN MY OPTIONS
                  </span>
                </Button>
              </div>

              {/* 6. FOOTER STATS (60px) */}
              <div 
                className="border-2 border-border bg-muted/50 p-3 pixel-border"
                style={{
                  minHeight: '60px',
                }}
              >
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xl mb-1 inline-flex justify-center">
                      <img src="/icons/strength.png" alt="Trees planted" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      TREES PLANTED
                    </div>
                    <div 
                      className="text-sm font-bold text-primary"
                      style={{ 
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      0
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-r-2 border-border">
                    <div className="text-xl mb-1 inline-flex justify-center">
                      <img src="/icons/up.png" alt="Score progress" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      SCORE PROGRESS
                    </div>
                    <div 
                      className="text-sm font-bold text-primary"
                      style={{ 
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      +12
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xl mb-1 inline-flex justify-center">
                      <img src="/icons/down.png" alt="CO2 offset" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      CO2 OFFSET
                    </div>
                    <div 
                      className="text-sm font-bold text-primary"
                      style={{ 
                        animation: 'pulse 2s infinite',
                      }}
                    >
                      0 TONS
                    </div>
                  </div>
                </div>
              </div>

              {/* Return Button */}
              <div className="pt-2 pb-4">
                <Button
                  onClick={handleReturn}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <img src="/icons/cross.png" alt="Close" className="w-4 h-4 object-contain" />
                    Return to Skill Tree
                  </span>
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
            transform: translateX(-100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes leafSway {
          0%, 100% {
            transform: rotate(-5deg);
          }
          50% {
            transform: rotate(5deg);
          }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.05); 
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
