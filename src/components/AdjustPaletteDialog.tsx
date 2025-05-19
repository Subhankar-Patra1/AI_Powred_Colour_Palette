// src/components/AdjustPaletteDialog.tsx
"use client";

import type { Palette, Color } from "@/lib/types";
import { adjustHsl, adjustTemperature, hexToRgb, rgbToHsl } from "@/lib/colorUtils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useMemo } from "react";
import ColorSwatch from "./ColorSwatch";

interface AdjustPaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette | null;
  onApply: (adjustedPalette: Palette) => void;
}

const initialAdjustments = {
  hue: 0,
  saturation: 0,
  brightness: 0,
  temperature: 0,
};

export default function AdjustPaletteDialog({ isOpen, onClose, palette, onApply }: AdjustPaletteDialogProps) {
  const [adjustments, setAdjustments] = useState(initialAdjustments);
  const [previewPalette, setPreviewPalette] = useState<Palette | null>(palette);

  useEffect(() => {
    if (palette) {
      setAdjustments(initialAdjustments); // Reset sliders when palette changes or dialog opens
      setPreviewPalette(palette);
    }
  }, [palette, isOpen]);

  const handleSliderChange = (type: keyof typeof initialAdjustments, value: number) => {
    setAdjustments(prev => ({ ...prev, [type]: value }));
  };

  useEffect(() => {
    if (!palette) return;

    const newColors = palette.colors.map(color => {
      let adjustedHex = color.hex;
      // Apply HSL adjustments first
      adjustedHex = adjustHsl(adjustedHex, adjustments.hue, adjustments.saturation, adjustments.brightness);
      // Then apply temperature
      adjustedHex = adjustTemperature(adjustedHex, adjustments.temperature);
      return { ...color, hex: adjustedHex };
    });
    setPreviewPalette({ ...palette, colors: newColors, id: palette.id + "-adjusted" }); // Give it a temp id
  }, [palette, adjustments]);


  const handleApply = () => {
    if (previewPalette) {
      onApply(previewPalette);
    }
    onClose();
  };
  
  const handleReset = () => {
    setAdjustments(initialAdjustments);
  };

  if (!palette) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Adjust Palette: {palette.name || "Untitled"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-1 mb-6 rounded-md">
          {(previewPalette || palette).colors.map((color, index) => (
            <ColorSwatch key={`${(previewPalette || palette).id}-${color.hex}-${index}`} color={color} />
          ))}
        </div>

        <div className="space-y-6 py-4">
          {[
            { id: "hue", label: "Hue", min: -180, max: 180, step: 1 },
            { id: "saturation", label: "Saturation", min: -50, max: 50, step: 1 },
            { id: "brightness", label: "Brightness", min: -50, max: 50, step: 1 },
            { id: "temperature", label: "Temperature", min: -50, max: 50, step: 1 },
          ].map(slider => (
            <div key={slider.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={slider.id} className="text-sm font-medium text-card-foreground">
                  {slider.label}
                </Label>
                <Input
                  type="number"
                  id={`${slider.id}-value`}
                  value={adjustments[slider.id as keyof typeof initialAdjustments]}
                  onChange={(e) => handleSliderChange(slider.id as keyof typeof initialAdjustments, parseInt(e.target.value))}
                  className="w-20 h-8 text-sm bg-background text-foreground"
                  min={slider.min}
                  max={slider.max}
                />
              </div>
              <Slider
                id={slider.id}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={[adjustments[slider.id as keyof typeof initialAdjustments]]}
                onValueChange={(value) => handleSliderChange(slider.id as keyof typeof initialAdjustments, value[0])}
                className="[&>span:first-child]:bg-primary"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>Reset Adjustments</Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleApply} className="bg-primary hover:bg-primary/90 text-primary-foreground">Apply</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
