import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
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

  // Custom label formatter to show values on bars
  const CustomLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const labelX = x + width / 2;
    const labelY = y + height / 2;
    
    // Format large numbers
    const formatValue = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    return (
      <text 
        x={labelX} 
        y={labelY} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="bold"
      >
        {formatValue(value)}
      </text>
    );
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
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                onClick={handleClick}
                className="cursor-pointer"
                radius={[4, 4, 0, 0]}
              >
                {/* Add labels on bars - NEW! */}
                <LabelList 
                  content={<CustomLabel />}
                  position="center"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend with values - NEW! */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {processedData.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                ({item[dataKey]?.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
