"use client";

import { Bot, User, ScanText, FileVideo, FileImage, Percent, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTypewriter } from '@/hooks/use-typewriter';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useMemo } from 'react';
import { DataBreakdown } from './data-breakdown';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

interface AiChatReportProps {
  analysis: AnalysisOutput;
}

const ChatMessage = ({ role, children, icon: Icon, title }: { role: 'user' | 'assistant', children: React.ReactNode, icon?: React.ElementType, title?: string }) => {
  const isAssistant = role === 'assistant';
  return (
    <div className={cn("flex items-start gap-3", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback><Bot size={20} /></AvatarFallback>
        </Avatar>
      )}
      <div className={cn("max-w-[85%]")}>
        <Card className={cn(isAssistant ? "bg-muted" : "bg-primary text-primary-foreground")}>
          <CardContent className="p-3 text-sm">
            {title && <h3 className="font-bold mb-2 flex items-center gap-2"><Icon className="w-4 h-4" />{title}</h3>}
            <div>{children}</div>
          </CardContent>
        </Card>
      </div>
       {!isAssistant && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback><User size={20} /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export const AiChatReport = ({ analysis }: AiChatReportProps) => {
  const { isAiGenerated, confidenceScore, analysis: summary, detailedAnalysis, dataBreakdown } = analysis;
  const confidence = Math.round(confidenceScore * 100);
  
  const getAnalysisDetails = useMemo(() => {
    const potentialModifications = (analysis as AnalyzeImageAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput).potentialModificationAreas;
    
    const details = [];
    if (isAiGenerated && potentialModifications) {
      details.push({ title: "Potential Modifications", content: potentialModifications, icon: Bot });
    }
    if ('linguisticPatterns' in detailedAnalysis) { // Text
      if(detailedAnalysis.linguisticPatterns) details.push({ title: "Linguistic Patterns", content: detailedAnalysis.linguisticPatterns, icon: ScanText });
      if(detailedAnalysis.cohesionAndFlow) details.push({ title: "Cohesion & Flow", content: detailedAnalysis.cohesionAndFlow, icon: ScanText });
      if(detailedAnalysis.commonAiTraits) details.push({ title: "Common AI Traits", content: detailedAnalysis.commonAiTraits, icon: ScanText });
    } else if ('visualInconsistencies' in detailedAnalysis) { // Image
      if(detailedAnalysis.visualInconsistencies) details.push({ title: "Visual Inconsistencies", content: detailedAnalysis.visualInconsistencies, icon: FileImage });
      if(detailedAnalysis.artifactAnalysis) details.push({ title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis, icon: FileImage });
      if(detailedAnalysis.contextualClues) details.push({ title: "Contextual Clues", content: detailedAnalysis.contextualClues, icon: FileImage });
    } else if ('temporalInconsistencies' in detailedAnalysis) { // Video
      if(detailedAnalysis.temporalInconsistencies) details.push({ title: "Temporal Inconsistencies", content: detailedAnalysis.temporalInconsistencies, icon: FileVideo });
      if(detailedAnalysis.artifactAnalysis) details.push({ title: "Artifact Analysis", content: detailedAnalysis.artifactAnalysis, icon: FileVideo });
      if(detailedAnalysis.audioVisualSync) details.push({ title: "Audio-Visual Sync", content: detailedAnalysis.audioVisualSync, icon: FileVideo });
    }
    return details;
  }, [analysis, detailedAnalysis, isAiGenerated]);

  const messages = useMemo(() => [
    { role: 'user' as const, content: `Can you analyze this?` },
    {
      role: 'assistant' as const,
      content: `After analyzing the content, I've determined that it is **${isAiGenerated ? 'likely AI-Generated' : 'likely Human-Created'}**.`,
      title: "Initial Determination",
      icon: isAiGenerated ? Bot : User,
    },
    {
      role: 'assistant' as const,
      content: `My confidence in this assessment is **${confidence}%**. ${summary}`,
      title: "Confidence Score & Summary",
      icon: Percent,
    },
    ...getAnalysisDetails.map(detail => ({
      role: 'assistant' as const,
      content: detail.content,
      title: detail.title,
      icon: detail.icon,
    })),
    {
      role: 'assistant' as const,
      content: 'data_breakdown'
    }
  ], [isAiGenerated, confidence, summary, getAnalysisDetails]);

  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);

  useEffect(() => {
    setDisplayedMessages([]);
    let currentDelay = 0;
    
    messages.forEach((msg, index) => {
        const delay = index === 0 ? 0 : (typeof messages[index-1].content === 'string' ? (messages[index-1].content?.length || 0) * 20 : 0) + 500;
        currentDelay += delay;

        setTimeout(() => {
            setDisplayedMessages(prev => [...prev, { ...msg, isTyping: true }]);
        }, currentDelay);
    });
  }, [messages]);
  
  const TypewriterMessage = ({ message, onFinished }: { message: any, onFinished: () => void }) => {
    const { displayedText, isFinished } = useTypewriter(message.content, 20, onFinished);
    
    if(message.role === 'user') return <ChatMessage role="user">{message.content}</ChatMessage>
    
    if (message.content === 'data_breakdown') {
      useEffect(() => {
        onFinished();
      },[onFinished])
      
      let analysisType: 'text' | 'image' | 'video' = 'image';
      if ('linguisticPatterns' in detailedAnalysis) {
        analysisType = 'text';
      } else if ('temporalInconsistencies' in detailedAnalysis) {
        analysisType = 'video';
      }
      
      return <DataBreakdown data={dataBreakdown} analysisType={analysisType} />;
    }
    
    return (
      <ChatMessage role="assistant" icon={message.icon} title={message.title}>
        {displayedText}
        {!isFinished && <span className="inline-block w-px h-4 bg-foreground align-middle ml-1 typewriter-cursor" />}
      </ChatMessage>
    );
  };

  return (
    <div className="w-full space-y-4">
      {displayedMessages.map((msg, index) => (
        <div key={index}>
            <TypewriterMessage
                message={msg}
                onFinished={() => {
                    setDisplayedMessages(prev =>
                        prev.map((m, i) => (i === index ? { ...m, isTyping: false } : m))
                    );
                }}
            />
        </div>
      ))}
       {displayedMessages.length > 0 && displayedMessages.some(m => m.isTyping) && (
         <div className="flex items-start gap-3 justify-start">
            <Avatar className="w-8 h-8 border">
              <AvatarFallback><Bot size={20} className="animate-pulse"/></AvatarFallback>
            </Avatar>
            <div className="max-w-[85%]">
              <Card className="bg-muted">
                <CardContent className="p-3 text-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '0s'}} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '0.2s'}} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" style={{animationDelay: '0.4s'}}/>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
       )}
    </div>
  );
};
