import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from "@/types/dashboard";
import { formatNumber } from "@/utils/dataProcessing";

interface CategoryChartProps {
  data: ChartData['topCategories'];
  isLoading?: boolean;
  onCategoryClick?: (category: string) => void;
}

export function CategoryChart({ data, isLoading, onCategoryClick }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Top Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse space-y-4 w-full">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-8 bg-muted rounded" style={{ width: `${(3-i) * 30 + 20}%` }}></div>
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
            {data.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data: any) => {
    if (onCategoryClick && data) {
      onCategoryClick(data.category);
    }
  };

  return (
    <Card className="bg-surface shadow-card border-0 hover:shadow-card-hover transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Top Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={formatNumber}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="mentions" 
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
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