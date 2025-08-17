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