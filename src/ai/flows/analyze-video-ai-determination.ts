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
  modelUsed: z.string().describe('The AI model used for the analysis.'),
  detailedAnalysis: z.object({
    temporalInconsistencies: z.string().optional().describe('Analysis of how elements change unnaturally over time.'),
    artifactAnalysis: z.string().optional().describe('Detection of digital artifacts like warping or blurring between frames.'),
    audioVisualSync: z.string().optional().describe('Checking for mismatches between audio and video if applicable.')
  }).describe('A detailed breakdown of the analysis findings.'),
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

Provide a confidence score (0-1) for your determination. 
Set the modelUsed to "Gemini 2.5 Flash".

Provide a brief, top-level analysis summary.

Then, provide a detailed breakdown of your findings, covering:
- Temporal inconsistencies (unnatural changes over time).
- Digital artifacts (warping, blurring between frames).
- Audio-visual synchronization issues.

If you determine that the video may be AI-generated, suggest to the user where potential modifications happened.

Video: {{media url=videoDataUri}}

Ensure that isAiGenerated is true if the video is determined to be AI-generated, and false if human. Keep all explanations concise and easy to read.`,
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
