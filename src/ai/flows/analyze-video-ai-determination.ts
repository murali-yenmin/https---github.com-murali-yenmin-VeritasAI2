'use server';
/**
 * @fileOverview Analyzes a video to determine if it is AI-generated.
 *
 * - analyzeVideoAiDetermination - A function that analyzes the video and determines if it's AI-generated.
 * - AnalyzeVideoAiDeterminationInput - The input type for the analyzeVideoAiDetermination function.
 * - AnalyzeVideoAiDeterminationOutput - The return type for the analyzeVideoAiDetermination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeVideoAiDeterminationInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      'A video to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.')
});
export type AnalyzeVideoAiDeterminationInput = z.infer<typeof AnalyzeVideoAiDeterminationInputSchema>;

const AnalyzeVideoAiDeterminationOutputSchema = z.object({
  isAiGenerated: z.boolean().describe('Whether the video is AI-generated or not.'),
  confidenceScore: z.number().describe('The confidence score of the AI determination (0-1).'),
  analysis: z.string().describe('A brief analysis explaining why the video was classified as AI or Human.'),
  potentialModificationAreas: z.string().optional().describe('If AI-generated, suggests where potential modifications happened.'),
});
export type AnalyzeVideoAiDeterminationOutput = z.infer<typeof AnalyzeVideoAiDeterminationOutputSchema>;

export async function analyzeVideoAiDetermination(input: AnalyzeVideoAiDeterminationInput): Promise<AnalyzeVideoAiDeterminationOutput> {
  return analyzeVideoAiDeterminationFlow(input);
}

const analyzeVideoAiDeterminationPrompt = ai.definePrompt({
  name: 'analyzeVideoAiDeterminationPrompt',
  input: {schema: AnalyzeVideoAiDeterminationInputSchema},
  output: {schema: AnalyzeVideoAiDeterminationOutputSchema},
  prompt: `You are an expert in identifying AI-generated videos. Analyze the given video and determine if it is AI-generated or human.

Provide a confidence score (0-1) for your determination. Also, provide a brief analysis explaining why the video was classified as AI or human. If you determine that the video may be AI-generated, suggest to the user where potential modifications happened.

Video: {{media url=videoDataUri}}

Ensure that isAiGenerated is true if the video is determined to be AI-generated, and false if human.`,
});

const analyzeVideoAiDeterminationFlow = ai.defineFlow(
  {
    name: 'analyzeVideoAiDeterminationFlow',
    inputSchema: AnalyzeVideoAiDeterminationInputSchema,
    outputSchema: AnalyzeVideoAiDeterminationOutputSchema,
  },
  async input => {
    const {output} = await analyzeVideoAiDeterminationPrompt(input);
    return output!;
  }
);
