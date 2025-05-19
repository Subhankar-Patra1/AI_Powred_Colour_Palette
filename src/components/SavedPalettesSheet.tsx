
// src/components/SavedPalettesSheet.tsx
"use client";

import type { Palette } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Edit3, MoreVertical } from "lucide-react"; // Removed Eye
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface SavedPalettesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  savedPalettes: Palette[];
  // onSelectPalette: (palette: Palette) => void; // Removed
  onDeletePalette: (paletteId: string) => void;
  // loadPalette: (palette: Palette) => void;  // Removed
  onRenamePalette: (palette: Palette) => void; 
}

export default function SavedPalettesSheet({ 
    isOpen, 
    onClose, 
    savedPalettes, 
    onDeletePalette, 
    // loadPalette, // Removed
    onRenamePalette, 
}: SavedPalettesSheetProps) {
  
  // const handleSelectAndLoad = (palette: Palette) => { // Removed
  //   loadPalette(palette); 
  // };

  const handleDelete = (paletteId: string) => {
    onDeletePalette(paletteId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[300px] xs:w-[360px] sm:w-[400px] bg-card flex flex-col" side="right">
        <SheetHeader>
          <SheetTitle className="text-card-foreground">My Saved Palettes</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Your collection of favorite palettes.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 pr-2 sm:pr-3">
          {savedPalettes.length === 0 ? (
            <p className="text-muted-foreground text-center py-10">No palettes saved yet.</p>
          ) : (
            <div className="space-y-3">
              {savedPalettes.map((palette) => (
                <div key={palette.id} className="p-2.5 border rounded-lg bg-background shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-semibold text-sm truncate text-foreground flex-grow pr-2">{palette.name || "Untitled Palette"}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Palette Options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem onClick={() => handleSelectAndLoad(palette)} className="text-xs">
                          <Eye className="mr-2 h-3.5 w-3.5" /> View in Main
                        </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={() => onRenamePalette(palette)} className="text-xs">
                          <Edit3 className="mr-2 h-3.5 w-3.5" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(palette.id)} className="text-xs text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="grid grid-cols-5 gap-1 mb-2">
                    {palette.colors.slice(0, 5).map((color, index) => (
                       <div key={`${palette.id}-saved-${color.hex}-${index}`} className="h-5 sm:h-6 w-full rounded" style={{ backgroundColor: color.hex }} title={color.name}></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <SheetFooter className="mt-auto pt-4 border-t">
          <SheetClose asChild>
            <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
