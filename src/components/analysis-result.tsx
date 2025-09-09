"use client";

import { RefreshCw, Bot, User, ChevronDown } from 'lucide-react';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Button } from '@/components/ui/button';
import { DataBreakdown } from './data-breakdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

interface AnalysisResultProps {
  analysis: AnalysisOutput;
  onReset: () => void;
}

export const AnalysisResult = ({ analysis, onReset }: AnalysisResultProps) => {
  const { isAiGenerated, confidenceScore, analysis: summary, detailedAnalysis, dataBreakdown } = analysis;
  const confidence = Math.round(confidenceScore * 100);

  let analysisType: 'text' | 'image' | 'video' = 'image';
  if ('linguisticPatterns' in detailedAnalysis) {
    analysisType = 'text';
  } else if ('temporalInconsistencies' in detailedAnalysis) {
    analysisType = 'video';
  }

  const getAnalysisDetails = () => {
    const potentialModifications = (analysis as AnalyzeImageAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput).potentialModificationAreas;
    
    const details = [];
    if (isAiGenerated && potentialModifications) {
      details.push({ title: "Potential Modifications", content: potentialModifications });
    }

    if ('linguisticPatterns' in detailedAnalysis) {
      if(detailedAnalysis.linguisticPatterns) details.push({ title: "Linguistic Patterns", content: detailedAnalysis.linguisticPatterns });
      if(detailedAnalysis.cohesionAndFlow) details.push({ title: "Cohesion & Flow", content: detailedAnalysis.cohesionAndFlow });
      if(detailedAnalysis.commonAiTraits) details.push({ title: "Common AI Traits", content: detailedAnalysis.commonAiTraits });
    } else if ('visualInconsistencies' in detailedAnalysis) {
      if(detailedAnalysis.visualInconsistencies) details.push({ title: "Visual Inconsistencies", content: detailedAnalysis.visualInconsistencies });
      if(detailedAnalysis.artifactAnalysis) details.push({ title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis });
      if(detailedAnalysis.contextualClues) details.push({ title: "Contextual Clues", content: detailedAnalysis.contextualClues });
    } else if ('temporalInconsistencies' in detailedAnalysis) {
      if(detailedAnalysis.temporalInconsistencies) details.push({ title: "Temporal Inconsistencies", content: detailedAnalysis.temporalInconsistencies });
      if(detailedAnalysis.artifactAnalysis) details.push({ title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis });
      if(detailedAnalysis.audioVisualSync) details.push({ title: "Audio-Visual Sync", content: detailedAnalysis.audioVisualSync });
    }
    return details.filter(d => d.content);
  }

  const analysisDetails = getAnalysisDetails();

  return (
    <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500 w-full">
      
      <Card className="w-full text-center">
        <CardHeader>
            <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full border-4 ${isAiGenerated ? 'bg-destructive/10 border-destructive text-destructive' : 'bg-green-500/10 border-green-500 text-green-500'}`}>
                    {isAiGenerated ? <Bot className="h-10 w-10" /> : <User className="h-10 w-10" />}
                </div>
                <div>
                    <CardTitle className="text-3xl">
                        {isAiGenerated ? 'Likely AI-Generated' : 'Likely Human-Created'}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Confidence: {confidence}%
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground max-w-2xl mx-auto">{summary}</p>
        </CardContent>
      </Card>
      
      <DataBreakdown data={dataBreakdown} analysisType={analysisType} />

      {analysisDetails.length > 0 && (
        <Card className="w-full">
          <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
              <CardDescription>A breakdown of the findings that led to the determination.</CardDescription>
          </CardHeader>
          <CardContent>
              <Accordion type="single" collapsible className="w-full">
                  {analysisDetails.map((detail, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                          <AccordionTrigger>
                            <h4 className="font-semibold text-foreground">{detail.title}</h4>
                          </AccordionTrigger>
                          <AccordionContent>
                              <p className="text-muted-foreground text-sm">{detail.content}</p>
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
          </CardContent>
        </Card>
      )}
      
      <Button onClick={onReset} size="lg" className="w-full md:w-auto">
        <RefreshCw className="mr-2 h-4 w-4" /> Analyze Another
      </Button>
    </div>
  );
};
