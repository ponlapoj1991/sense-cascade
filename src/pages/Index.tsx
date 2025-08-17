import { useState } from "react";
import { Header } from "@/components/Layout/Header";
import { KPICards } from "@/components/Dashboard/KPICards";
import { FilterControls } from "@/components/Dashboard/FilterControls";
import { ChartsGrid } from "@/components/Dashboard/ChartsGrid";
import { AIInsights } from "@/components/Dashboard/AIInsights";
import { useDashboardData } from "@/hooks/useDashboardData";

const Index = () => {
  const {
    kpiData,
    chartData,
    filters,
    isLoading,
    updateFilters,
    setTimeframe,
    totalRecords
  } = useDashboardData();

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'sentiment':
        const currentSentiments = filters.sentiment || [];
        const newSentiments = currentSentiments.includes(value)
          ? currentSentiments.filter(s => s !== value)
          : [...currentSentiments, value];
        updateFilters({ sentiment: newSentiments });
        break;
      
      case 'channel':
        const currentChannels = filters.channels || [];
        const newChannels = currentChannels.includes(value)
          ? currentChannels.filter(c => c !== value)
          : [...currentChannels, value];
        updateFilters({ channels: newChannels });
        break;
      
      case 'category':
        const currentCategories = filters.categories || [];
        const newCategories = currentCategories.includes(value)
          ? currentCategories.filter(c => c !== value)
          : [...currentCategories, value];
        updateFilters({ categories: newCategories });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        lastUpdated={new Date()} 
        totalRecords={totalRecords}
      />
      
      <div className="container mx-auto px-6 pb-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <KPICards data={kpiData} isLoading={isLoading} />
            
            <FilterControls
              filters={filters}
              onFiltersChange={updateFilters}
              onTimeframeChange={setTimeframe}
            />
            
            <ChartsGrid
              data={chartData}
              isLoading={isLoading}
              onFilterChange={handleFilterChange}
            />
          </div>
          
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <AIInsights
              kpiData={kpiData}
              chartData={chartData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
