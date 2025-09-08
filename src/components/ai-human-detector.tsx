"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Bot, User, UploadCloud, Loader2, RefreshCw, X, Video, FileImage, Type, AlertCircle } from 'lucide-react';
import { analyzeImageAiDetermination, type AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import { analyzeTextAiDetermination, type AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import { analyzeVideoAiDetermination, type AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';

const useCountUp = (end: number, duration: number = 1.5) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0 && count === 0) return;
    
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);
      
      const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

      const currentCount = Math.round(end * easedProgress);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const AnalysisResultDisplay = ({ analysis, onReset }: { analysis: AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput; onReset: () => void }) => {
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

const ImageAnalysis = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeImageAiDeterminationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const err = 'Please upload an image file (e.g., JPG, PNG).';
      setError(err);
      toast({ title: "Invalid File Type", description: err, variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.onerror = () => {
      const err = "Failed to read the selected file.";
      setError(err);
      toast({ title: "Error", description: err, variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files?.[0] || null);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const resetState = useCallback(() => {
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeImageAiDetermination({ photoDataUri: imagePreview });
      setAnalysis(result);
      
    } catch (e: any) {
      const err = e.message || "An unexpected error occurred during analysis.";
      setError(err);
      toast({ title: "Analysis Failed", description: err, variant: "destructive" });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 animate-in fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Analyzing...</p>
      </div>
    );
  }

  if (analysis) {
    return <AnalysisResultDisplay analysis={analysis} onReset={resetState} />;
  }

  return (
    <div className="space-y-6">
      {!imagePreview && (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors',
            isDragging && 'border-primary bg-accent/20'
          )}
          onDragEnter={handleDragEvents}
          onDragLeave={handleDragEvents}
          onDragOver={handleDragEvents}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4"/>
          <p className="text-center text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}

      {imagePreview && (
        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
          <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" />
           <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={() => resetState()}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
        </div>
      )}

      {(!imagePreview && error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button onClick={handleAnalyze} disabled={!imagePreview || isLoading} className="w-full" size="lg">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Analyze Image
      </Button>
    </div>
  );
};

const TextAnalysis = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<AnalyzeTextAiDeterminationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setText('');
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeTextAiDetermination({ text });
      setAnalysis(result);
    } catch (e: any) {
      const err = e.message || "An unexpected error occurred during analysis.";
      setError(err);
      toast({ title: "Analysis Failed", description: err, variant: "destructive" });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 animate-in fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Analyzing your text...</p>
      </div>
    );
  }

  if (analysis) {
    return <AnalysisResultDisplay analysis={analysis} onReset={resetState} />;
  }

  return (
    <div className="space-y-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type your text here to see if it's AI-generated..."
        className="min-h-[16rem] text-base"
        disabled={isLoading}
      />
      {error && (
        <Alert variant="destructive">
           <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button onClick={handleAnalyze} disabled={!text.trim() || isLoading} className="w-full" size="lg">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Analyze Text
      </Button>
    </div>
  );
};

const VideoAnalysis = () => {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeVideoAiDeterminationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      const err = 'Please upload a video file (e.g., MP4, WEBM).';
      setError(err);
      toast({ title: "Invalid File Type", description: err, variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result as string);
      setAnalysis(null);
      setError(null);
    };
    reader.onerror = () => {
      const err = "Failed to read the selected file.";
      setError(err);
      toast({ title: "Error", description: err, variant: "destructive" });
    };
    reader.readAsDataURL(file);
  };
  
  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => handleFileSelect(e.target.files?.[0] || null);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] || null);
  };

  const handleDragEvents = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const resetState = useCallback(() => {
    setVideoPreview(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = async () => {
    if (!videoPreview) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeVideoAiDetermination({ videoDataUri: videoPreview });
      setAnalysis(result);

    } catch (e: any) {
      const err = e.message || "An unexpected error occurred during analysis.";
      setError(err);
      toast({ title: "Analysis Failed", description: err, variant: "destructive" });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 animate-in fade-in">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground">Analyzing your video...</p>
      </div>
    );
  }

  if (analysis) {
    return <AnalysisResultDisplay analysis={analysis} onReset={resetState} />;
  }

  return (
    <div className="space-y-6">
      {!videoPreview && (
        <div
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors',
            isDragging && 'border-primary bg-accent/20'
          )}
          onDragEnter={handleDragEvents}
          onDragLeave={handleDragEvents}
          onDragOver={handleDragEvents}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Video className="h-12 w-12 text-muted-foreground mb-4"/>
          <p className="text-center text-muted-foreground">
            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">MP4, WEBM</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4, video/webm"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      )}
      
      {videoPreview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden">
          <video src={videoPreview} controls className="w-full h-full" />
           <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={() => resetState()}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove video</span>
            </Button>
        </div>
      )}

      {(!videoPreview && error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button onClick={handleAnalyze} disabled={!videoPreview || isLoading} className="w-full" size="lg">
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Analyze Video
      </Button>
    </div>
  );
};


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
    <Card className="w-full max-w-lg mx-auto shadow-2xl transition-all duration-500">
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
          <TabsList className="grid w-full grid-cols-3">
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
            <TextAnalysis />
          </TabsContent>
          <TabsContent value="image" className="mt-6">
            <ImageAnalysis />
          </TabsContent>
          <TabsContent value="video" className="mt-6">
            <VideoAnalysis />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
