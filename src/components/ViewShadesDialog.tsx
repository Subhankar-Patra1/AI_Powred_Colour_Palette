// src/components/ViewShadesDialog.tsx
"use client";

import type { Color } from "@/lib/types";
import { generateShades } from "@/lib/colorUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import ColorSwatch from "./ColorSwatch";
import { useState, useEffect } from "react";

interface ViewShadesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  baseColor: Color | null;
  onToggleSaveIndividualColor: (color: Color) => void;
  isIndividualColorSaved: (hex: string) => boolean;
}

export default function ViewShadesDialog({
  isOpen,
  onClose,
  baseColor,
  onToggleSaveIndividualColor,
  isIndividualColorSaved,
}: ViewShadesDialogProps) {
  const [shades, setShades] = useState<Color[]>([]);

  useEffect(() => {
    if (baseColor && isOpen) {
      setShades(generateShades(baseColor, 9)); // Generate 9 shades (4 darker, original, 4 lighter)
    } else if (!isOpen) {
      setShades([]); // Clear shades when dialog is closed to free up memory
    }
  }, [baseColor, isOpen]);

  if (!baseColor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] bg-card flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            Shades of {baseColor.name} ({baseColor.hex.toUpperCase()})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow p-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 py-4">
            {shades.map((shade, index) => (
              <ColorSwatch
                key={`${shade.hex}-${index}-shade`}
                color={shade}
                onToggleSave={onToggleSaveIndividualColor}
                isSaved={isIndividualColorSaved(shade.hex)}
                showSaveButton={true}
                // No onViewShades from within shades dialog to prevent nesting/complexity
                showViewShadesButton={false} 
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
