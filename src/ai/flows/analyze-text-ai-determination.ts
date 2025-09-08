'use server';
/**
 * @fileOverview Analyzes text to determine if it is AI-generated.
 *
 * - analyzeTextAiDetermination - A function that analyzes the text and determines if it's AI-generated.
 * - AnalyzeTextAiDeterminationInput - The input type for the analyzeTextAiDetermination function.
 * - AnalyzeTextAiDeterminationOutput - The return type for the analyzeTextAiDetermination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextAiDeterminationInputSchema = z.object({
  text: z
    .string()
    .describe(
      'The text to analyze.'
    )
});
export type AnalyzeTextAiDeterminationInput = z.infer<typeof AnalyzeTextAiDeterminationInputSchema>;

const AnalyzeTextAiDeterminationOutputSchema = z.object({
  isAiGenerated: z.boolean().describe('Whether the text is AI-generated or not.'),
  confidenceScore: z.number().describe('The confidence score of the AI determination (0-1).'),
  analysis: z.string().describe('A brief analysis explaining why the text was classified as AI or Human-written.'),
});
export type AnalyzeTextAiDeterminationOutput = z.infer<typeof AnalyzeTextAiDeterminationOutputSchema>;

export async function analyzeTextAiDetermination(input: AnalyzeTextAiDeterminationInput): Promise<AnalyzeTextAiDeterminationOutput> {
  return analyzeTextAiDeterminationFlow(input);
}

const analyzeTextAiDeterminationPrompt = ai.definePrompt({
  name: 'analyzeTextAiDeterminationPrompt',
  input: {schema: AnalyzeTextAiDeterminationInputSchema},
  output: {schema: AnalyzeTextAiDeterminationOutputSchema},
  prompt: `You are an expert in identifying AI-generated text. Analyze the given text and determine if it is AI-generated or human-written.

Provide a confidence score (0-1) for your determination. Also, provide a brief analysis explaining why the text was classified as AI or human.

Text: {{{text}}}

Ensure that isAiGenerated is true if the text is determined to be AI-generated, and false if human-written.`,
});

const analyzeTextAiDeterminationFlow = ai.defineFlow(
  {
    name: 'analyzeTextAiDeterminationFlow',
    inputSchema: AnalyzeTextAiDeterminationInputSchema,
    outputSchema: AnalyzeTextAiDeterminationOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextAiDeterminationPrompt(input);
    return output!;
  }
);
