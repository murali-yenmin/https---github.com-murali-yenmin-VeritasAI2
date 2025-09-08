'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-image-ai-determination.ts';
import '@/ai/flows/provide-analysis-ai-determination.ts';
import '@/ai/flows/analyze-text-ai-determination.ts';
import '@/ai/flows/analyze-video-ai-determination.ts';
