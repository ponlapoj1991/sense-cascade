import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from "@/types/dashboard";
import { formatNumber } from "@/utils/dataProcessing";

interface TimelineChartProps {
  data: ChartData['timelineTrend'];
  isLoading?: boolean;
}

export function TimelineChart({ data, isLoading }: TimelineChartProps) {
  const [metric, setMetric] = useState<'mentions' | 'engagement'>('mentions');

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Timeline Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse w-full">
              <div className="h-4 bg-muted rounded mb-4 w-1/4"></div>
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-6 bg-muted rounded" style={{ width: `${Math.random() * 100}%` }}></div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-sm text-muted-foreground">
            Mentions: {formatNumber(data.mentions)}
          </p>
          <p className="text-sm text-muted-foreground">
            Engagement: {formatNumber(data.engagement)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format data for better display (group by week if more than 14 days)
  const processedData = data.length > 14 
    ? data.filter((_, index) => index % 2 === 0) // Show every other day
    : data;

  return (
    <Card className="bg-surface shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-foreground">
          Timeline Trend
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={metric === 'mentions' ? "default" : "outline"}
            size="sm"
            onClick={() => setMetric('mentions')}
          >
            Mentions
          </Button>
          <Button
            variant={metric === 'engagement' ? "default" : "outline"}
            size="sm"
            onClick={() => setMetric('engagement')}
          >
            Engagement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={processedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={metric}
                stroke={metric === 'mentions' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'}
                strokeWidth={2}
                dot={{ r: 4, fill: metric === 'mentions' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))' }}
                activeDot={{ r: 6, stroke: metric === 'mentions' ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}