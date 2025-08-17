import { SocialMention, KPIData, ChartData, DashboardFilters } from '@/types/dashboard';

export function processKPIData(data: SocialMention[], previousData?: SocialMention[]): KPIData {
  const totalMentions = data.length;
  const totalEngagement = data.reduce((sum, item) => sum + item.total_engagement, 0);
  const avgEngagementRate = totalMentions > 0 ? totalEngagement / totalMentions : 0;
  
  // Sentiment distribution
  const sentimentCounts = data.reduce(
    (acc, item) => {
      acc[item.sentiment.toLowerCase() as keyof typeof acc]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );
  
  // Calculate sentiment score (0-100 scale)
  const sentimentScore = totalMentions > 0 
    ? Math.round(((sentimentCounts.positive * 100) + (sentimentCounts.neutral * 50)) / totalMentions)
    : 50;
  
  // Calculate changes compared to previous period
  const previousTotalMentions = previousData?.length || 0;
  const previousTotalEngagement = previousData?.reduce((sum, item) => sum + item.total_engagement, 0) || 0;
  const previousAvgEngagement = previousTotalMentions > 0 ? previousTotalEngagement / previousTotalMentions : 0;
  
  const mentionsChange = previousTotalMentions > 0 
    ? ((totalMentions - previousTotalMentions) / previousTotalMentions) * 100 
    : 0;
  
  const engagementChange = previousTotalEngagement > 0 
    ? ((totalEngagement - previousTotalEngagement) / previousTotalEngagement) * 100 
    : 0;
  
  const avgEngagementChange = previousAvgEngagement > 0 
    ? ((avgEngagementRate - previousAvgEngagement) / previousAvgEngagement) * 100 
    : 0;
  
  return {
    totalMentions: {
      value: totalMentions,
      change: mentionsChange,
      trend: mentionsChange > 0 ? 'up' : mentionsChange < 0 ? 'down' : 'stable'
    },
    totalEngagement: {
      value: totalEngagement,
      change: engagementChange,
      trend: engagementChange > 0 ? 'up' : engagementChange < 0 ? 'down' : 'stable'
    },
    avgEngagementRate: {
      value: avgEngagementRate,
      change: avgEngagementChange,
      trend: avgEngagementChange > 0 ? 'up' : avgEngagementChange < 0 ? 'down' : 'stable'
    },
    sentimentScore: {
      value: sentimentScore,
      distribution: sentimentCounts
    }
  };
}

export function processChartData(data: SocialMention[]): ChartData {
  // Sentiment Distribution
  const sentimentCounts = data.reduce(
    (acc, item) => {
      acc[item.sentiment]++;
      return acc;
    },
    { Positive: 0, Negative: 0, Neutral: 0 }
  );
  
  const total = data.length;
  const sentimentDistribution = Object.entries(sentimentCounts).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0,
    color: name === 'Positive' ? '#10b981' : name === 'Negative' ? '#ef4444' : '#6b7280'
  }));
  
  // Channel Performance
  const channelStats = data.reduce((acc, item) => {
    if (!acc[item.channel]) {
      acc[item.channel] = { mentions: 0, engagement: 0 };
    }
    acc[item.channel].mentions++;
    acc[item.channel].engagement += item.total_engagement;
    return acc;
  }, {} as Record<string, { mentions: number; engagement: number }>);
  
  const channelPerformance = Object.entries(channelStats).map(([channel, stats]) => ({
    channel,
    mentions: stats.mentions,
    engagement: stats.engagement
  })).sort((a, b) => b.mentions - a.mentions);
  
  // Timeline Trend (group by date)
  const timelineStats = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { mentions: 0, engagement: 0 };
    }
    acc[item.date].mentions++;
    acc[item.date].engagement += item.total_engagement;
    return acc;
  }, {} as Record<string, { mentions: number; engagement: number }>);
  
  const timelineTrend = Object.entries(timelineStats)
    .map(([date, stats]) => ({
      date,
      mentions: stats.mentions,
      engagement: stats.engagement
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Top Categories
  const categoryStats = data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = 0;
    }
    acc[item.category]++;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(categoryStats)
    .map(([category, mentions]) => ({
      category,
      mentions,
      percentage: total > 0 ? Math.round((mentions / total) * 100) : 0
    }))
    .sort((a, b) => b.mentions - a.mentions);
  
  return {
    sentimentDistribution,
    channelPerformance,
    timelineTrend,
    topCategories
  };
}

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

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
}

export function formatPercentage(num: number): string {
  return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
}