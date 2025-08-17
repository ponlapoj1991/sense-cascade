import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ChartData } from "@/types/dashboard";

interface SentimentChartProps {
  data: ChartData['sentimentDistribution'];
  isLoading?: boolean;
  onSegmentClick?: (sentiment: string) => void;
}

export function SentimentChart({ data, isLoading, onSegmentClick }: SentimentChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sentiment Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse">
              <div className="w-32 h-32 bg-muted rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = {
    'Positive': 'hsl(var(--chart-3))',
    'Negative': 'hsl(var(--destructive))',
    'Neutral': 'hsl(var(--muted-foreground))'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-modal">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} mentions ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-6 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-foreground">
              {entry.value} ({entry.payload.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleClick = (data: any) => {
    if (onSegmentClick) {
      onSegmentClick(data.name);
    }
  };

  return (
    <Card className="bg-surface shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Sentiment Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}