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
  analysis: z.string().describe('A brief summary analysis explaining why the image was classified as AI-generated or human-created.'),
  detailedAnalysis: z.object({
    visualInconsistencies: z.string().optional().describe('Analysis of unnatural textures, lighting, or shadows.'),
    artifactAnalysis: z.string().optional().describe('Detection of digital artifacts common in AI generation.'),
    contextualClues: z.string().optional().describe('Clues from the image context or background that support the determination.'),
    editingToolAnalysis: z.string().optional().describe('Analysis of potential editing tools used if the image is human-made but edited.')
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
  prompt: `You are an expert in identifying AI-generated images and digitally manipulated photographs. Your task is to analyze the given image and determine if it is AI-generated or human-created.

Provide a confidence score (0-1) for your determination.

Provide a brief, top-level analysis summary.

Then, provide a detailed breakdown of your findings, covering:
- Visual inconsistencies (unnatural textures, lighting, shadows).
- Digital artifact analysis (compression artifacts, weird patterns).
- Contextual clues within the image.

If you determine the image is AI-generated:
- Suggest where potential modifications happened.
- Ensure that isAiGenerated is true.

If you determine the image is Human-created:
- Analyze it for signs of digital manipulation (e.g., retouching, object removal, filtering).
- If editing is detected, identify potential software used (like Photoshop, Lightroom, GIMP, etc.) and explain your reasoning in the 'editingToolAnalysis' field.
- Ensure that isAiGenerated is false.

Finally, provide a detailed data breakdown. The 'aiLikelihood' should be the confidenceScore converted to a percentage. Estimate the 'deepfakeLikelihood' and 'qualityScore' based on the image. For the 'modelLikelihoods', you must identify the most likely AI models that could have generated this image. Consider a wide range of modern models, including but not limited to Midjourney, DALL-E 3, Stable Diffusion, Meta AI, Adobe Firefly, and Flux. Do not just list common models; your analysis should be specific to the visual evidence in the image provided. Provide an estimated likelihood percentage for each model you identify and only return models with a likelihood greater than 0.

Image: {{media url=photoDataUri}}

Keep all explanations concise and easy to read.`,
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
