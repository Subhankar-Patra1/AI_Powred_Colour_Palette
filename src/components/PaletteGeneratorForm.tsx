
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { generatePaletteFromPrompt, type GeneratePaletteOutput } from "@/ai/flows/generate-palette-from-prompt";
import type { Palette } from "@/lib/types";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Prompt must be at least 10 characters.",
  }),
});

const placeholderSuggestions = [
  "Misty forest dawn with dew-kissed greens and soft golds.",
  "Cyberpunk cityscape at night: neon signs, rain-slicked streets, deep blues.",
  "Art Deco elegance: rich golds, bold blacks, and geometric teals.",
  "A cozy autumn afternoon: warm oranges, deep reds, and earthy browns.",
  "Tropical coral reef teeming with vibrant fish and turquoise waters.",
  "Minimalist Scandinavian design: muted grays, clean whites, and a touch of natural wood.",
  "Whimsical fairy tale illustration: pastel pinks, lavenders, and sparkling silver.",
  "Vintage travel poster for a Mediterranean coast.",
  "Deep space nebula: cosmic purples, blues, and stardust whites.",
  "A feeling of tranquil melancholy: muted blues, soft grays, and a single desaturated yellow.",
  "Bohemian bazaar: rich tapestries, spices, and handcrafted jewelry tones.",
  "Sunset over a desert oasis: fiery oranges, sandy yellows, and cool blues.",
];

interface PaletteGeneratorFormProps {
  onPaletteGenerated: (palette: Palette) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

export default function PaletteGeneratorForm({ onPaletteGenerated, setIsLoading, isLoading }: PaletteGeneratorFormProps) {
  const { toast } = useToast();
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");

  useEffect(() => {
    setCurrentPlaceholder(placeholderSuggestions[Math.floor(Math.random() * placeholderSuggestions.length)]);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result: GeneratePaletteOutput = await generatePaletteFromPrompt({ prompt: values.prompt });
      const newPalette: Palette = {
        id: Date.now().toString(), // Simple unique ID
        name: `AI: ${values.prompt.substring(0,30)}${values.prompt.length > 30 ? '...' : ''}`,
        colors: result.colors,
      };
      onPaletteGenerated(newPalette);
      toast({
        title: "Palette Generated!",
        description: "Your new color palette is ready.",
      });
      form.reset(); // Optionally reset the form
      // Set a new placeholder for the next generation
      setCurrentPlaceholder(placeholderSuggestions[Math.floor(Math.random() * placeholderSuggestions.length)]);
    } catch (error) {
      console.error("Error generating palette:", error);
      toast({
        title: "Generation Failed",
        description: "Could not generate palette. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg shadow-md bg-card">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-card-foreground">Palette Prompt</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={currentPlaceholder}
                  className="resize-none min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="hover-glow-container generate-palette-button-container w-full">
          <Button type="submit" disabled={isLoading} className="w-full generate-palette-button-inner">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Palette
          </Button>
        </div>
      </form>
    </Form>
  );
}
