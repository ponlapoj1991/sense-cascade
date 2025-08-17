import { ChartData } from "@/types/dashboard";
import { SentimentChart } from "@/components/Charts/SentimentChart";
import { ChannelChart } from "@/components/Charts/ChannelChart";
import { TimelineChart } from "@/components/Charts/TimelineChart";
import { CategoryChart } from "@/components/Charts/CategoryChart";

interface ChartsGridProps {
  data: ChartData;
  isLoading?: boolean;
  onFilterChange?: (filterType: string, value: string) => void;
}

export function ChartsGrid({ data, isLoading, onFilterChange }: ChartsGridProps) {
  const handleSentimentClick = (sentiment: string) => {
    onFilterChange?.('sentiment', sentiment);
  };

  const handleChannelClick = (channel: string) => {
    onFilterChange?.('channel', channel);
  };

  const handleCategoryClick = (category: string) => {
    onFilterChange?.('category', category);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
        <SentimentChart 
          data={data.sentimentDistribution} 
          isLoading={isLoading}
          onSegmentClick={handleSentimentClick}
        />
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
        <ChannelChart 
          data={data.channelPerformance} 
          isLoading={isLoading}
          onChannelClick={handleChannelClick}
        />
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
        <TimelineChart 
          data={data.timelineTrend} 
          isLoading={isLoading}
        />
      </div>
      
      <div className="animate-fade-in" style={{ animationDelay: '500ms' }}>
        <CategoryChart 
          data={data.topCategories} 
          isLoading={isLoading}
          onCategoryClick={handleCategoryClick}
        />
      </div>
    </div>
  );
}