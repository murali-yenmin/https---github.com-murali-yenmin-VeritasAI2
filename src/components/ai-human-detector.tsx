
"use client";

import { useState } from 'react';
import { FileImage, Type, Video } from 'lucide-react';
import { analyzeImageAiDetermination, type AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import { analyzeTextAiDetermination, type AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import { analyzeVideoAiDetermination, type AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalysisPanel } from '@/components/analysis-panel';

export function AIHumanDetector() {
  const [activeTab, setActiveTab] = useState("text");

  const icons: { [key: string]: React.ElementType } = {
    text: Type,
    image: FileImage,
    video: Video,
  };

  const descriptions: { [key: string]: string } = {
    text: "Enter text to see if it's AI written.",
    image: "Upload an image to see if it's AI generated.",
    video: "Upload a video to see if it's AI generated.",
  };

  const ActiveIcon = icons[activeTab];
  
  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl transition-all duration-500">
      <CardHeader className="text-center p-6">
        <div className="flex justify-center items-center mb-4">
          <ActiveIcon className="h-8 w-8 text-primary transition-all duration-300" />
        </div>
        <CardTitle className="text-2xl font-headline">Let's Find Out</CardTitle>
        <CardDescription>
          {descriptions[activeTab]}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="text">
              <Type className="mr-2 h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="image">
              <FileImage className="mr-2 h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="mr-2 h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="mt-6">
            <AnalysisPanel<AnalyzeTextAiDeterminationOutput>
              analysisType="text"
              analyzeAction={analyzeTextAiDetermination}
              placeholder="Paste or type your text here to see if it's AI-generated..."
            />
          </TabsContent>
          <TabsContent value="image" className="mt-6">
            <AnalysisPanel<AnalyzeImageAiDeterminationOutput>
              analysisType="image"
              analyzeAction={analyzeImageAiDetermination}
              fileTypes="image/png, image/jpeg, image/webp, image/avif"
              fileTypeDescription="PNG, JPG, WEBP, or AVIF"
            />
          </TabsContent>
          <TabsContent value="video" className="mt-6">
            <AnalysisPanel<AnalyzeVideoAiDeterminationOutput>
              analysisType="video"
              analyzeAction={analyzeVideoAiDetermination}
              fileTypes="video/mp4, video/webm"
              fileTypeDescription="MP4, WEBM"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
