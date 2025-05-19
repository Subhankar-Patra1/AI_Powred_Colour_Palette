'use server';
/**
 * @fileOverview AI tool that generates a color palette based on a text prompt.
 *
 * - generatePaletteFromPrompt - A function that handles the color palette generation process.
 * - GeneratePaletteInput - The input type for the generatePaletteFromPrompt function.
 * - GeneratePaletteOutput - The return type for the generatePaletteFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaletteInputSchema = z.object({
  prompt: z.string().describe('A text prompt describing the desired color palette.'),
});
export type GeneratePaletteInput = z.infer<typeof GeneratePaletteInputSchema>;

const GeneratePaletteOutputSchema = z.object({
  colors: z
    .array(
      z.object({
        hex: z.string().describe('The hex code of the color.'),
        name: z.string().describe('The name of the color.'),
      })
    )
    .describe('An array of colors in the generated palette.'),
});
export type GeneratePaletteOutput = z.infer<typeof GeneratePaletteOutputSchema>;

export async function generatePaletteFromPrompt(input: GeneratePaletteInput): Promise<GeneratePaletteOutput> {
  return generatePaletteFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaletteFromPromptPrompt',
  input: {schema: GeneratePaletteInputSchema},
  output: {schema: GeneratePaletteOutputSchema},
  prompt: `You are a color palette expert. Generate a color palette based on the following prompt. The palette should contain 5 colors, with hex codes and names.

Prompt: {{{prompt}}}

Output format: 
{
  "colors": [
    {
      "hex": "#FFFFFF",
      "name": "White"
    },
    {
      "hex": "#000000",
      "name": "Black"
    },
    {
      "hex": "#FF0000",
      "name": "Red"
    },
    {
      "hex": "#00FF00",
      "name": "Green"
    },
    {
      "hex": "#0000FF",
      "name": "Blue"
    }
  ]
}`,
});

const generatePaletteFromPromptFlow = ai.defineFlow(
  {
    name: 'generatePaletteFromPromptFlow',
    inputSchema: GeneratePaletteInputSchema,
    outputSchema: GeneratePaletteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
