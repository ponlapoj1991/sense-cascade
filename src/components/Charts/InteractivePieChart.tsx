import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LabelList } from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';

interface ChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface InteractivePieChartProps {
  title: string;
  data: ChartData[];
  filterKey: string;
  className?: string;
}

export function InteractivePieChart({ 
  title, 
  data, 
  filterKey, 
  className 
}: InteractivePieChartProps) {
  const { addFilter, removeFilter, state } = useDashboard();
  const selectedFilters = (state.filters as any)[filterKey] || [];

  const handleClick = (entry: any) => {
    const value = entry.name;
    if (selectedFilters.includes(value)) {
      removeFilter(filterKey as any, value);
    } else {
      addFilter(filterKey as any, value);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="mt-1 text-sm text-muted-foreground">
            {data.value.toLocaleString()} mentions ({data.percentage}%)
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label to show percentage on pie slices - NEW!
  const CustomPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percentage, name } = props;
    const RADIAN = Math.PI / 180;
    
    // Calculate label position
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if percentage is > 5% to avoid crowding
    if (percentage < 5) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {payload?.map((entry: any, index: number) => {
        const isSelected = selectedFilters.includes(entry.value);
        const dataItem = data.find(d => d.name === entry.value);
        
        return (
          <button
            key={index}
            onClick={() => handleClick({ name: entry.value })}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
              isSelected 
                ? 'bg-primary text-primary-foreground shadow-sm scale-105' 
                : 'bg-muted hover:bg-muted-dark'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="text-left">
              <div className="text-sm font-medium">{entry.value}</div>
              <div className="text-xs opacity-75">
                {dataItem?.value?.toLocaleString()} • {dataItem?.percentage}%
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                onClick={handleClick}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={selectedFilters.includes(entry.name) ? '#000' : 'transparent'}
                    strokeWidth={selectedFilters.includes(entry.name) ? 2 : 0}
                    style={{
                      filter: selectedFilters.length > 0 && !selectedFilters.includes(entry.name) 
                        ? 'opacity(0.3)' 
                        : 'opacity(1)',
                      transform: selectedFilters.includes(entry.name) ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                ))}
                {/* Add percentage labels on pie slices - NEW! */}
                <LabelList content={<CustomPieLabel />} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats - NEW! */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-2 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-foreground">
              {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-success">
              {data.find(d => d.name === 'Positive')?.percentage || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Positive</div>
          </div>
          <div className="p-2 bg-muted/30 rounded-lg">
            <div className="text-lg font-bold text-destructive">
              {data.find(d => d.name === 'Negative')?.percentage || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Negative</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
