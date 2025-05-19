

"use client";

import { useState, useEffect } from "react";
import type { Palette, Color, SavedColor } from "@/lib/types";
import PaletteGeneratorForm from "@/components/PaletteGeneratorForm";
import ColorPaletteDisplay from "@/components/ColorPaletteDisplay";
import SavedPalettesList from "@/components/SavedPalettesList";
import SavedIndividualColorsList from "@/components/SavedIndividualColorsList";
import AdjustPaletteDialog from "@/components/AdjustPaletteDialog";
import PaletteHistorySheet from "@/components/PaletteHistorySheet";
import SavedPalettesSheet from "@/components/SavedPalettesSheet";
import ViewShadesDialog from "@/components/ViewShadesDialog";
import RenamePaletteDialog from "@/components/RenamePaletteDialog"; 
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Palette as PaletteIcon, Loader2, MoreVertical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type PaletteViewMode = 'new' | 'adjusted' | 'viewing' | 'initial';

export default function HomePage() {
  const [currentPalette, setCurrentPalette] = useState<Palette | null>(null);
  const [paletteViewMode, setPaletteViewMode] = useState<PaletteViewMode>('initial');
  const [savedPalettes, setSavedPalettes] = useLocalStorage<Palette[]>("palettePilot_savedPalettes", []);
  const [paletteHistory, setPaletteHistory] = useLocalStorage<Palette[]>("palettePilot_paletteHistory", []);
  const [savedIndividualColors, setSavedIndividualColors] = useLocalStorage<SavedColor[]>("palettePilot_savedIndividualColors", []);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [paletteToAdjust, setPaletteToAdjust] = useState<Palette | null>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [isSavedPalettesSheetOpen, setIsSavedPalettesSheetOpen] = useState(false);
  const [isViewShadesDialogOpen, setIsViewShadesDialogOpen] = useState(false);
  const [colorForShades, setColorForShades] = useState<Color | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false); 
  const [paletteToRename, setPaletteToRename] = useState<Palette | null>(null); 
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePaletteGenerated = (palette: Palette) => {
    setCurrentPalette(palette);
    setPaletteViewMode('new');
    setPaletteHistory(prev => [palette, ...prev.filter(p => p.id !== palette.id)].slice(0, 20));
  };

  const handleSavePalette = (paletteToSave: Palette) => {
    const baseId = paletteToSave.id.split('-adjusted')[0];
    const paletteWithAdjustFlagReset = { ...paletteToSave, isAdjusted: false, id: baseId, name: paletteToSave.name || `Palette ${baseId.substring(0,4)}` };

    let newSavedPalettes;
    const existingPaletteIndex = savedPalettes.findIndex(p => p.id === baseId);

    if (existingPaletteIndex > -1) {
        newSavedPalettes = [...savedPalettes];
        newSavedPalettes[existingPaletteIndex] = paletteWithAdjustFlagReset;
        toast({
            title: "Palette Updated!",
            description: `"${paletteWithAdjustFlagReset.name}" has been updated in your collection.`,
        });
    } else {
        newSavedPalettes = [paletteWithAdjustFlagReset, ...savedPalettes];
        toast({
            title: "Palette Saved!",
            description: `"${paletteWithAdjustFlagReset.name}" has been added to your collection.`,
        });
    }
    setSavedPalettes(newSavedPalettes);

    if(currentPalette && currentPalette.id.startsWith(baseId)) {
      setCurrentPalette(paletteWithAdjustFlagReset); 
      setPaletteViewMode('viewing'); 
    }
  };

  const handleDeletePalette = (paletteId: string) => {
    const paletteToDelete = savedPalettes.find(p => p.id === paletteId);
    setSavedPalettes(savedPalettes.filter((p) => p.id !== paletteId));
    toast({ title: "Palette Deleted", description: `"${paletteToDelete?.name || 'Palette'}" removed.` });
    if (currentPalette?.id === paletteId) {
        if (paletteHistory.length > 0 && paletteHistory.find(p=>p.id !== paletteId)) loadPalette(paletteHistory.filter(p=>p.id !== paletteId)[0]);
        else if (savedPalettes.filter((p) => p.id !== paletteId).length > 0) loadPalette(savedPalettes.filter((p) => p.id !== paletteId)[0]);
        else setCurrentPalette(null);
    }
    if (savedPalettes.filter((p) => p.id !== paletteId).length === 0) {
        setIsSavedPalettesSheetOpen(false);
    }
  };
  
  const isPaletteSaved = (paletteId: string): boolean => {
    const baseId = paletteId.split('-adjusted')[0];
    return savedPalettes.some(p => p.id === baseId);
  }

  const handleOpenAdjustDialog = (palette: Palette) => {
    setPaletteToAdjust(palette);
    setIsAdjustDialogOpen(true);
  };

  const handleApplyPaletteAdjustments = (adjustedPalette: Palette) => {
    const newAdjustedPalette = { 
        ...adjustedPalette, 
        isAdjusted: true, 
        id: `${adjustedPalette.id.split('-adjusted')[0]}-adjusted-${Date.now()}` 
    };
    setCurrentPalette(newAdjustedPalette);
    setPaletteViewMode('adjusted');
    setPaletteHistory(prev => [newAdjustedPalette, ...prev.filter(p => p.id !== newAdjustedPalette.id)].slice(0, 20));
    toast({ title: "Palette Adjusted" });
  };

  const loadPalette = (palette: Palette, mode: PaletteViewMode = 'viewing') => {
    setCurrentPalette(palette);
    setPaletteViewMode(mode);
    setIsHistorySheetOpen(false);
    setIsSavedPalettesSheetOpen(false);
  };

  const clearPaletteHistory = () => {
    setPaletteHistory([]);
    toast({ title: "History Cleared" });
    setIsHistorySheetOpen(false);
  };

  const handleToggleSaveIndividualColor = (color: Color) => {
    const existingColor = savedIndividualColors.find(c => c.hex.toLowerCase() === color.hex.toLowerCase());
    if (existingColor) {
      setSavedIndividualColors(prev => prev.filter(c => c.id !== existingColor.id));
      toast({ title: "Color Unsaved", description: `${color.name} (${color.hex}) removed from your favorites.` });
    } else {
      const newSavedColor: SavedColor = { ...color, id: `${color.hex}-${Date.now()}`, savedAt: Date.now() };
      setSavedIndividualColors(prev => [newSavedColor, ...prev]);
      toast({ title: "Color Saved!", description: `${color.name} (${color.hex}) added to your favorites.` });
    }
  };

  const isIndividualColorSaved = (hex: string): boolean => {
    return savedIndividualColors.some(c => c.hex.toLowerCase() === hex.toLowerCase());
  };

  const handleDeleteIndividualColor = (colorId: string) => {
    const colorToRemove = savedIndividualColors.find(c => c.id === colorId);
    setSavedIndividualColors(prev => prev.filter(c => c.id !== colorId));
    if (colorToRemove) {
        toast({ title: "Color Removed", description: `${colorToRemove.name} (${colorToRemove.hex}) removed.` });
    }
  };
  
  const handleOpenViewShadesDialog = (color: Color) => {
    setColorForShades(color);
    setIsViewShadesDialogOpen(true);
  };

  const handleOpenRenameDialog = (palette: Palette) => {
    setPaletteToRename(palette);
    setIsRenameDialogOpen(true);
  };

  const handleConfirmRename = (paletteId: string, newName: string) => {
    const updatedSavedPalettes = savedPalettes.map(p => 
      p.id === paletteId ? { ...p, name: newName } : p
    );
    setSavedPalettes(updatedSavedPalettes);

    if (currentPalette?.id === paletteId || currentPalette?.id.startsWith(`${paletteId}-adjusted`)) {
      setCurrentPalette(prev => prev ? { ...prev, name: newName } : null);
    }

    const updatedHistory = paletteHistory.map(p =>
      p.id.startsWith(paletteId) ? { ...p, name: newName } : p 
    );
    setPaletteHistory(updatedHistory);

    toast({ title: "Palette Renamed", description: `Palette successfully renamed to "${newName}".`});
    setIsRenameDialogOpen(false);
    setPaletteToRename(null);
  };
  
  useEffect(() => {
    if (isMounted && paletteViewMode === 'initial' && !isLoading) {
      if (paletteHistory.length > 0) {
        loadPalette(paletteHistory[0], 'viewing');
      } else if (savedPalettes.length > 0) {
        loadPalette(savedPalettes[0], 'viewing');
      } else {
        setPaletteViewMode('new'); 
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, isLoading, paletteViewMode]); // Simplified dependencies

  if (!isMounted) {
    return (
        <div className="container mx-auto px-4 py-8 md:px-8 md:py-12 min-h-screen flex flex-col items-center font-sans">
             <header className="mb-10 md:mb-12 text-center w-full">
                <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
                    <div className="flex items-center justify-between w-full px-2 sm:px-0">
                        <div className="flex-1" /> 
                        <div className="flex flex-col items-center px-4"> 
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                            <PaletteIcon className="inline-block mr-1 sm:mr-2 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-accent" />
                            Palette <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Pilot</span>
                            </h1>
                            <p className="text-muted-foreground mt-3 text-base sm:text-lg md:text-xl max-w-xl sm:max-w-2xl mx-auto">
                            Craft stunning color schemes with your AI-powered design assistant.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-end"> 
                             <Button variant="outline" size="icon" className="self-start mt-1" disabled>
                                <MoreVertical className="h-5 w-5" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="w-full flex flex-col items-center gap-12 md:gap-16">
                 <div className="flex flex-col items-center justify-center text-center my-8 p-8 rounded-lg bg-card shadow-md w-full max-w-md">
                    <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
                    <p className="text-xl font-medium text-card-foreground">Loading Palette Pilot...</p>
                 </div>
            </main>
            <footer className="mt-16 md:mt-24 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} Palette Pilot. Discover colors, inspire creativity.</p>
            </footer>
        </div>
    );
  }

  let currentPaletteSectionTitle = "Current Palette";
  if (currentPalette) {
    switch (paletteViewMode) {
      case 'new':
        currentPaletteSectionTitle = "New AI Creation";
        break;
      case 'adjusted':
        currentPaletteSectionTitle = "Adjusted Creation";
        break;
      case 'viewing':
        currentPaletteSectionTitle = `Viewing: ${currentPalette.name || 'Palette'}`;
        break;
      default:
        currentPaletteSectionTitle = currentPalette.name || "Current Palette";
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-8 md:py-12 min-h-screen flex flex-col items-center font-sans">
      <header className="mb-10 md:mb-12 text-center w-full">
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
           <div className="flex items-center justify-between w-full px-2 sm:px-0">
            <div className="flex-1" /> 
             <div className="flex flex-col items-center px-4"> 
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                <PaletteIcon className="inline-block mr-1 sm:mr-2 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-accent" />
                Palette <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-400">Pilot</span>
                </h1>
                <p className="text-muted-foreground mt-3 text-base sm:text-lg md:text-xl max-w-xl sm:max-w-2xl mx-auto">
                Craft stunning color schemes with your AI-powered design assistant.
                </p>
            </div>
            <div className="flex-1 flex justify-end"> 
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="self-start mt-1">
                            <MoreVertical className="h-5 w-5" />
                            <span className="sr-only">Open Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsHistorySheetOpen(true)}>
                            Palette History
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsSavedPalettesSheetOpen(true)} disabled={savedPalettes.length === 0}>
                            My Saved Palettes
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full flex flex-col items-center gap-8 sm:gap-12 md:gap-16">
        <section id="generator" className="w-full max-w-xl lg:max-w-2xl">
          <PaletteGeneratorForm
            onPaletteGenerated={handlePaletteGenerated}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        </section>

        {isLoading && (
          <div className="flex flex-col items-center justify-center text-center my-8 p-6 sm:p-8 rounded-lg bg-card shadow-md w-full max-w-md">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-accent mb-4" />
            <p className="text-lg sm:text-xl font-medium text-card-foreground">Generating your masterpiece...</p>
            <p className="text-muted-foreground text-sm sm:text-base">The AI is mixing colors, please wait.</p>
          </div>
        )}

        {currentPalette && !isLoading && (
          <section id="current-palette" className="w-full max-w-3xl lg:max-w-4xl">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center">
              {currentPaletteSectionTitle}
            </h2>
            <ColorPaletteDisplay
              key={currentPalette.id} 
              palette={currentPalette}
              onSavePalette={handleSavePalette}
              isSaved={isPaletteSaved(currentPalette.id)}
              onAdjustPalette={handleOpenAdjustDialog}
              toast={toast}
              onToggleSaveIndividualColor={handleToggleSaveIndividualColor}
              isIndividualColorSaved={isIndividualColorSaved}
              onViewShades={handleOpenViewShadesDialog}
            />
          </section>
        )}
        
        {(currentPalette || paletteHistory.length > 0 || savedIndividualColors.length > 0) && (savedPalettes.length > 0 || savedIndividualColors.length > 0) && <Separator className="my-6 sm:my-8 md:my-12 w-full max-w-3xl lg:max-w-4xl" />}

        {savedPalettes.length > 0 && (
          <section id="saved-palettes" className="w-full max-w-3xl lg:max-w-4xl">
            <SavedPalettesList
              savedPalettes={savedPalettes}
              onDeletePalette={handleDeletePalette}
              // onSelectPalette={(palette) => loadPalette(palette, 'viewing')} // Prop removed
              onToggleSaveIndividualColor={handleToggleSaveIndividualColor}
              isIndividualColorSaved={isIndividualColorSaved}
              onViewShades={handleOpenViewShadesDialog}
              onAdjustPalette={handleOpenAdjustDialog} 
              onRenamePalette={handleOpenRenameDialog} 
            />
          </section>
        )}

        {savedPalettes.length > 0 && savedIndividualColors.length > 0 && <Separator className="my-6 sm:my-8 md:my-12 w-full max-w-3xl lg:max-w-4xl" />}
        
        {savedIndividualColors.length > 0 && (
            <SavedIndividualColorsList
                savedColors={savedIndividualColors}
                onDeleteIndividualColor={handleDeleteIndividualColor}
                onViewShades={handleOpenViewShadesDialog}
                onToggleSaveIndividualColor={handleToggleSaveIndividualColor}
                isIndividualColorSaved={isIndividualColorSaved}
            />
        )}

        {savedPalettes.length === 0 && paletteHistory.length === 0 && savedIndividualColors.length === 0 && !currentPalette && !isLoading && paletteViewMode !== 'initial' && (
           <div className="text-center py-8 sm:py-10 mt-6 sm:mt-8">
            <p className="text-muted-foreground text-lg">No palettes or colors to display yet.</p>
            <p className="text-sm text-muted-foreground">Use the generator above to create your first color palette!</p>
          </div>
        )}
      </main>

      <footer className="mt-12 sm:mt-16 md:mt-24 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Palette Pilot. Discover colors, inspire creativity.</p>
      </footer>

      {paletteToAdjust && (
        <AdjustPaletteDialog
            isOpen={isAdjustDialogOpen}
            onClose={() => setIsAdjustDialogOpen(false)}
            palette={paletteToAdjust}
            onApply={handleApplyPaletteAdjustments}
        />
      )}
      {paletteToRename && ( 
        <RenamePaletteDialog
          isOpen={isRenameDialogOpen}
          onClose={() => {
            setIsRenameDialogOpen(false);
            setPaletteToRename(null);
          }}
          palette={paletteToRename}
          onConfirmRename={handleConfirmRename}
        />
      )}
      <PaletteHistorySheet
        isOpen={isHistorySheetOpen}
        onClose={() => setIsHistorySheetOpen(false)}
        history={paletteHistory}
        // onSelectPalette={(palette) => loadPalette(palette, 'viewing')} // Not used directly in sheet
        onClearHistory={clearPaletteHistory}
        loadPalette={loadPalette} // Pass loadPalette for view button in sheet
      />
      <SavedPalettesSheet
        isOpen={isSavedPalettesSheetOpen}
        onClose={() => setIsSavedPalettesSheetOpen(false)}
        savedPalettes={savedPalettes}
        // onSelectPalette={(palette) => loadPalette(palette, 'viewing')} // Prop removed
        onDeletePalette={handleDeletePalette}
        // loadPalette={loadPalette} // Prop removed
        onRenamePalette={handleOpenRenameDialog} 
      />
      {colorForShades && (
        <ViewShadesDialog
            isOpen={isViewShadesDialogOpen}
            onClose={() => setIsViewShadesDialogOpen(false)}
            baseColor={colorForShades}
            onToggleSaveIndividualColor={handleToggleSaveIndividualColor}
            isIndividualColorSaved={isIndividualColorSaved}
        />
      )}
    </div>
  );
}

