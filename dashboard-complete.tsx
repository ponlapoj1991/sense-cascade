// ============================================================================
// COMPLETE SOCIAL MEDIA DASHBOARD - ALL CODE IN ONE FILE
// ============================================================================

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface SocialMention {
  id: number;
  date: string;
  content: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  channel: 'Facebook' | 'Website' | 'Twitter' | 'Instagram' | 'TikTok' | 'YouTube';
  content_type: 'Post' | 'Video' | 'Comment' | 'Story';
  total_engagement: number;
  username: string;
  category: 'Business Branding' | 'ESG Branding' | 'Crisis Management';
  sub_category: 'Sport' | 'Stock' | 'Net zero' | 'Corporate';
  type_of_speaker: 'Publisher' | 'Influencer voice' | 'Consumer' | 'Media';
  comments: number;
  reactions: number;
  shares: number;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  channels: string[];
  sentiment: string[];
  categories: string[];
  timeframe: 'today' | 'week' | 'month' | 'custom';
}

export interface KPIData {
  totalMentions: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  totalEngagement: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  avgEngagementRate: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  sentimentScore: {
    value: number;
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
  };
}

export interface ChartData {
  sentimentDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  channelPerformance: Array<{
    channel: string;
    mentions: number;
    engagement: number;
  }>;
  timelineTrend: Array<{
    date: string;
    mentions: number;
    engagement: number;
  }>;
  topCategories: Array<{
    category: string;
    mentions: number;
    percentage: number;
  }>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockData: SocialMention[] = [
  {
    id: 1,
    date: "2024-01-15",
    content: "ยิ่งใหญ่มากเลยครับ #BrandAwesome",
    sentiment: "Positive",
    channel: "Facebook",
    content_type: "Post",
    total_engagement: 1250,
    username: "user123",
    category: "Business Branding",
    sub_category: "Sport",
    type_of_speaker: "Consumer",
    comments: 45,
    reactions: 1100,
    shares: 105
  },
  {
    id: 2,
    date: "2024-01-14",
    content: "ไม่ประทับใจเลย ต้องปรับปรุง",
    sentiment: "Negative",
    channel: "Twitter",
    content_type: "Post",
    total_engagement: 830,
    username: "critic_voice",
    category: "Crisis Management",
    sub_category: "Corporate",
    type_of_speaker: "Media",
    comments: 120,
    reactions: 600,
    shares: 110
  },
  {
    id: 3,
    date: "2024-01-13",
    content: "บริษัทนี้มีแนวทางด้านสิ่งแวดล้อมที่ดี",
    sentiment: "Positive",
    channel: "Website",
    content_type: "Comment",
    total_engagement: 2100,
    username: "green_advocate",
    category: "ESG Branding",
    sub_category: "Net zero",
    type_of_speaker: "Influencer voice",
    comments: 200,
    reactions: 1800,
    shares: 100
  },
  // Add more mock data...
  {
    id: 4,
    date: "2024-01-12",
    content: "คุณภาพโอเคครับ แต่ราคาแพงไป",
    sentiment: "Neutral",
    channel: "Instagram",
    content_type: "Story",
    total_engagement: 950,
    username: "honest_reviewer",
    category: "Business Branding",
    sub_category: "Stock",
    type_of_speaker: "Consumer",
    comments: 75,
    reactions: 800,
    shares: 75
  },
  {
    id: 5,
    date: "2024-01-11",
    content: "ประทับใจมากกับแบรนด์นี้",
    sentiment: "Positive",
    channel: "TikTok",
    content_type: "Video",
    total_engagement: 3200,
    username: "tiktok_star",
    category: "Business Branding",
    sub_category: "Sport",
    type_of_speaker: "Influencer voice",
    comments: 400,
    reactions: 2500,
    shares: 300
  }
];

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

export function filterData(data: SocialMention[], filters: Partial<DashboardFilters>): SocialMention[] {
  return data.filter(item => {
    // Date range filter
    if (filters.dateRange) {
      const itemDate = new Date(item.date);
      if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
        return false;
      }
    }

    // Channel filter
    if (filters.channels && filters.channels.length > 0) {
      if (!filters.channels.includes(item.channel)) {
        return false;
      }
    }

    // Sentiment filter
    if (filters.sentiment && filters.sentiment.length > 0) {
      if (!filters.sentiment.includes(item.sentiment)) {
        return false;
      }
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(item.category)) {
        return false;
      }
    }

    return true;
  });
}

