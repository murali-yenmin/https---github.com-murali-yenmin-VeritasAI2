"use client";

import { RefreshCw } from 'lucide-react';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Button } from '@/components/ui/button';
import { AiChatReport } from '@/components/ai-chat-report';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

interface AnalysisResultProps {
  analysis: AnalysisOutput;
  onReset: () => void;
}

export const AnalysisResult = ({ analysis, onReset }: AnalysisResultProps) => {
  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 w-full">
      <AiChatReport analysis={analysis} />
      <Button onClick={onReset} size="lg" className="w-full md:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
      </Button>
    </div>
  );
};
