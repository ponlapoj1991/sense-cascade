import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractivePieChart } from '@/components/Charts/InteractivePieChart';
import { InteractiveBarChart } from '@/components/Charts/InteractiveBarChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboard } from '@/contexts/DashboardContext';
import { BarChart3, TrendingUp, Users, Heart, MessageCircle, Share2 } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

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

    // Timeline data processing - NEW!
    const timelineStats = filteredData
      .filter(item => item.date)
      .reduce((acc, item) => {
        // Parse date properly - handle both ISO and simple date formats
        let dateStr = '';
        try {
          const date = new Date(item.date);
          if (isValid(date)) {
            dateStr = format(date, 'yyyy-MM-dd');
          }
        } catch (error) {
          console.warn('Invalid date:', item.date);
          return acc;
        }

        if (!dateStr) return acc;

        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            mentions: 0,
            engagement: 0
          };
        }

        acc[dateStr].mentions += 1;
        acc[dateStr].engagement += item.total_engagement || 0;

        return acc;
      }, {} as Record<string, { date: string; mentions: number; engagement: number }>);

    const timelineData = Object.values(timelineStats)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days

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
      contentTypeData,
      timelineData // NEW!
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

  // Timeline Chart Component - NEW!
  const TimelineChart = () => {
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
            <p className="font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
            <p className="text-sm text-muted-foreground">
              Mentions: {data.mentions.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Engagement: {data.engagement.toLocaleString()}
            </p>
          </div>
        );
      }
      return null;
    };

    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Timeline Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="mentions" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                  activeDot={{ r: 6, stroke: "hsl(var(--chart-1))" }}
                  name="Mentions"
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
                  activeDot={{ r: 6, stroke: "hsl(var(--chart-2))" }}
                  name="Engagement"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };

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

      {/* Timeline Chart - NEW! */}
      <TimelineChart />

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

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No data available</h3>
          <p className="text-muted-foreground">Upload an Excel file to see your social media analytics</p>
        </div>
      )}
    </div>
  );
}
