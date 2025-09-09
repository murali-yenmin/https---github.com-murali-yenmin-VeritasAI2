"use client";

import { Bot, User, RefreshCw, Cpu, ScanText, FileVideo, FileImage } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCountUp } from '@/hooks/use-count-up';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

interface AnalysisResultProps {
  analysis: AnalysisOutput;
  onReset: () => void;
}

const DetailCard = ({ title, content, icon: Icon }: { title: string, content?: string, icon: React.ElementType }) => {
  if (!content) return null;
  return (
    <div className="flex items-start gap-4">
      <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <h4 className="font-semibold text-card-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{content}</p>
      </div>
    </div>
  )
}

export const AnalysisResult = ({ analysis, onReset }: AnalysisResultProps) => {
  const confidence = Math.round(analysis.confidenceScore * 100);
  const animatedConfidence = useCountUp(confidence);

  const ResultIcon = analysis.isAiGenerated ? Bot : User;
  const resultText = analysis.isAiGenerated ? "THIS IS AI" : "THIS IS HUMAN";
  const resultColor = analysis.isAiGenerated ? "text-destructive" : "text-green-500";
  const potentialModifications = (analysis as AnalyzeImageAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput).potentialModificationAreas;
  
  const { detailedAnalysis } = analysis;

  const getAnalysisDetails = () => {
    if ('linguisticPatterns' in detailedAnalysis) { // Text analysis
      return [
        { title: "Linguistic Patterns", content: detailedAnalysis.linguisticPatterns, icon: ScanText },
        { title: "Cohesion & Flow", content: detailedAnalysis.cohesionAndFlow, icon: ScanText },
        { title: "Common AI Traits", content: detailedAnalysis.commonAiTraits, icon: ScanText },
      ];
    }
    if ('visualInconsistencies' in detailedAnalysis) { // Image analysis
      return [
        { title: "Visual Inconsistencies", content: detailedAnalysis.visualInconsistencies, icon: FileImage },
        { title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis, icon: FileImage },
        { title: "Contextual Clues", content: detailedAnalysis.contextualClues, icon: FileImage },
      ];
    }
     if ('temporalInconsistencies' in detailedAnalysis) { // Video analysis
      return [
        { title: "Temporal Inconsistencies", content: detailedAnalysis.temporalInconsistencies, icon: FileVideo },
        { title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis, icon: FileVideo },
        { title: "Audio-Visual Sync", content: detailedAnalysis.audioVisualSync, icon: FileVideo },
      ];
    }
    return [];
  }
  
  const analysisDetails = getAnalysisDetails();

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 w-full">
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
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{analysis.analysis}</p>
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full">
        <Card>
          <AccordionItem value="details" className="border-b-0">
            <AccordionTrigger className="p-6 text-lg">
                Detailed Report
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <DetailCard title="Model Used" content={analysis.modelUsed} icon={Cpu} />
                {analysis.isAiGenerated && potentialModifications && (
                    <DetailCard title="Potential Modifications" content={potentialModifications} icon={Bot} />
                )}
                {analysisDetails.map(detail => <DetailCard key={detail.title} {...detail} />)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Card>
      </Accordion>


      <Button onClick={onReset} size="lg" className="w-full md:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" /> Start Over
      </Button>
    </div>
  );
};