export function processKPIData(currentData: SocialMention[], previousData: SocialMention[]): KPIData {
  const currentMentions = currentData.length;
  const previousMentions = previousData.length;
  const currentEngagement = currentData.reduce((sum, item) => sum + item.total_engagement, 0);
  const previousEngagement = previousData.reduce((sum, item) => sum + item.total_engagement, 0);

  const currentEngagementRate = currentMentions > 0 ? currentEngagement / currentMentions : 0;
  const previousEngagementRate = previousMentions > 0 ? previousEngagement / previousMentions : 0;

  const positiveCount = currentData.filter(item => item.sentiment === 'Positive').length;
  const negativeCount = currentData.filter(item => item.sentiment === 'Negative').length;
  const neutralCount = currentData.filter(item => item.sentiment === 'Neutral').length;

  const sentimentScore = currentMentions > 0 
    ? (positiveCount * 1 + neutralCount * 0.5 + negativeCount * 0) / currentMentions * 100
    : 50;

  return {
    totalMentions: {
      value: currentMentions,
      change: previousMentions > 0 ? ((currentMentions - previousMentions) / previousMentions) * 100 : 0,
      trend: currentMentions > previousMentions ? 'up' : currentMentions < previousMentions ? 'down' : 'stable'
    },
    totalEngagement: {
      value: currentEngagement,
      change: previousEngagement > 0 ? ((currentEngagement - previousEngagement) / previousEngagement) * 100 : 0,
      trend: currentEngagement > previousEngagement ? 'up' : currentEngagement < previousEngagement ? 'down' : 'stable'
    },
    avgEngagementRate: {
      value: currentEngagementRate,
      change: previousEngagementRate > 0 ? ((currentEngagementRate - previousEngagementRate) / previousEngagementRate) * 100 : 0,
      trend: currentEngagementRate > previousEngagementRate ? 'up' : currentEngagementRate < previousEngagementRate ? 'down' : 'stable'
    },
    sentimentScore: {
      value: sentimentScore,
      distribution: {
        positive: currentMentions > 0 ? (positiveCount / currentMentions) * 100 : 0,
        negative: currentMentions > 0 ? (negativeCount / currentMentions) * 100 : 0,
        neutral: currentMentions > 0 ? (neutralCount / currentMentions) * 100 : 0
      }
    }
  };
}

