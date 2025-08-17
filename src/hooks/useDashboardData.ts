import { useState, useEffect, useMemo } from 'react';
import { SocialMention, DashboardFilters, KPIData, ChartData } from '@/types/dashboard';
import { mockData } from '@/utils/mockData';
import { processKPIData, processChartData, filterData } from '@/utils/dataProcessing';

export function useDashboardData() {
  const [rawData] = useState<SocialMention[]>(mockData);
  const [filters, setFilters] = useState<Partial<DashboardFilters>>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    },
    channels: [],
    sentiment: [],
    categories: [],
    timeframe: 'month'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    return filterData(rawData, filters);
  }, [rawData, filters]);

  // Process KPI data
  const kpiData = useMemo<KPIData>(() => {
    // Get previous period data for comparison
    const currentPeriodDays = filters.dateRange 
      ? Math.ceil((filters.dateRange.end.getTime() - filters.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    const previousStart = new Date(filters.dateRange?.start || new Date());
    previousStart.setDate(previousStart.getDate() - currentPeriodDays);
    
    const previousFilters = {
      ...filters,
      dateRange: {
        start: previousStart,
        end: filters.dateRange?.start || new Date()
      }
    };
    
    const previousData = filterData(rawData, previousFilters);
    
    return processKPIData(filteredData, previousData);
  }, [filteredData, rawData, filters]);

  // Process chart data
  const chartData = useMemo<ChartData>(() => {
    return processChartData(filteredData);
  }, [filteredData]);

  // Update filters
  const updateFilters = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Quick filter presets
  const setTimeframe = (timeframe: DashboardFilters['timeframe']) => {
    const end = new Date();
    let start = new Date();
    
    switch (timeframe) {
      case 'today':
        start = new Date();
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setDate(end.getDate() - 30);
        break;
      default:
        // Keep current date range for custom
        return;
    }
    
    updateFilters({
      dateRange: { start, end },
      timeframe
    });
  };

  return {
    data: filteredData,
    kpiData,
    chartData,
    filters,
    isLoading,
    updateFilters,
    setTimeframe,
    totalRecords: rawData.length
  };
}
