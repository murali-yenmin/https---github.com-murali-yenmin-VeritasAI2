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
  analysis: z.string().describe('A brief analysis explaining why the text was classified as AI-written or human-written.'),
  modelUsed: z.string().describe('The AI model used for the analysis.'),
  detailedAnalysis: z.object({
    linguisticPatterns: z.string().optional().describe('Analysis of sentence structure, word choice, and complexity.'),
    cohesionAndFlow: z.string().optional().describe('Evaluation of the text\'s logical flow and coherence.'),
    commonAiTraits: z.string().optional().describe('Detection of traits common in AI writing, like repetition or overly generic phrases.')
  }).describe('A detailed breakdown of the analysis findings.'),
  dataBreakdown: z.object({
    aiLikelihood: z.number().describe('Likelihood of being AI-generated (0-100).'),
    readabilityScore: z.number().describe('A score representing the text\'s readability (0-100).'),
    originalityScore: z.number().describe('A score for the originality of the text (0-100).'),
    modelLikelihoods: z.array(z.object({
      model: z.string().describe('The name of the AI model.'),
      likelihood: z.number().describe('The likelihood score for this model (0-100).')
    })).describe('Likelihood scores for various AI models.')
  }).describe('A detailed data breakdown of various analysis metrics.')
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

Provide a confidence score (0-1) for your determination.
Set the modelUsed to "Gemini 2.5 Flash".

Provide a brief, top-level analysis summary.

Then, provide a detailed breakdown of your findings, covering:
- Linguistic patterns (sentence structure, word choice).
- Cohesion and logical flow.
- Common AI writing traits (repetition, generic phrases).

Also provide a detailed data breakdown. The 'aiLikelihood' should be the confidenceScore converted to a percentage. Estimate the 'readabilityScore' and 'originalityScore' based on the text. For 'modelLikelihoods', identify the most likely AI models that could have written this text (e.g., GPT-3, GPT-4, Gemini, etc.) and provide an estimated likelihood percentage for each. Only return models with a likelihood greater than 0.

Text: {{{text}}}

Ensure that isAiGenerated is true if the text is determined to be AI-generated, and false if human-written. Keep all explanations concise and easy to read.`,
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