export function processChartData(data: SocialMention[]): ChartData {
  // Sentiment distribution
  const sentimentCounts = data.reduce((acc, item) => {
    acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = data.length;
  const sentimentDistribution = Object.entries(sentimentCounts).map(([sentiment, count]) => ({
    name: sentiment,
    value: count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    color: sentiment === 'Positive' ? '#22c55e' : sentiment === 'Negative' ? '#ef4444' : '#6b7280'
  }));

  // Channel performance
  const channelData = data.reduce((acc, item) => {
    if (!acc[item.channel]) {
      acc[item.channel] = { mentions: 0, engagement: 0 };
    }
    acc[item.channel].mentions++;
    acc[item.channel].engagement += item.total_engagement;
    return acc;
  }, {} as Record<string, { mentions: number; engagement: number }>);

  const channelPerformance = Object.entries(channelData).map(([channel, data]) => ({
    channel,
    mentions: data.mentions,
    engagement: data.engagement
  }));

  // Timeline trend (group by date)
  const timelineData = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { mentions: 0, engagement: 0 };
    }
    acc[date].mentions++;
    acc[date].engagement += item.total_engagement;
    return acc;
  }, {} as Record<string, { mentions: number; engagement: number }>);

  const timelineTrend = Object.entries(timelineData)
    .map(([date, data]) => ({
      date,
      mentions: data.mentions,
      engagement: data.engagement
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Top categories
  const categoryData = data.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryData)
    .map(([category, mentions]) => ({
      category,
      mentions,
      percentage: total > 0 ? (mentions / total) * 100 : 0
    }))
    .sort((a, b) => b.mentions - a.mentions);

  return {
    sentimentDistribution,
    channelPerformance,
    timelineTrend,
    topCategories
  };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ============================================================================
// REACT COMPONENTS
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Heart, 
  BarChart3, 
  Target,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Download,
  Share2,
  Settings,
  User,
  Bell,
  Bot,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

// ============================================================================
// CUSTOM HOOK
// ============================================================================

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

// ============================================================================
// HEADER COMPONENT
// ============================================================================

interface HeaderProps {
  lastUpdated?: Date;
  totalRecords?: number;
}

export function Header({ lastUpdated = new Date(), totalRecords = 0 }: HeaderProps) {
  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'เมื่อสักครู่';
    if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Social Media Dashboard</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live</span>
                  </div>
                  <span>•</span>
                  <span>อัปเดตล่าสุด: {formatLastUpdated(lastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {formatNumber(totalRecords)} รายการ
            </Badge>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// KPI CARDS COMPONENT
// ============================================================================

interface KPICardsProps {
  data: KPIData;
  isLoading?: boolean;
}

export function KPICards({ data, isLoading }: KPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Mentions",
      value: formatNumber(data.totalMentions.value),
      change: data.totalMentions.change,
      trend: data.totalMentions.trend,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Engagement", 
      value: formatNumber(data.totalEngagement.value),
      change: data.totalEngagement.change,
      trend: data.totalEngagement.trend,
      icon: Heart,
      color: "text-pink-600"
    },
    {
      title: "Avg. Engagement Rate",
      value: formatNumber(Math.round(data.avgEngagementRate.value)),
      change: data.avgEngagementRate.change,
      trend: data.avgEngagementRate.trend,
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      title: "Sentiment Score",
      value: `${Math.round(data.sentimentScore.value)}%`,
      change: 0, // Static for sentiment score
      trend: 'stable' as const,
      icon: Target,
      color: "text-purple-600"
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const TrendIcon = getTrendIcon(card.trend);
        
        return (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 group animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${card.color} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className={`flex items-center text-sm ${getTrendColor(card.trend)}`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  {card.change !== 0 && (
                    <span>{Math.abs(card.change).toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.title}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ============================================================================
// FILTER CONTROLS COMPONENT
// ============================================================================

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

  const toggleChannel = (channel: string) => {
    const currentChannels = filters.channels || [];
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter(c => c !== channel)
      : [...currentChannels, channel];
    onFiltersChange({ channels: newChannels });
  };

  const toggleSentiment = (sentiment: string) => {
    const currentSentiments = filters.sentiment || [];
    const newSentiments = currentSentiments.includes(sentiment)
      ? currentSentiments.filter(s => s !== sentiment)
      : [...currentSentiments, sentiment];
    onFiltersChange({ sentiment: newSentiments });
  };

  const toggleCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    onFiltersChange({ categories: newCategories });
  };

  const clearAllFilters = () => {
    onFiltersChange({
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

  return (
    <Card className="mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filters & Timeline</CardTitle>
          </div>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Timeframe Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['today', 'week', 'month'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={filters.timeframe === timeframe ? "default" : "outline"}
              size="sm"
              onClick={() => onTimeframeChange(timeframe)}
            >
              {timeframe === 'today' ? 'Today' : 
               timeframe === 'week' ? 'This Week' : 'This Month'}
            </Button>
          ))}
          <Button
            variant={filters.timeframe === 'custom' ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeframeChange('custom')}
          >
            Custom
          </Button>
        </div>

        {/* Date Range Display */}
        {filters.dateRange && (
          <div className="text-sm text-muted-foreground mb-4">
            {filters.dateRange.start.toLocaleDateString('th-TH')} - {filters.dateRange.end.toLocaleDateString('th-TH')}
          </div>
        )}

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4">
            {/* Clear Filters */}
            {getActiveFiltersCount() > 0 && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}

            {/* Channel Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Channels</h4>
              <div className="flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <Button
                    key={channel}
                    variant={filters.channels?.includes(channel) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleChannel(channel)}
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sentiment Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Sentiment</h4>
              <div className="flex flex-wrap gap-2">
                {sentiments.map((sentiment) => (
                  <Button
                    key={sentiment}
                    variant={filters.sentiment?.includes(sentiment) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleSentiment(sentiment)}
                  >
                    {sentiment}
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={filters.categories?.includes(category) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHART COMPONENTS
// ============================================================================

// Sentiment Chart
interface SentimentChartProps {
  data: ChartData['sentimentDistribution'];
  isLoading?: boolean;
  onSegmentClick?: (sentiment: string) => void;
}

export function SentimentChart({ data, isLoading, onSegmentClick }: SentimentChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = {
    'Positive': '#22c55e',
    'Negative': '#ef4444', 
    'Neutral': '#6b7280'
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} mentions ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm">{entry.value}</span>
            <span className="text-xs text-muted-foreground">
              ({data.find(d => d.name === entry.value)?.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  const handleClick = (data: any) => {
    onSegmentClick?.(data.name);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Distribution</CardTitle>
        <CardDescription>
          Overall sentiment breakdown of mentions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              onClick={handleClick}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                  className="hover:opacity-80 transition-opacity"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Channel Chart
interface ChannelChartProps {
  data: ChartData['channelPerformance'];
  isLoading?: boolean;
  onChannelClick?: (channel: string) => void;
}

export function ChannelChart({ data, isLoading, onChannelClick }: ChannelChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Mentions: {formatNumber(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Engagement: {formatNumber(payload[0].payload.engagement)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data: any) => {
    onChannelClick?.(data.channel);
  };

  // Sort by mentions and take top 6
  const sortedData = [...data]
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
        <CardDescription>
          Top channels by mentions and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData} onClick={handleClick}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="channel" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="mentions" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              className="cursor-pointer hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Timeline Chart
interface TimelineChartProps {
  data: ChartData['timelineTrend'];
  isLoading?: boolean;
}

export function TimelineChart({ data, isLoading }: TimelineChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<'mentions' | 'engagement'>('mentions');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString('th-TH')}</p>
          <p className="text-sm text-muted-foreground">
            Mentions: {formatNumber(payload[0].payload.mentions)}
          </p>
          <p className="text-sm text-muted-foreground">
            Engagement: {formatNumber(payload[0].payload.engagement)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Process data to show every other day if too many data points
  const processedData = data.length > 14 
    ? data.filter((_, index) => index % 2 === 0)
    : data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Timeline Trend</CardTitle>
            <CardDescription>
              Mentions and engagement over time
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedMetric === 'mentions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('mentions')}
            >
              Mentions
            </Button>
            <Button
              variant={selectedMetric === 'engagement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric('engagement')}
            >
              Engagement
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('th-TH', { 
                month: 'short', 
                day: 'numeric' 
              })}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={selectedMetric === 'mentions' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'}
              strokeWidth={2}
              dot={{ fill: selectedMetric === 'mentions' ? 'hsl(var(--primary))' : 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Category Chart
interface CategoryChartProps {
  data: ChartData['topCategories'];
  isLoading?: boolean;
  onCategoryClick?: (category: string) => void;
}

export function CategoryChart({ data, isLoading, onCategoryClick }: CategoryChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">
            Mentions: {formatNumber(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Percentage: {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data: any) => {
    onCategoryClick?.(data.category);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>
          Most discussed topic categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data} 
            layout="horizontal"
            onClick={handleClick}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis 
              type="category" 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="mentions" 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// CHARTS GRID COMPONENT
// ============================================================================

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

// ============================================================================
// AI INSIGHTS COMPONENT
// ============================================================================

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'trend';
  title: string;
  description: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AIInsightsProps {
  kpiData: KPIData;
  chartData: ChartData;
  isLoading?: boolean;
}

export function AIInsights({ kpiData, chartData, isLoading }: AIInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Sentiment insights
    const sentimentScore = kpiData.sentimentScore.value;
    if (sentimentScore > 70) {
      insights.push({
        id: 'positive-sentiment',
        type: 'success',
        title: 'Positive Sentiment Strong',
        description: `${sentimentScore.toFixed(1)}% positive sentiment indicates excellent brand perception.`,
        action: 'Amplify Success',
        icon: CheckCircle
      });
    } else if (sentimentScore < 40) {
      insights.push({
        id: 'negative-sentiment',
        type: 'warning',
        title: 'Sentiment Needs Attention',
        description: `${sentimentScore.toFixed(1)}% sentiment score suggests addressing negative feedback.`,
        action: 'Create Action Plan',
        icon: AlertTriangle
      });
    }

    // Channel performance insights
    const topChannel = chartData.channelPerformance.reduce((prev, current) => 
      prev.mentions > current.mentions ? prev : current
    );
    
    if (topChannel) {
      insights.push({
        id: 'top-channel',
        type: 'info',
        title: `${topChannel.channel} Leading Performance`,
        description: `${topChannel.channel} generates ${formatNumber(topChannel.mentions)} mentions with ${formatNumber(topChannel.engagement)} engagement.`,
        action: 'Optimize Strategy',
        icon: Zap
      });
    }

    // Engagement trend
    const engagementTrend = kpiData.totalEngagement.trend;
    if (engagementTrend === 'up') {
      insights.push({
        id: 'engagement-up',
        type: 'success',
        title: 'Engagement Growing',
        description: `Total engagement increased by ${kpiData.totalEngagement.change.toFixed(1)}% from previous period.`,
        action: 'Maintain Momentum',
        icon: TrendingUp
      });
    } else if (engagementTrend === 'down') {
      insights.push({
        id: 'engagement-down',
        type: 'warning',
        title: 'Engagement Declining',
        description: `Total engagement decreased by ${Math.abs(kpiData.totalEngagement.change).toFixed(1)}% from previous period.`,
        action: 'Boost Content',
        icon: TrendingDown
      });
    }

    // Category insights
    const topCategory = chartData.topCategories[0];
    if (topCategory) {
      insights.push({
        id: 'top-category',
        type: 'trend',
        title: `${topCategory.category} Trending`,
        description: `${topCategory.category} accounts for ${topCategory.percentage.toFixed(1)}% of all discussions.`,
        action: 'Leverage Topic',
        icon: Lightbulb
      });
    }

    // Return max 4 insights
    return insights.slice(0, 4);
  };

  const insights = generateInsights();

  const getInsightColor = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'info': return 'text-blue-600';
      case 'trend': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getInsightBadgeColor = (type: Insight['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'trend': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
      {/* AI Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>
            AI-powered analysis of your social media performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div
                  key={insight.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getInsightColor(insight.type)}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <Badge variant="secondary" className={`text-xs ${getInsightBadgeColor(insight.type)}`}>
                          {insight.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      <Button size="sm" variant="outline" className="text-xs">
                        {insight.action}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Set Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function SocialMediaDashboard() {
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
}

// ============================================================================
// USAGE INSTRUCTIONS
// ============================================================================

/*
วิธีใช้งาน Dashboard นี้:

1. Import และใช้ component หลัก:
   import SocialMediaDashboard from './dashboard-complete';
   
   function App() {
     return <SocialMediaDashboard />;
   }

2. ปรับแต่ง Mock Data:
   - แก้ไข mockData array เพื่อใส่ข้อมูลจริง
   - หรือเชื่อมต่อกับ API จริงใน useDashboardData hook

3. Customize Styling:
   - แก้ไข colors และ themes ใน design system
   - ปรับ layout ใน grid components
   - เพิ่ม animations และ effects

4. Add Features:
   - เพิ่ม export functionality
   - เพิ่ม real-time updates
   - เพิ่ม more chart types
   - เพิ่ม user preferences

5. เชื่อมต่อกับ Backend:
   - แทนที่ mockData ด้วย API calls
   - เพิ่ม authentication
   - เพิ่ม data caching
   - เพิ่ม error handling

Dependencies ที่ต้องการ:
- React 18+
- recharts (สำหรับ charts)
- lucide-react (สำหรับ icons)
- Radix UI components
- Tailwind CSS
- date-fns (สำหรับ date handling)
*/
