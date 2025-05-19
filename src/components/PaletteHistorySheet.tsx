// src/components/PaletteHistorySheet.tsx
"use client";

import type { Palette } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Trash2 } from "lucide-react";

interface PaletteHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  history: Palette[];
  onSelectPalette: (palette: Palette) => void; // Kept for direct selection if needed elsewhere
  onClearHistory: () => void;
  loadPalette: (palette: Palette) => void; // Added for consistent loading behavior
}

export default function PaletteHistorySheet({ isOpen, onClose, history, onClearHistory, loadPalette }: PaletteHistorySheetProps) {
  
  const handleSelectAndLoad = (palette: Palette) => {
    loadPalette(palette); // Uses the loadPalette from HomePage to ensure consistent state updates
    // onClose(); // loadPalette already closes the sheet
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[300px] xs:w-[360px] sm:w-[400px] bg-card flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle className="text-card-foreground">Palette History</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Recently generated or adjusted palettes. Click to view.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 pr-2 sm:pr-3">
          {history.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((palette) => (
                <div key={palette.id} className="p-2.5 border rounded-lg bg-background shadow-sm">
                  <p className="font-semibold text-sm truncate mb-2 text-foreground">{palette.name || "Untitled Palette"}</p>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {palette.colors.slice(0, 5).map((color, index) => (
                       <div key={`${palette.id}-hist-${color.hex}-${index}`} className="h-5 sm:h-6 w-full rounded" style={{ backgroundColor: color.hex }} title={color.name}></div>
                    ))}
                  </div>
                  <Button onClick={() => handleSelectAndLoad(palette)} variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                    <Eye className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> View Palette
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <SheetFooter className="mt-auto pt-4 border-t">
          <div className="flex justify-between items-center w-full">
            {history.length > 0 && (
              <Button variant="destructive" onClick={onClearHistory} size="sm" className="text-xs sm:text-sm">
                <Trash2 className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" /> Clear History
              </Button>
            )}
            <div className="flex-grow" /> {/* Pushes close button to the right if clear is not there */}
            <SheetClose asChild>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">Close</Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
