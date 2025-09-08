"use client";

import { useState, useRef, type ChangeEvent, type DragEvent, useCallback } from 'react';
import Image from 'next/image';
import { UploadCloud, Loader2, Link, File, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mediaUrlToDataUri } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AnalysisResult } from '@/components/analysis-result';
import type { AnalyzeImageAiDeterminationOutput } from '@/ai/flows/analyze-image-ai-determination';
import type { AnalyzeTextAiDeterminationOutput } from '@/ai/flows/analyze-text-ai-determination';
import type { AnalyzeVideoAiDeterminationOutput } from '@/ai/flows/analyze-video-ai-determination';

type AnalysisOutput = AnalyzeImageAiDeterminationOutput | AnalyzeTextAiDeterminationOutput | AnalyzeVideoAiDeterminationOutput;

type AnalysisPanelProps<T extends AnalysisOutput> = {
  analysisType: 'text' | 'image' | 'video';
  analyzeAction: (input: any) => Promise<T>;
  placeholder?: string;
  fileTypes?: string;
  fileTypeDescription?: string;
};

export function AnalysisPanel<T extends AnalysisOutput>({
  analysisType,
  analyzeAction,
  placeholder,
  fileTypes,
  fileTypeDescription,
}: AnalysisPanelProps<T>) {
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputType, setInputType] = useState<'upload' | 'url'>('upload');
  const [url, setUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: globalThis.File | null) => {
    if (!file) return;

    if (fileTypes && !file.type.startsWith(analysisType + '/')) {
      const err = `Please upload a ${analysisType} file (e.g., ${fileTypeDescription}).`;
      setError(err);
      toast({ title: "Invalid File Type", description: err, variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
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
    setMediaPreview(null);
    setText('');
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setInputType('upload');
    setUrl('');
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let analysisInput: any;

      if (analysisType === 'text') {
        if (!text.trim()) {
          setError("Please enter some text to analyze.");
          setIsLoading(false);
          return;
        }
        analysisInput = { text };
      } else {
        let dataUri: string | null = mediaPreview;
        if(inputType === 'url') {
          const result = await mediaUrlToDataUri(url);
          if (result.error) {
            setError(result.error);
            setIsLoading(false);
            return;
          }
          dataUri = result.dataUri!;
          setMediaPreview(dataUri);
        }

        if (!dataUri) {
          setError(`Please select a ${analysisType} or provide a URL.`);
          setIsLoading(false);
          return;
        }

        analysisInput = analysisType === 'image' ? { photoDataUri: dataUri } : { videoDataUri: dataUri };
      }

      const result = await analyzeAction(analysisInput);
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
        <p className="text-muted-foreground">Analyzing your {analysisType}...</p>
      </div>
    );
  }

  if (analysis) {
    return <AnalysisResult analysis={analysis} onReset={resetState} />;
  }
  
  const isMediaAnalysis = analysisType === 'image' || analysisType === 'video';

  return (
    <div className="space-y-6">
      {isMediaAnalysis && (
        <div className="flex justify-center rounded-md bg-muted p-1 text-muted-foreground w-max mx-auto">
          <Button variant={inputType === 'upload' ? 'ghost' : 'ghost'} onClick={() => { setInputType('upload'); resetState(); }} className={cn('h-8', inputType === 'upload' ? 'bg-background text-foreground shadow-sm' : '')}><File className="mr-2"/>Upload</Button>
          <Button variant={inputType === 'url' ? 'ghost' : 'ghost'} onClick={() => { setInputType('url'); resetState(); }} className={cn('h-8', inputType === 'url' ? 'bg-background text-foreground shadow-sm' : '')}><Link className="mr-2"/>URL</Button>
        </div>
      )}

      {analysisType === 'text' ? (
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-[16rem] text-base"
          disabled={isLoading}
        />
      ) : (
        <>
          {!mediaPreview && (
            <>
              {inputType === 'upload' ? (
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
                    <p className="text-xs text-muted-foreground">{fileTypeDescription}</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={fileTypes}
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>
              ) : (
                <div className="space-y-2">
                  <Input 
                    type="url" 
                    placeholder={`Enter ${analysisType} URL`} 
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(null); }}
                    className="w-full"
                    disabled={isLoading}
                  />
                </div>
              )}
            </>
          )}

          {mediaPreview && (
            <div className={cn("relative w-full rounded-lg overflow-hidden", analysisType === 'image' ? 'aspect-square' : 'aspect-video')}>
              {analysisType === 'image' ? (
                <Image src={mediaPreview} alt="Preview" layout="fill" objectFit="cover" />
              ) : (
                <video src={mediaPreview} controls className="w-full h-full" />
              )}
              <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 rounded-full h-8 w-8"
                  onClick={() => resetState()}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove {analysisType}</span>
                </Button>
            </div>
          )}
        </>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleAnalyze} 
        disabled={isLoading || (analysisType === 'text' ? !text.trim() : (inputType === 'upload' ? !mediaPreview : !url))}
        className="w-full" 
        size="lg"
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Analyze {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
      </Button>
    </div>
  );
}
