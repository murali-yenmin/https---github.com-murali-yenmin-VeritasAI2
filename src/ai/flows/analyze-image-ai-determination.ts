'use server';
/**
 * @fileOverview Analyzes an image to determine if it is AI-generated.
 *
 * - analyzeImageAiDetermination - A function that analyzes the image and determines if it's AI-generated.
 * - AnalyzeImageAiDeterminationInput - The input type for the analyzeImageAiDetermination function.
 * - AnalyzeImageAiDeterminationOutput - The return type for the analyzeImageAiDetermination function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageAiDeterminationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.')
});
export type AnalyzeImageAiDeterminationInput = z.infer<typeof AnalyzeImageAiDeterminationInputSchema>;

const AnalyzeImageAiDeterminationOutputSchema = z.object({
  isAiGenerated: z.boolean().describe('Whether the image is AI-generated or not.'),
  confidenceScore: z.number().describe('The confidence score of the AI determination (0-1).'),
  analysis: z.string().describe('A brief summary analysis explaining why the image was classified as AI or Human.'),
  modelUsed: z.string().describe('The AI model used for the analysis.'),
  detailedAnalysis: z.object({
    visualInconsistencies: z.string().optional().describe('Analysis of unnatural textures, lighting, or shadows.'),
    artifactAnalysis: z.string().optional().describe('Detection of digital artifacts common in AI generation.'),
    contextualClues: z.string().optional().describe('Clues from the image context or background that support the determination.')
  }).describe('A detailed breakdown of the analysis findings.'),
  potentialModificationAreas: z.string().optional().describe('If AI-generated, suggests where potential modifications happened.'),
  dataBreakdown: z.object({
    aiLikelihood: z.number().describe('Likelihood of being AI-generated (0-100).'),
    deepfakeLikelihood: z.number().describe('Likelihood of being a deepfake (0-100).'),
    qualityScore: z.number().describe('Overall quality score of the image (0-100).'),
    modelLikelihoods: z.array(z.object({
      model: z.string().describe('The name of the AI model.'),
      likelihood: z.number().describe('The likelihood score for this model (0-100).')
    })).describe('Likelihood scores for various AI models.')
  }).describe('A detailed data breakdown of various analysis metrics.')
});
export type AnalyzeImageAiDeterminationOutput = z.infer<typeof AnalyzeImageAiDeterminationOutputSchema>;

export async function analyzeImageAiDetermination(input: AnalyzeImageAiDeterminationInput): Promise<AnalyzeImageAiDeterminationOutput> {
  return analyzeImageAiDeterminationFlow(input);
}

const analyzeImageAiDeterminationPrompt = ai.definePrompt({
  name: 'analyzeImageAiDeterminationPrompt',
  input: {schema: AnalyzeImageAiDeterminationInputSchema},
  output: {schema: AnalyzeImageAiDeterminationOutputSchema},
  prompt: `You are an expert in identifying AI-generated images. Analyze the given image and determine if it is AI-generated or human.

Provide a confidence score (0-1) for your determination. 
Set the modelUsed to "Gemini 2.5 Flash".

Provide a brief, top-level analysis summary. 

Then, provide a detailed breakdown of your findings, covering:
- Visual inconsistencies (unnatural textures, lighting, shadows).
- Digital artifact analysis (compression artifacts, weird patterns).
- Contextual clues within the image.

If you determine that the photo may be AI-generated, suggest to the user where potential modifications happened.

Also provide a detailed data breakdown. The 'aiLikelihood' should be the confidenceScore converted to a percentage. Estimate the 'deepfakeLikelihood' and 'qualityScore' based on the image. For 'modelLikelihoods', identify the most likely AI models that could have generated this image (e.g., Midjourney, DALL-E, Stable Diffusion, etc.) and provide an estimated likelihood percentage for each. Only return models with a likelihood greater than 0.

Image: {{media url=photoDataUri}}

Ensure that isAiGenerated is true if the image is determined to be AI-generated, and false if human. Keep all explanations concise and easy to read.`, 
});

const analyzeImageAiDeterminationFlow = ai.defineFlow(
  {
    name: 'analyzeImageAiDeterminationFlow',
    inputSchema: AnalyzeImageAiDeterminationInputSchema,
    outputSchema: AnalyzeImageAiDeterminationOutputSchema,
  },
  async input => {
    const {output} = await analyzeImageAiDeterminationPrompt(input);
    return output!;
  }
);
