"use client";

import { Bot, User, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/use-count-up';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

interface AnalysisResultProps {
  analysis: AnalysisOutput;
  onReset: () => void;
}

export const AnalysisResult = ({ analysis, onReset }: AnalysisResultProps) => {
  const confidence = Math.round(analysis.confidenceScore * 100);
  const animatedConfidence = useCountUp(confidence);

  const ResultIcon = analysis.isAiGenerated ? Bot : User;
  const resultText = analysis.isAiGenerated ? "THIS IS AI" : "THIS IS HUMAN";
  const resultColor = analysis.isAiGenerated ? "text-destructive" : "text-green-500";
  const potentialModifications = (analysis as AnalyzeImageAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput).potentialModificationAreas;

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
      <div className="text-center">
        <ResultIcon className={cn("mx-auto h-20 w-20 mb-4", resultColor)} strokeWidth={1.5}/>
        <p className={cn("text-4xl font-bold tracking-wider", resultColor)}>{resultText}</p>
      </div>

      <div className="w-full space-y-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">CONFIDENCE</p>
        <div className="flex items-center gap-4">
          <Progress value={animatedConfidence} className="h-3" />
          <span className="text-xl font-semibold text-primary">{animatedConfidence}%</span>
        </div>
      </div>
      
      <div className="w-full grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
          </CardContent>
        </Card>
        {analysis.isAiGenerated && potentialModifications && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Potential Modifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{potentialModifications}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Button onClick={onReset} size="lg" className="w-full md:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
      </Button>
    </div>
  );
};
