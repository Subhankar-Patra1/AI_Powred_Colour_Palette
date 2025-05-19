
// src/components/RenamePaletteDialog.tsx
"use client";

import { useState, useEffect } from "react";
import type { Palette } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const renamePaletteSchema = z.object({
  name: z.string().min(1, "Palette name cannot be empty.").max(50, "Palette name is too long."),
});

type RenamePaletteFormValues = z.infer<typeof renamePaletteSchema>;

interface RenamePaletteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  palette: Palette | null;
  onConfirmRename: (paletteId: string, newName: string) => void;
}

export default function RenamePaletteDialog({
  isOpen,
  onClose,
  palette,
  onConfirmRename,
}: RenamePaletteDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenamePaletteFormValues>({
    resolver: zodResolver(renamePaletteSchema),
  });

  useEffect(() => {
    if (palette && isOpen) {
      reset({ name: palette.name || "" });
    }
  }, [palette, isOpen, reset]);

  const onSubmit: SubmitHandler<RenamePaletteFormValues> = (data) => {
    if (palette) {
      onConfirmRename(palette.id, data.name);
    }
    onClose();
  };

  if (!palette) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Rename Palette</DialogTitle>
          <DialogDescription>
            Enter a new name for &quot;{palette.name || "Untitled Palette"}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-card-foreground">
              Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="col-span-3 bg-background text-foreground"
              defaultValue={palette.name || ""}
            />
          </div>
          {errors.name && (
            <p className="col-span-4 text-sm text-destructive text-right -mt-2 pr-1">{errors.name.message}</p>
          )}
        
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Name</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
