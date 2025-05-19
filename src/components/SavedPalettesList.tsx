
// src/components/SavedPalettesList.tsx
"use client";

import type { Palette, Color } from "@/lib/types";
import ColorPaletteDisplay from "./ColorPaletteDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, SlidersHorizontal, MoreVertical } from "lucide-react"; // Removed Eye
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedPalettesListProps {
  savedPalettes: Palette[];
  onDeletePalette: (paletteId: string) => void;
  // onSelectPalette: (palette: Palette) => void; // Removed as it's no longer used by this component
  onToggleSaveIndividualColor: (color: Color) => void;
  isIndividualColorSaved: (hex: string) => boolean;
  onViewShades: (color: Color) => void;
  onAdjustPalette: (palette: Palette) => void; // For adjusting colors directly
  onRenamePalette: (palette: Palette) => void; // For renaming palette
}

export default function SavedPalettesList({ 
    savedPalettes, 
    onDeletePalette, 
    // onSelectPalette, // Removed
    onToggleSaveIndividualColor,
    isIndividualColorSaved,
    onViewShades,
    onAdjustPalette,
    onRenamePalette,
}: SavedPalettesListProps) {
  if (savedPalettes.length === 0) {
    return (
      <div className="text-center py-8 sm:py-10">
        <p className="text-muted-foreground text-lg">You haven't saved any palettes yet.</p>
        <p className="text-sm text-muted-foreground">Generate some with AI and save your favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
       <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">My Palettes Collection</h2>
      {savedPalettes.map((palette) => (
        <Card key={palette.id} className="bg-card shadow-md">
          <CardHeader className="p-3 sm:p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg text-card-foreground truncate pr-2">{palette.name || "Saved Palette"}</CardTitle>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                    <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="sr-only">Palette Options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* <DropdownMenuItem onClick={() => onSelectPalette(palette)} className="text-xs sm:text-sm">
                    <Eye className="mr-2 h-4 w-4" /> View in Main Display
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => onRenamePalette(palette)} className="text-xs sm:text-sm">
                    <Edit3 className="mr-2 h-4 w-4" /> Rename Palette
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAdjustPalette(palette)} className="text-xs sm:text-sm">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Adjust Colors
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <ColorPaletteDisplay
              palette={palette}
              onDeletePalette={onDeletePalette} // Keep delete on main display of the card
              isSaved={true} 
              onToggleSaveIndividualColor={onToggleSaveIndividualColor}
              isIndividualColorSaved={isIndividualColorSaved}
              onViewShades={onViewShades}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
