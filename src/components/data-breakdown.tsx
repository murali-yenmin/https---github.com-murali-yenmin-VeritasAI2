
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import type {
  AnalyzeImageAiDeterminationOutput
} from "@/ai/flows/analyze-image-ai-determination";
import type { AnalyzeTextAiDeterminationOutput } from "@/ai/flows/analyze-text-ai-determination";
import type { AnalyzeVideoAiDeterminationOutput } from "@/ai/flows/analyze-video-ai-determination";


type BreakdownData =
  | AnalyzeImageAiDeterminationOutput["dataBreakdown"]
  | AnalyzeTextAiDeterminationOutput["dataBreakdown"]
  | AnalyzeVideoAiDeterminationOutput["dataBreakdown"];

interface DataBreakdownProps {
  data: BreakdownData;
  analysisType: 'text' | 'image' | 'video';
}

const modelColors: { [key: string]: string } = {
  "Midjourney": "hsl(var(--chart-1))",
  "DALL-E": "hsl(var(--chart-2))",
  "DALL-E 3": "hsl(var(--chart-2))",
  "Meta AI": "hsl(var(--chart-3))",
  "GAN": "hsl(var(--chart-4))",
  "Stable Diffusion": "hsl(var(--chart-5))",
  "Adobe Firefly": "hsl(var(--chart-1))",
  "Flux": "hsl(var(--chart-2))",
  "GPT-3": "hsl(var(--chart-1))",
  "GPT-4": "hsl(var(--chart-2))",
  "Gemini": "hsl(var(--chart-3))",
  "Claude": "hsl(var(--chart-4))",
  "Llama": "hsl(var(--chart-5))",
  "Sora": "hsl(var(--chart-1))",
  "Veo": "hsl(var(--chart-2))",
  "Kling": "hsl(var(--chart-3))",
  "Gen-2": "hsl(var(--chart-4))",
};


const Gauge = ({ value, label }: { value: number; label: string }) => {
  const animatedValue = useCountUp(value, 1.5);
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative h-28 w-28">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-muted"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          <circle
            className="text-primary"
            strokeWidth="5"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.5s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">
            {animatedValue}%
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};


export const DataBreakdown = ({ data, analysisType }: DataBreakdownProps) => {

  const getGauges = () => {
    if(analysisType === 'text' && 'readabilityScore' in data){
        return [
            { label: "AI Likelihood", value: data.aiLikelihood },
            { label: "Readability", value: data.readabilityScore },
            { label: "Originality", value: data.originalityScore },
        ]
    }
    if((analysisType === 'image' || analysisType === 'video') && 'deepfakeLikelihood' in data) {
        return [
            { label: "AI Likelihood", value: data.aiLikelihood },
            { label: "Deepfake", value: data.deepfakeLikelihood },
            { label: "Quality Score", value: data.qualityScore },
        ]
    }
    return []
  }
  
  const filteredModelLikelihoods = data.modelLikelihoods.filter(m => m.likelihood > 0);
  const gauges = getGauges();

  if(gauges.length === 0 && filteredModelLikelihoods.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Breakdown</CardTitle>
        <CardDescription>
          A detailed analysis of various metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {gauges.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              {gauges.map(gauge => <Gauge key={gauge.label} {...gauge}/>)}
          </div>
        )}

        {filteredModelLikelihoods.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3">Model Likelihood</h4>
            <div className="space-y-3">
              {filteredModelLikelihoods.map((modelData) => (
                <div key={modelData.model} className="flex items-center gap-4 text-sm">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: modelColors[modelData.model] ?? 'hsl(var(--foreground))' }}
                  />
                  <span className="flex-1 font-medium">{modelData.model}</span>
                  <span className="font-mono text-muted-foreground">{useCountUp(modelData.likelihood)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
