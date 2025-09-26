
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCountUp } from "@/hooks/use-count-up";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

export const DataBreakdown = ({ data, analysisType }: DataBreakdownProps) => {

  const filteredModelLikelihoods = data.modelLikelihoods.filter(m => m.likelihood > 0);

  if(filteredModelLikelihoods.length === 0) {
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


        {filteredModelLikelihoods.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold mb-3">Model Likelihood</h4>
            <div className="w-full h-64">
              <ResponsiveContainer>
                <BarChart data={filteredModelLikelihoods} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="model"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--accent))" }}
                    contentStyle={{
                      background: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                    }}
                  />
                  <Bar dataKey="likelihood" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
