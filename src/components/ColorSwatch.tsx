
// src/components/ColorSwatch.tsx
"use client";

import type { Color } from "@/lib/types";
import { useState, useEffect, useCallback } from "react";
import { Copy, Check, Heart, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { isLight } from "@/lib/colorUtils";

interface ColorSwatchProps {
  color: Color;
  showSaveButton?: boolean;
  isSaved?: boolean;
  onToggleSave?: (color: Color) => void;
  showViewShadesButton?: boolean;
  onViewShades?: (color: Color) => void;
}

export default function ColorSwatch({
  color,
  showSaveButton = false,
  isSaved = false,
  onToggleSave,
  showViewShadesButton = false,
  onViewShades,
}: ColorSwatchProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  const [glowProps, setGlowProps] = useState<{ gradient: string; shadowColor: string } | null>(null);

  const textColorClass = isLight(color.hex) ? "text-black bg-white/80 hover:bg-white/95" : "text-white bg-black/80 hover:bg-black/95";
  const iconColorClass = isLight(color.hex) ? "text-black" : "text-white";

  const handleCopy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); 
    try {
      await navigator.clipboard.writeText(color.hex);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: `${color.hex.toUpperCase()} copied to clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy hex code to clipboard.",
        variant: "destructive",
      });
      console.error("Failed to copy text: ", err);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const generateGlowProperties = useCallback(() => {
    const randomAngle = Math.floor(Math.random() * 360);
    
    // Generate 4 distinct hues for a more dynamic gradient
    const hues: number[] = [];
    let currentHue = Math.random() * 360;
    for (let i = 0; i < 4; i++) {
      hues.push(currentHue);
      // Ensure hues are somewhat spread out for visual distinctiveness
      currentHue = (currentHue + 70 + Math.random() * 50) % 360; 
    }

    // Create vibrant, neon-like HSL color stops
    // Using a slightly lower lightness (e.g., 60%) can make colors appear more saturated/punchy
    const colorStops = hues.map(h => `hsl(${h}, 100%, 60%)`); 
    const gradient = `linear-gradient(${randomAngle}deg, ${colorStops.join(', ')})`;
    
    // Shadow color derived from the first hue of the gradient, but lighter and more transparent
    const shadowColorHue = hues[0];
    const shadowColor = `hsla(${shadowColorHue}, 100%, 75%, 0.6)`; // Lighter (75% lightness), slightly more opaque shadow (0.6 alpha)

    return { gradient, shadowColor };
  }, []);

  const handleSwatchClick = useCallback(() => {
    const newGlowProps = generateGlowProperties();
    setGlowProps(newGlowProps);
  }, [generateGlowProperties]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (glowProps) {
      timerId = setTimeout(() => {
        setGlowProps(null);
      }, 2500); // Glow duration
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [glowProps]);

  const outerDivStyle: React.CSSProperties = glowProps
    ? {
        padding: '3px', 
        backgroundImage: glowProps.gradient,
        boxShadow: `0 0 28px 7px ${glowProps.shadowColor}`, // Increased blur (28px) and spread (7px) for more glow
        borderRadius: '0.5rem', // Matches 'rounded-lg'
        transition: 'box-shadow 0.3s ease-out, background-image 0.05s linear', // Fast transition for bg image if any, smooth for shadow
      }
    : {
        padding: '0px', 
        borderRadius: '0.5rem',
        transition: 'box-shadow 0.3s ease-out, padding 0.3s ease-out', // Transition padding out
      };
      
  const handleButtonAction = (event: React.MouseEvent<HTMLButtonElement>, actionFn?: (colorOrEvent?: any) => void, arg?: any) => {
    event.stopPropagation(); // IMPORTANT: Prevents the swatch click (and glow) when an internal button is clicked
    if (actionFn) {
      if (arg !== undefined) {
        actionFn(arg);
      } else {
        actionFn(event); // For handlers that expect the event
      }
    }
  };


  return (
    <TooltipProvider delayDuration={300}>
      <div 
        className={cn(
          "relative cursor-pointer"
        )}
        style={outerDivStyle}
        onClick={handleSwatchClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSwatchClick()}
        aria-label={`Color swatch ${color.name}, hex ${color.hex}. Click to activate glow effect.`}
      >
        <div 
          className="flex flex-col items-center justify-end p-3 rounded-lg aspect-[3/4] w-full overflow-hidden"
          style={{ backgroundColor: color.hex }}
          data-ai-hint="color swatch"
        >
          <div className="absolute top-1.5 left-1.5 right-1.5 flex justify-between items-start z-10">
            {/* Left-aligned buttons (Save) */}
            <div className="flex flex-col space-y-1">
              {showSaveButton && onToggleSave && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleButtonAction(e, onToggleSave, color)}
                      className={cn("p-1.5 rounded-full h-7 w-7", textColorClass)}
                      aria-label={isSaved ? "Unsave color" : "Save color"}
                    >
                      <Heart className={cn("h-4 w-4", isSaved ? "fill-red-500 text-red-500" : iconColorClass)} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="start">
                    <p>{isSaved ? "Unsave Color" : "Save Color"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Right-aligned buttons (Copy, View Shades) */}
            <div className="flex flex-col space-y-1 items-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleButtonAction(e, (clickedEvent) => handleCopy(clickedEvent as React.MouseEvent<HTMLButtonElement>))}
                    className={cn("p-1.5 rounded-full h-7 w-7", textColorClass)}
                    aria-label={`Copy ${color.hex}`}
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="end">
                  <p>Copy Hex</p>
                </TooltipContent>
              </Tooltip>
              {showViewShadesButton && onViewShades && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleButtonAction(e, onViewShades, color)}
                      className={cn("p-1.5 rounded-full h-7 w-7", textColorClass)}
                      aria-label="View shades"
                    >
                      <Layers className={cn("h-4 w-4", iconColorClass)} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="end">
                    <p>View Shades</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          <div
            className={cn(
              "text-center p-1.5 rounded w-[calc(100%-16px)] relative z-0", 
              textColorClass,
              "bg-opacity-75" 
            )}
          >
            <p className="font-mono text-sm font-semibold">{color.hex.toUpperCase()}</p>
            <p className="text-xs capitalize truncate">{color.name}</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

