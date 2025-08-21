import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => {
        const isSelected = selectedFilters.includes(entry.value);
        return (
          <button
            key={index}
            onClick={() => handleClick({ name: entry.value })}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all ${
              isSelected 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted hover:bg-muted-dark'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.value}</span>
            <span className="text-xs opacity-75">
              {data.find(d => d.name === entry.value)?.percentage}%
            </span>
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
                        : 'opacity(1)'
                    }}
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