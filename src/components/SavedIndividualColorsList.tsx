// src/components/SavedIndividualColorsList.tsx
"use client";

import type { SavedColor, Color } from "@/lib/types";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Trash2, Layers } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import ColorSwatch from "./ColorSwatch"; // Reusing ColorSwatch

interface SavedIndividualColorsListProps {
  savedColors: SavedColor[];
  onDeleteIndividualColor: (colorId: string) => void;
  onViewShades: (color: Color) => void;
  onToggleSaveIndividualColor: (color: Color) => void; 
  isIndividualColorSaved: (hex: string) => boolean;
}

export default function SavedIndividualColorsList({
  savedColors,
  // onDeleteIndividualColor, // onDelete is handled by onToggleSave which will call the unsave logic
  onViewShades,
  onToggleSaveIndividualColor,
  isIndividualColorSaved,
}: SavedIndividualColorsListProps) {
  // const { toast } = useToast(); // Toast is handled in page.tsx

  if (savedColors.length === 0) {
    return (
        <div className="text-center py-8 sm:py-10 mt-6 sm:mt-8">
            <p className="text-muted-foreground text-lg">No individual colors saved yet.</p>
            <p className="text-sm text-muted-foreground">Click the heart icon on a color swatch to save it!</p>
        </div>
    );
  }

  return (
    <section id="saved-individual-colors" className="w-full max-w-3xl lg:max-w-4xl">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">
        My Favorite Colors
      </h2>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
        {savedColors.map((savedColor) => (
          <ColorSwatch
            key={savedColor.id}
            color={{ hex: savedColor.hex, name: savedColor.name }}
            showSaveButton={true}
            isSaved={isIndividualColorSaved(savedColor.hex)} // Should be true for these
            onToggleSave={() => onToggleSaveIndividualColor(savedColor)} // Will trigger unsave
            showViewShadesButton={true}
            onViewShades={onViewShades}
          />
        ))}
      </div>
    </section>
  );
}
