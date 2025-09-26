'use server';
/**
 * @fileOverview An AI analysis flow to explain why an image was classified as AI-generated or human-created.
 *
 * - provideAnalysisForAiDetermination - A function that handles the AI analysis process.
 * - ProvideAnalysisForAiDeterminationInput - The input type for the provideAnalysisForAiDetermination function.
 * - ProvideAnalysisForAiDeterminationOutput - The return type for the provideAnalysisForAiDetermination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAnalysisForAiDeterminationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  determination: z.enum(['AI', 'Human']).describe('The AI determination result.'),
  confidenceScore: z.number().describe('The confidence score of the AI determination.'),
});
export type ProvideAnalysisForAiDeterminationInput = z.infer<
  typeof ProvideAnalysisForAiDeterminationInputSchema
>;

const ProvideAnalysisForAiDeterminationOutputSchema = z.object({
  analysis: z.string().describe('The analysis explaining why the image was classified as AI-generated or human-created.'),
  potentialModifications: z
    .string()
    .optional()
    .describe('Potential modifications that may have occurred if classified as AI.'),
});
export type ProvideAnalysisForAiDeterminationOutput = z.infer<
  typeof ProvideAnalysisForAiDeterminationOutputSchema
>;

export async function provideAnalysisForAiDetermination(
  input: ProvideAnalysisForAiDeterminationInput
): Promise<ProvideAnalysisForAiDeterminationOutput> {
  return provideAnalysisForAiDeterminationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAnalysisForAiDeterminationPrompt',
  input: {schema: ProvideAnalysisForAiDeterminationInputSchema},
  output: {schema: ProvideAnalysisForAiDeterminationOutputSchema},
  prompt: `You are an expert in analyzing images to determine if they are AI-generated or human-created.

You are provided with an image, the determination of whether it is AI-generated or human-created, and a confidence score.

Based on this information, provide a brief analysis explaining why the image was classified as such.
If the image is classified as AI, also suggest where potential modifications might have occurred.

Image: {{media url=photoDataUri}}
Determination: {{{determination}}}
Confidence Score: {{{confidenceScore}}}

Analysis:
`,
});

const provideAnalysisForAiDeterminationFlow = ai.defineFlow(
  {
    name: 'provideAnalysisForAiDeterminationFlow',
    inputSchema: ProvideAnalysisForAiDeterminationInputSchema,
    outputSchema: ProvideAnalysisForAiDeterminationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
