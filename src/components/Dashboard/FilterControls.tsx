import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X } from "lucide-react";
import { DashboardFilters } from "@/types/dashboard";

interface FilterControlsProps {
  filters: Partial<DashboardFilters>;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onTimeframeChange: (timeframe: DashboardFilters['timeframe']) => void;
}

export function FilterControls({ filters, onFiltersChange, onTimeframeChange }: FilterControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const channels = ['Facebook', 'Website', 'Twitter', 'Instagram', 'TikTok', 'YouTube'];
  const sentiments = ['Positive', 'Negative', 'Neutral'];
  const categories = ['Business Branding', 'ESG Branding', 'Crisis Management'];

  const timeframes = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
    { key: 'custom' as const, label: 'Custom' }
  ];

  const toggleChannel = (channel: string) => {
    const currentChannels = filters.channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    
    onFiltersChange({ ...filters, channels: newChannels });
  };

  const toggleSentiment = (sentiment: string) => {
    const currentSentiments = filters.sentiment || [];
    const newSentiments = currentSentiments.includes(sentiment)
      ? currentSentiments.filter(s => s !== sentiment)
      : [...currentSentiments, sentiment];
    
    onFiltersChange({ ...filters, sentiment: newSentiments });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      ...filters,
      channels: [],
      sentiment: [],
      categories: []
    });
  };

  const getActiveFiltersCount = () => {
    return (filters.channels?.length || 0) + 
           (filters.sentiment?.length || 0) + 
           (filters.categories?.length || 0);
  };

  const formatDateRange = () => {
    if (!filters.dateRange) return 'Last 30 days';
    
    const start = filters.dateRange.start.toLocaleDateString();
    const end = filters.dateRange.end.toLocaleDateString();
    return `${start} - ${end}`;
  };

  return (
    <Card className="bg-surface shadow-card border-0 mb-6">
      <CardContent className="p-6">
        {/* Quick Timeframe Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Time Period:</span>
          </div>
          
          {timeframes.map((timeframe) => (
            <Button
              key={timeframe.key}
              variant={filters.timeframe === timeframe.key ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(timeframe.key)}
              className={filters.timeframe === timeframe.key ? "bg-primary text-primary-foreground" : ""}
            >
              {timeframe.label}
            </Button>
          ))}
          
          <span className="text-sm text-muted-foreground ml-2">
            {formatDateRange()}
          </span>
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>

          {getActiveFiltersCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Expandable Filter Options */}
        {isExpanded && (
          <div className="mt-6 space-y-6 animate-fade-in">
            {/* Channel Filters */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Channels</h4>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <Button
                    key={channel}
                    variant={filters.channels?.includes(channel) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel(channel)}
                    className={filters.channels?.includes(channel) ? "bg-primary text-primary-foreground" : ""}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sentiment Filters */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Sentiment</h4>
              <div className="flex flex-wrap gap-2">
                {sentiments.map((sentiment) => (
                  <Button
                    key={sentiment}
                    variant={filters.sentiment?.includes(sentiment) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSentiment(sentiment)}
                    className={filters.sentiment?.includes(sentiment) ? "bg-primary text-primary-foreground" : ""}
                  >
                    {sentiment}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filters.categories?.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                    className={filters.categories?.includes(category) ? "bg-primary text-primary-foreground" : ""}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}