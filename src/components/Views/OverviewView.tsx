import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractivePieChart } from '@/components/Charts/InteractivePieChart';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { useDashboard } from '@/contexts/DashboardContext';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Share2 } from 'lucide-react';

const SENTIMENT_COLORS = {
  'Positive': 'hsl(var(--success))',
  'Negative': 'hsl(var(--destructive))',
  'Neutral': 'hsl(var(--warning))'
};

const CHANNEL_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export function OverviewView() {
  const { state } = useDashboard();
  const { filteredData } = state;

  const analytics = useMemo(() => {
    // KPI calculations
    const totalMentions = filteredData.length;
    const totalEngagement = filteredData.reduce((sum, item) => sum + (item.total_engagement || 0), 0);
    const avgEngagement = totalMentions > 0 ? Math.round(totalEngagement / totalMentions) : 0;
    const uniqueUsers = new Set(filteredData.map(item => item.username)).size;

    // Sentiment distribution
    const sentimentCounts = filteredData.reduce((acc, item) => {
      const sentiment = item.sentiment || 'Unknown';
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({
      name,
      value,
      percentage: Math.round((value / totalMentions) * 100),
      color: SENTIMENT_COLORS[name as keyof typeof SENTIMENT_COLORS] || 'hsl(var(--muted-foreground))'
    }));

    // Channel distribution
    const channelCounts = filteredData.reduce((acc, item) => {
      const channel = item.channel || 'Unknown';
      acc[channel] = {
        mentions: (acc[channel]?.mentions || 0) + 1,
        engagement: (acc[channel]?.engagement || 0) + (item.total_engagement || 0)
      };
      return acc;
    }, {} as Record<string, { mentions: number; engagement: number }>);

    const channelData = Object.entries(channelCounts)
      .map(([name, data]) => ({
        name,
        value: data.mentions,
        engagement: data.engagement
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Category distribution
    const categoryData = Object.entries(
      filteredData.reduce((acc, item) => {
        const category = item.category || 'Unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Content type distribution
    const contentTypeData = Object.entries(
      filteredData.reduce((acc, item) => {
        const type = item.content_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      kpis: {
        totalMentions,
        totalEngagement,
        avgEngagement,
        uniqueUsers
      },
      sentimentData,
      channelData,
      categoryData,
      contentTypeData
    };
  }, [filteredData]);

  const KPICard = ({ title, value, icon: Icon, color = 'text-primary' }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Mentions"
          value={analytics.kpis.totalMentions}
          icon={BarChart3}
          color="text-chart-1"
        />
        <KPICard
          title="Total Engagement"
          value={analytics.kpis.totalEngagement}
          icon={TrendingUp}
          color="text-chart-2"
        />
        <KPICard
          title="Avg Engagement"
          value={analytics.kpis.avgEngagement}
          icon={Heart}
          color="text-chart-3"
        />
        <KPICard
          title="Unique Users"
          value={analytics.kpis.uniqueUsers}
          icon={Users}
          color="text-chart-4"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractivePieChart
          title="Sentiment Distribution"
          data={analytics.sentimentData}
          filterKey="sentiment"
        />
        
        <InteractiveBarChart
          title="Channel Performance"
          data={analytics.channelData}
          filterKey="channels"
          dataKey="value"
        />
        
        <InteractiveBarChart
          title="Top Categories"
          data={analytics.categoryData}
          filterKey="categories"
          color="hsl(var(--chart-3))"
        />
        
        <InteractiveBarChart
          title="Content Types"
          data={analytics.contentTypeData}
          filterKey="contentTypes"
          color="hsl(var(--chart-4))"
        />
      </div>
    </div>
  );
}