import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from "@/types/dashboard";
import { formatNumber } from "@/utils/dataProcessing";

interface ChannelChartProps {
  data: ChartData['channelPerformance'];
  isLoading?: boolean;
  onChannelClick?: (channel: string) => void;
}

export function ChannelChart({ data, isLoading, onChannelClick }: ChannelChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Channel Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse space-y-2 w-full">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-16 h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded flex-1" style={{ width: `${Math.random() * 100}%` }}></div>
                </div>
              ))}
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
          <p className="font-medium">{label}</p>
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

  const handleClick = (data: any) => {
    if (onChannelClick && data) {
      onChannelClick(data.channel);
    }
  };

  // Sort data by mentions descending and take top 6
  const sortedData = [...data]
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6);

  return (
    <Card className="bg-surface shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Channel Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                type="category" 
                dataKey="channel"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="mentions" 
                fill="hsl(var(--chart-1))"
                radius={[0, 4, 4, 0]}
                onClick={handleClick}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}