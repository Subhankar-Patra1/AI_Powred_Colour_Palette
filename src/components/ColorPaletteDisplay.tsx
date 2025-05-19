"use client";

import type { Palette, Color } from "@/lib/types";
import ColorSwatch from "./ColorSwatch";
import { Button } from "@/components/ui/button";
import { Save, Trash2, CheckCircle, MoreVertical, SlidersHorizontal, Download, FileJson, FileCode2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { useToast } from "@/hooks/use-toast";


interface ColorPaletteDisplayProps {
  palette: Palette;
  onSavePalette?: (palette: Palette) => void;
  onDeletePalette?: (paletteId: string) => void;
  isSaved?: boolean;
  onAdjustPalette?: (palette: Palette) => void;
  toast?: ReturnType<typeof useToast>['toast'];
  onToggleSaveIndividualColor: (color: Color) => void;
  isIndividualColorSaved: (hex: string) => boolean;
  onViewShades: (color: Color) => void;
}

export default function ColorPaletteDisplay({
  palette,
  onSavePalette,
  onDeletePalette,
  isSaved,
  onAdjustPalette,
  toast,
  onToggleSaveIndividualColor,
  isIndividualColorSaved,
  onViewShades,
}: ColorPaletteDisplayProps) {

  const handleExport = (format: 'css' | 'json') => {
    if (!toast) {
      console.error("Toast function not provided for export.")
      alert("Export function requires notification system.")
      return;
    }
    let content = '';
    const paletteNameForFile = (palette.name || 'palette').replace(/\s+/g, '_').replace(/[^a-z0-9_]/gi, '');
    let filename = `${paletteNameForFile || 'custom_palette'}.${format}`;
    
    if (format === 'json') {
      content = JSON.stringify(palette, null, 2);
    } else if (format === 'css') {
      const paletteIdClean = palette.id.split('-')[0].replace(/[^a-z0-9_]/gi, '');
      content = palette.colors.map((color, index) => 
        `--palette-${paletteIdClean}-color-${index + 1}-hex: ${color.hex};\n--palette-${paletteIdClean}-color-${index + 1}-name: "${color.name.replace(/"/g, '\\"')}";`
      ).join('\n\n');
    }

    navigator.clipboard.writeText(content).then(() => {
      toast({ title: "Copied to clipboard!", description: `${filename} content copied.` });
    }).catch(err => {
      console.error("Export error:", err);
      toast({ title: "Export Failed", description: "Could not copy to clipboard.", variant: "destructive" });
    });
  };


  return (
    <Card className="w-full shadow-lg bg-card" data-ai-hint="color palette">
      {palette.name && (
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-center text-card-foreground">{palette.name}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 pt-2">
        {palette.colors.map((color, index) => (
          <ColorSwatch 
            key={`${palette.id}-${color.hex}-${index}`} 
            color={color}
            showSaveButton={true}
            isSaved={isIndividualColorSaved(color.hex)}
            onToggleSave={onToggleSaveIndividualColor}
            showViewShadesButton={true}
            onViewShades={onViewShades}
          />
        ))}
      </CardContent>
      {(onSavePalette || onDeletePalette || onAdjustPalette) && (
         <CardFooter className="flex flex-col sm:flex-row justify-between items-center p-3 sm:p-4 gap-2">
          <div className="flex-shrink-0">
            {onSavePalette && !isSaved && (
              <Button 
                onClick={() => onSavePalette(palette)} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 h-auto sm:h-9"
              >
                <Save className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Save Palette
              </Button>
            )}
            {isSaved && !onDeletePalette && ( 
              <div className="flex items-center text-green-500 text-xs sm:text-sm">
                <CheckCircle className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Palette Saved
              </div>
            )}
             {isSaved && onDeletePalette && ( 
               <Button onClick={() => onDeletePalette(palette.id)} variant="destructive" size="sm" className="w-full sm:w-auto text-xs sm:text-sm px-3 py-1.5 h-auto sm:h-9">
                  <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Delete
              </Button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAdjustPalette && (
                <DropdownMenuItem onClick={() => onAdjustPalette(palette)} className="text-xs sm:text-sm">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Adjust Palette
                </DropdownMenuItem>
              )}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs sm:text-sm">
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export Palette</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleExport('css')} className="text-xs sm:text-sm">
                      <FileCode2 className="mr-2 h-4 w-4" /> CSS Variables
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('json')} className="text-xs sm:text-sm">
                      <FileJson className="mr-2 h-4 w-4" /> JSON
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
               {onSavePalette && isSaved && palette.isAdjusted && ( 
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onSavePalette({...palette, isAdjusted: false })} className="text-xs sm:text-sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save Adjustments
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      )}
    </Card>
  );
}
