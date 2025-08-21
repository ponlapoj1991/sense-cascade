import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';

interface ChartData {
  name: string;
  value: number;
  engagement?: number;
  [key: string]: any;
}

interface InteractiveBarChartProps {
  title: string;
  data: ChartData[];
  filterKey: string;
  dataKey?: string;
  className?: string;
  color?: string;
}

export function InteractiveBarChart({ 
  title, 
  data, 
  filterKey, 
  dataKey = 'value',
  className,
  color = 'hsl(var(--chart-1))'
}: InteractiveBarChartProps) {
  const { addFilter, removeFilter, state } = useDashboard();
  const selectedFilters = (state.filters as any)[filterKey] || [];

  const handleClick = (data: any) => {
    const value = data.name;
    if (selectedFilters.includes(value)) {
      removeFilter(filterKey as any, value);
    } else {
      addFilter(filterKey as any, value);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="font-medium">{label}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {dataKey === 'value' ? 'Mentions' : 'Engagement'}: {data[dataKey]?.toLocaleString()}
            {data.engagement && dataKey !== 'engagement' && (
              <div>Engagement: {data.engagement.toLocaleString()}</div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const processedData = data.map(item => ({
    ...item,
    fill: selectedFilters.includes(item.name) 
      ? 'hsl(var(--primary))' 
      : selectedFilters.length > 0 
        ? 'hsl(var(--muted-foreground))' 
        : color
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                onClick={handleClick}
                className="cursor-pointer"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}